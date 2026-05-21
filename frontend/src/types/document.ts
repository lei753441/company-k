export type DocumentCategory = 'contract' | 'invoice' | 'skill_sheet' | 'timesheet' | 'proposal' | 'other'
export type DocumentStatus = 'active' | 'archived' | 'deleted'

export interface DocumentVersion {
  version: number
  file_name: string
  file_size: number
  mime_type: string
  uploaded_by: string
  uploaded_by_name: string
  uploaded_at: string
  change_comment: string | null
}

export interface Document {
  id: string
  title: string
  category: DocumentCategory
  status: DocumentStatus
  tags: string[]
  related_employee_id: string | null
  related_employee_name: string | null
  related_project_id: string | null
  related_project_name: string | null
  related_customer_id: string | null
  related_customer_name: string | null
  current_version: number
  versions: DocumentVersion[]
  created_by: string
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface DocumentListItem {
  id: string
  title: string
  category: DocumentCategory
  status: DocumentStatus
  tags: string[]
  related_name: string | null
  current_version: number
  file_name: string
  file_size: number
  created_by_name: string
  updated_at: string
}

export interface DocumentListParams {
  q?: string
  category?: DocumentCategory | ''
  tag?: string
  page?: number
}
