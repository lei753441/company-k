import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  ExpenseReport,
  ExpenseReportListItem,
  ExpenseListParams,
  ExpenseSummary,
} from '@/types/expense'

const KEY = 'expense-reports'

export function useExpenseReports(params: ExpenseListParams = {}) {
  const sp = new URLSearchParams()
  if (params.year_month) sp.set('year_month', params.year_month)
  if (params.status) sp.set('status', params.status)
  if (params.user_id) sp.set('user_id', params.user_id)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: ExpenseReportListItem[]; total: number; page: number; status_counts: Record<string, number> }>(
        `/api/expense-reports${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function useExpenseReport(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<ExpenseReport>(`/api/expense-reports/${id}`),
    enabled: !!id,
  })
}

export function useCreateExpenseReport() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { title: string; year_month: string; project_id?: string }) =>
      api.post<ExpenseReport>('/api/expense-reports', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useSubmitExpenseReport(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<ExpenseReport>(`/api/expense-reports/${id}/submit`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useApproveExpenseReport(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { comment?: string }) =>
      api.post<ExpenseReport>(`/api/expense-reports/${id}/approve`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useRejectExpenseReport(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { comment: string }) =>
      api.post<ExpenseReport>(`/api/expense-reports/${id}/reject`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useExpenseSummary(yearMonth: string) {
  return useQuery({
    queryKey: [KEY, 'summary', yearMonth],
    queryFn: () => api.get<ExpenseSummary>(`/api/expense-reports/summary/${yearMonth}`),
    enabled: !!yearMonth,
  })
}
