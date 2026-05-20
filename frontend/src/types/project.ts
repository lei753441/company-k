export type ProjectType = 'ses' | 'consignment'
export type ProjectStatus =
  | 'negotiating'
  | 'proposing'
  | 'ordered'
  | 'in_progress'
  | 'completed'
  | 'lost'
  | 'cancelled'
export type AssignmentStatus = 'proposed' | 'confirmed' | 'completed'
export type RateUnit = 'monthly' | 'hourly'
export type WorkStyle = 'onsite' | 'remote' | 'hybrid'

export interface SesDetail {
  work_location: string | null
  work_style: WorkStyle | null
  required_headcount: number | null
  contract_unit: RateUnit
  min_hours: number | null
  max_hours: number | null
}

export interface ConsignmentDetail {
  contract_amount: number | null
  payment_terms: string | null
  deliverables: string | null
  acceptance_criteria: string | null
}

export interface Project {
  id: string
  project_type: ProjectType
  name: string
  description: string | null
  company_id: string
  company_name: string
  sales_user_id: string
  sales_user_name: string
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  skill_tags: string[]
  notes: string | null
  ses_detail: SesDetail | null
  consignment_detail: ConsignmentDetail | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface ProjectListItem {
  id: string
  project_type: ProjectType
  name: string
  company_name: string
  sales_user_name: string
  status: ProjectStatus
  start_date: string | null
  end_date: string | null
  skill_tags: string[]
  assignment_count: number
  created_at: string
  updated_at: string
}

export interface ProjectRate {
  id: string
  project_id: string
  target_type: 'employee' | 'partner'
  target_id: string | null
  target_name: string | null
  billing_rate: number
  payment_rate: number
  rate_unit: RateUnit
  valid_from: string
  valid_to: string | null
}

export interface ProjectAssignment {
  id: string
  project_id: string
  assignee_type: 'employee' | 'partner'
  assignee_id: string
  assignee_name: string
  role: string | null
  start_date: string
  end_date: string | null
  status: AssignmentStatus
}

export interface ProjectStatusLog {
  id: string
  project_id: string
  from_status: ProjectStatus
  to_status: ProjectStatus
  reason: string | null
  changed_by: string
  changed_by_name: string
  changed_at: string
}

export interface ProjectListParams {
  q?: string
  status?: ProjectStatus | ''
  project_type?: ProjectType | ''
  page?: number
}

export interface StatusChangeRequest {
  to_status: ProjectStatus
  reason: string
}

export interface AssignmentRequest {
  assignee_type: 'employee' | 'partner'
  assignee_id: string
  assignee_name: string
  role: string | null
  start_date: string
  end_date: string | null
  status: AssignmentStatus
}

export interface RateRequest {
  target_type: 'employee' | 'partner'
  target_id: string | null
  target_name: string | null
  billing_rate: number
  payment_rate: number
  rate_unit: RateUnit
  valid_from: string
  valid_to: string | null
}
