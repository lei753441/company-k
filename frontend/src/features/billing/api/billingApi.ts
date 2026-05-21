import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Invoice,
  InvoiceListItem,
  InvoiceListParams,
  PaymentRecord,
  PaymentListParams,
  BillingSummary,
} from '@/types/billing'

const INV_KEY = 'invoices'
const PAY_KEY = 'payment-records'
const SUMMARY_KEY = 'billing-summary'

export function useInvoices(params: InvoiceListParams = {}) {
  const sp = new URLSearchParams()
  if (params.year_month) sp.set('year_month', params.year_month)
  if (params.status) sp.set('status', params.status)
  if (params.customer_id) sp.set('customer_id', params.customer_id)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [INV_KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: InvoiceListItem[]; total: number; page: number; status_counts: Record<string, number> }>(
        `/api/invoices${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [INV_KEY, id],
    queryFn: () => api.get<Invoice>(`/api/invoices/${id}`),
    enabled: !!id,
  })
}

export function useUpdateInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Invoice>) => api.put<Invoice>(`/api/invoices/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INV_KEY, id] })
      qc.invalidateQueries({ queryKey: [INV_KEY, 'list'] })
    },
  })
}

export function useSendInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<Invoice>(`/api/invoices/${id}/send`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INV_KEY, id] })
      qc.invalidateQueries({ queryKey: [INV_KEY, 'list'] })
    },
  })
}

export function useApproveInvoice(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<Invoice>(`/api/invoices/${id}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INV_KEY, id] })
      qc.invalidateQueries({ queryKey: [INV_KEY, 'list'] })
    },
  })
}

export function useReceivePayment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { amount: number; date: string }) =>
      api.post<Invoice>(`/api/invoices/${id}/receive-payment`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [INV_KEY, id] })
      qc.invalidateQueries({ queryKey: [INV_KEY, 'list'] })
    },
  })
}

export function usePaymentRecords(params: PaymentListParams = {}) {
  const sp = new URLSearchParams()
  if (params.year_month) sp.set('year_month', params.year_month)
  if (params.status) sp.set('status', params.status)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [PAY_KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: PaymentRecord[]; total: number; page: number; status_counts: Record<string, number> }>(
        `/api/payment-records${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function usePaymentRecord(id: string) {
  return useQuery({
    queryKey: [PAY_KEY, id],
    queryFn: () => api.get<PaymentRecord>(`/api/payment-records/${id}`),
    enabled: !!id,
  })
}

export function useApprovePaymentRecord(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<PaymentRecord>(`/api/payment-records/${id}/approve`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAY_KEY, id] })
      qc.invalidateQueries({ queryKey: [PAY_KEY, 'list'] })
    },
  })
}

export function useMarkPaymentPaid(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<PaymentRecord>(`/api/payment-records/${id}/mark-paid`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [PAY_KEY, id] })
      qc.invalidateQueries({ queryKey: [PAY_KEY, 'list'] })
    },
  })
}

export function useBillingSummary(yearMonth: string) {
  return useQuery({
    queryKey: [SUMMARY_KEY, yearMonth],
    queryFn: () => api.get<BillingSummary>(`/api/billing/summary/${yearMonth}`),
    enabled: !!yearMonth,
  })
}
