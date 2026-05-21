export type PartnerStatus = 'active' | 'dormant' | 'suspended'
export type InvoiceRegistrationStatus = 'registered' | 'pending' | 'not_registered'
export type EngineerStatus = 'active' | 'resigned'

export interface Partner {
  id: string
  name: string
  name_kana: string | null
  corporate_number: string | null
  invoice_number: string | null
  prefecture: string | null
  address: string | null
  phone: string | null
  website_url: string | null
  status: PartnerStatus
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PartnerListItem {
  id: string
  name: string
  prefecture: string | null
  status: PartnerStatus
  engineer_count: number
  active_project_count: number
  tags: string[]
  updated_at: string
}

export interface PartnerEngineer {
  id: string
  partner_id: string
  last_name: string
  first_name: string
  last_name_kana: string | null
  first_name_kana: string | null
  email: string | null
  phone: string | null
  status: EngineerStatus
  availability_status: 'available' | 'available_soon' | 'in_project' | 'unavailable'
  available_from: string | null
  unit_price: number | null
  skills: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Freelancer {
  id: string
  last_name: string
  first_name: string
  last_name_kana: string | null
  first_name_kana: string | null
  email: string | null
  phone: string | null
  trade_name: string | null
  invoice_registration_status: InvoiceRegistrationStatus
  invoice_number: string | null
  prefecture: string | null
  status: 'active' | 'inactive'
  availability_status: 'available' | 'available_soon' | 'in_project' | 'unavailable'
  available_from: string | null
  unit_price: number | null
  skills: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PartnerListParams {
  q?: string
  status?: PartnerStatus | ''
  page?: number
}

export interface FreelancerListParams {
  q?: string
  availability_status?: string
  invoice_status?: InvoiceRegistrationStatus | ''
  page?: number
}
