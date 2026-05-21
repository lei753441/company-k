export type NotificationType =
  | 'timesheet_submitted'
  | 'timesheet_approved'
  | 'timesheet_rejected'
  | 'expense_submitted'
  | 'expense_approved'
  | 'expense_rejected'
  | 'contract_renewal'
  | 'invoice_approved'
  | 'followup_due'
  | 'system'

export type WorkflowType = 'timesheet' | 'expense' | 'contract_renewal' | 'invoice'
export type WorkflowStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  is_read: boolean
  link_url: string | null
  created_at: string
}

export interface WorkflowTask {
  id: string
  workflow_type: WorkflowType
  title: string
  requester_id: string
  requester_name: string
  status: WorkflowStatus
  link_url: string
  due_date: string | null
  created_at: string
  updated_at: string
}
