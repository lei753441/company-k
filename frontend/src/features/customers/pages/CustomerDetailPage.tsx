import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
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
import {
  CompanyStatusBadge,
  CompanyTypeBadge,
  InteractionTypeIcon,
  interactionTypeLabel,
} from '../components/CompanyStatusBadge'
import {
  useCompany,
  useAddContact,
  useUpdateContact,
  useResignContact,
  useAddInteraction,
  useUpdateInteraction,
} from '../api/customerApi'
import { useAuthStore } from '@/store/authStore'
import type { Contact, Interaction, InteractionType } from '@/types/customer'
import { Pencil, Plus, Trash2, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

// ---- Contact Sheet ----
const contactSchema = z.object({
  last_name: z.string().min(1, '姓を入力してください'),
  first_name: z.string().min(1, '名を入力してください'),
  last_name_kana: z.string().optional(),
  first_name_kana: z.string().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  email: z.string().email('メールアドレスが正しくありません').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  notes: z.string().optional(),
})
type ContactVals = z.infer<typeof contactSchema>

function ContactSheet({
  open,
  companyId,
  editing,
  onClose,
}: {
  open: boolean
  companyId: string
  editing: Contact | null
  onClose: () => void
}) {
  const addContact = useAddContact(companyId)
  const updateContact = useUpdateContact(companyId, editing?.id ?? '')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactVals>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      last_name: editing?.last_name ?? '',
      first_name: editing?.first_name ?? '',
      last_name_kana: editing?.last_name_kana ?? '',
      first_name_kana: editing?.first_name_kana ?? '',
      department: editing?.department ?? '',
      title: editing?.title ?? '',
      email: editing?.email ?? '',
      phone: editing?.phone ?? '',
      mobile: editing?.mobile ?? '',
      notes: editing?.notes ?? '',
    },
  })

  const onSubmit = async (data: ContactVals) => {
    const payload = {
      ...data,
      last_name_kana: data.last_name_kana || null,
      first_name_kana: data.first_name_kana || null,
      department: data.department || null,
      title: data.title || null,
      email: data.email || null,
      phone: data.phone || null,
      mobile: data.mobile || null,
      notes: data.notes || null,
    }
    if (editing) await updateContact.mutateAsync(payload)
    else await addContact.mutateAsync(payload)
    reset()
    onClose()
  }

  const isLoading = addContact.isPending || updateContact.isPending

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader><SheetTitle>{editing ? '担当者編集' : '担当者追加'}</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>姓 *</Label>
              <Input {...register('last_name')} />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
            </div>
            <div>
              <Label>名 *</Label>
              <Input {...register('first_name')} />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <Label>姓（カナ）</Label>
              <Input {...register('last_name_kana')} />
            </div>
            <div>
              <Label>名（カナ）</Label>
              <Input {...register('first_name_kana')} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>部署</Label>
              <Input {...register('department')} />
            </div>
            <div>
              <Label>役職</Label>
              <Input {...register('title')} />
            </div>
          </div>
          <div>
            <Label>メールアドレス</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>直通電話</Label>
              <Input {...register('phone')} />
            </div>
            <div>
              <Label>携帯電話</Label>
              <Input {...register('mobile')} />
            </div>
          </div>
          <div>
            <Label>社内メモ</Label>
            <Textarea {...register('notes')} rows={2} />
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

// ---- Interaction Sheet ----
const interactionSchema = z.object({
  interaction_type: z.enum(['meeting', 'online', 'phone', 'email', 'other']),
  interacted_at: z.string().min(1, '日時を入力してください'),
  subject: z.string().min(1, '件名を入力してください'),
  content: z.string().min(1, '内容を入力してください'),
  next_action: z.string().optional(),
  follow_up_date: z.string().optional(),
})
type InteractionVals = z.infer<typeof interactionSchema>

function InteractionSheet({
  open,
  companyId,
  editing,
  onClose,
}: {
  open: boolean
  companyId: string
  editing: Interaction | null
  onClose: () => void
}) {
  const addInteraction = useAddInteraction(companyId)
  const updateInteraction = useUpdateInteraction(companyId, editing?.id ?? '')

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<InteractionVals>({
    resolver: zodResolver(interactionSchema),
    defaultValues: {
      interaction_type: editing?.interaction_type ?? 'meeting',
      interacted_at: editing?.interacted_at
        ? editing.interacted_at.slice(0, 16)
        : new Date().toISOString().slice(0, 16),
      subject: editing?.subject ?? '',
      content: editing?.content ?? '',
      next_action: editing?.next_action ?? '',
      follow_up_date: editing?.follow_up_date ?? '',
    },
  })

  const onSubmit = async (data: InteractionVals) => {
    const payload = {
      ...data,
      interacted_at: new Date(data.interacted_at).toISOString(),
      next_action: data.next_action || null,
      follow_up_date: data.follow_up_date || null,
    }
    if (editing) await updateInteraction.mutateAsync(payload)
    else await addInteraction.mutateAsync(payload)
    reset()
    onClose()
  }

  const isLoading = addInteraction.isPending || updateInteraction.isPending

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader><SheetTitle>{editing ? '商談記録編集' : '商談記録追加'}</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>方法 *</Label>
              <Select
                value={watch('interaction_type')}
                onValueChange={(v) => setValue('interaction_type', v as InteractionType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(interactionTypeLabel) as InteractionType[]).map((t) => (
                    <SelectItem key={t} value={t}>{interactionTypeLabel[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>日時 *</Label>
              <Input type="datetime-local" {...register('interacted_at')} />
              {errors.interacted_at && <p className="text-red-500 text-xs mt-1">{errors.interacted_at.message}</p>}
            </div>
          </div>
          <div>
            <Label>件名 *</Label>
            <Input {...register('subject')} placeholder="例: 5月月次報告・6月計画確認" />
            {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
          </div>
          <div>
            <Label>商談内容 *</Label>
            <Textarea {...register('content')} rows={4} placeholder="商談の内容を記録してください" />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
          </div>
          <div>
            <Label>次のアクション</Label>
            <Input {...register('next_action')} placeholder="例: 設計書を提出" />
          </div>
          <div>
            <Label>フォローアップ予定日</Label>
            <Input type="date" {...register('follow_up_date')} />
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

// ---- Main Page ----
export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useAuthStore()
  const { data, isLoading, isError } = useCompany(id!)
  const resignContact = useResignContact(id!)

  const [contactSheet, setContactSheet] = useState<{ open: boolean; editing: Contact | null }>({ open: false, editing: null })
  const [interactionSheet, setInteractionSheet] = useState<{ open: boolean; editing: Interaction | null }>({ open: false, editing: null })

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">企業が見つかりません</div>

  const canEdit = can('edit_all')
  const activeContacts = data.contacts.filter((c) => c.status === 'active')
  const resignedContacts = data.contacts.filter((c) => c.status === 'resigned')

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <CompanyTypeBadge type={data.company_type} />
          </div>
          {data.name_kana && <p className="text-sm text-slate-400 mt-0.5">{data.name_kana}</p>}
          <div className="flex items-center gap-3 mt-2">
            <CompanyStatusBadge status={data.status} />
            <span className="text-xs text-slate-400">{data.id}</span>
            {data.website_url && (
              <a href={data.website_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 flex items-center gap-1 hover:underline">
                <ExternalLink size={12} />サイト
              </a>
            )}
          </div>
        </div>
        {canEdit && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/customers/${id}/edit`}><Pencil size={14} className="mr-1" />編集</Link>
          </Button>
        )}
      </div>

      {/* Basic info */}
      <Card>
        <CardHeader><CardTitle className="text-base">企業情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><dt className="text-xs text-slate-500">業種</dt><dd className="text-sm">{data.industry ?? '—'}</dd></div>
            <div><dt className="text-xs text-slate-500">所在地</dt><dd className="text-sm">{data.prefecture ? `${data.prefecture} ${data.address ?? ''}` : '—'}</dd></div>
            <div><dt className="text-xs text-slate-500">代表電話</dt><dd className="text-sm">{data.phone ?? '—'}</dd></div>
            {data.corporate_number && (
              <div><dt className="text-xs text-slate-500">法人番号</dt><dd className="text-sm font-mono">{data.corporate_number}</dd></div>
            )}
            {data.tags.length > 0 && (
              <div className="col-span-2 md:col-span-3">
                <dt className="text-xs text-slate-500 mb-1">タグ</dt>
                <dd className="flex flex-wrap gap-1">
                  {data.tags.map((t) => (
                    <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{t}</span>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          {data.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-slate-500 mb-1">社内メモ</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">担当者 ({activeContacts.length}名)</CardTitle>
          {canEdit && (
            <Button size="sm" onClick={() => setContactSheet({ open: true, editing: null })}>
              <Plus size={14} className="mr-1" />追加
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {activeContacts.length === 0 ? (
            <p className="text-slate-400 text-sm">担当者が登録されていません</p>
          ) : (
            <div className="space-y-3">
              {activeContacts.map((c) => (
                <div key={c.id} className="flex items-start justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {c.last_name} {c.first_name}
                      {c.title && <span className="ml-2 text-xs text-slate-500">{c.title}</span>}
                      {c.department && <span className="ml-1 text-xs text-slate-400">/ {c.department}</span>}
                    </p>
                    <div className="flex flex-wrap gap-3 mt-0.5">
                      {c.email && <a href={`mailto:${c.email}`} className="text-xs text-blue-500 hover:underline">{c.email}</a>}
                      {c.phone && <span className="text-xs text-slate-500">{c.phone}</span>}
                      {c.mobile && <span className="text-xs text-slate-500">{c.mobile}</span>}
                    </div>
                    {c.notes && <p className="text-xs text-slate-400 mt-0.5">{c.notes}</p>}
                  </div>
                  {canEdit && (
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => setContactSheet({ open: true, editing: c })}>
                        <Pencil size={12} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => { if (confirm('退職済みにしますか？')) resignContact.mutate(c.id) }}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {resignedContacts.length > 0 && (
                <p className="text-xs text-slate-400">退職済み: {resignedContacts.map((c) => `${c.last_name} ${c.first_name}`).join(', ')}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interaction timeline */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">商談履歴 ({data.interactions.length}件)</CardTitle>
          <Button size="sm" onClick={() => setInteractionSheet({ open: true, editing: null })}>
            <Plus size={14} className="mr-1" />記録追加
          </Button>
        </CardHeader>
        <CardContent>
          {data.interactions.length === 0 ? (
            <p className="text-slate-400 text-sm">商談履歴がありません</p>
          ) : (
            <div className="space-y-4">
              {data.interactions.map((interaction) => (
                <div key={interaction.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm">
                      <InteractionTypeIcon type={interaction.interaction_type} />
                    </div>
                    <div className="w-px flex-1 bg-slate-200 mt-2" />
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{interaction.subject}</p>
                        <p className="text-xs text-slate-500">
                          {format(new Date(interaction.interacted_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
                          {' / '}{interactionTypeLabel[interaction.interaction_type]}
                          {interaction.project_name && <span> / 案件: {interaction.project_name}</span>}
                        </p>
                      </div>
                      {canEdit && (
                        <Button variant="ghost" size="sm" onClick={() => setInteractionSheet({ open: true, editing: interaction })}>
                          <Pencil size={12} />
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{interaction.content}</p>
                    {interaction.next_action && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded text-sm">
                        <span className="font-medium text-yellow-700">次のアクション:</span>{' '}
                        <span className="text-yellow-800">{interaction.next_action}</span>
                        {interaction.follow_up_date && (
                          <span className="ml-2 text-xs text-yellow-600">
                            (期日: {interaction.follow_up_date})
                          </span>
                        )}
                      </div>
                    )}
                    {interaction.client_contact_names.length > 0 && (
                      <p className="text-xs text-slate-400 mt-1">
                        顧客側: {interaction.client_contact_names.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ContactSheet
        open={contactSheet.open}
        companyId={id!}
        editing={contactSheet.editing}
        onClose={() => setContactSheet({ open: false, editing: null })}
      />
      <InteractionSheet
        open={interactionSheet.open}
        companyId={id!}
        editing={interactionSheet.editing}
        onClose={() => setInteractionSheet({ open: false, editing: null })}
      />
    </div>
  )
}
