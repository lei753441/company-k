import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { SkillBadge, proficiencyLabel } from '../components/SkillBadge'
import {
  useSkillSheet,
  useSkillMasters,
  useAddSkill,
  useUpdateSkill,
  useDeleteSkill,
  useAddCertification,
  useUpdateCertification,
  useDeleteCertification,
  useAddCareerHistory,
  useUpdateCareerHistory,
  useDeleteCareerHistory,
} from '../api/skillApi'
import type { EmployeeSkill, Certification, CareerHistory, ProficiencyLevel } from '@/types/skill'
import { Plus, Trash2, Pencil } from 'lucide-react'

// ---- Skill form ----
const skillSchema = z.object({
  skill_master_id: z.string().min(1, 'スキルを選択してください'),
  proficiency_level: z.coerce.number().min(1).max(5),
  experience_years: z.coerce.number().min(0).nullable(),
  last_used_year: z.coerce.number().min(2000).max(2100).nullable(),
  note: z.string().optional(),
})
type SkillFormValues = z.infer<typeof skillSchema>

function SkillFormSheet({
  open,
  employeeId,
  editing,
  onClose,
}: {
  open: boolean
  employeeId: string
  editing: EmployeeSkill | null
  onClose: () => void
}) {
  const { data: mastersData } = useSkillMasters()
  const masters = mastersData?.items ?? []
  const addSkill = useAddSkill(employeeId)
  const updateSkill = useUpdateSkill(employeeId, editing?.id ?? '')

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      skill_master_id: editing?.skill_master_id ?? '',
      proficiency_level: editing?.proficiency_level ?? 3,
      experience_years: editing?.experience_years ?? null,
      last_used_year: editing?.last_used_year ?? null,
      note: editing?.note ?? '',
    },
  })

  const onSubmit = async (data: SkillFormValues) => {
    if (editing) {
      await updateSkill.mutateAsync(data)
    } else {
      await addSkill.mutateAsync(data)
    }
    reset()
    onClose()
  }

  const isLoading = addSkill.isPending || updateSkill.isPending

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editing ? 'スキル編集' : 'スキル追加'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label>スキル *</Label>
            <Select
              value={watch('skill_master_id') || '_none_'}
              onValueChange={(v) => setValue('skill_master_id', v === '_none_' ? '' : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="スキルを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none_">選択してください</SelectItem>
                {masters.map((m) => (
                  <SelectItem key={m.id} value={m.id}>{m.name} ({m.category_medium})</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.skill_master_id && <p className="text-red-500 text-xs mt-1">{errors.skill_master_id.message}</p>}
          </div>
          <div>
            <Label>習熟度 *</Label>
            <Select
              value={String(watch('proficiency_level'))}
              onValueChange={(v) => setValue('proficiency_level', Number(v) as ProficiencyLevel)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {([1, 2, 3, 4, 5] as ProficiencyLevel[]).map((l) => (
                  <SelectItem key={l} value={String(l)}>{l}: {proficiencyLabel[l]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>経験年数</Label>
            <Input type="number" step="0.5" min="0" {...register('experience_years')} placeholder="例: 3" />
          </div>
          <div>
            <Label>最終使用年</Label>
            <Input type="number" min="2000" max="2100" {...register('last_used_year')} placeholder="例: 2025" />
          </div>
          <div>
            <Label>備考</Label>
            <Input {...register('note')} placeholder="補足事項" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading}>{isLoading ? '保存中...' : '保存'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ---- Certification form ----
const certSchema = z.object({
  name: z.string().min(1, '資格名を入力してください'),
  issuer: z.string().optional(),
  acquired_date: z.string().min(1, '取得日を入力してください'),
  expiry_date: z.string().optional(),
  score: z.string().optional(),
})
type CertFormValues = z.infer<typeof certSchema>

function CertFormSheet({
  open,
  employeeId,
  editing,
  onClose,
}: {
  open: boolean
  employeeId: string
  editing: Certification | null
  onClose: () => void
}) {
  const addCert = useAddCertification(employeeId)
  const updateCert = useUpdateCertification(employeeId, editing?.id ?? '')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CertFormValues>({
    resolver: zodResolver(certSchema),
    defaultValues: {
      name: editing?.name ?? '',
      issuer: editing?.issuer ?? '',
      acquired_date: editing?.acquired_date ?? '',
      expiry_date: editing?.expiry_date ?? '',
      score: editing?.score ?? '',
    },
  })

  const onSubmit = async (data: CertFormValues) => {
    const payload = { ...data, issuer: data.issuer || null, expiry_date: data.expiry_date || null, score: data.score || null }
    if (editing) await updateCert.mutateAsync(payload)
    else await addCert.mutateAsync(payload)
    reset()
    onClose()
  }

  const isLoading = addCert.isPending || updateCert.isPending

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{editing ? '資格編集' : '資格追加'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label>資格名 *</Label>
            <Input {...register('name')} placeholder="例: AWS Certified Solutions Architect" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label>発行機関</Label>
            <Input {...register('issuer')} placeholder="例: IPA, Amazon Web Services" />
          </div>
          <div>
            <Label>取得日 *</Label>
            <Input type="date" {...register('acquired_date')} />
            {errors.acquired_date && <p className="text-red-500 text-xs mt-1">{errors.acquired_date.message}</p>}
          </div>
          <div>
            <Label>有効期限</Label>
            <Input type="date" {...register('expiry_date')} />
          </div>
          <div>
            <Label>スコア・等級</Label>
            <Input {...register('score')} placeholder="例: 900点, 1級" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading}>{isLoading ? '保存中...' : '保存'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ---- Career history form ----
const careerSchema = z.object({
  project_name: z.string().min(1, 'プロジェクト名を入力してください'),
  client_name: z.string().optional(),
  industry: z.string().optional(),
  start_date: z.string().min(1, '開始日を入力してください'),
  end_date: z.string().optional(),
  role: z.string().min(1, '役割を入力してください'),
  team_size: z.coerce.number().min(1).nullable(),
  description: z.string().min(1, '業務内容を入力してください'),
  achievements: z.string().optional(),
  is_client_name_hidden: z.boolean(),
})
type CareerFormValues = z.infer<typeof careerSchema>

function CareerFormSheet({
  open,
  employeeId,
  editing,
  onClose,
}: {
  open: boolean
  employeeId: string
  editing: CareerHistory | null
  onClose: () => void
}) {
  const addCareer = useAddCareerHistory(employeeId)
  const updateCareer = useUpdateCareerHistory(employeeId, editing?.id ?? '')

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CareerFormValues>({
    resolver: zodResolver(careerSchema),
    defaultValues: {
      project_name: editing?.project_name ?? '',
      client_name: editing?.client_name ?? '',
      industry: editing?.industry ?? '',
      start_date: editing?.start_date ?? '',
      end_date: editing?.end_date ?? '',
      role: editing?.role ?? '',
      team_size: editing?.team_size ?? null,
      description: editing?.description ?? '',
      achievements: editing?.achievements ?? '',
      is_client_name_hidden: editing?.is_client_name_hidden ?? false,
    },
  })

  const onSubmit = async (data: CareerFormValues) => {
    const payload = {
      ...data,
      client_name: data.client_name || null,
      industry: data.industry || null,
      end_date: data.end_date || null,
      team_size: data.team_size,
      achievements: data.achievements || null,
      skill_names: editing?.skill_names ?? [],
    }
    if (editing) await updateCareer.mutateAsync(payload)
    else await addCareer.mutateAsync(payload)
    reset()
    onClose()
  }

  const isLoading = addCareer.isPending || updateCareer.isPending

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? '経歴編集' : '経歴追加'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label>プロジェクト名 *</Label>
            <Input {...register('project_name')} />
            {errors.project_name && <p className="text-red-500 text-xs mt-1">{errors.project_name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>客先名</Label>
              <Input {...register('client_name')} placeholder="省略可" />
            </div>
            <div>
              <Label>業種</Label>
              <Input {...register('industry')} placeholder="例: 製造, EC" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hidden"
              {...register('is_client_name_hidden')}
              className="w-4 h-4"
            />
            <Label htmlFor="hidden">客先名を非公開にする</Label>
          </div>
          <div className="grid grid-cols-2 gap-3">
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>役割 *</Label>
              <Input {...register('role')} placeholder="例: SE, テックリード" />
              {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
            </div>
            <div>
              <Label>チーム規模（人）</Label>
              <Input type="number" min="1" {...register('team_size')} />
            </div>
          </div>
          <div>
            <Label>業務内容 *</Label>
            <Textarea {...register('description')} rows={3} />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>
          <div>
            <Label>成果・実績</Label>
            <Textarea {...register('achievements')} rows={2} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isLoading}>{isLoading ? '保存中...' : '保存'}</Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

// ---- Main page ----
export default function SkillEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: sheet, isLoading } = useSkillSheet(id!)
  const deleteSkill = useDeleteSkill(id!)
  const deleteCert = useDeleteCertification(id!)
  const deleteCareer = useDeleteCareerHistory(id!)

  const [skillSheet, setSkillSheet] = useState<{ open: boolean; editing: EmployeeSkill | null }>({ open: false, editing: null })
  const [certSheet, setCertSheet] = useState<{ open: boolean; editing: Certification | null }>({ open: false, editing: null })
  const [careerSheet, setCareerSheet] = useState<{ open: boolean; editing: CareerHistory | null }>({ open: false, editing: null })

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (!sheet) return <div className="py-16 text-center text-red-500">スキルシートが見つかりません</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">スキル編集</h1>
          <p className="text-slate-500 text-sm">{sheet.employee_name} / {sheet.department_name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/skills/${id}`)}>
          ← 詳細に戻る
        </Button>
      </div>

      {/* Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">技術スキル</CardTitle>
          <Button size="sm" onClick={() => setSkillSheet({ open: true, editing: null })}>
            <Plus size={14} className="mr-1" />追加
          </Button>
        </CardHeader>
        <CardContent>
          {sheet.skills.length === 0 ? (
            <p className="text-slate-400 text-sm">スキルが登録されていません</p>
          ) : (
            <div className="space-y-2">
              {sheet.skills.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <SkillBadge skillName={s.skill_name} proficiencyLevel={s.proficiency_level as ProficiencyLevel} experienceYears={s.experience_years} />
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setSkillSheet({ open: true, editing: s })}>
                      <Pencil size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => { if (confirm('削除しますか？')) deleteSkill.mutate(s.id) }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">資格・認定</CardTitle>
          <Button size="sm" onClick={() => setCertSheet({ open: true, editing: null })}>
            <Plus size={14} className="mr-1" />追加
          </Button>
        </CardHeader>
        <CardContent>
          {sheet.certifications.length === 0 ? (
            <p className="text-slate-400 text-sm">資格が登録されていません</p>
          ) : (
            <div className="space-y-2">
              {sheet.certifications.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-slate-500">
                      {c.issuer && `${c.issuer} / `}取得: {c.acquired_date}
                      {c.expiry_date && ` / 期限: ${c.expiry_date}`}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setCertSheet({ open: true, editing: c })}>
                      <Pencil size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => { if (confirm('削除しますか？')) deleteCert.mutate(c.id) }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Career histories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">プロジェクト経歴</CardTitle>
          <Button size="sm" onClick={() => setCareerSheet({ open: true, editing: null })}>
            <Plus size={14} className="mr-1" />追加
          </Button>
        </CardHeader>
        <CardContent>
          {sheet.career_histories.length === 0 ? (
            <p className="text-slate-400 text-sm">経歴が登録されていません</p>
          ) : (
            <div className="space-y-3">
              {sheet.career_histories.map((c) => (
                <div key={c.id} className="flex items-start justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">{c.project_name}</p>
                    <p className="text-xs text-slate-500">{c.start_date} 〜 {c.end_date ?? '現在'} / {c.role}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => setCareerSheet({ open: true, editing: c })}>
                      <Pencil size={12} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => { if (confirm('削除しますか？')) deleteCareer.mutate(c.id) }}
                    >
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <SkillFormSheet
        open={skillSheet.open}
        employeeId={id!}
        editing={skillSheet.editing}
        onClose={() => setSkillSheet({ open: false, editing: null })}
      />
      <CertFormSheet
        open={certSheet.open}
        employeeId={id!}
        editing={certSheet.editing}
        onClose={() => setCertSheet({ open: false, editing: null })}
      />
      <CareerFormSheet
        open={careerSheet.open}
        employeeId={id!}
        editing={careerSheet.editing}
        onClose={() => setCareerSheet({ open: false, editing: null })}
      />
    </div>
  )
}
