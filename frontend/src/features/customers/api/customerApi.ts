import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Company,
  CompanyListItem,
  CompanyListParams,
  Contact,
  Interaction,
} from '@/types/customer'

const KEY = 'companies'

export function useCompanies(params: CompanyListParams = {}) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.status) sp.set('status', params.status)
  if (params.company_type) sp.set('company_type', params.company_type)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: CompanyListItem[]; total: number; page: number; status_counts: Record<string, number> }>(
        `/api/companies${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () =>
      api.get<Company & { contacts: Contact[]; interactions: Interaction[] }>(`/api/companies/${id}`),
    enabled: !!id,
  })
}

export function useCreateCompany() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Company>) => api.post<Company>('/api/companies', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateCompany(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Company>) => api.put<Company>(`/api/companies/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useAddContact(companyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Contact>) => api.post<Contact>(`/api/companies/${companyId}/contacts`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, companyId] }),
  })
}

export function useUpdateContact(companyId: string, contactId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Contact>) =>
      api.put<Contact>(`/api/companies/${companyId}/contacts/${contactId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, companyId] }),
  })
}

export function useResignContact(companyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (contactId: string) => api.delete(`/api/companies/${companyId}/contacts/${contactId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, companyId] }),
  })
}

export function useAddInteraction(companyId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Interaction>) =>
      api.post<Interaction>(`/api/companies/${companyId}/interactions`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, companyId] }),
  })
}

export function useUpdateInteraction(companyId: string, interactionId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Interaction>) =>
      api.put<Interaction>(`/api/companies/${companyId}/interactions/${interactionId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, companyId] })
      qc.invalidateQueries({ queryKey: ['followup'] })
    },
  })
}

export function useFollowUpList() {
  return useQuery({
    queryKey: ['followup'],
    queryFn: () =>
      api.get<{ items: (Interaction & { company_name: string })[]; total: number }>('/api/interactions/followup'),
  })
}
