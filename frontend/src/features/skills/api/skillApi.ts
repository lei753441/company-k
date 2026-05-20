import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type {
  SkillSheet,
  SkillSheetListItem,
  EmployeeSkill,
  Certification,
  CareerHistory,
  WorkAvailability,
  AvailabilityWithEmployee,
  SkillMaster,
} from '@/types/skill'

const SKILLS_KEY = 'skills'
const AVAILABILITY_KEY = 'availability'

export function useSkillSheets(params: { q?: string; availability_status?: string } = {}) {
  const sp = new URLSearchParams()
  if (params.q) sp.set('q', params.q)
  if (params.availability_status) sp.set('availability_status', params.availability_status)
  const qs = sp.toString()
  return useQuery({
    queryKey: [SKILLS_KEY, 'list', params],
    queryFn: () => api.get<{ items: SkillSheetListItem[]; total: number }>(`/api/skills${qs ? `?${qs}` : ''}`),
  })
}

export function useSkillSheet(employeeId: string) {
  return useQuery({
    queryKey: [SKILLS_KEY, employeeId],
    queryFn: () => api.get<SkillSheet>(`/api/skills/${employeeId}`),
    enabled: !!employeeId,
  })
}

export function useSkillMasters(q?: string) {
  const sp = new URLSearchParams()
  if (q) sp.set('q', q)
  return useQuery({
    queryKey: ['skill-masters', q],
    queryFn: () => api.get<{ items: SkillMaster[]; total: number }>(`/api/skill-masters${q ? `?q=${q}` : ''}`),
  })
}

export function useAddSkill(employeeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<EmployeeSkill>) => api.post<EmployeeSkill>(`/api/skills/${employeeId}/skills`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] }),
  })
}

export function useUpdateSkill(employeeId: string, skillId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<EmployeeSkill>) => api.put<EmployeeSkill>(`/api/skills/${employeeId}/skills/${skillId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] }),
  })
}

export function useDeleteSkill(employeeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (skillId: string) => api.delete(`/api/skills/${employeeId}/skills/${skillId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] }),
  })
}

export function useAddCertification(employeeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Certification>) => api.post<Certification>(`/api/skills/${employeeId}/certifications`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] }),
  })
}

export function useUpdateCertification(employeeId: string, certId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Certification>) => api.put<Certification>(`/api/skills/${employeeId}/certifications/${certId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] }),
  })
}

export function useDeleteCertification(employeeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (certId: string) => api.delete(`/api/skills/${employeeId}/certifications/${certId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] }),
  })
}

export function useAddCareerHistory(employeeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CareerHistory>) => api.post<CareerHistory>(`/api/skills/${employeeId}/career-histories`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] }),
  })
}

export function useUpdateCareerHistory(employeeId: string, careerId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<CareerHistory>) => api.put<CareerHistory>(`/api/skills/${employeeId}/career-histories/${careerId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] }),
  })
}

export function useDeleteCareerHistory(employeeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (careerId: string) => api.delete(`/api/skills/${employeeId}/career-histories/${careerId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] }),
  })
}

export function useAvailabilityList(status?: string) {
  const sp = status ? `?status=${status}` : ''
  return useQuery({
    queryKey: [AVAILABILITY_KEY, 'list', status],
    queryFn: () => api.get<{ items: AvailabilityWithEmployee[]; total: number }>(`/api/availability${sp}`),
  })
}

export function useUpdateAvailability(employeeId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<WorkAvailability>) => api.put<WorkAvailability>(`/api/availability/${employeeId}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [AVAILABILITY_KEY] })
      qc.invalidateQueries({ queryKey: [SKILLS_KEY, employeeId] })
    },
  })
}

export function useSkillSearch(params: { skill_names: string[]; min_proficiency: number; availability_statuses: string[] }) {
  const sp = new URLSearchParams()
  params.skill_names.forEach((n) => sp.append('skill_names', n))
  if (params.min_proficiency > 1) sp.set('min_proficiency', String(params.min_proficiency))
  params.availability_statuses.forEach((s) => sp.append('availability_statuses', s))
  const qs = sp.toString()
  return useQuery({
    queryKey: ['skill-search', params],
    queryFn: () => api.get<{ items: unknown[]; total: number }>(`/api/skills/search${qs ? `?${qs}` : ''}`),
    enabled: params.skill_names.length > 0 || params.availability_statuses.length > 0,
  })
}
