import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useMatchingSearch } from '../api/matchingApi'
import { useProposals, useAddProposalCandidate } from '../api/matchingApi'
import type {
  MatchingCandidate,
  AvailabilityStatus,
  CandidateType,
  MatchingSearchParams,
} from '@/types/matching'
import { Search } from 'lucide-react'

const ALL = '_all_'

const availabilityLabel: Record<AvailabilityStatus, string> = {
  available: '稼働可',
  available_soon: 'まもなく空き',
  in_project: '稼働中',
  unavailable: '不可',
}

const availabilityColor: Record<AvailabilityStatus, string> = {
  available: 'bg-green-100 text-green-700',
  available_soon: 'bg-yellow-100 text-yellow-700',
  in_project: 'bg-blue-100 text-blue-700',
  unavailable: 'bg-slate-100 text-slate-500',
}

const candidateTypeLabel: Record<CandidateType, string> = {
  employee: '自社社員',
  partner_engineer: '協力会社',
  freelancer: 'フリーランス',
}

const candidateTypeColor: Record<CandidateType, string> = {
  employee: 'bg-indigo-100 text-indigo-700',
  partner_engineer: 'bg-purple-100 text-purple-700',
  freelancer: 'bg-orange-100 text-orange-700',
}

const projectOptions = [
  { id: 'PRJ-2026-0001', name: 'ECサイトリニューアル支援' },
  { id: 'PRJ-2026-0002', name: '大手銀行システム刷新PJ' },
  { id: 'PRJ-2026-0003', name: '在庫管理システム受託開発' },
]

function distributeWeights(
  changed: 'skill' | 'availability' | 'rate',
  newVal: number,
  current: { skill: number; availability: number; rate: number },
) {
  const remaining = Math.max(0, 1 - newVal)
  if (changed === 'skill') {
    const total = current.availability + current.rate
    if (total === 0) {
      return { skill: newVal, availability: remaining / 2, rate: remaining / 2 }
    }
    return {
      skill: newVal,
      availability: (current.availability / total) * remaining,
      rate: (current.rate / total) * remaining,
    }
  }
  if (changed === 'availability') {
    const total = current.skill + current.rate
    if (total === 0) {
      return { skill: remaining / 2, availability: newVal, rate: remaining / 2 }
    }
    return {
      skill: (current.skill / total) * remaining,
      availability: newVal,
      rate: (current.rate / total) * remaining,
    }
  }
  const total = current.skill + current.availability
  if (total === 0) {
    return { skill: remaining / 2, availability: remaining / 2, rate: newVal }
  }
  return {
    skill: (current.skill / total) * remaining,
    availability: (current.availability / total) * remaining,
    rate: newVal,
  }
}

function AddToProposalSheet({
  open,
  candidate: c,
  onClose,
}: {
  open: boolean
  candidate: MatchingCandidate | null
  onClose: () => void
}) {
  const { data } = useProposals()
  const proposals = data?.items ?? []
  const [selectedProposalId, setSelectedProposalId] = useState<string>('')
  const [note, setNote] = useState('')

  const addCandidate = useAddProposalCandidate(selectedProposalId)

  const handleSubmit = async () => {
    if (!c || !selectedProposalId) return
    await addCandidate.mutateAsync({
      person_id: c.person_id,
      person_name: c.name,
      person_type: c.person_type,
      company_name: c.company_name,
      score_total: c.score_total,
      note: note || null,
    })
    setNote('')
    setSelectedProposalId('')
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>提案リストに追加</SheetTitle>
        </SheetHeader>
        {c && (
          <div className="space-y-4 mt-4">
            <p className="text-sm text-slate-600">
              <span className="font-medium">{c.name}</span> を提案リストに追加します。
            </p>
            <div>
              <Label>提案リスト *</Label>
              <Select
                value={selectedProposalId || ALL}
                onValueChange={(v) => setSelectedProposalId(v === ALL ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="提案リストを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>選択してください</SelectItem>
                  {proposals.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.project_name}（{p.id}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>メモ（任意）</Label>
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 mt-1"
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="候補者に関するメモ"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSubmit}
                disabled={!selectedProposalId || addCandidate.isPending}
              >
                {addCandidate.isPending ? '追加中...' : '追加'}
              </Button>
              <Button variant="outline" onClick={onClose}>
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function ScoreBar({ skill, availability, rate }: { skill: number; availability: number; rate: number }) {
  const total = skill + availability + rate
  if (total === 0) return <div className="h-3 w-full bg-slate-100 rounded-full" />
  const skillPct = (skill / total) * 100
  const availPct = (availability / total) * 100
  const ratePct = (rate / total) * 100
  return (
    <div className="h-3 w-full flex rounded-full overflow-hidden">
      <div style={{ width: `${skillPct}%` }} className="bg-blue-400" title={`スキル: ${skill}`} />
      <div style={{ width: `${availPct}%` }} className="bg-green-400" title={`稼働: ${availability}`} />
      <div style={{ width: `${ratePct}%` }} className="bg-orange-400" title={`単価: ${rate}`} />
    </div>
  )
}

export default function MatchingSearchPage() {
  const [projectId, setProjectId] = useState<string>('')
  const [weights, setWeights] = useState({ skill: 0.5, availability: 0.3, rate: 0.2 })
  const [availFilter, setAvailFilter] = useState<AvailabilityStatus | ''>('')
  const [typeFilter, setTypeFilter] = useState<CandidateType | ''>('')
  const [searchParams, setSearchParams] = useState<MatchingSearchParams | null>(null)
  const [addSheet, setAddSheet] = useState<{ open: boolean; candidate: MatchingCandidate | null }>({
    open: false,
    candidate: null,
  })

  const { data, isFetching } = useMatchingSearch(searchParams)
  const candidates = data?.candidates ?? []

  const handleWeightChange = (which: 'skill' | 'availability' | 'rate', val: number) => {
    const newWeights = distributeWeights(which, val, weights)
    setWeights({
      skill: Math.round(newWeights.skill * 100) / 100,
      availability: Math.round(newWeights.availability * 100) / 100,
      rate: Math.round(newWeights.rate * 100) / 100,
    })
  }

  const handleSearch = () => {
    if (!projectId) return
    setSearchParams({
      project_id: projectId,
      skill_weight: weights.skill,
      availability_weight: weights.availability,
      rate_weight: weights.rate,
      availability_status: availFilter,
      candidate_type: typeFilter,
    })
  }

  const weightTotal = Math.round((weights.skill + weights.availability + weights.rate) * 100)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">案件マッチング検索</h1>

      <div className="p-4 bg-white rounded-lg border space-y-5">
        <div>
          <Label>案件 *</Label>
          <Select
            value={projectId || ALL}
            onValueChange={(v) => setProjectId(v === ALL ? '' : v)}
          >
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="案件を選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>案件を選択してください</SelectItem>
              {projectOptions.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Label>重み調整</Label>
            <span className={`text-xs px-2 py-0.5 rounded ${weightTotal === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              合計: {weightTotal}%
            </span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-sm w-24 shrink-0">
                <span className="inline-block w-3 h-3 rounded-sm bg-blue-400 mr-1" />
                スキル適合
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(weights.skill * 100)}
                onChange={(e) => handleWeightChange('skill', Number(e.target.value) / 100)}
                className="flex-1 accent-blue-500"
              />
              <span className="text-sm w-12 text-right font-mono">{Math.round(weights.skill * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm w-24 shrink-0">
                <span className="inline-block w-3 h-3 rounded-sm bg-green-400 mr-1" />
                稼働適合
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(weights.availability * 100)}
                onChange={(e) => handleWeightChange('availability', Number(e.target.value) / 100)}
                className="flex-1 accent-green-500"
              />
              <span className="text-sm w-12 text-right font-mono">{Math.round(weights.availability * 100)}%</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm w-24 shrink-0">
                <span className="inline-block w-3 h-3 rounded-sm bg-orange-400 mr-1" />
                単価適合
              </span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(weights.rate * 100)}
                onChange={(e) => handleWeightChange('rate', Number(e.target.value) / 100)}
                className="flex-1 accent-orange-500"
              />
              <span className="text-sm w-12 text-right font-mono">{Math.round(weights.rate * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="w-40">
            <Label>稼働ステータス</Label>
            <Select
              value={availFilter || ALL}
              onValueChange={(v) => setAvailFilter(v === ALL ? '' : (v as AvailabilityStatus))}
            >
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>すべて</SelectItem>
                {(Object.keys(availabilityLabel) as AvailabilityStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {availabilityLabel[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <Label>種別</Label>
            <Select
              value={typeFilter || ALL}
              onValueChange={(v) => setTypeFilter(v === ALL ? '' : (v as CandidateType))}
            >
              <SelectTrigger>
                <SelectValue placeholder="すべて" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>すべて</SelectItem>
                {(Object.keys(candidateTypeLabel) as CandidateType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    {candidateTypeLabel[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleSearch} disabled={!projectId || isFetching}>
          <Search size={14} className="mr-1" />
          {isFetching ? '検索中...' : '候補者を検索'}
        </Button>
      </div>

      {searchParams && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            {isFetching ? '検索中...' : `${candidates.length}名の候補者が見つかりました（スコア順）`}
          </p>
          <div className="grid gap-4">
            {candidates.length === 0 && !isFetching && (
              <div className="text-center py-12 text-slate-400 bg-white rounded-lg border">
                条件に合う候補者が見つかりません
              </div>
            )}
            {candidates.map((c) => (
              <div key={c.person_id} className="bg-white rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-semibold text-base">{c.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${candidateTypeColor[c.person_type]}`}>
                      {candidateTypeLabel[c.person_type]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${availabilityColor[c.availability_status]}`}>
                      {availabilityLabel[c.availability_status]}
                    </span>
                    {c.company_name && (
                      <span className="text-sm text-slate-500">{c.company_name}</span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-2xl font-bold text-slate-800">{c.score_total}</span>
                    <span className="text-xs text-slate-400 ml-1">/ 100</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>スキル: {c.score_skill}</span>
                    <span>稼働: {c.score_availability}</span>
                    <span>単価: {c.score_rate}</span>
                  </div>
                  <ScoreBar skill={c.score_skill} availability={c.score_availability} rate={c.score_rate} />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {c.skill_match_details.map((d) => (
                    <span
                      key={d.skill}
                      className={`text-xs px-2 py-0.5 rounded border flex items-center gap-1 ${
                        d.matched
                          ? d.required
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                          : 'bg-red-50 text-red-500 border-red-200'
                      }`}
                    >
                      {d.matched ? '○' : '✗'} {d.skill}
                      {d.required && <span className="text-xs opacity-60">必須</span>}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-500 space-x-4">
                    {c.available_from && <span>稼働可能: {c.available_from}</span>}
                    {c.desired_rate && (
                      <span>希望単価: ¥{c.desired_rate.toLocaleString()}</span>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddSheet({ open: true, candidate: c })}
                  >
                    提案リストに追加
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddToProposalSheet
        open={addSheet.open}
        candidate={addSheet.candidate}
        onClose={() => setAddSheet({ open: false, candidate: null })}
      />
    </div>
  )
}
