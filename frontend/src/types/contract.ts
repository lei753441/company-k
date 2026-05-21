export type ContractType = 'ses_commission' | 'lump_sum' | 'outsource_company' | 'outsource_freelancer'
export type ContractPartyType = 'customer' | 'partner' | 'freelancer'
export type ContractStatus = 'draft' | 'signing' | 'active' | 'renewal_due' | 'expired' | 'cancelled' | 'void'
export type UnitType = 'hourly' | 'monthly' | 'fixed'

export interface Contract {
  id: string
  contract_number: string
  contract_type: ContractType
  party_type: ContractPartyType
  party_id: string
  party_name: string
  project_id: string | null
  project_name: string | null
  title: string
  status: ContractStatus
  start_date: string
  end_date: string | null
  is_auto_renewal: boolean
  renewal_notice_months: number
  unit_price: number | null
  unit_type: UnitType | null
  overtime_rate: number | null
  holiday_rate: number | null
  standard_work_hours: number | null
  upper_limit_hours: number | null
  lower_limit_hours: number | null
  fixed_amount: number | null
  payment_terms: string
  note: string | null
  created_by: string
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface ContractListItem {
  id: string
  contract_number: string
  contract_type: ContractType
  party_name: string
  project_name: string | null
  title: string
  status: ContractStatus
  start_date: string
  end_date: string | null
  days_until_expiry: number | null
  unit_price: number | null
}

export interface ContractListParams {
  q?: string
  status?: ContractStatus | ''
  contract_type?: ContractType | ''
  party_type?: ContractPartyType | ''
  page?: number
}
