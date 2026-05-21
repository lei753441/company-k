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
import { buttonVariants } from '@/components/ui/button'
import { TimesheetStatusBadge, timesheetStatusLabel } from '../components/AttendanceBadge'
import { useTimesheets } from '../api/attendanceApi'
import type { TimesheetStatus } from '@/types/attendance'

const ALL = '_all_'

function fmtMinutes(m: number): string {
  return `${Math.floor(m / 60)}h${m % 60}m`
}

function currentYearMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export default function ApprovalListPage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [status, setStatus] = useState<TimesheetStatus | ''>('submitted')

  const { data, isLoading, isError } = useTimesheets({ year_month: yearMonth, status })
  const items = data?.items ?? []

  const yearMonthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return format(d, 'yyyy-MM')
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">承認一覧</h1>

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
                <TableHead>氏名</TableHead>
                <TableHead>年月</TableHead>
                <TableHead>提出日時</TableHead>
                <TableHead className="text-right">残業</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>アクション</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    該当する勤務表がありません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.user_name}</TableCell>
                  <TableCell>{item.year_month}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {item.submitted_at ? format(new Date(item.submitted_at), 'M/d HH:mm') : '—'}
                  </TableCell>
                  <TableCell className={`text-right text-sm ${item.total_overtime_minutes > 2700 ? 'text-red-600 font-semibold' : ''}`}>
                    {fmtMinutes(item.total_overtime_minutes)}
                  </TableCell>
                  <TableCell><TimesheetStatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <Link to={`/attendance/timesheets/${item.id}`} className={buttonVariants({ size: 'sm', variant: 'outline' })}>詳細</Link>
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
