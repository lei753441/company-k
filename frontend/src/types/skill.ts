export type ProficiencyLevel = 1 | 2 | 3 | 4 | 5

export type WorkAvailabilityStatus =
  | 'assigned_client'
  | 'assigned_internal'
  | 'available'
  | 'available_soon'
  | 'on_leave'
  | 'training'

export interface SkillMaster {
  id: string
  name: string
  category_large: string
  category_medium: string
  is_active: boolean
}

export interface EmployeeSkill {
  id: string
  employee_id: string
  skill_master_id: string
  skill_name: string
  category_large: string
  category_medium: string
  proficiency_level: ProficiencyLevel
  experience_years: number | null
  last_used_year: number | null
  note: string | null
}

export interface Certification {
  id: string
  employee_id: string
  name: string
  issuer: string | null
  acquired_date: string
  expiry_date: string | null
  score: string | null
}

export interface CareerHistory {
  id: string
  employee_id: string
  project_name: string
  client_name: string | null
  industry: string | null
  start_date: string
  end_date: string | null
  role: string
  team_size: number | null
  description: string
  achievements: string | null
  display_order: number
  is_client_name_hidden: boolean
  skill_names: string[]
}

export interface WorkAvailability {
  employee_id: string
  status: WorkAvailabilityStatus
  current_assignment_end_date: string | null
  available_from_date: string | null
  working_style: string | null
  preferred_location: string | null
  note: string | null
  updated_at: string
}

export interface SkillSheet {
  employee_id: string
  employee_name: string
  department_name: string
  summary: string | null
  years_of_experience: number | null
  education: string | null
  skills: EmployeeSkill[]
  certifications: Certification[]
  career_histories: CareerHistory[]
  availability: WorkAvailability | null
  version: number
  updated_at: string
}

export interface SkillSheetListItem {
  employee_id: string
  employee_name: string
  department_name: string
  skill_count: number
  certification_count: number
  top_skills: string[]
  availability_status: WorkAvailabilityStatus | null
  available_from_date: string | null
  updated_at: string
}

export interface AvailabilityWithEmployee {
  employee_id: string
  employee_name: string
  department_name: string
  availability: WorkAvailability | null
}
