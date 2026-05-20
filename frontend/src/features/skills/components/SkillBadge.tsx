import { Badge } from '@/components/ui/badge'
import type { ProficiencyLevel } from '@/types/skill'

const proficiencyLabel: Record<ProficiencyLevel, string> = {
  1: '入門',
  2: '初級',
  3: '中級',
  4: '上級',
  5: 'エキスパート',
}

const proficiencyColor: Record<ProficiencyLevel, string> = {
  1: 'bg-slate-100 text-slate-600',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-green-100 text-green-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-purple-100 text-purple-700',
}

interface Props {
  skillName: string
  proficiencyLevel: ProficiencyLevel
  experienceYears?: number | null
}

export function SkillBadge({ skillName, proficiencyLevel, experienceYears }: Props) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-sm font-medium">{skillName}</span>
      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${proficiencyColor[proficiencyLevel]}`}>
        {proficiencyLabel[proficiencyLevel]}
      </span>
      {experienceYears != null && (
        <span className="text-xs text-slate-400">{experienceYears}年</span>
      )}
    </span>
  )
}

export { proficiencyLabel }
