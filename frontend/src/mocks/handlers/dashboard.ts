import { http, HttpResponse } from 'msw'

export const dashboardHandlers = [
  http.get('/api/dashboard/admin', () => {
    return HttpResponse.json({
      headcount: { total: 15, in_project: 10, available: 4, leave: 1 },
      billing_summary: { invoiced: 5830000, received: 3850000, payment_due: 1540000 },
      project_pipeline: { proposing: 3, negotiating: 2, contracted: 5, in_progress: 8 },
      pending_approvals: { timesheets: 3, expenses: 5 },
      followups: [
        {
          id: 'FU-001',
          company_name: '株式会社アルファ',
          subject: '追加案件の見積もり依頼',
          follow_up_date: '2026-05-20',
          interaction_type: 'email',
        },
        {
          id: 'FU-002',
          company_name: 'ベータシステムズ株式会社',
          subject: '契約更新の打ち合わせ',
          follow_up_date: '2026-05-21',
          interaction_type: 'meeting',
        },
        {
          id: 'FU-003',
          company_name: '株式会社ガンマ',
          subject: '要件定義書の確認',
          follow_up_date: '2026-05-22',
          interaction_type: 'call',
        },
      ],
    })
  }),

  http.get('/api/dashboard/employee', () => {
    return HttpResponse.json({
      today_clock: {
        clock_in: '2026-05-20T09:05:00+09:00',
        clock_out: null,
        status: 'working',
      },
      monthly_work: {
        total_minutes: 7200,
        overtime_minutes: 480,
        paid_leave_remaining: 17,
      },
      timesheet: {
        id: 'TS-2026-05-0001',
        status: 'draft',
        year_month: '2026-05',
      },
      active_projects: [
        {
          id: 'PRJ-2026-0001',
          name: 'ECサイトリニューアル支援',
          customer_name: '株式会社アルファ',
          end_date: '2026-09-30',
        },
      ],
    })
  }),
]
