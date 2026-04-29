# DynamoDB 物理テーブル設計

**バージョン**: 1.0  
**作成日**: 2026-04-29  
**対象**: 全 Bounded Context（Team A〜E）

---

## 0. 設計方針

### 0.1 基本方針

| 項目 | 方針 |
|------|------|
| テーブル粒度 | **Bounded Context 1つ = DynamoDB テーブル 1つ**（Single Table Design） |
| キー設計 | PK/SK に `ENTITY_TYPE#id` 形式のプレフィックスを付与 |
| GSI | GSI Overloading（汎用名 `GSI1` 〜 `GSI3`）でGSI数を削減 |
| TTL | セッション・APIトークンなど期限付きアイテムに必須 |
| 金額型 | DynamoDBに DECIMAL 型はないため **Number（整数、円単位）** |
| 有給日数など小数 | **整数に正規化**（例：0.5日 → 5 として10分の1日単位） |
| 削除 | 論理削除のみ（`deleted_at` 属性）。Sparse GSI で削除済みを除外 |
| 冪等性 | 月次締めなど重複実行が危険な操作は `attribute_not_exists(PK)` で保証 |
| ページネーション | `LastEvaluatedKey` のみ（OFFSET 不可）。フロントには Base64 トークンで返す |

### 0.2 アクセスパターン設計の優先順位

```
1. GetItem（PK + SK 完全一致） — RCU 最小、最速
2. Query（PK 完全一致 + SK 条件）— 親子・時系列取得
3. GSI Query — 逆引き・ステータス別一覧
4. Scan — 禁止（管理用バッチ以外での利用は原則不可）
```

### 0.3 GSI Overloading パターン

同一テーブル内の複数エンティティが、**同一 GSI（GSI1 等）を共用** することでGSI数を削減する。
各エンティティが `GSI1PK` / `GSI1SK` 属性に異なる値を入れることで用途を使い分ける。

```
例（auth テーブル）:
  Userアイテム    → GSI1PK = "EMAIL#user@example.com",  GSI1SK = "USER#uuid"
  Sessionアイテム → GSI1PK = "TOKEN#sha256hash",        GSI1SK = "USER#uuid"
  AuditLogアイテム → GSI1PK = "ACTOR#actorId",          GSI1SK = "TIME#2026-04-29T..."
  すべて同じ GSI1 を使う
```

### 0.4 Sparse GSI（論理削除・任意属性）

- `deleted_at` 属性を持つアイテムを GSI から除外したい場合、`GSI1PK` に値をセットしない
- DynamoDB はキー属性が存在しないアイテムを GSI に登録しない

---

## 1. Auth Context（Team A）

**テーブル名**: `auth`

### 1.1 アクセスパターン

| # | パターン | 実装 |
|---|---------|------|
| A1 | ユーザーIDで取得 | GetItem |
| A2 | メールアドレスでユーザー検索（ログイン） | GSI1 Query（GSI1PK = `EMAIL#xxx`） |
| A3 | Cognito Sub でユーザー検索（SSO） | GSI2 Query（GSI2PK = `COGNITO#sub`） |
| A4 | ユーザーのセッション一覧 | Query（PK = `USER#userId`, SK begins_with `SESSION#`） |
| A5 | リフレッシュトークンハッシュでセッション検索 | GSI1 Query（GSI1PK = `TOKEN#hash`） |
| A6 | ユーザーのロール一覧 | Query（PK = `USER#userId`, SK begins_with `ROLE#`） |
| A7 | ロールのユーザー一覧 | GSI1 Query（GSI1PK = `ROLE#roleId`） |
| A8 | 操作者IDで監査ログ検索 + 日時範囲 | GSI1 Query（GSI1PK = `ACTOR#actorId`, SK between） |
| A9 | リソース種別・IDで監査ログ検索 | GSI2 Query（GSI2PK = `RESOURCE#type#id`） |
| A10 | 日付範囲で監査ログ一覧 | Query（PK = `AUDIT#YYYY-MM-DD`） |
| A11 | APIトークン一覧 | GSI1 Query（GSI1PK = `CREATOR#userId`） |

### 1.2 テーブルレイアウト

| エンティティ | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK | TTL |
|------------|----|----|--------|--------|--------|--------|-----|
| User | `USER#userId` | `#METADATA` | `EMAIL#email` | `USER#userId` | `COGNITO#cognitoSub` | `USER#userId` | - |
| UserRole | `USER#userId` | `ROLE#roleId` | `ROLE#roleId` | `USER#userId` | - | - | - |
| Session | `USER#userId` | `SESSION#sessionId` | `TOKEN#tokenHash` | `USER#userId` | - | - | `expires_at` |
| AuditLog | `AUDIT#YYYY-MM-DD` | `TIME#HH:MM:SS.mmm#logId` | `ACTOR#actorId` | `TIME#ISO8601#logId` | `RESOURCE#type#id` | `TIME#ISO8601#logId` | - |
| ApiToken | `TOKEN#tokenId` | `#METADATA` | `CREATOR#userId` | `TOKEN#tokenId` | - | - | `expires_at` |
| Role | `ROLE#roleId` | `#METADATA` | - | - | - | - | - |
| Permission | `PERM#permId` | `#METADATA` | `ROLE#roleId` | `PERM#permId` | - | - | - |

### 1.3 GSI 定義

| GSI名 | PK属性 | SK属性 | ProjectionType | 用途 |
|-------|--------|--------|---------------|------|
| `GSI1` | `GSI1PK` | `GSI1SK` | ALL | A2 メール検索 / A5 トークン検索 / A7 ロール別ユーザー / A8 操作者別監査ログ / A11 APIトークン一覧 |
| `GSI2` | `GSI2PK` | `GSI2SK` | ALL | A3 Cognito Sub 検索 / A9 リソース別監査ログ |

### 1.4 アイテム例

```json
// User
{
  "PK": "USER#a1b2c3",
  "SK": "#METADATA",
  "GSI1PK": "EMAIL#yamada@company.example.com",
  "GSI1SK": "USER#a1b2c3",
  "GSI2PK": "COGNITO#cognito-sub-xyz",
  "GSI2SK": "USER#a1b2c3",
  "email": "yamada@company.example.com",
  "name": "山田太郎",
  "user_type": "internal",
  "status": "active",
  "mfa_enabled": true,
  "created_at": "2026-04-01T09:00:00Z",
  "updated_at": "2026-04-29T10:00:00Z"
}

// Session（TTL付き）
{
  "PK": "USER#a1b2c3",
  "SK": "SESSION#sess001",
  "GSI1PK": "TOKEN#sha256hashXXX",
  "GSI1SK": "USER#a1b2c3",
  "ip_address": "203.0.113.1",
  "device_info": "Mozilla/5.0 ...",
  "created_at": "2026-04-29T09:00:00Z",
  "last_used_at": "2026-04-29T11:00:00Z",
  "expires_at": 1751155200,
  "ttl": 1751155200
}

// AuditLog（日付シャーディング）
{
  "PK": "AUDIT#2026-04-29",
  "SK": "TIME#09:30:00.123#log001",
  "GSI1PK": "ACTOR#a1b2c3",
  "GSI1SK": "TIME#2026-04-29T09:30:00.123Z#log001",
  "GSI2PK": "RESOURCE#user#a1b2c3",
  "GSI2SK": "TIME#2026-04-29T09:30:00.123Z#log001",
  "action_type": "USER_LOGIN",
  "ip_address": "203.0.113.1",
  "occurred_at": "2026-04-29T09:30:00.123Z"
}
```

### 1.5 設計上の注意

- **監査ログは削除不可・TTLなし**（電子帳簿保存法対応、7年保持）
- `AuditLog` の PK を日付にすることでホットパーティションを回避（日別に分散）
- セッション・APIトークンのクリーンアップは DynamoDB TTL に委任（削除バッチ不要）
- `Role` / `Permission` のマスタは小規模のため、起動時にアプリ内キャッシュ推奨

---

## 2. People Context（Team B）

**テーブル名**: `people`

### 2.1 アクセスパターン

| # | パターン | 実装 |
|---|---------|------|
| P1 | 社員IDで取得 | GetItem |
| P2 | 社員の緊急連絡先一覧 | Query（PK = `EMP#empId`, SK begins_with `EMERGENCY#`） |
| P3 | 部署別・在籍ステータス別社員一覧 | GSI1 Query（GSI1PK = `DEPT#deptId`, SK begins_with `STATUS#active`） |
| P4 | 上長IDで部下一覧 | GSI2 Query（GSI2PK = `MGR#managerId`） |
| P5 | 雇用形態別社員一覧 | GSI1 Query（GSI1PK = `EMPTYPE#full_time`） |
| P6 | 協力会社IDで所属担当者一覧 | Query（PK = `PARTNER#partnerId`, SK begins_with `PERSON#`） |
| P7 | 在籍中の全社員一覧（KPI） | GSI1 Query（GSI1PK = `STATUS#active`） |
| P8 | 部署IDで部署取得 | GetItem |
| P9 | 親部署で子部署一覧 | GSI1 Query（GSI1PK = `PARENT_DEPT#parentId`） |

### 2.2 テーブルレイアウト

| エンティティ | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK |
|------------|----|----|--------|--------|--------|--------|
| Employee | `EMP#employeeId` | `#METADATA` | `DEPT#deptId` | `STATUS#status#EMP#empId` | `MGR#managerId` | `EMP#empId` |
| Employee（雇用形態別） | `EMP#employeeId` | `#METADATA` | `EMPTYPE#empType` | `EMP#empId` | - | - |
| EmergencyContact | `EMP#employeeId` | `EMERGENCY#priority#contactId` | - | - | - | - |
| Department | `DEPT#deptId` | `#METADATA` | `PARENT_DEPT#parentId` | `DEPT#deptId` | - | - |
| Position | `POS#positionId` | `#METADATA` | - | - | - | - |
| PartnerCompany | `PARTNER#partnerId` | `#METADATA` | `STATUS#status` | `PARTNER#partnerId` | - | - |
| PartnerPerson | `PARTNER#partnerId` | `PERSON#personId` | `PERSON#personId` | `PARTNER#partnerId` | - | - |

> **注意**: Employee は `GSI1PK` に `DEPT#deptId` を入れているが、雇用形態検索（P5）と部署検索（P3）を同一GSI1で扱うためには GSI1PK の値を使い分ける。Employee アイテムを1つのキーに絞る場合は「部署別」を優先し、雇用形態は GSI2 を使う設計も可。用途とクエリ頻度で判断すること。

### 2.3 GSI 定義

| GSI名 | PK属性 | SK属性 | ProjectionType | 用途 |
|-------|--------|--------|---------------|------|
| `GSI1` | `GSI1PK` | `GSI1SK` | ALL | P3 部署別社員 / P5 雇用形態別 / P7 在籍中全社員 / P9 子部署一覧 |
| `GSI2` | `GSI2PK` | `GSI2SK` | KEYS_ONLY | P4 上長→部下一覧（KEYS_ONLYで軽量化、詳細は BatchGet） |

### 2.4 アイテム例

```json
// Employee
{
  "PK": "EMP#EMP-20260401-0001",
  "SK": "#METADATA",
  "GSI1PK": "DEPT#dept-engineering",
  "GSI1SK": "STATUS#active#EMP#EMP-20260401-0001",
  "GSI2PK": "MGR#EMP-20220101-0005",
  "GSI2SK": "EMP#EMP-20260401-0001",
  "last_name": "山田",
  "first_name": "太郎",
  "employment_type": "full_time",
  "status": "active",
  "hire_date": "2026-04-01",
  "created_at": "2026-04-01T09:00:00Z",
  "updated_at": "2026-04-01T09:00:00Z"
}

// EmergencyContact（親子：社員 PK に収納）
{
  "PK": "EMP#EMP-20260401-0001",
  "SK": "EMERGENCY#1#contact001",
  "name": "山田花子",
  "relationship": "配偶者",
  "phone": "090-0000-0000"
}
```

### 2.5 設計上の注意

- **退職社員の Sparse GSI 除外**: `status = retired` になったとき `GSI1PK` の値を削除することで、在籍者一覧（P7）から自動除外できる。ただし DynamoDB の Update でキー属性を削除する場合は REMOVE アクション
- **マイナンバー・銀行口座**: 暗号化（AES-256 with AWS KMS）を前提。属性名に `_enc` サフィックスを付けて暗号化済みであることを明示（例: `bank_account_number_enc`）
- **部署削除チェック**: 削除前に `GSI1 Query(GSI1PK = "DEPT#xxx")` で所属社員数を確認

---

## 3. Sales & Project Context（Team C）

**テーブル名**: `sales_project`

### 3.1 アクセスパターン

| # | パターン | 実装 |
|---|---------|------|
| SP1 | 案件IDで取得 | GetItem |
| SP2 | 顧客別案件一覧（+ ステータス絞り込み） | GSI1 Query（GSI1PK = `COMPANY#companyId`、SK begins_with `STATUS#xxx`） |
| SP3 | 担当営業別案件一覧（+ ステータス絞り込み） | GSI2 Query（GSI2PK = `SALES#userId`） |
| SP4 | ステータス別案件一覧 | GSI1 Query（GSI1PK = `STATUS#in_progress`） |
| SP5 | 案件のアサイン一覧 | Query（PK = `PRJ#projectId`、SK begins_with `ASSIGN#`） |
| SP6 | 社員/協力会社の参画案件一覧 | GSI1 Query（GSI1PK = `ASSIGNEE#assigneeId`） |
| SP7 | 案件の単価履歴（有効期間順） | Query（PK = `PRJ#projectId`、SK begins_with `RATE#`） |
| SP8 | 案件のステータス変更履歴（時系列） | Query（PK = `PRJ#projectId`、SK begins_with `LOG#`） |
| SP9 | 顧客企業IDで取得 | GetItem |
| SP10 | 顧客の担当者一覧 | Query（PK = `COMPANY#companyId`、SK begins_with `CONTACT#`） |

### 3.2 テーブルレイアウト

| エンティティ | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK |
|------------|----|----|--------|--------|--------|--------|
| Project | `PRJ#projectId` | `#METADATA` | `COMPANY#companyId` | `STATUS#status#PRJ#projectId` | `SALES#userId` | `STATUS#status#PRJ#projectId` |
| SesDetail | `PRJ#projectId` | `SES_DETAIL` | - | - | - | - |
| ConsignDetail | `PRJ#projectId` | `CONSIGN_DETAIL` | - | - | - | - |
| Assignment | `PRJ#projectId` | `ASSIGN#assigneeId#assignId` | `ASSIGNEE#assigneeId` | `STATUS#status#PRJ#projectId` | - | - |
| ProjectRate | `PRJ#projectId` | `RATE#targetId#validFrom` | - | - | - | - |
| StatusLog | `PRJ#projectId` | `LOG#ISO8601#logId` | - | - | - | - |
| Customer | `COMPANY#companyId` | `#METADATA` | - | - | - | - |
| Contact | `COMPANY#companyId` | `CONTACT#contactId` | - | - | - | - |
| MatchingProposal | `PRJ#projectId` | `PROPOSAL#candidateId` | `CANDIDATE#candidateId` | `PRJ#projectId` | - | - |

### 3.3 GSI 定義

| GSI名 | PK属性 | SK属性 | ProjectionType | 用途 |
|-------|--------|--------|---------------|------|
| `GSI1` | `GSI1PK` | `GSI1SK` | ALL | SP2 顧客別案件 / SP4 ステータス別案件 / SP6 参画案件一覧 |
| `GSI2` | `GSI2PK` | `GSI2SK` | ALL | SP3 担当営業別案件 |

### 3.4 アイテム例

```json
// Project（論理削除前：GSI1PK/GSI1SK あり）
{
  "PK": "PRJ#prj-001",
  "SK": "#METADATA",
  "GSI1PK": "COMPANY#company-abc",
  "GSI1SK": "STATUS#in_progress#PRJ#prj-001",
  "GSI2PK": "SALES#user-sales01",
  "GSI2SK": "STATUS#in_progress#PRJ#prj-001",
  "project_type": "ses",
  "name": "〇〇社 Java開発支援",
  "status": "in_progress",
  "start_date": "2026-04-01",
  "created_at": "2026-03-15T10:00:00Z",
  "updated_at": "2026-04-01T09:00:00Z"
}

// Project（論理削除後：GSI1PK/GSI1SK を削除して Sparse GSI から除外）
{
  "PK": "PRJ#prj-001",
  "SK": "#METADATA",
  "status": "cancelled",
  "deleted_at": "2026-04-29T12:00:00Z"
  // GSI1PK, GSI1SK, GSI2PK, GSI2SK なし → GSIから自動除外
}

// Assignment
{
  "PK": "PRJ#prj-001",
  "SK": "ASSIGN#EMP-20260401-0001#assign-001",
  "GSI1PK": "ASSIGNEE#EMP-20260401-0001",
  "GSI1SK": "STATUS#confirmed#PRJ#prj-001",
  "assignee_type": "employee",
  "role": "SE",
  "start_date": "2026-04-01",
  "status": "confirmed"
}

// ProjectRate（単価履歴。SK でターゲット+開始日順）
{
  "PK": "PRJ#prj-001",
  "SK": "RATE#EMP-20260401-0001#2026-04-01",
  "billing_rate": 800000,
  "payment_rate": 600000,
  "rate_unit": "monthly",
  "valid_from": "2026-04-01"
}
```

### 3.5 設計上の注意

- **論理削除と Sparse GSI**: `deleted_at` をセットするときに `GSI1PK` / `GSI2PK` を REMOVE することで、削除済み案件は GSI の案件一覧に出てこなくなる
- **ステータス変更履歴（StatusLog）**: SK に ISO8601 時刻を使うことで時系列ソートが自動的に実現される
- **単価情報のアクセス制御**: `ProjectRate` アイテムの取得は Lambda 内で権限チェック必須（管理者・営業・事務のみ）

---

## 4. Attendance Context（Team D）

**テーブル名**: `attendance`

### 4.1 アクセスパターン

| # | パターン | 実装 |
|---|---------|------|
| AT1 | ユーザー + 年月で勤務表取得 | Query（PK = `USER#userId`、SK begins_with `SHEET#YYYY-MM`） |
| AT2 | ユーザー + 日付で勤務記録取得 | Query（PK = `USER#userId`、SK begins_with `RECORD#YYYY-MM-DD`） |
| AT3 | 提出済み勤務表一覧（承認待ち） | GSI1 Query（GSI1PK = `STATUS#submitted`） |
| AT4 | 案件別工数集計 | GSI1 Query（GSI1PK = `PRJ#projectId`、SK begins_with `YYYYMM`） |
| AT5 | ユーザーの休暇申請一覧 | Query（PK = `USER#userId`、SK begins_with `LEAVE#`） |
| AT6 | 申請中の休暇申請一覧（承認待ち） | GSI1 Query（GSI1PK = `STATUS#pending`） |
| AT7 | ユーザーの有給残高取得 | Query（PK = `USER#userId`、SK begins_with `LEAVE_BALANCE#`） |
| AT8 | 特定年月の月次締め状態確認 | GetItem（PK = `CLOSE#YYYY-MM`、SK = `#METADATA`） |
| AT9 | 残業申請一覧（承認待ち） | GSI1 Query（GSI1PK = `STATUS#ot_pending`） |

### 4.2 テーブルレイアウト

| エンティティ | PK | SK | GSI1PK | GSI1SK |
|------------|----|----|--------|--------|
| MonthlySheet | `USER#userId` | `SHEET#YYYY-MM#sheetId` | `STATUS#status` | `YYYYMM#USER#userId` |
| AttendanceRecord | `USER#userId` | `RECORD#YYYY-MM-DD#recordId` | `PRJ#projectId` | `YYYYMM#USER#userId` |
| LeaveRequest | `USER#userId` | `LEAVE#YYYY-MM-DD#requestId` | `STATUS#leave_status` | `DATE#YYYY-MM-DD#USER#userId` |
| OvertimeRequest | `USER#userId` | `OT#YYYY-MM-DD#requestId` | `STATUS#ot_status` | `DATE#YYYY-MM-DD#USER#userId` |
| PaidLeaveBalance | `USER#userId` | `LEAVE_BALANCE#grantYear` | - | - |
| MonthlyClose | `CLOSE#YYYY-MM` | `#METADATA` | - | - |

### 4.3 GSI 定義

| GSI名 | PK属性 | SK属性 | ProjectionType | 用途 |
|-------|--------|--------|---------------|------|
| `GSI1` | `GSI1PK` | `GSI1SK` | ALL | AT3 承認待ち勤務表 / AT4 案件別工数 / AT6 申請中休暇 / AT9 申請中残業 |

### 4.4 アイテム例

```json
// MonthlySheet（提出済：GSI1PK に STATUS# を付与）
{
  "PK": "USER#user-001",
  "SK": "SHEET#2026-04#sheet-001",
  "GSI1PK": "STATUS#submitted",
  "GSI1SK": "2026-04#USER#user-001",
  "status": "submitted",
  "total_work_minutes": 10080,
  "total_overtime_minutes": 480,
  "submitted_at": "2026-04-30T18:00:00Z",
  "is_locked": false
}

// MonthlySheet（確定後：GSI1PK を削除して承認待ちリストから除外）
{
  "PK": "USER#user-001",
  "SK": "SHEET#2026-04#sheet-001",
  "status": "confirmed",
  "is_locked": true,
  "approved_at": "2026-05-02T10:00:00Z"
  // GSI1PK, GSI1SK なし → GSIから除外（Sparse GSI）
}

// AttendanceRecord（案件別工数集計用にGSI1PK = PRJ#xxx）
{
  "PK": "USER#user-001",
  "SK": "RECORD#2026-04-01#rec-001",
  "GSI1PK": "PRJ#prj-001",
  "GSI1SK": "2026-04#USER#user-001",
  "attendance_type": "NORMAL",
  "clock_in": "2026-04-01T09:00:00+09:00",
  "clock_out": "2026-04-01T18:00:00+09:00",
  "break_minutes": 60,
  "actual_work_minutes": 480,
  "work_location": "remote"
}

// MonthlyClose（冪等性保証用。ConditionExpression: attribute_not_exists(PK) で二重締め防止）
{
  "PK": "CLOSE#2026-04",
  "SK": "#METADATA",
  "status": "closed",
  "closed_by": "user-office01",
  "closed_at": "2026-05-02T10:00:00Z"
}
```

### 4.5 設計上の注意

- **Sparse GSI による状態別一覧**: `submitted` 状態のシートだけが GSI1 に存在する。承認 → `confirmed` にするときに `GSI1PK` / `GSI1SK` を REMOVE することで自動的に一覧から消える
- **月次締めの二重防止**: `MonthlyClose` の書き込みには必ず `ConditionExpression: attribute_not_exists(PK)` を使用する
- **打刻時刻の真実**: サーバー側で `clock_in` をセットする（クライアント時刻は使用しない）。Lambda の `Date.now()` を使用
- **勤怠記録の保存義務**: 労基法109条に基づき5年保持。TTL なし

---

## 5. Billing Context（Team D）

**テーブル名**: `billing`

### 5.1 アクセスパターン

| # | パターン | 実装 |
|---|---------|------|
| B1 | 請求書IDで取得 | GetItem |
| B2 | 顧客 + 請求年月で請求書一覧 | GSI1 Query（GSI1PK = `CUSTOMER#customerId`、SK begins_with `YYYYMM`） |
| B3 | ステータス別請求書一覧（ドラフト・未入金等） | GSI2 Query（GSI2PK = `BILL_STATUS#draft`） |
| B4 | 支払先 + 支払年月で支払明細取得 | GSI1 Query（GSI1PK = `PAYEE#payeeId`、SK begins_with `YYYYMM`） |
| B5 | ステータス別支払明細一覧 | GSI2 Query（GSI2PK = `PAY_STATUS#pending`） |
| B6 | 未消込入金一覧 | GSI1 Query（GSI1PK = `RECEIPT_STATUS#unmatched`） |
| B7 | 請求書の消込履歴 | Query（PK = `INV#invoiceId`、SK begins_with `MATCH#`） |
| B8 | 入金の消込履歴 | GSI1 Query（GSI1PK = `RECEIPT#receiptId`） |
| B9 | 特定年月の月次締め状態確認 | GetItem（PK = `BCLOSE#YYYY-MM`） |

### 5.2 テーブルレイアウト

| エンティティ | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK |
|------------|----|----|--------|--------|--------|--------|
| Invoice | `INV#invoiceId` | `#METADATA` | `CUSTOMER#customerId` | `YYYYMM#INV#invoiceId` | `BILL_STATUS#status` | `YYYYMM#INV#invoiceId` |
| InvoiceItem | `INV#invoiceId` | `ITEM#lineNumber` | - | - | - | - |
| PaymentRecord | `PAY#paymentId` | `#METADATA` | `PAYEE#payeeId` | `YYYYMM#PAY#paymentId` | `PAY_STATUS#status` | `YYYYMM#PAY#paymentId` |
| PaymentReceipt | `RECEIPT#receiptId` | `#METADATA` | `RECEIPT_STATUS#status` | `DATE#receivedDate#receiptId` | - | - |
| Matching | `INV#invoiceId` | `MATCH#receiptId` | `RECEIPT#receiptId` | `INV#invoiceId` | - | - |
| MonthlyBillingClose | `BCLOSE#YYYY-MM` | `#METADATA` | - | - | - | - |

### 5.3 GSI 定義

| GSI名 | PK属性 | SK属性 | ProjectionType | 用途 |
|-------|--------|--------|---------------|------|
| `GSI1` | `GSI1PK` | `GSI1SK` | ALL | B2 顧客別請求書 / B4 支払先別支払明細 / B6 未消込入金 / B8 入金の消込履歴 |
| `GSI2` | `GSI2PK` | `GSI2SK` | ALL | B3 ステータス別請求書 / B5 ステータス別支払明細 |

### 5.4 アイテム例

```json
// Invoice（ドラフト状態）
{
  "PK": "INV#inv-2026-04-001",
  "SK": "#METADATA",
  "GSI1PK": "CUSTOMER#company-abc",
  "GSI1SK": "2026-04#INV#inv-2026-04-001",
  "GSI2PK": "BILL_STATUS#draft",
  "GSI2SK": "2026-04#INV#inv-2026-04-001",
  "invoice_number": "INV-2026-04-001",
  "billing_year_month": "2026-04",
  "invoice_date": "2026-05-01",
  "due_date": "2026-05-31",
  "status": "draft",
  "subtotal": 1000000,
  "tax_rate": 10,
  "tax_amount": 100000,
  "total_amount": 1100000,
  "is_locked": false,
  "created_at": "2026-05-01T09:00:00Z",
  "updated_at": "2026-05-01T09:00:00Z"
}

// Invoice（送付済：GSI2 を BILL_STATUS#sent に更新）
{
  "PK": "INV#inv-2026-04-001",
  "SK": "#METADATA",
  "GSI1PK": "CUSTOMER#company-abc",
  "GSI1SK": "2026-04#INV#inv-2026-04-001",
  "GSI2PK": "BILL_STATUS#sent",
  "GSI2SK": "2026-04#INV#inv-2026-04-001",
  "status": "sent",
  "sent_at": "2026-05-02T10:00:00Z"
}

// PaymentReceipt（未消込）
{
  "PK": "RECEIPT#receipt-001",
  "SK": "#METADATA",
  "GSI1PK": "RECEIPT_STATUS#unmatched",
  "GSI1SK": "DATE#2026-05-28#receipt-001",
  "received_date": "2026-05-28",
  "amount": 1100000,
  "payer_name": "カブシキガイシャ ABC",
  "status": "unmatched"
}

// PaymentReceipt（消込済：GSI1PK を matched に変更）
{
  "PK": "RECEIPT#receipt-001",
  "SK": "#METADATA",
  "GSI1PK": "RECEIPT_STATUS#matched",
  "GSI1SK": "DATE#2026-05-28#receipt-001",
  "status": "matched"
}

// Matching（消込レコード）
{
  "PK": "INV#inv-2026-04-001",
  "SK": "MATCH#receipt-001",
  "GSI1PK": "RECEIPT#receipt-001",
  "GSI1SK": "INV#inv-2026-04-001",
  "matched_amount": 1100000,
  "matched_by": "user-office01",
  "matched_at": "2026-05-29T11:00:00Z"
}

// MonthlyBillingClose（冪等保証）
{
  "PK": "BCLOSE#2026-04",
  "SK": "#METADATA",
  "status": "closed",
  "closed_by": "user-office01",
  "closed_at": "2026-05-31T17:00:00Z",
  "total_invoice_amount": 5000000,
  "total_payment_amount": 3200000
}
```

### 5.5 設計上の注意

- **請求書番号の不変性**: `invoice_number` は採番後に変更禁止。採番はアトミックカウンター（DynamoDB の `ADD` アクション）または `billing_year_month` + 連番（アプリ層での採番 + ConditionExpression）で実現
- **金額は整数（円単位）**: `subtotal`, `tax_amount`, `total_amount` はすべて Number 型・整数
- **消費税率**: `tax_rate` は整数パーセント（例: 10）で保存。小数税率が生じた場合は 100分率から 1000分率へ変更
- **月次締めの二重防止**: `MonthlyBillingClose` 書き込みに `ConditionExpression: attribute_not_exists(PK)` を使用
- **送付済み請求書の変更禁止**: Lambda 側のロジックで `status != 'sent'` チェックを必須とする
- **請求書・支払記録の保存義務**: 法人税法に基づき7年保持。TTL なし

---

## 6. 横断的なガイドライン

### 6.1 TTL 設定一覧

| テーブル | エンティティ | TTL 属性名 | 型 | 単位 |
|---------|------------|-----------|-----|------|
| `auth` | Session | `ttl` | Number | Unix タイムスタンプ（秒） |
| `auth` | ApiToken | `ttl` | Number | Unix タイムスタンプ（秒） |

> その他のテーブルは法的保存義務（5〜7年）があるため TTL を設定しない。

### 6.2 DynamoDB Streams によるクロスコンテキスト連携

コンテキスト間の状態連携は、DynamoDB Streams + Lambda で実現する。

```
people テーブル
  └─ Employee.status → "retired" に変更
       └─ Stream → Lambda → auth テーブルの User.status を "inactive" に更新
                          → SQS へイベント送信（他コンテキストへの通知）

attendance テーブル
  └─ MonthlyClose.status → "closed" に変更
       └─ Stream → Lambda → billing テーブルに請求書・支払明細ドラフトを生成

billing テーブル
  └─ Invoice.status → "sent" に変更
       └─ Stream → Lambda → SQS → 通知コンテキストへ配信
```

**メリット**: SQS/Webhook だけでなく、テーブルへの書き込みをトリガーにできるため確実性が高い。

### 6.3 ホットパーティション対策まとめ

| 危険なパターン | 対策 |
|-------------|------|
| 監査ログの PK が固定値（全ログ同一パーティション） | PK = `AUDIT#YYYY-MM-DD`（日付シャーディング） |
| ステータス単体を PK にする（active/submitted 等） | Sparse GSI で対処。GSI1PK のバリエーションを増やす |
| 月次締めアイテムへの同時書き込み | ConditionExpression で二重書き込み防止。1回だけ書く |

### 6.4 ページネーション実装方針

```typescript
// DynamoDB Query のページネーション例
const result = await dynamodb.query({
  TableName: "attendance",
  KeyConditionExpression: "PK = :pk AND begins_with(SK, :prefix)",
  ExpressionAttributeValues: { ":pk": "USER#user-001", ":prefix": "SHEET#" },
  Limit: 20,
  ExclusiveStartKey: lastEvaluatedKey  // 前ページの終端キー
});

// フロントエンドへは Base64 エンコードして返す
const nextToken = result.LastEvaluatedKey
  ? Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString("base64")
  : null;
```

- **ページ番号での直接ジャンプは不可**（UI 仕様で制約を明示すること）
- ページサイズはデフォルト 20〜50 件。最大 100 件を推奨

### 6.5 条件付き書き込みパターン

```typescript
// 月次締めの冪等保証（二重締め防止）
await dynamodb.put({
  TableName: "attendance",
  Item: { PK: "CLOSE#2026-04", SK: "#METADATA", status: "closed", ... },
  ConditionExpression: "attribute_not_exists(PK)"
  // 既に存在する場合は ConditionalCheckFailedException が発生
});

// 楽観的ロック（同時更新防止）
await dynamodb.update({
  TableName: "billing",
  Key: { PK: "INV#inv-001", SK: "#METADATA" },
  UpdateExpression: "SET status = :newStatus, updated_at = :now",
  ConditionExpression: "updated_at = :expectedUpdatedAt",
  ExpressionAttributeValues: { ... }
});
```

### 6.6 金額・数値型の統一規則

| データ | 型 | 保存形式 | 例 |
|-------|-----|---------|-----|
| 金額（円） | Number | 整数（円単位） | 1,100,000 → `1100000` |
| 消費税率 | Number | 整数（%単位） | 10% → `10` |
| 仕入税額控除割合 | Number | 整数（%単位） | 80% → `80` |
| 有給日数 | Number | 整数（0.1日単位） | 0.5日 → `5` |
| 労働時間 | Number | 整数（分単位） | 8時間 → `480` |

### 6.7 GSI の上限と管理

- DynamoDB は1テーブルにつき **最大 20 GSI**（デフォルト）
- 本設計では各コンテキストテーブルで GSI 2〜3 本に収めているため余裕がある
- GSI の追加はテーブル稼働中でも可能だが、バックフィルに時間がかかる（大規模テーブルは注意）

---

## 7. テーブル一覧サマリ

| テーブル名 | Bounded Context | GSI数 | 主なエンティティ |
|-----------|----------------|-------|-----------------|
| `auth` | Auth（Team A） | 2 | User, Session, AuditLog, ApiToken, Role |
| `people` | People（Team B） | 2 | Employee, Department, PartnerCompany, PartnerPerson |
| `sales_project` | Sales & Project（Team C） | 2 | Project, Assignment, Customer, MatchingProposal |
| `attendance` | Attendance（Team D） | 1 | MonthlySheet, AttendanceRecord, LeaveRequest, MonthlyClose |
| `billing` | Billing（Team D） | 2 | Invoice, PaymentRecord, PaymentReceipt, Matching |

> Workflow & Notification（Team E）・Document（Team E）・Analytics（Team E）のテーブル設計は要件定義確定後に追記する。

---

*本ドキュメントはアクセスパターンが確定・追加されるたびに更新すること。物理設計は要件変更に合わせて見直しが必要。*
