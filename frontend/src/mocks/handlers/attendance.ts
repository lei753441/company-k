import { http, HttpResponse } from 'msw'
import type {
  DailyRecord,
  MonthlyTimesheet,
  MonthlyTimesheetListItem,
  LeaveRequest,
  TodayClock,
  MonthlySummary,
  PaidLeaveBalance,
  TimesheetStatus,
  LeaveStatus,
} from '@/types/attendance'

function makeRecords(userId: string, yearMonth: string, count: number): DailyRecord[] {
  const [year, month] = yearMonth.split('-').map(Number)
  const records: DailyRecord[] = []
  let day = 1
  let added = 0
  while (added < count && day <= 31) {
    const date = new Date(year, month - 1, day)
    if (date.getMonth() !== month - 1) break
    const dow = date.getDay()
    if (dow !== 0 && dow !== 6) {
      const dateStr = `${yearMonth}-${String(day).padStart(2, '0')}`
      const clockIn = `${yearMonth}-${String(day).padStart(2, '0')}T09:00:00+09:00`
      const clockOut = `${yearMonth}-${String(day).padStart(2, '0')}T18:30:00+09:00`
      const breakMin = 60
      const workMin = 570 - breakMin
      const otMin = Math.max(0, workMin - 480)
      records.push({
        id: `REC-${userId}-${dateStr}`,
        user_id: userId,
        date: dateStr,
        attendance_type: 'NORMAL',
        clock_in: clockIn,
        clock_out: clockOut,
        break_minutes: breakMin,
        actual_work_minutes: workMin,
        overtime_minutes: otMin,
        work_location: 'office',
        project_id: 'PRJ-2026-0001',
        note: null,
        is_adjusted: false,
      })
      added++
    }
    day++
  }
  return records
}

const ts1Records = makeRecords('EMP-20240401-0001', '2026-05', 20)
const ts2Records = makeRecords('EMP-20230601-0002', '2026-05', 22)
const ts3Records = makeRecords('EMP-20250101-0003', '2026-05', 10)

let timesheets: MonthlyTimesheet[] = [
  {
    id: 'TS-2026-05-0001',
    user_id: 'EMP-20240401-0001',
    user_name: '山田 太郎',
    year_month: '2026-05',
    project_id: 'PRJ-2026-0001',
    project_name: 'ECサイトリニューアル支援',
    status: 'submitted',
    submitted_at: '2026-05-20T10:00:00Z',
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    total_work_days: 20,
    total_work_minutes: ts1Records.reduce((a, r) => a + r.actual_work_minutes, 0),
    total_overtime_minutes: ts1Records.reduce((a, r) => a + r.overtime_minutes, 0),
    paid_leave_days: 0,
    comment: '今月も通常通り稼働しました。',
    approver_comment: null,
    is_locked: false,
    records: ts1Records,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'TS-2026-05-0002',
    user_id: 'EMP-20230601-0002',
    user_name: '鈴木 花子',
    year_month: '2026-05',
    project_id: 'PRJ-2026-0002',
    project_name: '大手銀行システム刷新PJ',
    status: 'approved',
    submitted_at: '2026-05-19T11:00:00Z',
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-05-20T09:00:00Z',
    total_work_days: 22,
    total_work_minutes: ts2Records.reduce((a, r) => a + r.actual_work_minutes, 0),
    total_overtime_minutes: ts2Records.reduce((a, r) => a + r.overtime_minutes, 0),
    paid_leave_days: 0,
    comment: null,
    approver_comment: '問題ありません。',
    is_locked: false,
    records: ts2Records,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-20T09:00:00Z',
  },
  {
    id: 'TS-2026-05-0003',
    user_id: 'EMP-20250101-0003',
    user_name: '田中 次郎',
    year_month: '2026-05',
    project_id: 'PRJ-2026-0003',
    project_name: '在庫管理システム受託開発',
    status: 'draft',
    submitted_at: null,
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    total_work_days: 10,
    total_work_minutes: ts3Records.reduce((a, r) => a + r.actual_work_minutes, 0),
    total_overtime_minutes: ts3Records.reduce((a, r) => a + r.overtime_minutes, 0),
    paid_leave_days: 0,
    comment: null,
    approver_comment: null,
    is_locked: false,
    records: ts3Records,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-15T00:00:00Z',
  },
]

let todayClock: TodayClock = {
  clock_in: '2026-05-20T09:05:00+09:00',
  clock_out: null,
  break_minutes: 0,
  status: 'working',
}

let leaveRequests: LeaveRequest[] = [
  {
    id: 'LVR-001',
    user_id: 'EMP-20240401-0001',
    user_name: '山田 太郎',
    leave_type: 'paid',
    start_date: '2026-05-25',
    end_date: '2026-05-25',
    half_day: null,
    reason: '私用のため',
    status: 'pending',
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    approver_comment: null,
    created_at: '2026-05-18T10:00:00Z',
    updated_at: '2026-05-18T10:00:00Z',
  },
  {
    id: 'LVR-002',
    user_id: 'EMP-20230601-0002',
    user_name: '鈴木 花子',
    leave_type: 'paid',
    start_date: '2026-05-22',
    end_date: '2026-05-22',
    half_day: 'AM',
    reason: '通院のため',
    status: 'approved',
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-05-19T09:00:00Z',
    approver_comment: null,
    created_at: '2026-05-17T09:00:00Z',
    updated_at: '2026-05-19T09:00:00Z',
  },
  {
    id: 'LVR-003',
    user_id: 'EMP-20250101-0003',
    user_name: '田中 次郎',
    leave_type: 'paid',
    start_date: '2026-05-28',
    end_date: '2026-05-29',
    half_day: null,
    reason: '家族旅行',
    status: 'rejected',
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-05-19T14:00:00Z',
    approver_comment: '月末のため代替日程を検討してください',
    created_at: '2026-05-16T15:00:00Z',
    updated_at: '2026-05-19T14:00:00Z',
  },
]

function toListItem(ts: MonthlyTimesheet): MonthlyTimesheetListItem {
  return {
    id: ts.id,
    user_id: ts.user_id,
    user_name: ts.user_name,
    year_month: ts.year_month,
    project_name: ts.project_name,
    status: ts.status,
    total_work_days: ts.total_work_days,
    total_work_minutes: ts.total_work_minutes,
    total_overtime_minutes: ts.total_overtime_minutes,
    submitted_at: ts.submitted_at,
  }
}

export const attendanceHandlers = [
  http.get('/api/attendance/today', () => {
    return HttpResponse.json(todayClock)
  }),

  http.post('/api/attendance/clock-in', () => {
    todayClock = {
      clock_in: new Date().toISOString(),
      clock_out: null,
      break_minutes: 0,
      status: 'working',
    }
    return HttpResponse.json(todayClock)
  }),

  http.post('/api/attendance/clock-out', () => {
    todayClock = {
      ...todayClock,
      clock_out: new Date().toISOString(),
      status: 'finished',
    }
    return HttpResponse.json(todayClock)
  }),

  http.get('/api/timesheets', ({ request }) => {
    const url = new URL(request.url)
    const yearMonth = url.searchParams.get('year_month') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const userId = url.searchParams.get('user_id') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = [...timesheets]
    if (yearMonth) list = list.filter((ts) => ts.year_month === yearMonth)
    if (status) list = list.filter((ts) => ts.status === status)
    if (userId) list = list.filter((ts) => ts.user_id === userId)

    const statusCounts = timesheets.reduce<Record<string, number>>((acc, ts) => {
      acc[ts.status] = (acc[ts.status] ?? 0) + 1
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

  http.get('/api/timesheets/:id', ({ params }) => {
    const ts = timesheets.find((t) => t.id === params.id)
    if (!ts) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(ts)
  }),

  http.post('/api/timesheets/:id/submit', ({ params }) => {
    const idx = timesheets.findIndex((t) => t.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    timesheets[idx] = {
      ...timesheets[idx],
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(timesheets[idx])
  }),

  http.post('/api/timesheets/:id/approve', async ({ params, request }) => {
    const idx = timesheets.findIndex((t) => t.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { comment?: string }
    timesheets[idx] = {
      ...timesheets[idx],
      status: 'approved',
      approved_by: 'EMP-20200101-0001',
      approved_by_name: '管理者 太郎',
      approved_at: new Date().toISOString(),
      approver_comment: body.comment ?? null,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(timesheets[idx])
  }),

  http.post('/api/timesheets/:id/reject', async ({ params, request }) => {
    const idx = timesheets.findIndex((t) => t.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { comment?: string }
    timesheets[idx] = {
      ...timesheets[idx],
      status: 'rejected',
      approver_comment: body.comment ?? null,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(timesheets[idx])
  }),

  http.get('/api/leave-requests', ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status') ?? ''
    const userId = url.searchParams.get('user_id') ?? ''

    let list = [...leaveRequests]
    if (status) list = list.filter((r) => r.status === status)
    if (userId) list = list.filter((r) => r.user_id === userId)

    return HttpResponse.json({ items: list, total: list.length })
  }),

  http.post('/api/leave-requests', async ({ request }) => {
    const body = (await request.json()) as Partial<LeaveRequest>
    const now = new Date().toISOString()
    const newReq: LeaveRequest = {
      id: `LVR-${Date.now()}`,
      user_id: 'EMP-20200101-0001',
      user_name: '管理者 太郎',
      leave_type: body.leave_type ?? 'paid',
      start_date: body.start_date ?? '',
      end_date: body.end_date ?? '',
      half_day: body.half_day ?? null,
      reason: body.reason ?? null,
      status: 'pending',
      approved_by: null,
      approved_by_name: null,
      approved_at: null,
      approver_comment: null,
      created_at: now,
      updated_at: now,
    }
    leaveRequests.push(newReq)
    return HttpResponse.json(newReq, { status: 201 })
  }),

  http.post('/api/leave-requests/:id/cancel', ({ params }) => {
    const idx = leaveRequests.findIndex((r) => r.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    leaveRequests[idx] = {
      ...leaveRequests[idx],
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(leaveRequests[idx])
  }),

  http.post('/api/leave-requests/:id/approve', async ({ params, request }) => {
    const idx = leaveRequests.findIndex((r) => r.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { comment?: string }
    leaveRequests[idx] = {
      ...leaveRequests[idx],
      status: 'approved',
      approved_by: 'EMP-20200101-0001',
      approved_by_name: '管理者 太郎',
      approved_at: new Date().toISOString(),
      approver_comment: body.comment ?? null,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(leaveRequests[idx])
  }),

  http.post('/api/leave-requests/:id/reject', async ({ params, request }) => {
    const idx = leaveRequests.findIndex((r) => r.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { comment?: string }
    leaveRequests[idx] = {
      ...leaveRequests[idx],
      status: 'rejected',
      approved_by: 'EMP-20200101-0001',
      approved_by_name: '管理者 太郎',
      approved_at: new Date().toISOString(),
      approver_comment: body.comment ?? null,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(leaveRequests[idx])
  }),

  http.get('/api/attendance/summary/:yearMonth', ({ params }) => {
    const ym = params.yearMonth as string
    const filtered = timesheets.filter((ts) => ts.year_month === ym)
    const summary: MonthlySummary = {
      year_month: ym,
      total_employees: filtered.length,
      submitted_count: filtered.filter((ts) => ts.status === 'submitted').length,
      approved_count: filtered.filter((ts) => ts.status === 'approved' || ts.status === 'closed').length,
      pending_count: filtered.filter((ts) => ts.status === 'draft' || ts.status === 'rejected').length,
      items: filtered.map((ts) => ({
        user_id: ts.user_id,
        user_name: ts.user_name,
        total_work_minutes: ts.total_work_minutes,
        total_overtime_minutes: ts.total_overtime_minutes,
        paid_leave_days: ts.paid_leave_days,
        status: ts.status as TimesheetStatus,
      })),
    }
    return HttpResponse.json(summary)
  }),

  http.get('/api/attendance/paid-leave-balance', () => {
    const balance: PaidLeaveBalance = {
      user_id: 'EMP-20200101-0001',
      user_name: '管理者 太郎',
      granted_days: 20,
      used_days: 3,
      remaining_days: 17,
      expiry_date: '2027-03-31',
    }
    return HttpResponse.json(balance)
  }),

  http.post('/api/attendance/close/:yearMonth', ({ params }) => {
    const ym = params.yearMonth as string
    timesheets = timesheets.map((ts) =>
      ts.year_month === ym && ts.status === 'approved'
        ? { ...ts, status: 'closed' as TimesheetStatus, is_locked: true, updated_at: new Date().toISOString() }
        : ts,
    )
    return HttpResponse.json({ year_month: ym, closed: true })
  }),
]
