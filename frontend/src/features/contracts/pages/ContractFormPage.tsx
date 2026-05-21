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
import { useContract, useCreateContract, useUpdateContract } from '../api/contractApi'
import type { ContractType, ContractPartyType, ContractStatus, UnitType } from '@/types/contract'

const schema = z.object({
  contract_type: z.enum(['ses_commission', 'lump_sum', 'outsource_company', 'outsource_freelancer']),
  party_type: z.enum(['customer', 'partner', 'freelancer']),
  party_name: z.string().min(1, '当事者名を入力してください'),
  party_id: z.string().optional(),
  project_name: z.string().optional(),
  project_id: z.string().optional(),
  title: z.string().min(1, '契約件名を入力してください'),
  status: z.enum(['draft', 'signing', 'active', 'renewal_due', 'expired', 'cancelled', 'void']).optional(),
  start_date: z.string().min(1, '開始日を入力してください'),
  end_date: z.string().optional(),
  is_auto_renewal: z.boolean(),
  renewal_notice_months: z.coerce.number().min(1).max(12),
  unit_price: z.coerce.number().optional().or(z.literal('')),
  unit_type: z.enum(['hourly', 'monthly', 'fixed']).optional().or(z.literal('')),
  overtime_rate: z.coerce.number().optional().or(z.literal('')),
  holiday_rate: z.coerce.number().optional().or(z.literal('')),
  standard_work_hours: z.coerce.number().optional().or(z.literal('')),
  upper_limit_hours: z.coerce.number().optional().or(z.literal('')),
  lower_limit_hours: z.coerce.number().optional().or(z.literal('')),
  fixed_amount: z.coerce.number().optional().or(z.literal('')),
  payment_terms: z.string().optional(),
  note: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

interface Props {
  mode: 'new' | 'edit'
}

const NONE = '_none_'

export default function ContractFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: existing } = useContract(mode === 'edit' ? id! : '')
  const createContract = useCreateContract()
  const updateContract = useUpdateContract(id ?? '')

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contract_type: 'ses_commission',
      party_type: 'customer',
      party_name: '',
      title: '',
      start_date: '',
      is_auto_renewal: false,
      renewal_notice_months: 2,
    },
  })

  useEffect(() => {
    if (existing && mode === 'edit') {
      reset({
        contract_type: existing.contract_type,
        party_type: existing.party_type,
        party_name: existing.party_name,
        party_id: existing.party_id,
        project_name: existing.project_name ?? '',
        project_id: existing.project_id ?? '',
        title: existing.title,
        status: existing.status,
        start_date: existing.start_date,
        end_date: existing.end_date ?? '',
        is_auto_renewal: existing.is_auto_renewal,
        renewal_notice_months: existing.renewal_notice_months,
        unit_price: existing.unit_price ?? '',
        unit_type: existing.unit_type ?? '',
        overtime_rate: existing.overtime_rate ?? '',
        holiday_rate: existing.holiday_rate ?? '',
        standard_work_hours: existing.standard_work_hours ?? '',
        upper_limit_hours: existing.upper_limit_hours ?? '',
        lower_limit_hours: existing.lower_limit_hours ?? '',
        fixed_amount: existing.fixed_amount ?? '',
        payment_terms: existing.payment_terms,
        note: existing.note ?? '',
      })
    }
  }, [existing, mode, reset])

  const contractType = watch('contract_type')
  const isSes = contractType === 'ses_commission'
  const isLumpSum = contractType === 'lump_sum'

  const onSubmit = async (data: FormValues) => {
    const payload = {
      contract_type: data.contract_type,
      party_type: data.party_type,
      party_name: data.party_name,
      party_id: data.party_id || '',
      project_name: data.project_name || null,
      project_id: data.project_id || null,
      title: data.title,
      ...(mode === 'edit' && data.status ? { status: data.status } : {}),
      start_date: data.start_date,
      end_date: data.end_date || null,
      is_auto_renewal: data.is_auto_renewal,
      renewal_notice_months: data.renewal_notice_months,
      unit_price: data.unit_price !== '' && data.unit_price != null ? Number(data.unit_price) : null,
      unit_type: data.unit_type !== '' && data.unit_type ? data.unit_type as UnitType : null,
      overtime_rate: isSes && data.overtime_rate !== '' && data.overtime_rate != null ? Number(data.overtime_rate) : null,
      holiday_rate: isSes && data.holiday_rate !== '' && data.holiday_rate != null ? Number(data.holiday_rate) : null,
      standard_work_hours: isSes && data.standard_work_hours !== '' && data.standard_work_hours != null ? Number(data.standard_work_hours) : null,
      upper_limit_hours: isSes && data.upper_limit_hours !== '' && data.upper_limit_hours != null ? Number(data.upper_limit_hours) : null,
      lower_limit_hours: isSes && data.lower_limit_hours !== '' && data.lower_limit_hours != null ? Number(data.lower_limit_hours) : null,
      fixed_amount: isLumpSum && data.fixed_amount !== '' && data.fixed_amount != null ? Number(data.fixed_amount) : null,
      payment_terms: data.payment_terms || '',
      note: data.note || null,
    }
    if (mode === 'new') {
      const created = await createContract.mutateAsync(payload)
      navigate(`/contracts/${created.id}`)
    } else {
      await updateContract.mutateAsync(payload)
      navigate(`/contracts/${id}`)
    }
  }

  const isLoading = createContract.isPending || updateContract.isPending

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{mode === 'new' ? '契約新規作成' : '契約編集'}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← 戻る</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>契約種別 *</Label>
                <Select
                  value={watch('contract_type')}
                  onValueChange={(v) => setValue('contract_type', v as ContractType)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ses_commission">準委任</SelectItem>
                    <SelectItem value="lump_sum">請負</SelectItem>
                    <SelectItem value="outsource_company">業務委託(法人)</SelectItem>
                    <SelectItem value="outsource_freelancer">業務委託(個人)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>当事者種別 *</Label>
                <Select
                  value={watch('party_type')}
                  onValueChange={(v) => setValue('party_type', v as ContractPartyType)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">顧客</SelectItem>
                    <SelectItem value="partner">協力会社</SelectItem>
                    <SelectItem value="freelancer">フリーランス</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>当事者名 *</Label>
              <Input {...register('party_name')} placeholder="例: 株式会社テックコーポレーション" />
              {errors.party_name && <p className="text-red-500 text-xs mt-1">{errors.party_name.message}</p>}
            </div>
            <div>
              <Label>案件名（任意）</Label>
              <Input {...register('project_name')} placeholder="例: ECサイトリニューアル支援" />
            </div>
            <div>
              <Label>契約件名 *</Label>
              <Input {...register('title')} placeholder="例: SES準委任契約（ECサイトリニューアル）" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            {mode === 'edit' && (
              <div>
                <Label>ステータス</Label>
                <Select
                  value={watch('status') ?? 'draft'}
                  onValueChange={(v) => setValue('status', v as ContractStatus)}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">下書き</SelectItem>
                    <SelectItem value="signing">署名依頼中</SelectItem>
                    <SelectItem value="active">有効</SelectItem>
                    <SelectItem value="renewal_due">更新待ち</SelectItem>
                    <SelectItem value="expired">終了</SelectItem>
                    <SelectItem value="cancelled">解約</SelectItem>
                    <SelectItem value="void">無効</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">契約期間・更新</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>開始日 *</Label>
                <Input type="date" {...register('start_date')} />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <Label>終了日</Label>
                <Input type="date" {...register('end_date')} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_auto_renewal"
                {...register('is_auto_renewal')}
                className="h-4 w-4"
              />
              <Label htmlFor="is_auto_renewal">自動更新あり</Label>
            </div>
            <div>
              <Label>更新通知月数</Label>
              <Input
                type="number"
                min={1}
                max={12}
                {...register('renewal_notice_months')}
                className="w-24"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">契約条件</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {!isLumpSum && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>単価（円）</Label>
                  <Input type="number" step="1000" {...register('unit_price')} placeholder="例: 800000" />
                </div>
                <div>
                  <Label>単価種別</Label>
                  <Select
                    value={watch('unit_type') || NONE}
                    onValueChange={(v) => setValue('unit_type', v === NONE ? '' : (v as UnitType))}
                  >
                    <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>選択してください</SelectItem>
                      <SelectItem value="hourly">時間単価</SelectItem>
                      <SelectItem value="monthly">月額</SelectItem>
                      <SelectItem value="fixed">固定額</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {isLumpSum && (
              <div>
                <Label>固定額（円）</Label>
                <Input type="number" step="10000" {...register('fixed_amount')} placeholder="例: 5000000" />
              </div>
            )}
            {isSes && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>時間外割増率（%）</Label>
                    <Input type="number" {...register('overtime_rate')} placeholder="例: 125" />
                  </div>
                  <div>
                    <Label>休日割増率（%）</Label>
                    <Input type="number" {...register('holiday_rate')} placeholder="例: 135" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>所定労働時間（h）</Label>
                    <Input type="number" {...register('standard_work_hours')} placeholder="例: 160" />
                  </div>
                  <div>
                    <Label>精算上限（h）</Label>
                    <Input type="number" {...register('upper_limit_hours')} placeholder="例: 180" />
                  </div>
                  <div>
                    <Label>精算下限（h）</Label>
                    <Input type="number" {...register('lower_limit_hours')} placeholder="例: 140" />
                  </div>
                </div>
              </>
            )}
            <div>
              <Label>支払条件</Label>
              <Input {...register('payment_terms')} placeholder="例: 月末締め翌月末払い" />
            </div>
            <div>
              <Label>メモ</Label>
              <Textarea {...register('note')} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? '保存中...' : mode === 'new' ? '作成' : '更新'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>キャンセル</Button>
        </div>
      </form>
    </div>
  )
}
