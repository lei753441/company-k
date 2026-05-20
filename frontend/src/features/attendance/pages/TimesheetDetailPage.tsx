import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TimesheetStatusBadge, attendanceTypeLabel } from '../components/AttendanceBadge'
import { useTimesheet, useSubmitTimesheet, useApproveTimesheet, useRejectTimesheet } from '../api/attendanceApi'
import { useAuthStore } from '@/store/authStore'

function fmtMinutes(m: number): string {
  return `${Math.floor(m / 60)}h${m % 60}m`
}

function fmtTime(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

export default function TimesheetDetailPage() {
  const { id } = useParams<{ id: string }>()
  const can = useAuthStore((s) => s.can)
  const isAdmin = can('edit_all')

  const { data, isLoading, isError } = useTimesheet(id!)
  const submit = useSubmitTimesheet(id!)
  const approve = useApproveTimesheet(id!)
  const reject = useRejectTimesheet(id!)

  const [rejectSheet, setRejectSheet] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ comment: string }>({ defaultValues: { comment: '' } })

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">勤務表が見つかりません</div>

  const canSubmit = !isAdmin && (data.status === 'draft' || data.status === 'rejected') && !data.is_locked
  const canApprove = isAdmin && data.status === 'submitted'

  const onReject = async (vals: { comment: string }) => {
    await reject.mutateAsync({ comment: vals.comment })
    reset()
    setRejectSheet(false)
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.year_month} 勤務表</h1>
          <p className="text-slate-500 text-sm mt-1">{data.user_name} / {data.project_name ?? '案件未設定'}</p>
          <div className="mt-2">
            <TimesheetStatusBadge status={data.status} />
          </div>
        </div>
        <div className="flex gap-2">
          {canSubmit && (
            <Button onClick={() => submit.mutate()} disabled={submit.isPending}>
              {submit.isPending ? '提出中...' : '提出'}
            </Button>
          )}
          {canApprove && (
            <>
              <Button onClick={() => approve.mutate({ comment: '' })} disabled={approve.isPending}>
                {approve.isPending ? '承認中...' : '承認'}
              </Button>
              <Button variant="outline" onClick={() => setRejectSheet(true)}>差し戻し</Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">月次サマリー</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-xs text-slate-500">勤務日数</dt>
              <dd className="text-xl font-semibold">{data.total_work_days}日</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">総実働</dt>
              <dd className="text-xl font-semibold">{fmtMinutes(data.total_work_minutes)}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">残業時間</dt>
              <dd className={`text-xl font-semibold ${data.total_overtime_minutes > 2700 ? 'text-red-600' : ''}`}>
                {fmtMinutes(data.total_overtime_minutes)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">有給消化</dt>
              <dd className="text-xl font-semibold">{data.paid_leave_days}日</dd>
            </div>
          </dl>
          {data.comment && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-slate-500">本人コメント</p>
              <p className="text-sm mt-1">{data.comment}</p>
            </div>
          )}
          {data.approver_comment && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-slate-500">承認者コメント（{data.approved_by_name}）</p>
              <p className="text-sm mt-1">{data.approver_comment}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">日次レコード（{data.records.length}件）</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>種別</TableHead>
                  <TableHead>出勤</TableHead>
                  <TableHead>退勤</TableHead>
                  <TableHead className="text-right">休憩</TableHead>
                  <TableHead className="text-right">実働</TableHead>
                  <TableHead className="text-right">残業</TableHead>
                  <TableHead>備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-400">レコードなし</TableCell>
                  </TableRow>
                )}
                {data.records.map((rec) => (
                  <TableRow key={rec.id}>
                    <TableCell className="text-sm font-medium">{rec.date}</TableCell>
                    <TableCell className="text-sm">{attendanceTypeLabel[rec.attendance_type]}</TableCell>
                    <TableCell className="text-sm">{fmtTime(rec.clock_in)}</TableCell>
                    <TableCell className="text-sm">{fmtTime(rec.clock_out)}</TableCell>
                    <TableCell className="text-right text-sm">{rec.break_minutes}分</TableCell>
                    <TableCell className="text-right text-sm">{fmtMinutes(rec.actual_work_minutes)}</TableCell>
                    <TableCell className={`text-right text-sm ${rec.overtime_minutes > 0 ? 'text-orange-600' : 'text-slate-400'}`}>
                      {rec.overtime_minutes > 0 ? fmtMinutes(rec.overtime_minutes) : '—'}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{rec.note ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={rejectSheet} onOpenChange={(o) => !o && setRejectSheet(false)}>
        <SheetContent>
          <SheetHeader><SheetTitle>差し戻し</SheetTitle></SheetHeader>
          <form onSubmit={handleSubmit(onReject)} className="space-y-4 mt-4">
            <div>
              <Label>差し戻し理由</Label>
              <Textarea
                {...register('comment')}
                placeholder="差し戻しの理由を入力してください"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" disabled={reject.isPending}>
                {reject.isPending ? '処理中...' : '差し戻し'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setRejectSheet(false)}>キャンセル</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
