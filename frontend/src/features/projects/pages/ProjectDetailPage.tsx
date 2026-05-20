import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProjectStatusBadge, statusLabel, nextStatuses, requiresReason } from '../components/ProjectStatusBadge'
import {
  useProject,
  useChangeProjectStatus,
  useAddAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
  useAddRate,
  useDeleteRate,
} from '../api/projectApi'
import { useAuthStore } from '@/store/authStore'
import type { ProjectStatus, ProjectAssignment, AssignmentStatus } from '@/types/project'
import { Pencil, Trash2, Plus } from 'lucide-react'

const typeLabel = { ses: 'SES', consignment: '受託開発' }
const workStyleLabel = { onsite: 'フル常駐', remote: 'フルリモート', hybrid: 'ハイブリッド' }

// ---- Status Change Sheet ----
function StatusChangeSheet({
  open,
  projectId,
  currentStatus,
  onClose,
}: {
  open: boolean
  projectId: string
  currentStatus: ProjectStatus
  onClose: () => void
}) {
  const changeStatus = useChangeProjectStatus(projectId)
  const available = nextStatuses[currentStatus]

  const schema = z.object({
    to_status: z.enum(['negotiating', 'proposing', 'ordered', 'in_progress', 'completed', 'lost', 'cancelled']),
    reason: z.string(),
  })
  type Vals = z.infer<typeof schema>

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<Vals>({
    defaultValues: { to_status: available[0] ?? 'negotiating', reason: '' },
  })

  const toStatus = watch('to_status')
  const needsReason = requiresReason.includes(toStatus)

  const onSubmit = async (data: Vals) => {
    await changeStatus.mutateAsync(data)
    onClose()
  }

  if (available.length === 0) return null

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader><SheetTitle>ステータス変更</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <p className="text-sm text-slate-500 mb-2">
              現在: <ProjectStatusBadge status={currentStatus} />
            </p>
            <Label>変更先ステータス *</Label>
            <Select value={toStatus} onValueChange={(v) => setValue('to_status', v as ProjectStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {available.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{needsReason ? '変更理由 *' : '変更理由（任意）'}</Label>
            <Textarea
              {...register('reason', { required: needsReason ? '変更理由を入力してください' : false })}
              placeholder={needsReason ? '失注・中止の理由を入力してください' : '任意'}
              rows={3}
            />
            {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason.message}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={changeStatus.isPending}>
              {changeStatus.isPending ? '変更中...' : 'ステータス変更'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ---- Assignment Sheet ----
const assignSchema = z.object({
  assignee_id: z.string().min(1, '社員IDを入力してください'),
  assignee_name: z.string().min(1, '氏名を入力してください'),
  role: z.string().optional(),
  start_date: z.string().min(1, '開始日を入力してください'),
  end_date: z.string().optional(),
  status: z.enum(['proposed', 'confirmed', 'completed']),
})
type AssignVals = z.infer<typeof assignSchema>

function AssignmentSheet({
  open,
  projectId,
  editing,
  onClose,
}: {
  open: boolean
  projectId: string
  editing: ProjectAssignment | null
  onClose: () => void
}) {
  const addAsgn = useAddAssignment(projectId)
  const updateAsgn = useUpdateAssignment(projectId, editing?.id ?? '')

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<AssignVals>({
    resolver: zodResolver(assignSchema),
    defaultValues: {
      assignee_id: editing?.assignee_id ?? '',
      assignee_name: editing?.assignee_name ?? '',
      role: editing?.role ?? '',
      start_date: editing?.start_date ?? '',
      end_date: editing?.end_date ?? '',
      status: editing?.status ?? 'proposed',
    },
  })

  const onSubmit = async (data: AssignVals) => {
    const payload = {
      ...data,
      assignee_type: 'employee' as const,
      role: data.role || null,
      end_date: data.end_date || null,
    }
    if (editing) await updateAsgn.mutateAsync(payload)
    else await addAsgn.mutateAsync(payload)
    reset()
    onClose()
  }

  const isLoading = addAsgn.isPending || updateAsgn.isPending

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader><SheetTitle>{editing ? 'アサイン編集' : 'アサイン追加'}</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label>社員ID *</Label>
            <Input {...register('assignee_id')} placeholder="例: EMP-20240401-0001" />
            {errors.assignee_id && <p className="text-red-500 text-xs mt-1">{errors.assignee_id.message}</p>}
          </div>
          <div>
            <Label>氏名 *</Label>
            <Input {...register('assignee_name')} placeholder="例: 山田 太郎" />
            {errors.assignee_name && <p className="text-red-500 text-xs mt-1">{errors.assignee_name.message}</p>}
          </div>
          <div>
            <Label>担当役割</Label>
            <Input {...register('role')} placeholder="例: SE, テックリード, PM" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>参画開始日 *</Label>
              <Input type="date" {...register('start_date')} />
              {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
            </div>
            <div>
              <Label>参画終了日</Label>
              <Input type="date" {...register('end_date')} />
            </div>
          </div>
          <div>
            <Label>ステータス</Label>
            <Select value={watch('status')} onValueChange={(v) => setValue('status', v as AssignmentStatus)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="proposed">候補</SelectItem>
                <SelectItem value="confirmed">確定</SelectItem>
                <SelectItem value="completed">完了</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>{isLoading ? '保存中...' : '保存'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ---- Rate Sheet ----
const rateSchema = z.object({
  target_name: z.string().min(1, '対象者名を入力してください'),
  billing_rate: z.coerce.number().min(1, '請求単価を入力してください'),
  payment_rate: z.coerce.number().min(1, '支払単価を入力してください'),
  rate_unit: z.enum(['monthly', 'hourly']),
  valid_from: z.string().min(1, '適用開始日を入力してください'),
  valid_to: z.string().optional(),
})
type RateVals = z.infer<typeof rateSchema>

function RateSheet({
  open,
  projectId,
  onClose,
}: {
  open: boolean
  projectId: string
  onClose: () => void
}) {
  const addRate = useAddRate(projectId)

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<RateVals>({
    resolver: zodResolver(rateSchema),
    defaultValues: { rate_unit: 'monthly', valid_from: '', valid_to: '', billing_rate: 0, payment_rate: 0, target_name: '' },
  })

  const onSubmit = async (data: RateVals) => {
    await addRate.mutateAsync({
      ...data,
      target_type: 'employee',
      target_id: null,
      valid_to: data.valid_to || null,
    })
    reset()
    onClose()
  }

  const billing = Number(watch('billing_rate') ?? 0)
  const payment = Number(watch('payment_rate') ?? 0)
  const margin = billing - payment

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader><SheetTitle>単価追加</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label>対象者名 *</Label>
            <Input {...register('target_name')} placeholder="例: 山田 太郎" />
            {errors.target_name && <p className="text-red-500 text-xs mt-1">{errors.target_name.message}</p>}
          </div>
          <div>
            <Label>単価区分</Label>
            <Select value={watch('rate_unit')} onValueChange={(v) => setValue('rate_unit', v as 'monthly' | 'hourly')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">月単価</SelectItem>
                <SelectItem value="hourly">時間単価</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>顧客請求単価 *（円）</Label>
            <Input type="number" step="1000" {...register('billing_rate')} />
            {errors.billing_rate && <p className="text-red-500 text-xs mt-1">{errors.billing_rate.message}</p>}
          </div>
          <div>
            <Label>支払単価 *（円）</Label>
            <Input type="number" step="1000" {...register('payment_rate')} />
            {errors.payment_rate && <p className="text-red-500 text-xs mt-1">{errors.payment_rate.message}</p>}
          </div>
          {billing > 0 && payment > 0 && (
            <div className="p-3 bg-slate-50 rounded text-sm">
              <span className="text-slate-500">粗利: </span>
              <span className={`font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ¥{margin.toLocaleString()}
              </span>
              <span className="text-slate-400 ml-1">({billing > 0 ? Math.round((margin / billing) * 100) : 0}%)</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>適用開始日 *</Label>
              <Input type="date" {...register('valid_from')} />
              {errors.valid_from && <p className="text-red-500 text-xs mt-1">{errors.valid_from.message}</p>}
            </div>
            <div>
              <Label>適用終了日</Label>
              <Input type="date" {...register('valid_to')} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={addRate.isPending}>{addRate.isPending ? '保存中...' : '追加'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ---- Main Page ----
const assignStatusLabel: Record<AssignmentStatus, string> = { proposed: '候補', confirmed: '確定', completed: '完了' }

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useAuthStore()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useProject(id!)
  const deleteAsgn = useDeleteAssignment(id!)
  const deleteRate = useDeleteRate(id!)

  const [statusSheet, setStatusSheet] = useState(false)
  const [asgnSheet, setAsgnSheet] = useState<{ open: boolean; editing: ProjectAssignment | null }>({ open: false, editing: null })
  const [rateSheet, setRateSheet] = useState(false)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">案件が見つかりません</div>

  const canEdit = can('edit_all')
  const canViewRates = can('edit_all') || can('export_csv')
  const hasNextStatus = nextStatuses[data.status].length > 0

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${
              data.project_type === 'ses' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
            }`}>
              {typeLabel[data.project_type]}
            </span>
          </div>
          <p className="text-slate-500 text-sm mt-1">{data.company_name} / {data.sales_user_name}</p>
          <div className="flex items-center gap-3 mt-2">
            <ProjectStatusBadge status={data.status} />
            <span className="text-xs text-slate-400">{data.id}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/projects/${id}/edit`}><Pencil size={14} className="mr-1" />編集</Link>
            </Button>
          )}
          {canEdit && hasNextStatus && (
            <Button size="sm" onClick={() => setStatusSheet(true)}>ステータス変更</Button>
          )}
        </div>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.description && <p className="text-sm text-slate-700">{data.description}</p>}
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><dt className="text-xs text-slate-500">開始日</dt><dd className="text-sm">{data.start_date ?? '—'}</dd></div>
            <div><dt className="text-xs text-slate-500">終了日</dt><dd className="text-sm">{data.end_date ?? '—'}</dd></div>
            {data.skill_tags.length > 0 && (
              <div className="col-span-2 md:col-span-3">
                <dt className="text-xs text-slate-500 mb-1">必要スキル</dt>
                <dd className="flex flex-wrap gap-1">
                  {data.skill_tags.map((t) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          {/* SES detail */}
          {data.ses_detail && (
            <div className="pt-2 border-t">
              <p className="text-xs text-slate-500 font-medium mb-2">SES詳細</p>
              <dl className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div><dt className="text-xs text-slate-500">就業場所</dt><dd className="text-sm">{data.ses_detail.work_location ?? '—'}</dd></div>
                <div><dt className="text-xs text-slate-500">勤務形態</dt><dd className="text-sm">{data.ses_detail.work_style ? workStyleLabel[data.ses_detail.work_style] : '—'}</dd></div>
                <div><dt className="text-xs text-slate-500">必要人数</dt><dd className="text-sm">{data.ses_detail.required_headcount ? `${data.ses_detail.required_headcount}名` : '—'}</dd></div>
                <div><dt className="text-xs text-slate-500">精算単位</dt><dd className="text-sm">{data.ses_detail.contract_unit === 'monthly' ? '月単位' : '時間単位'}</dd></div>
                {(data.ses_detail.min_hours || data.ses_detail.max_hours) && (
                  <div><dt className="text-xs text-slate-500">精算幅</dt><dd className="text-sm">{data.ses_detail.min_hours}h 〜 {data.ses_detail.max_hours}h</dd></div>
                )}
              </dl>
            </div>
          )}
          {/* Consignment detail */}
          {data.consignment_detail && (
            <div className="pt-2 border-t">
              <p className="text-xs text-slate-500 font-medium mb-2">受託詳細</p>
              <dl className="grid grid-cols-2 gap-3">
                {data.consignment_detail.contract_amount && (
                  <div><dt className="text-xs text-slate-500">契約金額</dt><dd className="text-sm font-medium">¥{data.consignment_detail.contract_amount.toLocaleString()}</dd></div>
                )}
                {data.consignment_detail.payment_terms && (
                  <div><dt className="text-xs text-slate-500">支払条件</dt><dd className="text-sm">{data.consignment_detail.payment_terms}</dd></div>
                )}
                {data.consignment_detail.deliverables && (
                  <div className="col-span-2"><dt className="text-xs text-slate-500">成果物</dt><dd className="text-sm">{data.consignment_detail.deliverables}</dd></div>
                )}
                {data.consignment_detail.acceptance_criteria && (
                  <div className="col-span-2"><dt className="text-xs text-slate-500">検収条件</dt><dd className="text-sm">{data.consignment_detail.acceptance_criteria}</dd></div>
                )}
              </dl>
            </div>
          )}
          {data.notes && (
            <div className="pt-2 border-t">
              <p className="text-xs text-slate-500 mb-1">社内メモ</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">アサインメンバー ({data.assignments.length}名)</CardTitle>
          {canEdit && (
            <Button size="sm" onClick={() => setAsgnSheet({ open: true, editing: null })}>
              <Plus size={14} className="mr-1" />追加
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {data.assignments.length === 0 ? (
            <p className="text-slate-400 text-sm">アサインメンバーなし</p>
          ) : (
            <div className="space-y-2">
              {data.assignments.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{a.assignee_name}</p>
                    <p className="text-xs text-slate-500">
                      {a.role ?? '役割未設定'} / {a.start_date} 〜 {a.end_date ?? '現在'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      a.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      a.status === 'completed' ? 'bg-slate-100 text-slate-600' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {assignStatusLabel[a.status]}
                    </span>
                    {canEdit && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setAsgnSheet({ open: true, editing: a })}>
                          <Pencil size={12} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() => { if (confirm('削除しますか？')) deleteAsgn.mutate(a.id) }}
                        >
                          <Trash2 size={12} />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rates (권한 있는 사람만) */}
      {canViewRates && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">単価情報</CardTitle>
            {canEdit && (
              <Button size="sm" onClick={() => setRateSheet(true)}>
                <Plus size={14} className="mr-1" />追加
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {data.rates.length === 0 ? (
              <p className="text-slate-400 text-sm">単価情報なし</p>
            ) : (
              <div className="space-y-2">
                {data.rates.map((r) => {
                  const margin = r.billing_rate - r.payment_rate
                  return (
                    <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <p className="text-sm font-medium">{r.target_name ?? '（未設定）'}</p>
                        <p className="text-xs text-slate-500">
                          {r.valid_from} 〜 {r.valid_to ?? '継続中'} / {r.rate_unit === 'monthly' ? '月単価' : '時間単価'}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">請求</p>
                          <p className="font-medium">¥{r.billing_rate.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">支払</p>
                          <p>¥{r.payment_rate.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">粗利</p>
                          <p className={`font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ¥{margin.toLocaleString()}
                          </p>
                        </div>
                        {canEdit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => { if (confirm('削除しますか？')) deleteRate.mutate(r.id) }}
                          >
                            <Trash2 size={12} />
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status log */}
      <Card>
        <CardHeader><CardTitle className="text-base">ステータス変更履歴</CardTitle></CardHeader>
        <CardContent>
          {data.status_logs.length === 0 ? (
            <p className="text-slate-400 text-sm">変更履歴なし</p>
          ) : (
            <div className="space-y-2">
              {data.status_logs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 py-2 border-b last:border-0 text-sm">
                  <span className="text-slate-400 text-xs shrink-0">{log.changed_at.slice(0, 10)}</span>
                  <span className="text-slate-500">{log.changed_by_name}</span>
                  <ProjectStatusBadge status={log.from_status} />
                  <span className="text-slate-400">→</span>
                  <ProjectStatusBadge status={log.to_status} />
                  {log.reason && <span className="text-slate-600 text-xs">（{log.reason}）</span>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <StatusChangeSheet
        open={statusSheet}
        projectId={id!}
        currentStatus={data.status}
        onClose={() => setStatusSheet(false)}
      />
      <AssignmentSheet
        open={asgnSheet.open}
        projectId={id!}
        editing={asgnSheet.editing}
        onClose={() => setAsgnSheet({ open: false, editing: null })}
      />
      <RateSheet
        open={rateSheet}
        projectId={id!}
        onClose={() => setRateSheet(false)}
      />
    </div>
  )
}
