export type EmploymentType = 'full_time' | 'contract' | 'part_time'
export type EmployeeStatus = 'active' | 'on_leave' | 'retiring' | 'retired'
export type UserRole = 'ROLE_ADMIN' | 'ROLE_OFFICE' | 'ROLE_SALES' | 'ROLE_EMPLOYEE' | 'ROLE_PARTNER'

export interface Employee {
  employee_id: string
  last_name: string
  first_name: string
  last_name_kana: string
  first_name_kana: string
  birth_date: string
  gender: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null
  email_company: string
  email_private: string | null
  phone_company: string | null
  phone_private: string | null
  postal_code: string | null
  address_pref: string | null
  address_city: string | null
  address_detail: string | null
  employment_type: EmploymentType
  hire_date: string
  retirement_date: string | null
  status: EmployeeStatus
  department_id: string
  department_name: string
  position_id: string | null
  position_name: string | null
  manager_employee_id: string | null
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

export interface EmployeeListResponse {
  items: Employee[]
  total: number
  page: number
  limit: number
}

export interface EmployeeListParams {
  q?: string
  status?: EmployeeStatus | ''
  department_id?: string
  employment_type?: EmploymentType | ''
  page?: number
}

export interface Department {
  department_id: string
  name: string
  parent_department_id: string | null
  manager_employee_id: string | null
  is_active: boolean
}

export interface Position {
  position_id: string
  name: string
  rank: number | null
  is_active: boolean
}

export interface ChangeHistory {
  id: string
  employee_id: string
  changed_at: string
  changed_by: string
  changed_by_name: string
  field_name: string
  field_label: string
  old_value: string | null
  new_value: string | null
}

export interface RetireRequest {
  retirement_date: string
  retirement_reason: 'voluntary' | 'company' | 'mandatory' | 'expiry' | 'other'
  retirement_note: string
}

export interface LeaveRequest {
  leave_start_date: string
  leave_end_date: string
  leave_reason: string
}
