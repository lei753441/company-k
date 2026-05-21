import { http, HttpResponse } from 'msw'
import type {
  ExpenseReport,
  ExpenseReportListItem,
  ExpenseSummary,
  ExpenseItem,
  ExpenseStatus,
} from '@/types/expense'

let reports: ExpenseReport[] = [
  {
    id: 'EXP-001',
    title: '2026年5月経費申請',
    user_id: 'EMP-20240401-0001',
    user_name: '山田 太郎',
    year_month: '2026-05',
    project_id: 'PRJ-2026-0001',
    project_name: 'ECサイトリニューアル支援',
    status: 'submitted',
    total_amount: 32500,
    submitted_at: '2026-05-20T10:00:00Z',
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    approver_comment: null,
    items: [
      {
        id: 'ITEM-001-1',
        expense_report_id: 'EXP-001',
        date: '2026-05-10',
        category: 'transport',
        description: '客先往復交通費',
        amount: 2500,
        payment_method: 'personal',
        receipt_url: null,
        note: null,
      },
      {
        id: 'ITEM-001-2',
        expense_report_id: 'EXP-001',
        date: '2026-05-15',
        category: 'entertainment',
        description: '顧客接待費',
        amount: 25000,
        payment_method: 'corporate_card',
        receipt_url: null,
        note: '顧客3名',
      },
      {
        id: 'ITEM-001-3',
        expense_report_id: 'EXP-001',
        date: '2026-05-18',
        category: 'transport',
        description: '新幹線出張費',
        amount: 5000,
        payment_method: 'personal',
        receipt_url: null,
        note: null,
      },
    ],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'EXP-002',
    title: '2026年5月通信費申請',
    user_id: 'EMP-20230601-0002',
    user_name: '鈴木 花子',
    year_month: '2026-05',
    project_id: 'PRJ-2026-0002',
    project_name: '大手銀行システム刷新PJ',
    status: 'approved',
    total_amount: 5500,
    submitted_at: '2026-05-18T11:00:00Z',
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-05-19T09:00:00Z',
    approver_comment: '確認しました。問題ありません。',
    items: [
      {
        id: 'ITEM-002-1',
        expense_report_id: 'EXP-002',
        date: '2026-05-01',
        category: 'communication',
        description: '携帯電話料金（業務分）',
        amount: 5500,
        payment_method: 'personal',
        receipt_url: null,
        note: null,
      },
    ],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-19T09:00:00Z',
  },
  {
    id: 'EXP-003',
    title: '2026年5月交通費申請',
    user_id: 'EMP-20250101-0003',
    user_name: '田中 次郎',
    year_month: '2026-05',
    project_id: null,
    project_name: null,
    status: 'draft',
    total_amount: 15000,
    submitted_at: null,
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    approver_comment: null,
    items: [
      {
        id: 'ITEM-003-1',
        expense_report_id: 'EXP-003',
        date: '2026-05-05',
        category: 'transport',
        description: '出張交通費（往路）',
        amount: 8000,
        payment_method: 'personal',
        receipt_url: null,
        note: null,
      },
      {
        id: 'ITEM-003-2',
        expense_report_id: 'EXP-003',
        date: '2026-05-06',
        category: 'transport',
        description: '出張交通費（復路）',
        amount: 7000,
        payment_method: 'personal',
        receipt_url: null,
        note: null,
      },
    ],
    created_at: '2026-05-05T00:00:00Z',
    updated_at: '2026-05-10T00:00:00Z',
  },
  {
    id: 'EXP-004',
    title: '2026年4月備品購入申請',
    user_id: 'EMP-20240401-0001',
    user_name: '山田 太郎',
    year_month: '2026-04',
    project_id: 'PRJ-2026-0001',
    project_name: 'ECサイトリニューアル支援',
    status: 'paid',
    total_amount: 8800,
    submitted_at: '2026-04-25T10:00:00Z',
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-04-26T09:00:00Z',
    approver_comment: null,
    items: [
      {
        id: 'ITEM-004-1',
        expense_report_id: 'EXP-004',
        date: '2026-04-20',
        category: 'supplies',
        description: 'USBハブ・ケーブル類',
        amount: 8800,
        payment_method: 'personal',
        receipt_url: null,
        note: null,
      },
    ],
    created_at: '2026-04-20T00:00:00Z',
    updated_at: '2026-05-01T00:00:00Z',
  },
]

function toListItem(r: ExpenseReport): ExpenseReportListItem {
  return {
    id: r.id,
    title: r.title,
    user_name: r.user_name,
    year_month: r.year_month,
    project_name: r.project_name,
    status: r.status,
    total_amount: r.total_amount,
    submitted_at: r.submitted_at,
    item_count: r.items.length,
  }
}

export const expenseHandlers = [
  http.get('/api/expense-reports', ({ request }) => {
    const url = new URL(request.url)
    const yearMonth = url.searchParams.get('year_month') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const userId = url.searchParams.get('user_id') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = [...reports]
    if (yearMonth) list = list.filter((r) => r.year_month === yearMonth)
    if (status) list = list.filter((r) => r.status === status)
    if (userId) list = list.filter((r) => r.user_id === userId)

    const statusCounts = reports.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1
      return acc
    }, {})

    const start = (page - 1) * limit
    return HttpResponse.json({
      items: list.slice(start, start + limit).map(toListItem),
      total: list.length,
      page,
      status_counts: statusCounts,
    })
  }),

  http.get('/api/expense-reports/summary/:yearMonth', ({ params }) => {
    const ym = params.yearMonth as string
    const filtered = reports.filter((r) => r.year_month === ym)

    const byCategory = filtered.reduce<Record<string, number>>((acc, r) => {
      for (const item of r.items) {
        acc[item.category] = (acc[item.category] ?? 0) + item.amount
      }
      return acc
    }, {})

    const byStatus = filtered.reduce<Record<string, number>>((acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + r.total_amount
      return acc
    }, {})

    const summary: ExpenseSummary = {
      year_month: ym,
      total_amount: filtered.reduce((a, r) => a + r.total_amount, 0),
      by_category: {
        transport: byCategory['transport'] ?? 0,
        accommodation: byCategory['accommodation'] ?? 0,
        entertainment: byCategory['entertainment'] ?? 0,
        supplies: byCategory['supplies'] ?? 0,
        communication: byCategory['communication'] ?? 0,
        other: byCategory['other'] ?? 0,
      },
      by_status: {
        draft: byStatus['draft'] ?? 0,
        submitted: byStatus['submitted'] ?? 0,
        approved: byStatus['approved'] ?? 0,
        rejected: byStatus['rejected'] ?? 0,
        paid: byStatus['paid'] ?? 0,
      },
      items: filtered.map((r) => ({
        user_name: r.user_name,
        total_amount: r.total_amount,
        status: r.status,
      })),
    }
    return HttpResponse.json(summary)
  }),

  http.get('/api/expense-reports/:id', ({ params }) => {
    const report = reports.find((r) => r.id === params.id)
    if (!report) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(report)
  }),

  http.post('/api/expense-reports', async ({ request }) => {
    const body = (await request.json()) as {
      title: string
      year_month: string
      project_id?: string
      items: Omit<ExpenseItem, 'id' | 'expense_report_id'>[]
    }
    const now = new Date().toISOString()
    const id = `EXP-${Date.now()}`
    const items: ExpenseItem[] = (body.items ?? []).map((item, i) => ({
      ...item,
      id: `ITEM-${Date.now()}-${i}`,
      expense_report_id: id,
      receipt_url: null,
      note: item.note ?? null,
    }))
    const newReport: ExpenseReport = {
      id,
      title: body.title,
      user_id: 'EMP-20200101-0001',
      user_name: '管理者 太郎',
      year_month: body.year_month,
      project_id: body.project_id ?? null,
      project_name: null,
      status: 'draft',
      total_amount: items.reduce((a, i) => a + i.amount, 0),
      submitted_at: null,
      approved_by: null,
      approved_by_name: null,
      approved_at: null,
      approver_comment: null,
      items,
      created_at: now,
      updated_at: now,
    }
    reports.push(newReport)
    return HttpResponse.json(newReport, { status: 201 })
  }),

  http.post('/api/expense-reports/:id/submit', ({ params }) => {
    const idx = reports.findIndex((r) => r.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    reports[idx] = {
      ...reports[idx],
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(reports[idx])
  }),

  http.post('/api/expense-reports/:id/approve', async ({ params, request }) => {
    const idx = reports.findIndex((r) => r.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { comment?: string }
    reports[idx] = {
      ...reports[idx],
      status: 'approved',
      approved_by: 'EMP-20200101-0001',
      approved_by_name: '管理者 太郎',
      approved_at: new Date().toISOString(),
      approver_comment: body.comment ?? null,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(reports[idx])
  }),

  http.post('/api/expense-reports/:id/reject', async ({ params, request }) => {
    const idx = reports.findIndex((r) => r.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { comment: string }
    reports[idx] = {
      ...reports[idx],
      status: 'rejected' as ExpenseStatus,
      approver_comment: body.comment,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(reports[idx])
  }),
]
