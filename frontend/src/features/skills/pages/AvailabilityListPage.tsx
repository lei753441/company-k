import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AvailabilityBadge, availabilityLabel } from '../components/AvailabilityBadge'
import { useAvailabilityList, useUpdateAvailability } from '../api/skillApi'
import type { WorkAvailabilityStatus, WorkAvailability, AvailabilityWithEmployee } from '@/types/skill'
import { useAuthStore } from '@/store/authStore'
import { Pencil } from 'lucide-react'

const ALL = '_all_'

const availSchema = z.object({
  status: z.enum(['assigned_client', 'assigned_internal', 'available', 'available_soon', 'on_leave', 'training']),
  current_assignment_end_date: z.string().optional(),
  available_from_date: z.string().optional(),
  working_style: z.string().optional(),
  preferred_location: z.string().optional(),
  note: z.string().optional(),
})
type AvailFormValues = z.infer<typeof availSchema>

function AvailEditSheet({
  open,
  target,
  onClose,
}: {
  open: boolean
  target: AvailabilityWithEmployee | null
  onClose: () => void
}) {
  const updateAvail = useUpdateAvailability(target?.employee_id ?? '')
  const avail = target?.availability

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AvailFormValues>({
    resolver: zodResolver(availSchema),
    defaultValues: {
      status: avail?.status ?? 'available',
      current_assignment_end_date: avail?.current_assignment_end_date ?? '',
      available_from_date: avail?.available_from_date ?? '',
      working_style: avail?.working_style ?? '',
      preferred_location: avail?.preferred_location ?? '',
      note: avail?.note ?? '',
    },
  })

  const onSubmit = async (data: AvailFormValues) => {
    await updateAvail.mutateAsync({
      ...data,
      current_assignment_end_date: data.current_assignment_end_date || null,
      available_from_date: data.available_from_date || null,
      working_style: data.working_style || null,
      preferred_location: data.preferred_location || null,
      note: data.note || null,
    })
    reset()
    onClose()
  }

  if (!target) return null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>稼働状況更新 — {target.employee_name}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label>稼働ステータス *</Label>
            <Select
              value={watch('status')}
              onValueChange={(v) => setValue('status', v as WorkAvailabilityStatus)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(availabilityLabel) as WorkAvailabilityStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{availabilityLabel[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>現アサイン終了予定日</Label>
            <Input type="date" {...register('current_assignment_end_date')} />
          </div>
          <div>
            <Label>空き開始予定日</Label>
            <Input type="date" {...register('available_from_date')} />
          </div>
          <div>
            <Label>希望勤務形態</Label>
            <Input {...register('working_style')} placeholder="例: リモート優先、ハイブリッド" />
          </div>
          <div>
            <Label>希望勤務地</Label>
            <Input {...register('preferred_location')} placeholder="例: 東京都内" />
          </div>
          <div>
            <Label>備考</Label>
            <Textarea {...register('note')} rows={3} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={updateAvail.isPending}>
              {updateAvail.isPending ? '保存中...' : '保存'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function AvailabilityListPage() {
  const can = useAuthStore((s) => s.can)
  const [filterStatus, setFilterStatus] = useState('')
  const { data, isLoading, isError } = useAvailabilityList(filterStatus)
  const items = data?.items ?? []
  const [editing, setEditing] = useState<AvailabilityWithEmployee | null>(null)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">稼働状況一覧</h1>
        <span className="text-sm text-slate-500">{isLoading ? '—' : `${data?.total ?? 0}件`}</span>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="w-44">
          <Label>ステータスフィルタ</Label>
          <Select
            value={filterStatus || ALL}
            onValueChange={(v) => setFilterStatus(v === ALL ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {(Object.keys(availabilityLabel) as WorkAvailabilityStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{availabilityLabel[s]}</SelectItem>
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
                <TableHead>部署</TableHead>
                <TableHead>稼働ステータス</TableHead>
                <TableHead>アサイン終了予定</TableHead>
                <TableHead>空き開始予定</TableHead>
                <TableHead>希望勤務形態</TableHead>
                <TableHead>希望勤務地</TableHead>
                {can('edit_all') && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                    該当する社員が見つかりません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.employee_id}>
                  <TableCell className="font-medium">
                    <Link to={`/skills/${item.employee_id}`} className="hover:underline">
                      {item.employee_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.department_name}</TableCell>
                  <TableCell>
                    {item.availability ? (
                      <AvailabilityBadge status={item.availability.status} />
                    ) : (
                      <span className="text-slate-400 text-xs">未設定</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">{item.availability?.current_assignment_end_date ?? '—'}</TableCell>
                  <TableCell className="text-sm">{item.availability?.available_from_date ?? '—'}</TableCell>
                  <TableCell className="text-sm">{item.availability?.working_style ?? '—'}</TableCell>
                  <TableCell className="text-sm">{item.availability?.preferred_location ?? '—'}</TableCell>
                  {can('edit_all') && (
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setEditing(item)}>
                        <Pencil size={14} />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AvailEditSheet open={!!editing} target={editing} onClose={() => setEditing(null)} />
    </div>
  )
}
