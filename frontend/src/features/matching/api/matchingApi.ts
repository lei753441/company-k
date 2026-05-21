import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  MatchingCandidate,
  MatchingSearchParams,
  Proposal,
  ProposalCandidate,
  ProposalListItem,
  CandidateIntention,
  ProposalStatus,
} from '@/types/matching'

const PROPOSALS_KEY = 'proposals'

export function useMatchingSearch(params: MatchingSearchParams | null) {
  return useQuery({
    queryKey: ['matching', 'search', params],
    queryFn: () =>
      api.post<{ candidates: MatchingCandidate[]; project_name: string }>(
        '/api/matching/search',
        params,
      ),
    enabled: params !== null && !!params.project_id,
  })
}

export function useProposals() {
  return useQuery({
    queryKey: [PROPOSALS_KEY, 'list'],
    queryFn: () => api.get<{ items: ProposalListItem[]; total: number }>('/api/proposals'),
  })
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: [PROPOSALS_KEY, id],
    queryFn: () => api.get<Proposal>(`/api/proposals/${id}`),
    enabled: !!id,
  })
}

export function useCreateProposal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { project_id: string; note: string | null }) =>
      api.post<Proposal>('/api/proposals', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROPOSALS_KEY] }),
  })
}

export function useAddProposalCandidate(proposalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      person_id: string
      person_name: string
      person_type: string
      company_name: string | null
      score_total: number
      note: string | null
    }) => api.post<ProposalCandidate>(`/api/proposals/${proposalId}/candidates`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROPOSALS_KEY, proposalId] })
      qc.invalidateQueries({ queryKey: [PROPOSALS_KEY, 'list'] })
    },
  })
}

export function useDeleteProposalCandidate(proposalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (candidateId: string) =>
      api.delete<void>(`/api/proposals/${proposalId}/candidates/${candidateId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROPOSALS_KEY, proposalId] })
      qc.invalidateQueries({ queryKey: [PROPOSALS_KEY, 'list'] })
    },
  })
}

export function useUpdateCandidateIntention(proposalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ candidateId, intention }: { candidateId: string; intention: CandidateIntention }) =>
      api.put<ProposalCandidate>(
        `/api/proposals/${proposalId}/candidates/${candidateId}/intention`,
        { intention },
      ),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PROPOSALS_KEY, proposalId] }),
  })
}

export function useUpdateProposalStatus(proposalId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (status: ProposalStatus) =>
      api.put<Proposal>(`/api/proposals/${proposalId}/status`, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PROPOSALS_KEY, proposalId] })
      qc.invalidateQueries({ queryKey: [PROPOSALS_KEY, 'list'] })
    },
  })
}
