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
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TimesheetStatusBadge } from '../components/AttendanceBadge'
import { useMonthlySummary, useMonthlyClose } from '../api/attendanceApi'

function currentYearMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export default function MonthlyClosePage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const { data, isLoading, isError } = useMonthlySummary(yearMonth)
  const close = useMonthlyClose()
  const [closed, setClosed] = useState(false)

  const yearMonthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return format(d, 'yyyy-MM')
  })

  const allApproved = data ? data.items.length > 0 && data.items.every((i) => i.status === 'approved' || i.status === 'closed') : false
  const alreadyClosed = data ? data.items.every((i) => i.status === 'closed') : false

  const handleClose = async () => {
    if (!confirm(`${yearMonth} の月次締め処理を実行しますか？この操作は取り消せません。`)) return
    await close.mutateAsync(yearMonth)
    setClosed(true)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">月次締め</h1>
        <div className="w-40">
          <Label>年月</Label>
          <Select value={yearMonth} onValueChange={(v) => { setYearMonth(v); setClosed(false) }}>
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
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">承認済み</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-green-600">{data.approved_count}名</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">提出済み（未承認）</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-blue-500">{data.submitted_count}名</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">未提出</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold text-slate-400">{data.pending_count}名</p></CardContent>
            </Card>
          </div>

          {(data.submitted_count > 0 || data.pending_count > 0) && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              未承認・未提出の勤務表が残っています。全員承認後に締め処理を実行してください。
            </div>
          )}

          {(alreadyClosed || closed) && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              {yearMonth} の月次締めが完了しています。
            </div>
          )}

          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>ステータス</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-8 text-slate-400">データなし</TableCell>
                  </TableRow>
                )}
                {data.items.map((item) => (
                  <TableRow key={item.user_id}>
                    <TableCell className="font-medium">{item.user_name}</TableCell>
                    <TableCell><TimesheetStatusBadge status={item.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleClose}
              disabled={!allApproved || alreadyClosed || closed || close.isPending}
              size="lg"
            >
              {close.isPending ? '締め処理中...' : `${yearMonth} 月次締め実行`}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
