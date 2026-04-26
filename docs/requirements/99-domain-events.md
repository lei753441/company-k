## ドメインイベント・カタログ（全体）

目的: Bounded Context 間の連携を「イベント」で揃え、解釈差を減らす。  
原則: イベントは **発行元BCの過去事実**を表し、購読側は冪等に処理する。

### 命名規約（暫定）
- 形式: `{boundedContext}.{eventName}`（例: `attendance.timesheetClosed`）
- 互換性: 破壊的変更は新イベント名で追加し、旧イベントを一定期間併存させる

### 共通最小ペイロード（推奨）
すべてのイベントに以下を含める。
- `event_id`（UUID）
- `event_type`（例: `attendance.timesheetClosed`）
- `occurred_at`（ISO8601）
- `version`（整数）
- `actor_user_id`（ユーザー起点の場合。バッチ等はNULL可）
- `subject_id`（対象リソースID）
- `trace_id`（相関ID。分散トレース/監査用）

---

## イベント一覧（初期案）

### Auth & Access
- **`auth.userInvited`**
  - **意味**: 招待（invited）ユーザーが作成された
  - **購読候補**: Notification（招待通知）
- **`auth.userDisabled`**
  - **意味**: ユーザーが無効化された（以後ログイン不可）
  - **購読候補**: 各BC（参照キャッシュの無効化、担当者割当の再確認）
- **`auth.roleChanged`**
  - **意味**: ユーザーのロールが変更された
  - **購読候補**: Notification（重要変更通知）、各BC（権限キャッシュ無効化）

### Sales & Project
- **`sales.projectCreated`**
  - **意味**: 案件が作成された
  - **購読候補**: Notification（管理者通知）
- **`sales.projectStatusChanged`**
  - **意味**: 案件ステータスが変更された
  - **購読候補**: Attendance/Billing/Contract（入力可否や締め条件に影響する場合）
- **`sales.assignmentChanged`**
  - **意味**: 案件アサインが変更された
  - **購読候補**: Attendance（勤務入力対象）、Billing（請求明細作成）

### Contract
- **`contract.contractActivated`**
  - **意味**: 契約が有効化された（署名完了）
  - **購読候補**: Attendance（所定労働/精算条件）、Billing（単価/割増/支払条件）
- **`contract.contractUpdated`**
  - **意味**: 契約条件が更新された（新バージョンが有効）
  - **購読候補**: Attendance/Billing（次月以降の条件に反映）
- **`contract.contractEnded`**
  - **意味**: 契約が終了/解約になった
  - **購読候補**: Attendance（入力可能期間）、Billing（請求停止）

### Attendance
- **`attendance.timesheetSubmitted`**
  - **意味**: 勤務表が提出された（業務状態: 提出済）
  - **購読候補**: Workflow（承認依頼作成）
- **`attendance.timesheetApproved`**
  - **意味**: 勤務表が承認済になった（最終承認完了）
  - **購読候補**: Notification（承認完了）
- **`attendance.timesheetClosed`**
  - **意味**: 月次締めが完了し、確定勤務データが生成された
  - **購読候補**: Billing（請求・支払ドラフト生成）、Analytics（集計）

### Billing & Payment
- **`billing.invoiceIssued`**
  - **意味**: 請求書が送付/発行された（業務状態が外部に出た）
  - **購読候補**: Document（PDF保管/公開）、Notification（送付完了）
- **`billing.paymentMatched`**
  - **意味**: 入金が消込された
  - **購読候補**: Analytics（売上/入金KPI）
- **`billing.monthClosed`**
  - **意味**: 請求・支払の月次締めが完了した
  - **購読候補**: Analytics（確定集計）

### Expense
- **`expense.expenseClaimSubmitted`**
  - **意味**: 経費申請が提出された
  - **購読候補**: Workflow（承認依頼作成）
- **`expense.expenseClaimApproved`**
  - **意味**: 経費申請が承認済になった
  - **購読候補**: Notification（承認完了）
- **`expense.expenseSettled`**
  - **意味**: 経費が精算済になった（精算バッチ完了）
  - **購読候補**: Analytics（経費KPI）

---

## TODO（要件確定ポイント）
- イベントの**versioning方針**（破壊的変更の扱い）
- subjectの型情報（`subject_type` を持たせるか）
- 冪等キー（`event_id` と購読側の重複排除保持期間）

