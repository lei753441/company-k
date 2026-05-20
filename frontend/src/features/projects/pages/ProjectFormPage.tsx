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
import { useProject, useCreateProject, useUpdateProject } from '../api/projectApi'
import type { ProjectType, WorkStyle, RateUnit } from '@/types/project'

const sesSchema = z.object({
  work_location: z.string().optional(),
  work_style: z.enum(['onsite', 'remote', 'hybrid']).optional(),
  required_headcount: z.coerce.number().min(1).nullable(),
  contract_unit: z.enum(['monthly', 'hourly']),
  min_hours: z.coerce.number().nullable(),
  max_hours: z.coerce.number().nullable(),
})

const consignmentSchema = z.object({
  contract_amount: z.coerce.number().nullable(),
  payment_terms: z.string().optional(),
  deliverables: z.string().optional(),
  acceptance_criteria: z.string().optional(),
})

const schema = z.object({
  project_type: z.enum(['ses', 'consignment']),
  name: z.string().min(1, '案件名を入力してください'),
  description: z.string().optional(),
  company_name: z.string().min(1, '顧客企業名を入力してください'),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  skill_tags_str: z.string().optional(),
  notes: z.string().optional(),
  ses_work_location: z.string().optional(),
  ses_work_style: z.enum(['onsite', 'remote', 'hybrid', '_none_']).optional(),
  ses_required_headcount: z.coerce.number().nullable(),
  ses_contract_unit: z.enum(['monthly', 'hourly']),
  ses_min_hours: z.coerce.number().nullable(),
  ses_max_hours: z.coerce.number().nullable(),
  con_contract_amount: z.coerce.number().nullable(),
  con_payment_terms: z.string().optional(),
  con_deliverables: z.string().optional(),
  con_acceptance_criteria: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface Props {
  mode: 'new' | 'edit'
}

export default function ProjectFormPage({ mode }: Props) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: existing } = useProject(mode === 'edit' ? id! : '')
  const createProject = useCreateProject()
  const updateProject = useUpdateProject(id ?? '')

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      project_type: 'ses',
      name: '',
      description: '',
      company_name: '',
      start_date: '',
      end_date: '',
      skill_tags_str: '',
      notes: '',
      ses_work_style: '_none_',
      ses_contract_unit: 'monthly',
      ses_required_headcount: null,
      ses_min_hours: null,
      ses_max_hours: null,
      con_contract_amount: null,
    },
  })

  const projectType = watch('project_type')

  useEffect(() => {
    if (existing && mode === 'edit') {
      reset({
        project_type: existing.project_type,
        name: existing.name,
        description: existing.description ?? '',
        company_name: existing.company_name,
        start_date: existing.start_date ?? '',
        end_date: existing.end_date ?? '',
        skill_tags_str: existing.skill_tags.join(', '),
        notes: existing.notes ?? '',
        ses_work_location: existing.ses_detail?.work_location ?? '',
        ses_work_style: existing.ses_detail?.work_style ?? '_none_',
        ses_contract_unit: existing.ses_detail?.contract_unit ?? 'monthly',
        ses_required_headcount: existing.ses_detail?.required_headcount ?? null,
        ses_min_hours: existing.ses_detail?.min_hours ?? null,
        ses_max_hours: existing.ses_detail?.max_hours ?? null,
        con_contract_amount: existing.consignment_detail?.contract_amount ?? null,
        con_payment_terms: existing.consignment_detail?.payment_terms ?? '',
        con_deliverables: existing.consignment_detail?.deliverables ?? '',
        con_acceptance_criteria: existing.consignment_detail?.acceptance_criteria ?? '',
      })
    }
  }, [existing, mode])

  const onSubmit = async (data: FormValues) => {
    const skillTags = data.skill_tags_str
      ? data.skill_tags_str.split(',').map((s) => s.trim()).filter(Boolean)
      : []

    const payload = {
      project_type: data.project_type,
      name: data.name,
      description: data.description || null,
      company_name: data.company_name,
      company_id: 'CMP-001',
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      skill_tags: skillTags,
      notes: data.notes || null,
      ses_detail: data.project_type === 'ses' ? {
        work_location: data.ses_work_location || null,
        work_style: (data.ses_work_style === '_none_' ? null : data.ses_work_style) as WorkStyle | null,
        required_headcount: data.ses_required_headcount,
        contract_unit: data.ses_contract_unit,
        min_hours: data.ses_min_hours,
        max_hours: data.ses_max_hours,
      } : null,
      consignment_detail: data.project_type === 'consignment' ? {
        contract_amount: data.con_contract_amount,
        payment_terms: data.con_payment_terms || null,
        deliverables: data.con_deliverables || null,
        acceptance_criteria: data.con_acceptance_criteria || null,
      } : null,
    }

    if (mode === 'new') {
      const created = await createProject.mutateAsync(payload)
      navigate(`/projects/${created.id}`)
    } else {
      await updateProject.mutateAsync(payload)
      navigate(`/projects/${id}`)
    }
  }

  const isLoading = createProject.isPending || updateProject.isPending
  const title = mode === 'new' ? '案件新規登録' : '案件編集'

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← 戻る</Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>案件種別 *</Label>
              <Select
                value={watch('project_type')}
                onValueChange={(v) => setValue('project_type', v as ProjectType)}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ses">SES（客先常駐）</SelectItem>
                  <SelectItem value="consignment">受託開発</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>案件名 *</Label>
              <Input {...register('name')} placeholder="例: ECサイトリニューアル支援" />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <Label>顧客企業名 *</Label>
              <Input {...register('company_name')} placeholder="例: 株式会社テックコーポレーション" />
              {errors.company_name && <p className="text-red-500 text-xs mt-1">{errors.company_name.message}</p>}
            </div>
            <div>
              <Label>案件概要</Label>
              <Textarea {...register('description')} rows={3} placeholder="案件の概要を入力してください" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>開始予定日</Label>
                <Input type="date" {...register('start_date')} />
              </div>
              <div>
                <Label>終了予定日</Label>
                <Input type="date" {...register('end_date')} />
              </div>
            </div>
            <div>
              <Label>必要スキル（カンマ区切り）</Label>
              <Input {...register('skill_tags_str')} placeholder="例: TypeScript, React, AWS" />
            </div>
            <div>
              <Label>社内メモ</Label>
              <Textarea {...register('notes')} rows={2} />
            </div>
          </CardContent>
        </Card>

        {projectType === 'ses' && (
          <Card>
            <CardHeader><CardTitle className="text-base">SES詳細</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>就業場所</Label>
                <Input {...register('ses_work_location')} placeholder="例: 東京都渋谷区（一部リモート）" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>勤務形態</Label>
                  <Select
                    value={watch('ses_work_style') ?? '_none_'}
                    onValueChange={(v) => setValue('ses_work_style', v as WorkStyle | '_none_')}
                  >
                    <SelectTrigger><SelectValue placeholder="選択" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">未設定</SelectItem>
                      <SelectItem value="onsite">フル常駐</SelectItem>
                      <SelectItem value="remote">フルリモート</SelectItem>
                      <SelectItem value="hybrid">ハイブリッド</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>必要人数</Label>
                  <Input type="number" min="1" {...register('ses_required_headcount')} placeholder="例: 2" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>精算単位</Label>
                  <Select
                    value={watch('ses_contract_unit')}
                    onValueChange={(v) => setValue('ses_contract_unit', v as RateUnit)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">月単位</SelectItem>
                      <SelectItem value="hourly">時間単位</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>精算下限（時間）</Label>
                  <Input type="number" {...register('ses_min_hours')} placeholder="例: 140" />
                </div>
                <div>
                  <Label>精算上限（時間）</Label>
                  <Input type="number" {...register('ses_max_hours')} placeholder="例: 180" />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {projectType === 'consignment' && (
          <Card>
            <CardHeader><CardTitle className="text-base">受託開発詳細</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>契約金額（円）</Label>
                <Input type="number" step="100000" {...register('con_contract_amount')} placeholder="例: 12000000" />
              </div>
              <div>
                <Label>支払条件</Label>
                <Input {...register('con_payment_terms')} placeholder="例: マイルストーン払い（3回）" />
              </div>
              <div>
                <Label>成果物</Label>
                <Textarea {...register('con_deliverables')} rows={2} placeholder="例: システム一式（設計書・ソースコード含む）" />
              </div>
              <div>
                <Label>検収条件</Label>
                <Textarea {...register('con_acceptance_criteria')} rows={2} />
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>{isLoading ? '保存中...' : mode === 'new' ? '登録' : '更新'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>キャンセル</Button>
        </div>
      </form>
    </div>
  )
}
