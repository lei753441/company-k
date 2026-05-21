import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { availabilityLabel } from '../components/PartnerBadge'
import type { AvailabilityStatus } from '../components/PartnerBadge'
import { useFreelancer, useCreateFreelancer, useUpdateFreelancer } from '../api/partnerApi'
import type { InvoiceRegistrationStatus } from '@/types/partner'

const schema = z.object({
  last_name: z.string().min(1, '姓を入力してください'),
  first_name: z.string().min(1, '名を入力してください'),
  last_name_kana: z.string().optional(),
  first_name_kana: z.string().optional(),
  email: z.string().email('メールアドレスが正しくありません').optional().or(z.literal('')),
  phone: z.string().optional(),
  trade_name: z.string().optional(),
  invoice_registration_status: z.enum(['registered', 'pending', 'not_registered']),
  invoice_number: z.string().optional(),
  prefecture: z.string().optional(),
  availability_status: z.enum(['available', 'available_soon', 'in_project', 'unavailable']),
  available_from: z.string().optional(),
  unit_price: z.string().optional(),
  skills_str: z.string().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const prefectures = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']

const NONE = '_none_'

interface Props {
  mode: 'new' | 'edit'
}

export default function FreelancerFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: existing } = useFreelancer(mode === 'edit' ? id! : '')
  const createFreelancer = useCreateFreelancer()
  const updateFreelancer = useUpdateFreelancer(id ?? '')

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      last_name: '',
      first_name: '',
      invoice_registration_status: 'not_registered',
      availability_status: 'available',
    },
  })

  useEffect(() => {
    if (existing && mode === 'edit') {
      reset({
        last_name: existing.last_name,
        first_name: existing.first_name,
        last_name_kana: existing.last_name_kana ?? '',
        first_name_kana: existing.first_name_kana ?? '',
        email: existing.email ?? '',
        phone: existing.phone ?? '',
        trade_name: existing.trade_name ?? '',
        invoice_registration_status: existing.invoice_registration_status,
        invoice_number: existing.invoice_number ?? '',
        prefecture: existing.prefecture ?? '',
        availability_status: existing.availability_status,
        available_from: existing.available_from ?? '',
        unit_price: existing.unit_price != null ? String(existing.unit_price) : '',
        skills_str: existing.skills.join(', '),
        notes: existing.notes ?? '',
      })
    }
  }, [existing, mode])

  const onSubmit = async (data: FormValues) => {
    const invoiceStatus = data.invoice_registration_status
    const showInvoiceNumber = invoiceStatus === 'registered' || invoiceStatus === 'pending'
    const payload = {
      last_name: data.last_name,
      first_name: data.first_name,
      last_name_kana: data.last_name_kana || null,
      first_name_kana: data.first_name_kana || null,
      email: data.email || null,
      phone: data.phone || null,
      trade_name: data.trade_name || null,
      invoice_registration_status: invoiceStatus,
      invoice_number: showInvoiceNumber ? (data.invoice_number || null) : null,
      prefecture: data.prefecture || null,
      status: 'active' as const,
      availability_status: data.availability_status,
      available_from: data.available_from || null,
      unit_price: data.unit_price ? Number(data.unit_price) : null,
      skills: data.skills_str ? data.skills_str.split(',').map((s) => s.trim()).filter(Boolean) : [],
      notes: data.notes || null,
    }
    if (mode === 'new') {
      const created = await createFreelancer.mutateAsync(payload)
      navigate(`/freelancers/${created.id}`)
    } else {
      await updateFreelancer.mutateAsync(payload)
      navigate(`/freelancers/${id}`)
    }
  }

  const isLoading = createFreelancer.isPending || updateFreelancer.isPending
  const invoiceStatus = watch('invoice_registration_status')
  const showInvoiceNumber = invoiceStatus === 'registered' || invoiceStatus === 'pending'

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{mode === 'new' ? 'フリーランス新規登録' : 'フリーランス編集'}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← 戻る</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>姓 *</Label>
                <Input {...register('last_name')} placeholder="例: 田中" />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
              <div>
                <Label>名 *</Label>
                <Input {...register('first_name')} placeholder="例: 太郎" />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div>
                <Label>姓（カナ）</Label>
                <Input {...register('last_name_kana')} placeholder="例: タナカ" />
              </div>
              <div>
                <Label>名（カナ）</Label>
                <Input {...register('first_name_kana')} placeholder="例: タロウ" />
              </div>
            </div>
            <div>
              <Label>メールアドレス</Label>
              <Input type="email" {...register('email')} placeholder="例: tanaka@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>電話番号</Label>
                <Input {...register('phone')} placeholder="例: 090-1234-5678" />
              </div>
              <div>
                <Label>屋号</Label>
                <Input {...register('trade_name')} placeholder="例: タナカ技術事務所" />
              </div>
            </div>
            <div>
              <Label>都道府県</Label>
              <Select value={watch('prefecture') || NONE} onValueChange={(v) => setValue('prefecture', v === NONE ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>選択してください</SelectItem>
                  {prefectures.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">インボイス登録</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>インボイス登録ステータス</Label>
              <Select
                value={watch('invoice_registration_status')}
                onValueChange={(v) => setValue('invoice_registration_status', v as InvoiceRegistrationStatus)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="registered">登録済</SelectItem>
                  <SelectItem value="pending">申請中</SelectItem>
                  <SelectItem value="not_registered">未登録</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {showInvoiceNumber && (
              <div>
                <Label>インボイス番号</Label>
                <Input {...register('invoice_number')} placeholder="例: T1234567890123" />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">稼働情報</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div>
              <Label>月額単価（円）</Label>
              <Input type="number" {...register('unit_price')} placeholder="例: 750000" />
            </div>
            <div>
              <Label>スキル（カンマ区切り）</Label>
              <Input {...register('skills_str')} placeholder="例: React, Node.js, TypeScript" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">その他</CardTitle></CardHeader>
          <CardContent>
            <div>
              <Label>メモ</Label>
              <Textarea {...register('notes')} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>{isLoading ? '保存中...' : mode === 'new' ? '登録' : '更新'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>キャンセル</Button>
        </div>
      </form>
    </div>
  )
}
