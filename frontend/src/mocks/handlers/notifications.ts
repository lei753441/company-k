import { http, HttpResponse } from 'msw'
import type { Notification, WorkflowTask, WorkflowStatus } from '@/types/notification'

let notifications: Notification[] = [
  {
    id: 'NOTIF-001',
    type: 'timesheet_submitted',
    title: '勤務表承認依頼',
    body: '山田 太郎さんが2026年5月分の勤務表を提出しました。承認をお願いします。',
    is_read: false,
    link_url: '/attendance/timesheets/TS-2026-05-0001',
    created_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'NOTIF-002',
    type: 'expense_submitted',
    title: '経費申請承認依頼',
    body: '鈴木 花子さんが経費申請（交通費 12,500円）を提出しました。',
    is_read: false,
    link_url: '/expenses/EXP-001',
    created_at: '2026-05-19T14:30:00Z',
  },
  {
    id: 'NOTIF-003',
    type: 'contract_renewal',
    title: '契約更新アラート',
    body: '田中 次郎さんの契約が30日後に満了します。更新手続きを開始してください。',
    is_read: false,
    link_url: '/contracts/CTR-001',
    created_at: '2026-05-18T09:00:00Z',
  },
  {
    id: 'NOTIF-004',
    type: 'followup_due',
    title: 'フォローアップ期限',
    body: '株式会社サンプルのフォローアップ期限が本日です。',
    is_read: false,
    link_url: '/customers/followup',
    created_at: '2026-05-20T08:00:00Z',
  },
  {
    id: 'NOTIF-005',
    type: 'invoice_approved',
    title: '請求書承認完了',
    body: '2026年4月分の請求書（INV-2026-04-001）が承認されました。',
    is_read: true,
    link_url: '/billing/invoices/INV-2026-04-001',
    created_at: '2026-05-15T11:00:00Z',
  },
  {
    id: 'NOTIF-006',
    type: 'timesheet_rejected',
    title: '勤務表差し戻し通知',
    body: '2026年4月分の勤務表が差し戻されました。修正してください。',
    is_read: true,
    link_url: '/attendance/timesheets/TS-2026-04-0001',
    created_at: '2026-05-14T16:00:00Z',
  },
  {
    id: 'NOTIF-007',
    type: 'expense_approved',
    title: '経費承認完了',
    body: '経費申請（出張費 45,000円）が承認されました。',
    is_read: true,
    link_url: '/expenses/EXP-002',
    created_at: '2026-05-13T10:30:00Z',
  },
  {
    id: 'NOTIF-008',
    type: 'system',
    title: 'システムメンテナンス',
    body: '2026年5月28日（土）2:00〜6:00にシステムメンテナンスを実施します。',
    is_read: true,
    link_url: null,
    created_at: '2026-05-10T12:00:00Z',
  },
]

let workflowTasks: WorkflowTask[] = [
  {
    id: 'WF-001',
    workflow_type: 'timesheet',
    title: '山田 太郎 - 2026年5月分勤務表',
    requester_id: 'EMP-20240401-0001',
    requester_name: '山田 太郎',
    status: 'pending',
    link_url: '/attendance/timesheets/TS-2026-05-0001',
    due_date: '2026-05-25',
    created_at: '2026-05-20T10:00:00Z',
    updated_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'WF-002',
    workflow_type: 'expense',
    title: '鈴木 花子 - 交通費精算（12,500円）',
    requester_id: 'EMP-20230601-0002',
    requester_name: '鈴木 花子',
    status: 'pending',
    link_url: '/expenses/EXP-001',
    due_date: '2026-05-22',
    created_at: '2026-05-19T14:30:00Z',
    updated_at: '2026-05-19T14:30:00Z',
  },
  {
    id: 'WF-003',
    workflow_type: 'contract_renewal',
    title: '田中 次郎 - 業務委託契約更新',
    requester_id: 'EMP-20250101-0003',
    requester_name: '田中 次郎',
    status: 'pending',
    link_url: '/contracts/CTR-001',
    due_date: '2026-06-01',
    created_at: '2026-05-18T09:00:00Z',
    updated_at: '2026-05-18T09:00:00Z',
  },
  {
    id: 'WF-004',
    workflow_type: 'invoice',
    title: '2026年4月分請求書承認',
    requester_id: 'EMP-20230601-0002',
    requester_name: '鈴木 花子',
    status: 'approved',
    link_url: '/billing/invoices/INV-2026-04-001',
    due_date: null,
    created_at: '2026-05-10T09:00:00Z',
    updated_at: '2026-05-15T11:00:00Z',
  },
  {
    id: 'WF-005',
    workflow_type: 'expense',
    title: '田中 次郎 - 出張費精算（45,000円）',
    requester_id: 'EMP-20250101-0003',
    requester_name: '田中 次郎',
    status: 'rejected',
    link_url: '/expenses/EXP-003',
    due_date: null,
    created_at: '2026-05-08T15:00:00Z',
    updated_at: '2026-05-13T10:30:00Z',
  },
]

export const notificationHandlers = [
  http.get('/api/notifications', () => {
    const unread_count = notifications.filter((n) => !n.is_read).length
    return HttpResponse.json({ items: notifications, unread_count })
  }),

  http.post('/api/notifications/:id/read', ({ params }) => {
    const idx = notifications.findIndex((n) => n.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    notifications[idx] = { ...notifications[idx], is_read: true }
    return HttpResponse.json(notifications[idx])
  }),

  http.post('/api/notifications/read-all', () => {
    const updated_count = notifications.filter((n) => !n.is_read).length
    notifications = notifications.map((n) => ({ ...n, is_read: true }))
    return HttpResponse.json({ updated_count })
  }),

  http.get('/api/workflow-tasks', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? ''
    let list = [...workflowTasks]
    if (status) list = list.filter((t) => t.status === status)
    return HttpResponse.json({ items: list, total: list.length })
  }),

  http.post('/api/workflow-tasks/:id/approve', ({ params }) => {
    const idx = workflowTasks.findIndex((t) => t.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    workflowTasks[idx] = {
      ...workflowTasks[idx],
      status: 'approved',
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(workflowTasks[idx])
  }),

  http.post('/api/workflow-tasks/:id/reject', async ({ params, request }) => {
    const idx = workflowTasks.findIndex((t) => t.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    await request.json()
    workflowTasks[idx] = {
      ...workflowTasks[idx],
      status: 'rejected',
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(workflowTasks[idx])
  }),
]
