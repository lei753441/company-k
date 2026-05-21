import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { Document, DocumentListItem, DocumentListParams } from '@/types/document'

const KEY = 'documents'

export function useDocuments(params: DocumentListParams = {}) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.category) sp.set('category', params.category)
  if (params.tag) sp.set('tag', params.tag)
  if (params.page) sp.set('page', String(params.page))
  const qs = sp.toString()
  return useQuery({
    queryKey: [KEY, 'list', params],
    queryFn: () =>
      api.get<{ items: DocumentListItem[]; total: number; category_counts: Record<string, number> }>(
        `/api/documents${qs ? `?${qs}` : ''}`,
      ),
  })
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: [KEY, id],
    queryFn: () => api.get<Document>(`/api/documents/${id}`),
    enabled: !!id,
  })
}

export function useCreateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      title: string
      category: string
      tags: string[]
      related_employee_id?: string | null
      related_employee_name?: string | null
      related_project_id?: string | null
      related_project_name?: string | null
      related_customer_id?: string | null
      related_customer_name?: string | null
      file_name: string
      file_size: number
      mime_type: string
      change_comment?: string | null
    }) => api.post<Document>('/api/documents', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}

export function useAddDocumentVersion(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      file_name: string
      file_size: number
      mime_type: string
      change_comment?: string | null
    }) => api.post<Document>(`/api/documents/${id}/versions`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KEY, id] })
      qc.invalidateQueries({ queryKey: [KEY, 'list'] })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/documents/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [KEY] }),
  })
}
