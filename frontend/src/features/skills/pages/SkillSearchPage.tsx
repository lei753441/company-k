import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
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
import { AvailabilityBadge, availabilityLabel } from '../components/AvailabilityBadge'
import { SkillBadge } from '../components/SkillBadge'
import { useSkillSearch, useSkillMasters } from '../api/skillApi'
import type { WorkAvailabilityStatus, ProficiencyLevel, EmployeeSkill } from '@/types/skill'
import { Search, X, Plus } from 'lucide-react'

interface SearchCandidate {
  employee_id: string
  employee_name: string
  department_name: string
  skills: EmployeeSkill[]
  availability: { status: WorkAvailabilityStatus; available_from_date: string | null } | null
}

const ALL = '_all_'

export default function SkillSearchPage() {
  const [skillInput, setSkillInput] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [minProficiency, setMinProficiency] = useState(1)
  const [selectedStatuses, setSelectedStatuses] = useState<WorkAvailabilityStatus[]>([])
  const [searched, setSearched] = useState(false)

  const { data: mastersData } = useSkillMasters(skillInput)
  const masters = mastersData?.items ?? []

  const { data, isFetching } = useSkillSearch({
    skill_names: searched ? selectedSkills : [],
    min_proficiency: minProficiency,
    availability_statuses: searched ? selectedStatuses : [],
  })
  const results = (data?.items ?? []) as SearchCandidate[]

  const addSkill = (name: string) => {
    if (!selectedSkills.includes(name)) setSelectedSkills((prev) => [...prev, name])
    setSkillInput('')
  }

  const removeSkill = (name: string) => setSelectedSkills((prev) => prev.filter((s) => s !== name))

  const toggleStatus = (status: WorkAvailabilityStatus) => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    )
  }

  const handleSearch = () => setSearched(true)
  const handleReset = () => {
    setSelectedSkills([])
    setMinProficiency(1)
    setSelectedStatuses([])
    setSearched(false)
    setSkillInput('')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">スキル検索</h1>

      <div className="p-4 bg-white rounded-lg border space-y-4">
        <div className="space-y-2">
          <Label>スキルタグ（複数指定可・AND条件）</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="スキル名で検索 (例: React)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && skillInput) {
                    e.preventDefault()
                    const match = masters.find((m) => m.name.toLowerCase() === skillInput.toLowerCase())
                    if (match) addSkill(match.name)
                    else if (skillInput) addSkill(skillInput)
                  }
                }}
              />
              {skillInput && masters.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded shadow-md max-h-48 overflow-y-auto">
                  {masters.slice(0, 10).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-100"
                      onClick={() => addSkill(m.name)}
                    >
                      {m.name}
                      <span className="text-xs text-slate-400 ml-1">({m.category_medium})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          {selectedSkills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((s) => (
                <span key={s} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded">
                  {s}
                  <button type="button" onClick={() => removeSkill(s)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="w-44">
            <Label>習熟度（下限）</Label>
            <Select
              value={String(minProficiency)}
              onValueChange={(v) => setMinProficiency(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1: 入門以上</SelectItem>
                <SelectItem value="2">2: 初級以上</SelectItem>
                <SelectItem value="3">3: 中級以上</SelectItem>
                <SelectItem value="4">4: 上級以上</SelectItem>
                <SelectItem value="5">5: エキスパート</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Label>稼働ステータス（複数選択可）</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {(Object.keys(availabilityLabel) as WorkAvailabilityStatus[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  className={`text-xs px-2 py-1 rounded-full border transition-colors ${
                    selectedStatuses.includes(s)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-300 text-slate-600 hover:border-blue-400'
                  }`}
                >
                  {availabilityLabel[s]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSearch} disabled={selectedSkills.length === 0 && selectedStatuses.length === 0}>
            <Search size={14} className="mr-1" />検索
          </Button>
          <Button variant="outline" onClick={handleReset}>リセット</Button>
        </div>
      </div>

      {searched && (
        <div className="space-y-2">
          <p className="text-sm text-slate-500">
            {isFetching ? '検索中...' : `${results.length}件の候補社員が見つかりました`}
          </p>
          <div className="bg-white rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>氏名</TableHead>
                  <TableHead>部署</TableHead>
                  <TableHead>マッチしたスキル</TableHead>
                  <TableHead>稼働状況</TableHead>
                  <TableHead>空き予定</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                      条件に合う社員が見つかりません
                    </TableCell>
                  </TableRow>
                )}
                {results.map((r) => {
                  const matchedSkills = r.skills.filter((s) => selectedSkills.includes(s.skill_name))
                  return (
                    <TableRow key={r.employee_id}>
                      <TableCell className="font-medium">{r.employee_name}</TableCell>
                      <TableCell className="text-sm text-slate-600">{r.department_name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          {matchedSkills.map((s) => (
                            <SkillBadge
                              key={s.id}
                              skillName={s.skill_name}
                              proficiencyLevel={s.proficiency_level as ProficiencyLevel}
                              experienceYears={s.experience_years}
                            />
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {r.availability ? (
                          <AvailabilityBadge status={r.availability.status} />
                        ) : (
                          <span className="text-slate-400 text-xs">未設定</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{r.availability?.available_from_date ?? '—'}</TableCell>
                      <TableCell>
                        <Button asChild variant="ghost" size="sm">
                          <Link to={`/skills/${r.employee_id}`}>詳細</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
