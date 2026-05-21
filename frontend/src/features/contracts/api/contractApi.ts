import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Contract, ContractListItem, ContractListParams } from '@/types/contract'

const KEY = 'contracts'

export function useContracts(params: ContractListParams = {}) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.status) sp.set('status', params.status)
  if (params.contract_type) sp.set('contract_type', params.contract_type)
  if (params.party_type) sp.set('party_type', params.party_type)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: ContractListItem[]; total: number; page: number; status_counts: Record<string, number> }>(
        `/api/contracts${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Contract>(`/api/contracts/${id}`),
    enabled: !!id,
  })
}

export function useCreateContract() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Contract>) => api.post<Contract>('/api/contracts', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateContract(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Contract>) => api.put<Contract>(`/api/contracts/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useSendForSigning(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<Contract>(`/api/contracts/${id}/send-for-signing`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useActivateContract(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<Contract>(`/api/contracts/${id}/activate`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useCancelContract(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<Contract>(`/api/contracts/${id}/cancel`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useRenewalAlerts() {
  return useQuery({
    queryKey: [KEY, 'renewal-alerts'],
    queryFn: () =>
      api.get<{ items: ContractListItem[]; total: number }>('/api/contracts/renewal-alerts'),
  })
}
