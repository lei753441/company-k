import { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TimesheetStatusBadge, timesheetStatusLabel } from '../components/AttendanceBadge'
import { useTimesheets } from '../api/attendanceApi'
import { useAuthStore } from '@/store/authStore'
import type { TimesheetStatus } from '@/types/attendance'

const ALL = '_all_'

function fmtMinutes(m: number): string {
  return `${Math.floor(m / 60)}h${m % 60}m`
}

function currentYearMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export default function TimesheetListPage() {
  const can = useAuthStore((s) => s.can)
  const user = useAuthStore((s) => s.user)
  const isAdmin = can('edit_all')

  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [status, setStatus] = useState<TimesheetStatus | ''>('')

  const params = {
    year_month: yearMonth,
    status,
    user_id: isAdmin ? undefined : (user?.employee_id ?? ''),
  }
  const { data, isLoading, isError } = useTimesheets(params)
  const items = data?.items ?? []

  const yearMonthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return format(d, 'yyyy-MM')
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">勤務表一覧</h1>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="w-40">
          <Label>年月</Label>
          <Select value={yearMonth} onValueChange={(v) => setYearMonth(v ?? '')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {yearMonthOptions.map((ym) => (
                <SelectItem key={ym} value={ym}>{ym}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Label>ステータス</Label>
          <Select
            value={status || ALL}
            onValueChange={(v) => setStatus((v ?? '') === ALL ? '' : ((v ?? '') as TimesheetStatus))}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {(Object.keys(timesheetStatusLabel) as TimesheetStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{timesheetStatusLabel[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>年月</TableHead>
                {isAdmin && <TableHead>氏名</TableHead>}
                <TableHead>案件</TableHead>
                <TableHead className="text-right">勤務日数</TableHead>
                <TableHead className="text-right">総実働</TableHead>
                <TableHead className="text-right">残業</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>提出日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-12 text-slate-400">
                    勤務表が見つかりません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link to={`/attendance/timesheets/${item.id}`} className="font-medium hover:underline">
                      {item.year_month}
                    </Link>
                  </TableCell>
                  {isAdmin && <TableCell className="text-sm">{item.user_name}</TableCell>}
                  <TableCell className="text-sm text-slate-500">{item.project_name ?? '—'}</TableCell>
                  <TableCell className="text-right text-sm">{item.total_work_days}日</TableCell>
                  <TableCell className="text-right text-sm">{fmtMinutes(item.total_work_minutes)}</TableCell>
                  <TableCell className={`text-right text-sm ${item.total_overtime_minutes > 2700 ? 'text-red-600 font-semibold' : ''}`}>
                    {fmtMinutes(item.total_overtime_minutes)}
                  </TableCell>
                  <TableCell><TimesheetStatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {item.submitted_at ? format(new Date(item.submitted_at), 'M/d HH:mm') : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
