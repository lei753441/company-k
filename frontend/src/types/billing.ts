export type InvoiceStatus = 'draft' | 'pending_approval' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
export type PaymentRecordStatus = 'calculating' | 'pending_review' | 'approved' | 'transfer_ready' | 'paid' | 'on_hold'

export interface InvoiceItem {
  id: string
  invoice_id: string
  line_number: number
  description: string
  worker_name: string | null
  work_type: 'normal' | 'overtime' | 'holiday' | 'midnight'
  quantity: number
  unit: string
  unit_price: number
  amount: number
  tax_rate: number
}

export interface Invoice {
  id: string
  invoice_number: string
  customer_id: string
  customer_name: string
  project_id: string | null
  project_name: string | null
  billing_year_month: string
  invoice_date: string
  due_date: string
  status: InvoiceStatus
  subtotal: number
  tax_rate: number
  tax_amount: number
  total_amount: number
  our_invoice_number: string
  payment_received_amount: number
  payment_received_date: string | null
  note: string | null
  sent_at: string | null
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  parent_invoice_id: string | null
  is_locked: boolean
  items: InvoiceItem[]
  created_at: string
  updated_at: string
}

export interface InvoiceListItem {
  id: string
  invoice_number: string
  customer_name: string
  project_name: string | null
  billing_year_month: string
  invoice_date: string
  due_date: string
  status: InvoiceStatus
  total_amount: number
  payment_received_amount: number
  sent_at: string | null
}

export interface PaymentRecord {
  id: string
  payee_id: string
  payee_name: string
  payee_type: 'company' | 'freelancer'
  project_id: string | null
  project_name: string | null
  payment_year_month: string
  status: PaymentRecordStatus
  work_minutes_normal: number
  work_minutes_overtime: number
  work_minutes_holiday: number
  unit_price: number
  subtotal: number
  is_invoice_registered: boolean
  invoice_registration_number: string | null
  tax_rate: number
  tax_amount_full: number
  deductible_tax_ratio: number
  deductible_tax_amount: number
  withholding_tax_amount: number
  total_payment: number
  scheduled_payment_date: string
  actual_payment_date: string | null
  note: string | null
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  is_locked: boolean
  created_at: string
  updated_at: string
}

export interface InvoiceListParams {
  year_month?: string
  status?: InvoiceStatus | ''
  customer_id?: string
  page?: number
}

export interface PaymentListParams {
  year_month?: string
  status?: PaymentRecordStatus | ''
  page?: number
}

export interface BillingSummary {
  year_month: string
  total_invoiced: number
  total_received: number
  total_outstanding: number
  total_payment: number
  invoice_count_by_status: Record<string, number>
  payment_count_by_status: Record<string, number>
}
