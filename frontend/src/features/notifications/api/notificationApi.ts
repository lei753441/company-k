import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Notification, WorkflowTask, WorkflowStatus } from '@/types/notification'

const NOTIF_KEY = 'notifications'
const WORKFLOW_KEY = 'workflow-tasks'

export function useNotifications() {
  return useQuery({
    queryKey: [NOTIF_KEY],
    queryFn: () => api.get<{ items: Notification[]; unread_count: number }>('/api/notifications'),
    refetchInterval: 30000,
  })
}

export function useMarkRead(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<Notification>(`/api/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<{ updated_count: number }>('/api/notifications/read-all', {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIF_KEY] }),
  })
}

export function useWorkflowTasks(status?: WorkflowStatus) {
  const sp = new URLSearchParams()
  if (status) sp.set('status', status)
  const qs = sp.toString()
  return useQuery({
    queryKey: [WORKFLOW_KEY, status],
    queryFn: () =>
      api.get<{ items: WorkflowTask[]; total: number }>(`/api/workflow-tasks${qs ? `?${qs}` : ''}`),
  })
}

export function useApproveTask(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<WorkflowTask>(`/api/workflow-tasks/${id}/approve`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WORKFLOW_KEY] }),
  })
}

export function useRejectTask(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { comment: string }) =>
      api.post<WorkflowTask>(`/api/workflow-tasks/${id}/reject`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: [WORKFLOW_KEY] }),
  })
}
