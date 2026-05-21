export type CandidateType = 'employee' | 'partner_engineer' | 'freelancer'
export type AvailabilityStatus = 'available' | 'available_soon' | 'in_project' | 'unavailable'
export type ProposalStatus = 'draft' | 'proposed' | 'confirmed' | 'rejected'
export type CandidateIntention = 'ok' | 'ng' | 'pending'

export interface MatchingCandidate {
  person_id: string
  person_type: CandidateType
  name: string
  company_name: string | null
  skills: string[]
  availability_status: AvailabilityStatus
  available_from: string | null
  desired_rate: number | null
  score_total: number
  score_skill: number
  score_availability: number
  score_rate: number
  skill_match_details: {
    skill: string
    required: boolean
    matched: boolean
  }[]
}

export interface ProposalCandidate {
  id: string
  proposal_id: string
  person_id: string
  person_name: string
  person_type: CandidateType
  company_name: string | null
  score_total: number
  note: string | null
  intention: CandidateIntention
  intention_updated_at: string | null
}

export interface Proposal {
  id: string
  project_id: string
  project_name: string
  status: ProposalStatus
  note: string | null
  candidates: ProposalCandidate[]
  created_by: string
  created_by_name: string
  created_at: string
  updated_at: string
}

export interface ProposalListItem {
  id: string
  project_id: string
  project_name: string
  status: ProposalStatus
  candidate_count: number
  confirmed_count: number
  created_at: string
  updated_at: string
}

export interface MatchingSearchParams {
  project_id: string
  skill_weight: number
  availability_weight: number
  rate_weight: number
  availability_status?: AvailabilityStatus | ''
  candidate_type?: CandidateType | ''
}
