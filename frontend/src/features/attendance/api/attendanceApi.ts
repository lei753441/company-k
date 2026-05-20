import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  TodayClock,
  MonthlyTimesheet,
  MonthlyTimesheetListItem,
  LeaveRequest,
  MonthlySummary,
  PaidLeaveBalance,
  TimesheetListParams,
} from '@/types/attendance'

const CLOCK_KEY = 'attendance-today'
const TS_KEY = 'timesheets'
const LEAVE_KEY = 'leave-requests'
const SUMMARY_KEY = 'attendance-summary'
const BALANCE_KEY = 'paid-leave-balance'

export function useTodayClock() {
  return useQuery({
    queryKey: [CLOCK_KEY],
    queryFn: () => api.get<TodayClock>('/api/attendance/today'),
    refetchInterval: 60_000,
  })
}

export function useClockIn() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<TodayClock>('/api/attendance/clock-in', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLOCK_KEY] }),
  })
}

export function useClockOut() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<TodayClock>('/api/attendance/clock-out', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [CLOCK_KEY] }),
  })
}

export function useTimesheets(params: TimesheetListParams = {}) {
  const sp = new URLSearchParams()
  if (params.year_month) sp.set('year_month', params.year_month)
  if (params.status) sp.set('status', params.status)
  if (params.user_id) sp.set('user_id', params.user_id)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [TS_KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: MonthlyTimesheetListItem[]; total: number; page: number; status_counts: Record<string, number> }>(
        `/api/timesheets${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function useTimesheet(id: string) {
  return useQuery({
    queryKey: [TS_KEY, id],
    queryFn: () => api.get<MonthlyTimesheet>(`/api/timesheets/${id}`),
    enabled: !!id,
  })
}

export function useSubmitTimesheet(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<MonthlyTimesheet>(`/api/timesheets/${id}/submit`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TS_KEY, id] })
      qc.invalidateQueries({ queryKey: [TS_KEY, 'list'] })
    },
  })
}

export function useApproveTimesheet(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { comment?: string }) => api.post<MonthlyTimesheet>(`/api/timesheets/${id}/approve`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TS_KEY, id] })
      qc.invalidateQueries({ queryKey: [TS_KEY, 'list'] })
      qc.invalidateQueries({ queryKey: [SUMMARY_KEY] })
    },
  })
}

export function useRejectTimesheet(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { comment?: string }) => api.post<MonthlyTimesheet>(`/api/timesheets/${id}/reject`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TS_KEY, id] })
      qc.invalidateQueries({ queryKey: [TS_KEY, 'list'] })
    },
  })
}

export function useLeaveRequests(params: { status?: string; user_id?: string } = {}) {
  const sp = new URLSearchParams()
  if (params.status) sp.set('status', params.status)
  if (params.user_id) sp.set('user_id', params.user_id)
  const qs = sp.toString()
  return useQuery({
    queryKey: [LEAVE_KEY, params],
    queryFn: () =>
      api.get<{ items: LeaveRequest[]; total: number }>(`/api/leave-requests${qs ? `?${qs}` : ''}`),
  })
}

export function useCreateLeaveRequest() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<LeaveRequest>) => api.post<LeaveRequest>('/api/leave-requests', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEAVE_KEY] })
      qc.invalidateQueries({ queryKey: [BALANCE_KEY] })
    },
  })
}

export function useCancelLeaveRequest(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<LeaveRequest>(`/api/leave-requests/${id}/cancel`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEAVE_KEY] }),
  })
}

export function useApproveLeaveRequest(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { comment?: string }) => api.post<LeaveRequest>(`/api/leave-requests/${id}/approve`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEAVE_KEY] }),
  })
}

export function useRejectLeaveRequest(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { comment?: string }) => api.post<LeaveRequest>(`/api/leave-requests/${id}/reject`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [LEAVE_KEY] }),
  })
}

export function useMonthlySummary(yearMonth: string) {
  return useQuery({
    queryKey: [SUMMARY_KEY, yearMonth],
    queryFn: () => api.get<MonthlySummary>(`/api/attendance/summary/${yearMonth}`),
    enabled: !!yearMonth,
  })
}

export function usePaidLeaveBalance() {
  return useQuery({
    queryKey: [BALANCE_KEY],
    queryFn: () => api.get<PaidLeaveBalance>('/api/attendance/paid-leave-balance'),
  })
}

export function useMonthlyClose() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (yearMonth: string) => api.post<{ year_month: string; closed: boolean }>(`/api/attendance/close/${yearMonth}`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [TS_KEY] })
      qc.invalidateQueries({ queryKey: [SUMMARY_KEY] })
    },
  })
}
