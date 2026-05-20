import { useState } from 'react'
import { format } from 'date-fns'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TimesheetStatusBadge } from '../components/AttendanceBadge'
import { useMonthlySummary } from '../api/attendanceApi'

function fmtMinutes(m: number): string {
  return `${Math.floor(m / 60)}h${m % 60}m`
}

function currentYearMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export default function MonthlySummaryPage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const { data, isLoading, isError } = useMonthlySummary(yearMonth)

  const yearMonthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return format(d, 'yyyy-MM')
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">月次集計</h1>
        <div className="w-40">
          <Label>年月</Label>
          <Select value={yearMonth} onValueChange={setYearMonth}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {yearMonthOptions.map((ym) => (
                <SelectItem key={ym} value={ym}>{ym}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">対象者数</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{data.total_employees}名</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">提出済み</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-blue-600">{data.submitted_count}名</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">承認済み</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-green-600">{data.approved_count}名</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">未提出</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-slate-400">{data.pending_count}名</p></CardContent>
            </Card>
          </div>

          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead className="text-right">実働時間</TableHead>
                  <TableHead className="text-right">残業時間</TableHead>
                  <TableHead className="text-right">有給日数</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-slate-400">データなし</TableCell>
                  </TableRow>
                )}
                {data.items.map((item) => (
                  <TableRow key={item.user_id}>
                    <TableCell className="font-medium">{item.user_name}</TableCell>
                    <TableCell className="text-right text-sm">{fmtMinutes(item.total_work_minutes)}</TableCell>
                    <TableCell className={`text-right text-sm font-medium ${item.total_overtime_minutes > 2700 ? 'text-red-600' : ''}`}>
                      {fmtMinutes(item.total_overtime_minutes)}
                      {item.total_overtime_minutes > 2700 && <span className="ml-1 text-xs">⚠45h超</span>}
                    </TableCell>
                    <TableCell className="text-right text-sm">{item.paid_leave_days}日</TableCell>
                    <TableCell><TimesheetStatusBadge status={item.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  )
}
