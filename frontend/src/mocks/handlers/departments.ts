import { http, HttpResponse } from 'msw'
import type { Department, Position } from '@/types/employee'

const departments: Department[] = [
  { department_id: 'DEPT-001', name: '開発部', parent_department_id: null, manager_employee_id: null, is_active: true },
  { department_id: 'DEPT-002', name: '営業部', parent_department_id: null, manager_employee_id: null, is_active: true },
  { department_id: 'DEPT-003', name: 'インフラチーム', parent_department_id: 'DEPT-001', manager_employee_id: null, is_active: true },
]

const positions: Position[] = [
  { position_id: 'POS-001', name: 'ジュニアエンジニア', rank: 1, is_active: true },
  { position_id: 'POS-002', name: 'エンジニア', rank: 2, is_active: true },
  { position_id: 'POS-003', name: 'シニアエンジニア', rank: 3, is_active: true },
  { position_id: 'POS-004', name: 'PM', rank: 4, is_active: true },
  { position_id: 'POS-005', name: '部長', rank: 5, is_active: true },
]

export const departmentHandlers = [
  http.get('/api/departments', () => {
    return HttpResponse.json({ items: departments.filter((d) => d.is_active) })
  }),

  http.post('/api/departments', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const newDept: Department = {
      department_id: `DEPT-${String(departments.length + 1).padStart(3, '0')}`,
      name: body.name as string,
      parent_department_id: (body.parent_department_id as string | null) ?? null,
      manager_employee_id: null,
      is_active: true,
    }
    departments.push(newDept)
    return HttpResponse.json(newDept, { status: 201 })
  }),

  http.put('/api/departments/:id', async ({ params, request }) => {
    const idx = departments.findIndex((d) => d.department_id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = await request.json() as Record<string, unknown>
    departments[idx] = { ...departments[idx], ...body }
    return HttpResponse.json(departments[idx])
  }),

  http.delete('/api/departments/:id', ({ params }) => {
    const idx = departments.findIndex((d) => d.department_id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    departments[idx] = { ...departments[idx], is_active: false }
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/positions', () => {
    return HttpResponse.json({ items: positions.filter((p) => p.is_active) })
  }),
]
