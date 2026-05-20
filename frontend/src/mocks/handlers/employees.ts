import { http, HttpResponse } from 'msw'
import type { Employee } from '@/types/employee'

const employees: Employee[] = [
  {
    employee_id: 'EMP-20240401-0001',
    last_name: '山田',
    first_name: '太郎',
    last_name_kana: 'ヤマダ',
    first_name_kana: 'タロウ',
    birth_date: '1990-05-15',
    gender: 'male',
    email_company: 'yamada.taro@company.example.com',
    email_private: 'yamada.taro@gmail.com',
    phone_company: '090-1234-5678',
    phone_private: null,
    postal_code: '100-0001',
    address_pref: '東京都',
    address_city: '千代田区',
    address_detail: '丸の内1-1-1',
    employment_type: 'full_time',
    hire_date: '2024-04-01',
    retirement_date: null,
    status: 'active',
    department_id: 'DEPT-001',
    department_name: '開発部',
    position_id: 'POS-002',
    position_name: 'エンジニア',
    manager_employee_id: 'EMP-20220101-0001',
    created_at: '2024-04-01T09:00:00Z',
    updated_at: '2024-04-01T09:00:00Z',
    created_by: 'EMP-20200101-0001',
    updated_by: 'EMP-20200101-0001',
  },
  {
    employee_id: 'EMP-20230601-0002',
    last_name: '鈴木',
    first_name: '花子',
    last_name_kana: 'スズキ',
    first_name_kana: 'ハナコ',
    birth_date: '1988-11-20',
    gender: 'female',
    email_company: 'suzuki.hanako@company.example.com',
    email_private: null,
    phone_company: '090-9876-5432',
    phone_private: null,
    postal_code: '150-0001',
    address_pref: '東京都',
    address_city: '渋谷区',
    address_detail: '神南1-2-3',
    employment_type: 'full_time',
    hire_date: '2023-06-01',
    retirement_date: null,
    status: 'active',
    department_id: 'DEPT-002',
    department_name: '営業部',
    position_id: 'POS-003',
    position_name: 'シニアエンジニア',
    manager_employee_id: null,
    created_at: '2023-06-01T09:00:00Z',
    updated_at: '2024-01-15T14:30:00Z',
    created_by: 'EMP-20200101-0001',
    updated_by: 'EMP-20200101-0001',
  },
]

const changeHistory = [
  {
    id: 'HIST-001',
    employee_id: 'EMP-20240401-0001',
    changed_at: '2024-06-01T10:00:00Z',
    changed_by: 'EMP-20200101-0001',
    changed_by_name: '管理者 太郎',
    field_name: 'department_id',
    field_label: '部署',
    old_value: 'DEPT-003',
    new_value: 'DEPT-001',
  },
]

export const employeeHandlers = [
  http.get('/api/employees', ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const departmentId = url.searchParams.get('department_id') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 50

    let filtered = [...employees]
    if (query) {
      filtered = filtered.filter(
        (e) =>
          e.last_name.includes(query) ||
          e.first_name.includes(query) ||
          e.employee_id.includes(query) ||
          e.email_company.includes(query),
      )
    }
    if (status) filtered = filtered.filter((e) => e.status === status)
    if (departmentId) filtered = filtered.filter((e) => e.department_id === departmentId)

    const start = (page - 1) * limit
    return HttpResponse.json({
      items: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    })
  }),

  http.get('/api/employees/:id', ({ params }) => {
    const emp = employees.find((e) => e.employee_id === params.id)
    if (!emp) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(emp)
  }),

  http.post('/api/employees', async ({ request }) => {
    const body = await request.json() as Record<string, unknown>
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const newId = `EMP-${today}-${String(employees.length + 1).padStart(4, '0')}`
    const now = new Date().toISOString()
    const newEmp = {
      ...body,
      employee_id: newId,
      status: 'active',
      department_name: '開発部',
      position_name: null,
      created_at: now,
      updated_at: now,
      created_by: 'EMP-20200101-0001',
      updated_by: 'EMP-20200101-0001',
    } as Employee
    employees.push(newEmp)
    return HttpResponse.json(newEmp, { status: 201 })
  }),

  http.put('/api/employees/:id', async ({ params, request }) => {
    const idx = employees.findIndex((e) => e.employee_id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = await request.json() as Record<string, unknown>
    employees[idx] = { ...employees[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(employees[idx])
  }),

  http.post('/api/employees/:id/retire', async ({ params, request }) => {
    const idx = employees.findIndex((e) => e.employee_id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = await request.json() as { retirement_date: string; retirement_reason: string }
    employees[idx] = {
      ...employees[idx],
      status: 'retiring',
      retirement_date: body.retirement_date,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(employees[idx])
  }),

  http.post('/api/employees/:id/leave', async ({ params }) => {
    const idx = employees.findIndex((e) => e.employee_id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    employees[idx] = { ...employees[idx], status: 'on_leave', updated_at: new Date().toISOString() }
    return HttpResponse.json(employees[idx])
  }),

  http.post('/api/employees/:id/return', async ({ params }) => {
    const idx = employees.findIndex((e) => e.employee_id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    employees[idx] = { ...employees[idx], status: 'active', updated_at: new Date().toISOString() }
    return HttpResponse.json(employees[idx])
  }),

  http.get('/api/employees/:id/history', ({ params }) => {
    const history = changeHistory.filter((h) => h.employee_id === params.id)
    return HttpResponse.json({ items: history, total: history.length })
  }),
]
