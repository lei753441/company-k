import { http, HttpResponse } from 'msw'
import type {
  Project,
  ProjectListItem,
  ProjectRate,
  ProjectAssignment,
  ProjectStatusLog,
  ProjectStatus,
} from '@/types/project'

let projects: Project[] = [
  {
    id: 'PRJ-2026-0001',
    project_type: 'ses',
    name: 'ECサイトリニューアル支援',
    description: '大手ECサイトのフロントエンド刷新。ReactへのSPA移行と新規機能開発を担当。',
    company_id: 'CMP-001',
    company_name: '株式会社テックコーポレーション',
    sales_user_id: 'EMP-20200101-0001',
    sales_user_name: '管理者 太郎',
    status: 'in_progress',
    start_date: '2026-04-01',
    end_date: '2026-09-30',
    skill_tags: ['TypeScript', 'React', 'AWS'],
    notes: '月次レポートを毎月末に提出する。',
    ses_detail: {
      work_location: '東京都渋谷区（一部リモート）',
      work_style: 'hybrid',
      required_headcount: 2,
      contract_unit: 'monthly',
      min_hours: 140,
      max_hours: 180,
    },
    consignment_detail: null,
    created_by: 'EMP-20200101-0001',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'PRJ-2026-0002',
    project_type: 'ses',
    name: '大手銀行システム刷新PJ',
    description: 'Javaバックエンドのマイクロサービス化。Spring Boot + DynamoDB へのマイグレーション。',
    company_id: 'CMP-002',
    company_name: '大手銀行グループ',
    sales_user_id: 'EMP-20200101-0001',
    sales_user_name: '管理者 太郎',
    status: 'proposing',
    start_date: '2026-07-01',
    end_date: null,
    skill_tags: ['Java', 'Spring Boot', 'DynamoDB'],
    notes: null,
    ses_detail: {
      work_location: '東京都千代田区（フル常駐）',
      work_style: 'onsite',
      required_headcount: 3,
      contract_unit: 'monthly',
      min_hours: 140,
      max_hours: 200,
    },
    consignment_detail: null,
    created_by: 'EMP-20200101-0001',
    created_at: '2026-03-01T09:00:00Z',
    updated_at: '2026-03-20T09:00:00Z',
  },
  {
    id: 'PRJ-2026-0003',
    project_type: 'consignment',
    name: '在庫管理システム受託開発',
    description: '物流会社向けの在庫管理システムをフルスクラッチで開発。React + Go + DynamoDB 構成。',
    company_id: 'CMP-003',
    company_name: '日本流通株式会社',
    sales_user_id: 'EMP-20200101-0001',
    sales_user_name: '管理者 太郎',
    status: 'ordered',
    start_date: '2026-05-01',
    end_date: '2026-12-31',
    skill_tags: ['Go', 'React', 'DynamoDB', 'AWS'],
    notes: 'マイルストーン1: 基本設計完了(6月末)、マイルストーン2: 開発完了(10月末)、マイルストーン3: 本番稼働(12月末)',
    ses_detail: null,
    consignment_detail: {
      contract_amount: 12000000,
      payment_terms: 'マイルストーン払い（3回）',
      deliverables: '在庫管理システム一式（設計書・ソースコード・テスト報告書含む）',
      acceptance_criteria: '要件定義書の全機能を満たし、受け入れテストを通過すること',
    },
    created_by: 'EMP-20200101-0001',
    created_at: '2026-02-15T09:00:00Z',
    updated_at: '2026-04-20T09:00:00Z',
  },
  {
    id: 'PRJ-2025-0012',
    project_type: 'ses',
    name: '決済システムインフラ整備',
    description: '既存決済システムのAWS移行とCI/CD整備。',
    company_id: 'CMP-001',
    company_name: '株式会社テックコーポレーション',
    sales_user_id: 'EMP-20200101-0001',
    sales_user_name: '管理者 太郎',
    status: 'completed',
    start_date: '2025-07-01',
    end_date: '2026-02-28',
    skill_tags: ['AWS', 'Docker', 'Kubernetes'],
    notes: null,
    ses_detail: {
      work_location: '東京都渋谷区',
      work_style: 'hybrid',
      required_headcount: 1,
      contract_unit: 'monthly',
      min_hours: 140,
      max_hours: 180,
    },
    consignment_detail: null,
    created_by: 'EMP-20200101-0001',
    created_at: '2025-06-01T09:00:00Z',
    updated_at: '2026-03-01T09:00:00Z',
  },
]

let rates: ProjectRate[] = [
  { id: 'RATE-001', project_id: 'PRJ-2026-0001', target_type: 'employee', target_id: 'EMP-20240401-0001', target_name: '山田 太郎', billing_rate: 650000, payment_rate: 500000, rate_unit: 'monthly', valid_from: '2026-04-01', valid_to: null },
  { id: 'RATE-002', project_id: 'PRJ-2026-0001', target_type: 'employee', target_id: 'EMP-20230601-0002', target_name: '鈴木 花子', billing_rate: 850000, payment_rate: 650000, rate_unit: 'monthly', valid_from: '2026-04-01', valid_to: null },
  { id: 'RATE-003', project_id: 'PRJ-2026-0003', target_type: 'employee', target_id: 'EMP-20230601-0002', target_name: '鈴木 花子', billing_rate: 900000, payment_rate: 700000, rate_unit: 'monthly', valid_from: '2026-05-01', valid_to: null },
]

let assignments: ProjectAssignment[] = [
  { id: 'ASGN-001', project_id: 'PRJ-2026-0001', assignee_type: 'employee', assignee_id: 'EMP-20240401-0001', assignee_name: '山田 太郎', role: 'フロントエンドエンジニア', start_date: '2026-04-01', end_date: '2026-09-30', status: 'confirmed' },
  { id: 'ASGN-002', project_id: 'PRJ-2026-0001', assignee_type: 'employee', assignee_id: 'EMP-20230601-0002', assignee_name: '鈴木 花子', role: 'テックリード', start_date: '2026-04-01', end_date: '2026-09-30', status: 'confirmed' },
  { id: 'ASGN-003', project_id: 'PRJ-2026-0003', assignee_type: 'employee', assignee_id: 'EMP-20230601-0002', assignee_name: '鈴木 花子', role: 'PM', start_date: '2026-05-01', end_date: '2026-12-31', status: 'confirmed' },
]

let statusLogs: ProjectStatusLog[] = [
  { id: 'LOG-001', project_id: 'PRJ-2026-0001', from_status: 'negotiating', to_status: 'proposing', reason: null, changed_by: 'EMP-20200101-0001', changed_by_name: '管理者 太郎', changed_at: '2026-01-20T09:00:00Z' },
  { id: 'LOG-002', project_id: 'PRJ-2026-0001', from_status: 'proposing', to_status: 'ordered', reason: null, changed_by: 'EMP-20200101-0001', changed_by_name: '管理者 太郎', changed_at: '2026-02-10T09:00:00Z' },
  { id: 'LOG-003', project_id: 'PRJ-2026-0001', from_status: 'ordered', to_status: 'in_progress', reason: null, changed_by: 'EMP-20200101-0001', changed_by_name: '管理者 太郎', changed_at: '2026-04-01T09:00:00Z' },
  { id: 'LOG-004', project_id: 'PRJ-2025-0012', from_status: 'in_progress', to_status: 'completed', reason: '納品・検収完了', changed_by: 'EMP-20200101-0001', changed_by_name: '管理者 太郎', changed_at: '2026-03-01T09:00:00Z' },
]

function toListItem(p: Project): ProjectListItem {
  return {
    id: p.id,
    project_type: p.project_type,
    name: p.name,
    company_name: p.company_name,
    sales_user_name: p.sales_user_name,
    status: p.status,
    start_date: p.start_date,
    end_date: p.end_date,
    skill_tags: p.skill_tags,
    assignment_count: assignments.filter((a) => a.project_id === p.id).length,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

export const projectHandlers = [
  http.get('/api/projects', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const type = url.searchParams.get('project_type') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = projects.filter((p) => !p.updated_at.startsWith('deleted'))
    if (q) list = list.filter((p) => p.name.includes(q) || p.company_name.includes(q))
    if (status) list = list.filter((p) => p.status === status)
    if (type) list = list.filter((p) => p.project_type === type)

    const statusCounts = projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1
      return acc
    }, {})

    const start = (page - 1) * limit
    return HttpResponse.json({
      items: list.slice(start, start + limit).map(toListItem),
      total: list.length,
      page,
      limit,
      status_counts: statusCounts,
    })
  }),

  http.get('/api/projects/:id', ({ params }) => {
    const p = projects.find((p) => p.id === params.id)
    if (!p) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      ...p,
      assignments: assignments.filter((a) => a.project_id === p.id),
      rates: rates.filter((r) => r.project_id === p.id),
      status_logs: statusLogs.filter((l) => l.project_id === p.id).sort((a, b) => b.changed_at.localeCompare(a.changed_at)),
    })
  }),

  http.post('/api/projects', async ({ request }) => {
    const body = (await request.json()) as Partial<Project>
    const now = new Date().toISOString()
    const date = now.slice(0, 10).replace(/-/g, '').slice(0, 8)
    const newProject: Project = {
      id: `PRJ-${date.slice(0, 4)}-${String(projects.length + 1).padStart(4, '0')}`,
      project_type: body.project_type ?? 'ses',
      name: body.name ?? '',
      description: body.description ?? null,
      company_id: body.company_id ?? 'CMP-001',
      company_name: body.company_name ?? '顧客企業',
      sales_user_id: body.sales_user_id ?? 'EMP-20200101-0001',
      sales_user_name: body.sales_user_name ?? '管理者 太郎',
      status: 'negotiating',
      start_date: body.start_date ?? null,
      end_date: body.end_date ?? null,
      skill_tags: body.skill_tags ?? [],
      notes: body.notes ?? null,
      ses_detail: body.ses_detail ?? null,
      consignment_detail: body.consignment_detail ?? null,
      created_by: 'EMP-20200101-0001',
      created_at: now,
      updated_at: now,
    }
    projects.push(newProject)
    return HttpResponse.json(newProject, { status: 201 })
  }),

  http.put('/api/projects/:id', async ({ params, request }) => {
    const idx = projects.findIndex((p) => p.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<Project>
    projects[idx] = { ...projects[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(projects[idx])
  }),

  http.post('/api/projects/:id/status', async ({ params, request }) => {
    const idx = projects.findIndex((p) => p.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { to_status: ProjectStatus; reason: string }
    const fromStatus = projects[idx].status
    const now = new Date().toISOString()
    projects[idx] = { ...projects[idx], status: body.to_status, updated_at: now }
    statusLogs.push({
      id: `LOG-${Date.now()}`,
      project_id: params.id as string,
      from_status: fromStatus,
      to_status: body.to_status,
      reason: body.reason || null,
      changed_by: 'EMP-20200101-0001',
      changed_by_name: '管理者 太郎',
      changed_at: now,
    })
    return HttpResponse.json(projects[idx])
  }),

  http.get('/api/projects/:id/assignments', ({ params }) => {
    const list = assignments.filter((a) => a.project_id === params.id)
    return HttpResponse.json({ items: list, total: list.length })
  }),

  http.post('/api/projects/:id/assignments', async ({ params, request }) => {
    const body = (await request.json()) as Partial<ProjectAssignment>
    const newAsgn: ProjectAssignment = {
      id: `ASGN-${Date.now()}`,
      project_id: params.id as string,
      assignee_type: body.assignee_type ?? 'employee',
      assignee_id: body.assignee_id ?? '',
      assignee_name: body.assignee_name ?? '',
      role: body.role ?? null,
      start_date: body.start_date ?? '',
      end_date: body.end_date ?? null,
      status: body.status ?? 'proposed',
    }
    assignments.push(newAsgn)
    return HttpResponse.json(newAsgn, { status: 201 })
  }),

  http.put('/api/projects/:id/assignments/:asgnId', async ({ params, request }) => {
    const idx = assignments.findIndex((a) => a.id === params.asgnId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<ProjectAssignment>
    assignments[idx] = { ...assignments[idx], ...body }
    return HttpResponse.json(assignments[idx])
  }),

  http.delete('/api/projects/:id/assignments/:asgnId', ({ params }) => {
    const idx = assignments.findIndex((a) => a.id === params.asgnId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    assignments.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/projects/:id/rates', ({ params }) => {
    const list = rates.filter((r) => r.project_id === params.id)
    return HttpResponse.json({ items: list, total: list.length })
  }),

  http.post('/api/projects/:id/rates', async ({ params, request }) => {
    const body = (await request.json()) as Partial<ProjectRate>
    const newRate: ProjectRate = {
      id: `RATE-${Date.now()}`,
      project_id: params.id as string,
      target_type: body.target_type ?? 'employee',
      target_id: body.target_id ?? null,
      target_name: body.target_name ?? null,
      billing_rate: body.billing_rate ?? 0,
      payment_rate: body.payment_rate ?? 0,
      rate_unit: body.rate_unit ?? 'monthly',
      valid_from: body.valid_from ?? '',
      valid_to: body.valid_to ?? null,
    }
    rates.push(newRate)
    return HttpResponse.json(newRate, { status: 201 })
  }),

  http.delete('/api/projects/:id/rates/:rateId', ({ params }) => {
    const idx = rates.findIndex((r) => r.id === params.rateId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    rates.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),
]
