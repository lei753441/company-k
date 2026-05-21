export type ExpenseCategory = 'transport' | 'accommodation' | 'entertainment' | 'supplies' | 'communication' | 'other'
export type ExpenseStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'paid'
export type PaymentMethod = 'personal' | 'corporate_card'

export interface ExpenseItem {
  id: string
  expense_report_id: string
  date: string
  category: ExpenseCategory
  description: string
  amount: number
  payment_method: PaymentMethod
  receipt_url: string | null
  note: string | null
}

export interface ExpenseReport {
  id: string
  title: string
  user_id: string
  user_name: string
  year_month: string
  project_id: string | null
  project_name: string | null
  status: ExpenseStatus
  total_amount: number
  submitted_at: string | null
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  approver_comment: string | null
  items: ExpenseItem[]
  created_at: string
  updated_at: string
}

export interface ExpenseReportListItem {
  id: string
  title: string
  user_name: string
  year_month: string
  project_name: string | null
  status: ExpenseStatus
  total_amount: number
  submitted_at: string | null
  item_count: number
}

export interface ExpenseListParams {
  year_month?: string
  status?: ExpenseStatus | ''
  user_id?: string
  page?: number
}

export interface ExpenseSummary {
  year_month: string
  total_amount: number
  by_category: Record<ExpenseCategory, number>
  by_status: Record<ExpenseStatus, number>
  items: { user_name: string; total_amount: number; status: ExpenseStatus }[]
}
