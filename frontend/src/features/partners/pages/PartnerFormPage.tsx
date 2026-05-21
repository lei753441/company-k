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
import { usePartner, useCreatePartner, useUpdatePartner } from '../api/partnerApi'
import type { PartnerStatus } from '@/types/partner'

const schema = z.object({
  name: z.string().min(1, '企業名を入力してください'),
  name_kana: z.string().optional(),
  corporate_number: z.string().optional(),
  invoice_number: z.string().optional(),
  prefecture: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website_url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  status: z.enum(['active', 'dormant', 'suspended']),
  tags_str: z.string().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const prefectures = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']

const NONE = '_none_'

interface Props {
  mode: 'new' | 'edit'
}

export default function PartnerFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: existing } = usePartner(mode === 'edit' ? id! : '')
  const createPartner = useCreatePartner()
  const updatePartner = useUpdatePartner(id ?? '')

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      status: 'active',
    },
  })

  useEffect(() => {
    if (existing && mode === 'edit') {
      reset({
        name: existing.name,
        name_kana: existing.name_kana ?? '',
        corporate_number: existing.corporate_number ?? '',
        invoice_number: existing.invoice_number ?? '',
        prefecture: existing.prefecture ?? '',
        address: existing.address ?? '',
        phone: existing.phone ?? '',
        website_url: existing.website_url ?? '',
        status: existing.status,
        tags_str: existing.tags.join(', '),
        notes: existing.notes ?? '',
      })
    }
  }, [existing, mode])

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      name_kana: data.name_kana || null,
      corporate_number: data.corporate_number || null,
      invoice_number: data.invoice_number || null,
      prefecture: data.prefecture || null,
      address: data.address || null,
      phone: data.phone || null,
      website_url: data.website_url || null,
      tags: data.tags_str ? data.tags_str.split(',').map((t) => t.trim()).filter(Boolean) : [],
      notes: data.notes || null,
    }
    if (mode === 'new') {
      const created = await createPartner.mutateAsync(payload)
      navigate(`/partners/${created.id}`)
    } else {
      await updatePartner.mutateAsync(payload)
      navigate(`/partners/${id}`)
    }
  }

  const isLoading = createPartner.isPending || updatePartner.isPending

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{mode === 'new' ? '協力会社新規登録' : '協力会社編集'}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← 戻る</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>企業名 *</Label>
              <Input {...register('name')} placeholder="例: 株式会社グローバルIT開発" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>企業名（カナ）</Label>
              <Input {...register('name_kana')} placeholder="例: カブシキガイシャグローバルアイティーカイハツ" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>ステータス *</Label>
                <Select value={watch('status')} onValueChange={(v) => setValue('status', v as PartnerStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">取引中</SelectItem>
                    <SelectItem value="dormant">休眠</SelectItem>
                    <SelectItem value="suspended">取引停止</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>法人番号</Label>
                <Input {...register('corporate_number')} placeholder="13桁" maxLength={13} />
              </div>
            </div>
            <div>
              <Label>インボイス番号</Label>
              <Input {...register('invoice_number')} placeholder="例: T1234567890123" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">連絡先・所在地</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <div>
                <Label>電話番号</Label>
                <Input {...register('phone')} placeholder="例: 03-1234-5678" />
              </div>
            </div>
            <div>
              <Label>住所（都道府県以降）</Label>
              <Input {...register('address')} placeholder="例: 千代田区神田1-1-1 ビル5F" />
            </div>
            <div>
              <Label>Webサイト</Label>
              <Input {...register('website_url')} placeholder="例: https://example.com" />
              {errors.website_url && <p className="text-red-500 text-xs mt-1">{errors.website_url.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">その他</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>タグ（カンマ区切り）</Label>
              <Input {...register('tags_str')} placeholder="例: Java, AWS, 大規模" />
            </div>
            <div>
              <Label>社内メモ</Label>
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
