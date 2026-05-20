import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Pencil, Activity } from 'lucide-react'
import { useSkillSheet } from '../api/skillApi'
import { SkillBadge, proficiencyLabel } from '../components/SkillBadge'
import { AvailabilityBadge } from '../components/AvailabilityBadge'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useAuthStore } from '@/store/authStore'
import type { ProficiencyLevel } from '@/types/skill'

export default function SkillSheetPage() {
  const { id } = useParams<{ id: string }>()
  const { user, can } = useAuthStore()
  const { data: sheet, isLoading, isError } = useSkillSheet(id!)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !sheet) return <div className="py-16 text-center text-red-500">スキルシートが見つかりません</div>

  const isSelf = user?.employee_id === sheet.employee_id
  const canEdit = can('edit_all') || isSelf

  const groupedSkills = sheet.skills.reduce<Record<string, typeof sheet.skills>>((acc, s) => {
    const key = s.category_large
    if (!acc[key]) acc[key] = []
    acc[key].push(s)
    return acc
  }, {})

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{sheet.employee_name}</h1>
          <p className="text-slate-500 text-sm">{sheet.department_name} / {sheet.employee_id}</p>
          {sheet.availability && (
            <div className="mt-2">
              <AvailabilityBadge status={sheet.availability.status} />
              {sheet.availability.available_from_date && (
                <span className="ml-2 text-xs text-slate-500">
                  空き予定: {sheet.availability.available_from_date}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/skills/${id}/edit`}><Pencil size={14} className="mr-1" />編集</Link>
            </Button>
          )}
          {can('edit_all') && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/availability/${id}/edit`}><Activity size={14} className="mr-1" />稼働更新</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Skills */}
      <Card>
        <CardHeader><CardTitle className="text-base">技術スキル ({sheet.skills.length}件)</CardTitle></CardHeader>
        <CardContent>
          {sheet.skills.length === 0 ? (
            <p className="text-slate-400 text-sm">スキルが登録されていません</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedSkills).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-3">
                    {skills.map((s) => (
                      <SkillBadge
                        key={s.id}
                        skillName={s.skill_name}
                        proficiencyLevel={s.proficiency_level as ProficiencyLevel}
                        experienceYears={s.experience_years}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader><CardTitle className="text-base">資格・認定 ({sheet.certifications.length}件)</CardTitle></CardHeader>
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
                      {c.issuer && `${c.issuer} / `}
                      取得: {format(new Date(c.acquired_date), 'yyyy年MM月', { locale: ja })}
                      {c.score && ` / ${c.score}`}
                    </p>
                  </div>
                  {c.expiry_date ? (
                    <span className="text-xs text-slate-500">有効期限: {c.expiry_date}</span>
                  ) : (
                    <span className="text-xs text-slate-400">期限なし</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Career History */}
      <Card>
        <CardHeader><CardTitle className="text-base">プロジェクト経歴 ({sheet.career_histories.length}件)</CardTitle></CardHeader>
        <CardContent>
          {sheet.career_histories.length === 0 ? (
            <p className="text-slate-400 text-sm">経歴が登録されていません</p>
          ) : (
            <div className="space-y-6">
              {sheet.career_histories.map((c) => (
                <div key={c.id} className="border-l-2 border-slate-200 pl-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{c.project_name}</p>
                      <p className="text-xs text-slate-500">
                        {c.is_client_name_hidden ? '某社' : (c.client_name ?? '自社')}
                        {c.industry && ` / ${c.industry}`}
                        {' / '}役割: {c.role}
                        {c.team_size && ` / ${c.team_size}名`}
                      </p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0 ml-2">
                      {c.start_date} 〜 {c.end_date ?? '現在'}
                    </span>
                  </div>
                  <p className="text-sm mt-2 text-slate-700">{c.description}</p>
                  {c.achievements && (
                    <p className="text-sm mt-1 text-slate-600"><span className="font-medium">成果:</span> {c.achievements}</p>
                  )}
                  {c.skill_names.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.skill_names.map((s) => (
                        <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability details */}
      {sheet.availability && (
        <Card>
          <CardHeader><CardTitle className="text-base">稼働情報</CardTitle></CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              {sheet.availability.working_style && (
                <div>
                  <dt className="text-xs text-slate-500">希望勤務形態</dt>
                  <dd className="text-sm">{sheet.availability.working_style}</dd>
                </div>
              )}
              {sheet.availability.preferred_location && (
                <div>
                  <dt className="text-xs text-slate-500">希望勤務地</dt>
                  <dd className="text-sm">{sheet.availability.preferred_location}</dd>
                </div>
              )}
              {sheet.availability.note && (
                <div className="col-span-2">
                  <dt className="text-xs text-slate-500">備考</dt>
                  <dd className="text-sm">{sheet.availability.note}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
