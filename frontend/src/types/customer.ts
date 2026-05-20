export type CompanyType = 'customer' | 'partner' | 'both'
export type CompanyStatus = 'prospect' | 'active' | 'dormant' | 'suspended'
export type InteractionType = 'meeting' | 'online' | 'phone' | 'email' | 'other'
export type ContactStatus = 'active' | 'resigned'

export interface Company {
  id: string
  company_type: CompanyType
  name: string
  name_kana: string | null
  corporate_number: string | null
  industry: string | null
  prefecture: string | null
  address: string | null
  phone: string | null
  website_url: string | null
  status: CompanyStatus
  tags: string[]
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface CompanyListItem {
  id: string
  company_type: CompanyType
  name: string
  industry: string | null
  prefecture: string | null
  status: CompanyStatus
  tags: string[]
  contact_count: number
  last_interaction_at: string | null
  updated_at: string
}

export interface Contact {
  id: string
  company_id: string
  last_name: string
  first_name: string
  last_name_kana: string | null
  first_name_kana: string | null
  department: string | null
  title: string | null
  email: string | null
  phone: string | null
  mobile: string | null
  status: ContactStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Interaction {
  id: string
  company_id: string
  project_id: string | null
  project_name: string | null
  interaction_type: InteractionType
  interacted_at: string
  our_attendees: string[]
  client_contact_ids: string[]
  client_contact_names: string[]
  subject: string
  content: string
  next_action: string | null
  follow_up_date: string | null
  created_by: string
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface CompanyListParams {
  q?: string
  status?: CompanyStatus | ''
  company_type?: CompanyType | ''
  industry?: string
  prefecture?: string
  page?: number
}
