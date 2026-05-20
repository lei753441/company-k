import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
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
import { LeaveStatusBadge } from '../components/AttendanceBadge'
import {
  useLeaveRequests,
  usePaidLeaveBalance,
  useCreateLeaveRequest,
  useCancelLeaveRequest,
  useApproveLeaveRequest,
  useRejectLeaveRequest,
} from '../api/attendanceApi'
import { useAuthStore } from '@/store/authStore'
import type { LeaveType, LeaveStatus } from '@/types/attendance'

const ALL = '_all_'
const NONE = '_none_'

const leaveTypeLabel: Record<LeaveType, string> = {
  paid: '有給休暇',
  special: '特別休暇',
  compensatory: '代休',
  absence: '欠勤',
  other: 'その他',
}

const leaveSchema = z.object({
  leave_type: z.enum(['paid', 'special', 'compensatory', 'absence', 'other']),
  start_date: z.string().min(1, '開始日を入力してください'),
  end_date: z.string().min(1, '終了日を入力してください'),
  half_day: z.enum(['AM', 'PM', '_none_']),
  reason: z.string().optional(),
})
type LeaveVals = z.infer<typeof leaveSchema>

function ActionCell({ id, status, isAdmin }: { id: string; status: LeaveStatus; isAdmin: boolean }) {
  const cancel = useCancelLeaveRequest(id)
  const approve = useApproveLeaveRequest(id)
  const reject = useRejectLeaveRequest(id)

  if (status === 'cancelled' || status === 'rejected') return <span className="text-slate-400 text-xs">—</span>

  if (isAdmin && status === 'pending') {
    return (
      <div className="flex gap-1">
        <Button size="sm" onClick={() => approve.mutate({})} disabled={approve.isPending}>承認</Button>
        <Button size="sm" variant="outline" onClick={() => reject.mutate({})} disabled={reject.isPending}>却下</Button>
      </div>
    )
  }

  if (!isAdmin && status === 'pending') {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => { if (confirm('申請を取り消しますか？')) cancel.mutate() }}
        disabled={cancel.isPending}
      >
        取消
      </Button>
    )
  }

  return null
}

export default function LeaveListPage() {
  const can = useAuthStore((s) => s.can)
  const user = useAuthStore((s) => s.user)
  const isAdmin = can('edit_all')

  const [sheet, setSheet] = useState(false)
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | ''>('')

  const myParams = { user_id: user?.employee_id ?? '', status: statusFilter }
  const allParams = { status: statusFilter }

  const { data: myData } = useLeaveRequests(isAdmin ? {} : myParams)
  const { data: allData } = useLeaveRequests(isAdmin ? allParams : {})
  const { data: balance } = usePaidLeaveBalance()
  const create = useCreateLeaveRequest()

  const myItems = isAdmin ? [] : (myData?.items ?? [])
  const allItems = isAdmin ? (allData?.items ?? []) : []

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<LeaveVals>({
    resolver: zodResolver(leaveSchema),
    defaultValues: { leave_type: 'paid', start_date: '', end_date: '', half_day: '_none_', reason: '' },
  })

  const onSubmit = async (data: LeaveVals) => {
    await create.mutateAsync({
      leave_type: data.leave_type,
      start_date: data.start_date,
      end_date: data.end_date,
      half_day: data.half_day === '_none_' ? null : data.half_day,
      reason: data.reason || null,
    })
    reset()
    setSheet(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">休暇申請</h1>
        <Button onClick={() => setSheet(true)}>申請する</Button>
      </div>

      {balance && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">有給休暇残日数</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-6">
              <div>
                <p className="text-xs text-slate-500">残日数</p>
                <p className="text-3xl font-bold text-green-600">{balance.remaining_days}日</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">付与</p>
                <p className="text-xl font-semibold">{balance.granted_days}日</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">消化済み</p>
                <p className="text-xl font-semibold">{balance.used_days}日</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">有効期限</p>
                <p className="text-sm">{balance.expiry_date}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 items-end">
        <div className="w-40">
          <Label>ステータス</Label>
          <Select
            value={statusFilter || ALL}
            onValueChange={(v) => setStatusFilter(v === ALL ? '' : (v as LeaveStatus))}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              <SelectItem value="pending">申請中</SelectItem>
              <SelectItem value="approved">承認済み</SelectItem>
              <SelectItem value="rejected">却下</SelectItem>
              <SelectItem value="cancelled">取消済み</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isAdmin && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>種別</TableHead>
                <TableHead>開始日</TableHead>
                <TableHead>終了日</TableHead>
                <TableHead>半休</TableHead>
                <TableHead>理由</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>申請日</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {myItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">申請なし</TableCell>
                </TableRow>
              )}
              {myItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">{leaveTypeLabel[item.leave_type]}</TableCell>
                  <TableCell className="text-sm">{item.start_date}</TableCell>
                  <TableCell className="text-sm">{item.end_date}</TableCell>
                  <TableCell className="text-sm">{item.half_day ?? '—'}</TableCell>
                  <TableCell className="text-sm text-slate-500">{item.reason ?? '—'}</TableCell>
                  <TableCell><LeaveStatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(new Date(item.created_at), 'M/d')}
                  </TableCell>
                  <TableCell>
                    <ActionCell id={item.id} status={item.status} isAdmin={false} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>開始日</TableHead>
                <TableHead>終了日</TableHead>
                <TableHead>半休</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>申請日</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">申請なし</TableCell>
                </TableRow>
              )}
              {allItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-sm">{item.user_name}</TableCell>
                  <TableCell className="text-sm">{leaveTypeLabel[item.leave_type]}</TableCell>
                  <TableCell className="text-sm">{item.start_date}</TableCell>
                  <TableCell className="text-sm">{item.end_date}</TableCell>
                  <TableCell className="text-sm">{item.half_day ?? '—'}</TableCell>
                  <TableCell><LeaveStatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(new Date(item.created_at), 'M/d')}
                  </TableCell>
                  <TableCell>
                    <ActionCell id={item.id} status={item.status} isAdmin={true} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={sheet} onOpenChange={(o) => !o && setSheet(false)}>
        <SheetContent>
          <SheetHeader><SheetTitle>休暇申請</SheetTitle></SheetHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <Label>種別 *</Label>
              <Select value={watch('leave_type')} onValueChange={(v) => setValue('leave_type', v as LeaveType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(leaveTypeLabel) as LeaveType[]).map((t) => (
                    <SelectItem key={t} value={t}>{leaveTypeLabel[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>開始日 *</Label>
                <Input type="date" {...register('start_date')} />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <Label>終了日 *</Label>
                <Input type="date" {...register('end_date')} />
                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
              </div>
            </div>
            <div>
              <Label>半休</Label>
              <Select value={watch('half_day')} onValueChange={(v) => setValue('half_day', v as 'AM' | 'PM' | '_none_')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>なし（全日）</SelectItem>
                  <SelectItem value="AM">午前半休</SelectItem>
                  <SelectItem value="PM">午後半休</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>理由（任意）</Label>
              <Textarea {...register('reason')} placeholder="申請理由を入力してください" rows={3} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? '申請中...' : '申請'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setSheet(false)}>キャンセル</Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
