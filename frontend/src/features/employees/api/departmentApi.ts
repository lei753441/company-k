import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Department, Position } from '@/types/employee'

const DEPT_KEY = 'departments'

export function useDepartments() {
  return useQuery({
    queryKey: [DEPT_KEY],
    queryFn: () => api.get<{ items: Department[] }>('/api/departments'),
  })
}

export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: () => api.get<{ items: Position[] }>('/api/positions'),
  })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Omit<Department, 'department_id' | 'is_active'>) =>
      api.post<Department>('/api/departments', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEPT_KEY] }),
  })
}

export function useUpdateDepartment(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Department>) => api.put<Department>(`/api/departments/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEPT_KEY] }),
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/departments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [DEPT_KEY] }),
  })
}
