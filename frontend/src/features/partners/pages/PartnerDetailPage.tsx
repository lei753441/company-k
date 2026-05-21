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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PartnerStatusBadge, AvailabilityBadge, availabilityLabel } from '../components/PartnerBadge'
import type { AvailabilityStatus } from '../components/PartnerBadge'
import { usePartner, useAddEngineer, useUpdateEngineer } from '../api/partnerApi'
import { useAuthStore } from '@/store/authStore'
import type { PartnerEngineer } from '@/types/partner'
import { Pencil, Plus, ExternalLink } from 'lucide-react'

const engineerSchema = z.object({
  last_name: z.string().min(1, '姓を入力してください'),
  first_name: z.string().min(1, '名を入力してください'),
  last_name_kana: z.string().optional(),
  first_name_kana: z.string().optional(),
  email: z.string().email('メールアドレスが正しくありません').optional().or(z.literal('')),
  phone: z.string().optional(),
  availability_status: z.enum(['available', 'available_soon', 'in_project', 'unavailable']),
  available_from: z.string().optional(),
  unit_price: z.string().optional(),
  skills_str: z.string().optional(),
  notes: z.string().optional(),
})
type EngineerVals = z.infer<typeof engineerSchema>

const NONE = '_none_'

function EngineerSheet({
  open,
  partnerId,
  editing,
  onClose,
}: {
  open: boolean
  partnerId: string
  editing: PartnerEngineer | null
  onClose: () => void
}) {
  const addEngineer = useAddEngineer(partnerId)
  const updateEngineer = useUpdateEngineer(partnerId, editing?.id ?? '')

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<EngineerVals>({
    resolver: zodResolver(engineerSchema),
    defaultValues: {
      last_name: editing?.last_name ?? '',
      first_name: editing?.first_name ?? '',
      last_name_kana: editing?.last_name_kana ?? '',
      first_name_kana: editing?.first_name_kana ?? '',
      email: editing?.email ?? '',
      phone: editing?.phone ?? '',
      availability_status: editing?.availability_status ?? 'available',
      available_from: editing?.available_from ?? '',
      unit_price: editing?.unit_price != null ? String(editing.unit_price) : '',
      skills_str: editing?.skills.join(', ') ?? '',
      notes: editing?.notes ?? '',
    },
  })

  const onSubmit = async (data: EngineerVals) => {
    const payload = {
      last_name: data.last_name,
      first_name: data.first_name,
      last_name_kana: data.last_name_kana || null,
      first_name_kana: data.first_name_kana || null,
      email: data.email || null,
      phone: data.phone || null,
      availability_status: data.availability_status,
      available_from: data.available_from || null,
      unit_price: data.unit_price ? Number(data.unit_price) : null,
      skills: data.skills_str ? data.skills_str.split(',').map((s) => s.trim()).filter(Boolean) : [],
      notes: data.notes || null,
    }
    if (editing) await updateEngineer.mutateAsync(payload)
    else await addEngineer.mutateAsync(payload)
    reset()
    onClose()
  }

  const isLoading = addEngineer.isPending || updateEngineer.isPending

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader><SheetTitle>{editing ? 'エンジニア編集' : 'エンジニア追加'}</SheetTitle></SheetHeader>
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
          <div>
            <Label>メールアドレス</Label>
            <Input type="email" {...register('email')} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <Label>電話番号</Label>
            <Input {...register('phone')} />
          </div>
          <div>
            <Label>稼働状況</Label>
            <Select
              value={watch('availability_status')}
              onValueChange={(v) => setValue('availability_status', v as AvailabilityStatus)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(availabilityLabel) as AvailabilityStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>{availabilityLabel[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>稼働可能日</Label>
            <Input type="date" {...register('available_from')} />
          </div>
          <div>
            <Label>月額単価（円）</Label>
            <Input type="number" {...register('unit_price')} placeholder="例: 700000" />
          </div>
          <div>
            <Label>スキル（カンマ区切り）</Label>
            <Input {...register('skills_str')} placeholder="例: Java, Spring Boot, AWS" />
          </div>
          <div>
            <Label>メモ</Label>
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

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useAuthStore()
  const { data, isLoading, isError } = usePartner(id!)

  const [engineerSheet, setEngineerSheet] = useState<{ open: boolean; editing: PartnerEngineer | null }>({ open: false, editing: null })

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">協力会社が見つかりません</div>

  const canEdit = can('edit_all') || can('manage_office')
  const activeEngineers = data.engineers.filter((e) => e.status === 'active')

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.name}</h1>
            <PartnerStatusBadge status={data.status} />
          </div>
          {data.name_kana && <p className="text-sm text-slate-400 mt-0.5">{data.name_kana}</p>}
          <div className="flex items-center gap-3 mt-1">
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
            <Link to={`/partners/${id}/edit`}><Pencil size={14} className="mr-1" />編集</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">企業情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div><dt className="text-xs text-slate-500">所在地</dt><dd className="text-sm">{data.prefecture ? `${data.prefecture} ${data.address ?? ''}` : '—'}</dd></div>
            <div><dt className="text-xs text-slate-500">電話番号</dt><dd className="text-sm">{data.phone ?? '—'}</dd></div>
            {data.corporate_number && (
              <div><dt className="text-xs text-slate-500">法人番号</dt><dd className="text-sm font-mono">{data.corporate_number}</dd></div>
            )}
            {data.invoice_number && (
              <div><dt className="text-xs text-slate-500">インボイス番号</dt><dd className="text-sm font-mono">{data.invoice_number}</dd></div>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">所属エンジニア ({activeEngineers.length}名)</CardTitle>
          {canEdit && (
            <Button size="sm" onClick={() => setEngineerSheet({ open: true, editing: null })}>
              <Plus size={14} className="mr-1" />追加
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {activeEngineers.length === 0 ? (
            <p className="text-slate-400 text-sm">登録されているエンジニアがいません</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>稼働状況</TableHead>
                  <TableHead>スキル</TableHead>
                  <TableHead>月額単価</TableHead>
                  {canEdit && <TableHead></TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeEngineers.map((eng) => (
                  <TableRow key={eng.id}>
                    <TableCell>
                      <p className="text-sm font-medium">{eng.last_name} {eng.first_name}</p>
                      {eng.email && <a href={`mailto:${eng.email}`} className="text-xs text-blue-500 hover:underline">{eng.email}</a>}
                    </TableCell>
                    <TableCell><AvailabilityBadge status={eng.availability_status} /></TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {eng.skills.slice(0, 4).map((s) => (
                          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-slate-700">
                      {eng.unit_price != null ? `¥${eng.unit_price.toLocaleString()}` : '—'}
                    </TableCell>
                    {canEdit && (
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setEngineerSheet({ open: true, editing: eng })}>
                          <Pencil size={12} />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <EngineerSheet
        open={engineerSheet.open}
        partnerId={id!}
        editing={engineerSheet.editing}
        onClose={() => setEngineerSheet({ open: false, editing: null })}
      />
    </div>
  )
}
