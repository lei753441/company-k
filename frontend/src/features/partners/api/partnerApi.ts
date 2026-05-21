import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Partner,
  PartnerListItem,
  PartnerListParams,
  PartnerEngineer,
  Freelancer,
  FreelancerListParams,
  PartnerStatus,
} from '@/types/partner'

const PARTNER_KEY = 'partners'
const FREELANCER_KEY = 'freelancers'

export function usePartners(params: PartnerListParams = {}) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.status) sp.set('status', params.status)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [PARTNER_KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: PartnerListItem[]; total: number; status_counts: Record<string, number> }>(
        `/api/partners${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: [PARTNER_KEY, id],
    queryFn: () =>
      api.get<Partner & { engineers: PartnerEngineer[] }>(`/api/partners/${id}`),
    enabled: !!id,
  })
}

export function useCreatePartner() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Partner>) => api.post<Partner>('/api/partners', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PARTNER_KEY] }),
  })
}

export function useUpdatePartner(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Partner>) => api.put<Partner>(`/api/partners/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PARTNER_KEY, id] })
      qc.invalidateQueries({ queryKey: [PARTNER_KEY, 'list'] })
    },
  })
}

export function usePartnerEngineers(partnerId: string) {
  return useQuery({
    queryKey: [PARTNER_KEY, partnerId, 'engineers'],
    queryFn: () => api.get<{ items: PartnerEngineer[] }>(`/api/partners/${partnerId}/engineers`),
    enabled: !!partnerId,
  })
}

export function useAddEngineer(partnerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PartnerEngineer>) =>
      api.post<PartnerEngineer>(`/api/partners/${partnerId}/engineers`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PARTNER_KEY, partnerId] }),
  })
}

export function useUpdateEngineer(partnerId: string, engineerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<PartnerEngineer>) =>
      api.put<PartnerEngineer>(`/api/partners/${partnerId}/engineers/${engineerId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [PARTNER_KEY, partnerId] }),
  })
}

export function useFreelancers(params: FreelancerListParams = {}) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.availability_status) sp.set('availability_status', params.availability_status)
  if (params.invoice_status) sp.set('invoice_status', params.invoice_status)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [FREELANCER_KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: Freelancer[]; total: number }>(`/api/freelancers${qs ? `?${qs}` : ''}`),
  })
}

export function useFreelancer(id: string) {
  return useQuery({
    queryKey: [FREELANCER_KEY, id],
    queryFn: () => api.get<Freelancer>(`/api/freelancers/${id}`),
    enabled: !!id,
  })
}

export function useCreateFreelancer() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Freelancer>) => api.post<Freelancer>('/api/freelancers', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [FREELANCER_KEY] }),
  })
}

export function useUpdateFreelancer(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Freelancer>) => api.put<Freelancer>(`/api/freelancers/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [FREELANCER_KEY, id] })
      qc.invalidateQueries({ queryKey: [FREELANCER_KEY, 'list'] })
    },
  })
}
