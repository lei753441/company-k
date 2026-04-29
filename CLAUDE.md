# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 現状

コードは未実装。`docs/` 配下の要件定義・設計ドキュメントのみ存在する。  
開発順序: **フロントエンド実装 → ユーザー確認 → バックエンド実装**

---

## アーキテクチャ

```
[React SPA]
  → CloudFront → S3（静的ホスティング）
  → API Gateway（HTTP API）→ Lambda（ビジネスロジック）
                            → DynamoDB（データ永続化）
  → Cognito（認証・JWTトークン発行）
  → S3（ファイル保存。アップロードは事前署名URLでクライアント直接PUT）
```

- フロントは Cognito JWT を API Gateway に渡し、Lambda 内で RBAC を実装する
- サーバー間通信は API トークン方式（`ck_live_xxxx` 形式）

## ドキュメント構成

```
docs/
  requirements/   # モジュール別要件定義（00〜14）
  design/         # 物理設計（DynamoDB テーブル設計など）
  references/     # 法令・規制参照資料
```

## DDD コンテキスト構成（チーム割当）

| Context | Team | テーブル名 | 主な責務 |
|---------|------|-----------|---------|
| Auth & Access | A | `auth` | 認証(Cognito連携)・RBAC・監査ログ |
| People | B | `people` | 社員・協力会社・個人事業主マスタ |
| Sales & Project | C | `sales_project` | 顧客・案件・マッチング |
| Attendance / Billing & Payment / Contract / Expense | D | `attendance`, `billing` | 勤怠・請求・支払・契約・経費 |
| Workflow / Document / Analytics | E | — | 通知・ワークフロー・書類・ダッシュボード |

コンテキスト間連携は **DynamoDB Streams → Lambda → SQS** または REST API（最小限）。  
他コンテキストのマスタは「参照専用」。確定データ（請求書・勤怠確定値）は送信時点でスナップショット保存する。

## DynamoDB 設計規約

物理テーブル設計の詳細は `docs/design/01-dynamodb-physical-design.md` を参照。

- **1 Bounded Context = 1 テーブル**（Single Table Design）
- PK/SK は `ENTITY_TYPE#id` 形式のプレフィックス必須
- **GSI Overloading**: `GSI1PK`/`GSI1SK` という汎用属性名で複数エンティティが同一 GSI を共用
- **Sparse GSI**: 論理削除時は GSI キー属性を REMOVE して一覧から自動除外
- **Scan 禁止**（管理バッチ以外）。一覧取得は必ず Query + GSI
- 金額は **Number 整数（円単位）**。DECIMAL 型は存在しない
- 労働時間は **分単位の整数**。有給日数は **10分の1日単位の整数**（0.5日 → 5）
- セッション・APIトークンには TTL 属性（Unix タイムスタンプ）を必須設定
- 月次締め等の冪等操作は `ConditionExpression: attribute_not_exists(PK)` で保証

## ユーザーロールと権限

| ロール | 区分 | 主な権限 |
|--------|------|---------|
| 管理者 (ROLE_ADMIN) | 内部 | 全機能フルアクセス |
| 営業 (ROLE_SALES) | 内部 | 案件・顧客・マッチング |
| 事務 (ROLE_OFFICE) | 内部 | 勤怠集計・請求・契約管理 |
| 社員 (ROLE_EMPLOYEE) | 内部 | 自分の勤怠・キャリア |
| 協力会社/個人事業主 (ROLE_PARTNER) | 外部 | 限定閲覧・勤怠報告・請求書提出 |

外部ユーザーは別サブドメイン（パートナーポータル）経由。内部 API エンドポイントへのアクセスはエンドポイントレベルで遮断。

## 主要ドメインルール（実装時の注意）

- **自己承認禁止**: 勤務表・経費・休暇申請の承認者は申請者本人と異なること
- **確定後ロック**: 月次締め後のデータは管理者のみ例外修正可。修正理由と履歴が必須
- **二重締め防止**: MonthlyClose / MonthlyBillingClose の書き込みは `attribute_not_exists(PK)` で冪等保証
- **打刻時刻**: サーバー時刻を使用。クライアント時刻は信頼しない
- **請求書番号不変**: 採番後の変更不可。送付後の金額・明細変更は「修正請求書」で対応
- **データ保持**: 監査ログ 7年、勤怠記録 5年、請求書 7年。これらに TTL を設定してはいけない
- **マイナンバー・銀行口座**: AES-256（AWS KMS）で暗号化。属性名に `_enc` サフィックス

## モジュール優先度

| 優先度 | モジュール |
|--------|-----------|
| 高 | 01-認証・権限管理、02-社員管理、06-案件管理、09-勤怠管理、10-請求・支払管理 |
| 中 | 03-スキル・キャリア、04-顧客管理、05-協力会社管理、07-マッチング、08-契約管理 |
| 低 | 11-書類管理、12-通知・ワークフロー、13-ダッシュボード、14-経費管理 |
