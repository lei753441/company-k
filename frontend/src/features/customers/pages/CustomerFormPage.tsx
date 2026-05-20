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
import { useCompany, useCreateCompany, useUpdateCompany } from '../api/customerApi'
import type { CompanyType, CompanyStatus } from '@/types/customer'

const schema = z.object({
  company_type: z.enum(['customer', 'partner', 'both']),
  name: z.string().min(1, '企業名を入力してください'),
  name_kana: z.string().optional(),
  corporate_number: z.string().optional(),
  industry: z.string().optional(),
  prefecture: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  website_url: z.string().url('正しいURLを入力してください').optional().or(z.literal('')),
  status: z.enum(['prospect', 'active', 'dormant', 'suspended']),
  tags_str: z.string().optional(),
  notes: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

const prefectures = ['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県','新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県']

interface Props {
  mode: 'new' | 'edit'
}

export default function CustomerFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: existing } = useCompany(mode === 'edit' ? id! : '')
  const createCompany = useCreateCompany()
  const updateCompany = useUpdateCompany(id ?? '')

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company_type: 'customer',
      status: 'prospect',
      name: '',
    },
  })

  useEffect(() => {
    if (existing && mode === 'edit') {
      reset({
        company_type: existing.company_type,
        name: existing.name,
        name_kana: existing.name_kana ?? '',
        corporate_number: existing.corporate_number ?? '',
        industry: existing.industry ?? '',
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
      industry: data.industry || null,
      prefecture: data.prefecture || null,
      address: data.address || null,
      phone: data.phone || null,
      website_url: data.website_url || null,
      tags: data.tags_str ? data.tags_str.split(',').map((t) => t.trim()).filter(Boolean) : [],
      notes: data.notes || null,
    }
    if (mode === 'new') {
      const created = await createCompany.mutateAsync(payload)
      navigate(`/customers/${created.id}`)
    } else {
      await updateCompany.mutateAsync(payload)
      navigate(`/customers/${id}`)
    }
  }

  const isLoading = createCompany.isPending || updateCompany.isPending
  const ALL = '_none_'

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{mode === 'new' ? '企業新規登録' : '企業編集'}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← 戻る</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>種別 *</Label>
                <Select value={watch('company_type')} onValueChange={(v) => setValue('company_type', v as CompanyType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">顧客</SelectItem>
                    <SelectItem value="partner">取引先</SelectItem>
                    <SelectItem value="both">顧客/取引先</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>取引ステータス *</Label>
                <Select value={watch('status')} onValueChange={(v) => setValue('status', v as CompanyStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prospect">見込み</SelectItem>
                    <SelectItem value="active">取引中</SelectItem>
                    <SelectItem value="dormant">休眠</SelectItem>
                    <SelectItem value="suspended">取引停止</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>企業名 *</Label>
              <Input {...register('name')} placeholder="例: 株式会社テックコーポレーション" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>企業名（カナ）</Label>
              <Input {...register('name_kana')} placeholder="例: カブシキガイシャテックコーポレーション" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>法人番号</Label>
                <Input {...register('corporate_number')} placeholder="13桁" maxLength={13} />
              </div>
              <div>
                <Label>業種</Label>
                <Input {...register('industry')} placeholder="例: IT・通信、金融・保険" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">連絡先・所在地</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>都道府県</Label>
                <Select value={watch('prefecture') || ALL} onValueChange={(v) => setValue('prefecture', v === ALL ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>選択してください</SelectItem>
                    {prefectures.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>代表電話</Label>
                <Input {...register('phone')} placeholder="例: 03-1234-5678" />
              </div>
            </div>
            <div>
              <Label>住所（都道府県以降）</Label>
              <Input {...register('address')} placeholder="例: 渋谷区渋谷1-1-1 テックビル8F" />
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
              <Input {...register('tags_str')} placeholder="例: SES, 大手, React" />
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
