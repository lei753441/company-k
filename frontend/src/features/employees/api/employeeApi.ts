import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Employee,
  EmployeeListResponse,
  EmployeeListParams,
  ChangeHistory,
  RetireRequest,
  LeaveRequest,
} from '@/types/employee'

const EMPLOYEES_KEY = 'employees'

export function useEmployees(params: EmployeeListParams = {}) {
  const searchParams = new URLSearchParams()
  if (params.q) searchParams.set('q', params.q)
  if (params.status) searchParams.set('status', params.status)
  if (params.department_id) searchParams.set('department_id', params.department_id)
  if (params.employment_type) searchParams.set('employment_type', params.employment_type)
  if (params.page) searchParams.set('page', String(params.page))

  const query = searchParams.toString()
  return useQuery({
    queryKey: [EMPLOYEES_KEY, 'list', params],
    queryFn: () => api.get<EmployeeListResponse>(`/api/employees${query ? `?${query}` : ''}`),
  })
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, id],
    queryFn: () => api.get<Employee>(`/api/employees/${id}`),
    enabled: !!id,
  })
}

export function useCreateEmployee() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<Employee>('/api/employees', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  })
}

export function useUpdateEmployee(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Employee>) => api.put<Employee>(`/api/employees/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY, id] })
      qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY, 'list'] })
    },
  })
}

export function useRetireEmployee(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RetireRequest) => api.post<Employee>(`/api/employees/${id}/retire`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  })
}

export function useLeaveEmployee(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: LeaveRequest) => api.post<Employee>(`/api/employees/${id}/leave`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  })
}

export function useReturnEmployee(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<Employee>(`/api/employees/${id}/return`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [EMPLOYEES_KEY] }),
  })
}

export function useEmployeeHistory(id: string) {
  return useQuery({
    queryKey: [EMPLOYEES_KEY, id, 'history'],
    queryFn: () => api.get<{ items: ChangeHistory[]; total: number }>(`/api/employees/${id}/history`),
    enabled: !!id,
  })
}
