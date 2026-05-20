import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  Project,
  ProjectListItem,
  ProjectListParams,
  ProjectRate,
  ProjectAssignment,
  ProjectStatusLog,
  StatusChangeRequest,
  AssignmentRequest,
  RateRequest,
} from '@/types/project'

const KEY = 'projects'

export function useProjects(params: ProjectListParams = {}) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.status) sp.set('status', params.status)
  if (params.project_type) sp.set('project_type', params.project_type)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: ProjectListItem[]; total: number; page: number; limit: number; status_counts: Record<string, number> }>(
        `/api/projects${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function useProject(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () =>
      api.get<Project & { assignments: ProjectAssignment[]; rates: ProjectRate[]; status_logs: ProjectStatusLog[] }>(
        `/api/projects/${id}`,
      ),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Project>) => api.post<Project>('/api/projects', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useUpdateProject(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Project>) => api.put<Project>(`/api/projects/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useChangeProjectStatus(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: StatusChangeRequest) => api.post<Project>(`/api/projects/${id}/status`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, id] }),
  })
}

export function useAddAssignment(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: AssignmentRequest) => api.post<ProjectAssignment>(`/api/projects/${projectId}/assignments`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, projectId] }),
  })
}

export function useUpdateAssignment(projectId: string, assignmentId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AssignmentRequest>) =>
      api.put<ProjectAssignment>(`/api/projects/${projectId}/assignments/${assignmentId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, projectId] }),
  })
}

export function useDeleteAssignment(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: string) => api.delete(`/api/projects/${projectId}/assignments/${assignmentId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, projectId] }),
  })
}

export function useAddRate(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: RateRequest) => api.post<ProjectRate>(`/api/projects/${projectId}/rates`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, projectId] }),
  })
}

export function useDeleteRate(projectId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rateId: string) => api.delete(`/api/projects/${projectId}/rates/${rateId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY, projectId] }),
  })
}
