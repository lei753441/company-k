import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import {
  useProposal,
  useDeleteProposalCandidate,
  useUpdateCandidateIntention,
  useUpdateProposalStatus,
} from '../api/matchingApi'
import type {
  ProposalStatus,
  CandidateType,
  CandidateIntention,
} from '@/types/matching'
import { ArrowLeft, Trash2 } from 'lucide-react'

const statusLabel: Record<ProposalStatus, string> = {
  draft: '下書き',
  proposed: '提案中',
  confirmed: '確定',
  rejected: '却下',
}

const statusColor: Record<ProposalStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  proposed: 'bg-blue-100 text-blue-700',
  confirmed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
}

const nextStatus: Record<ProposalStatus, ProposalStatus | null> = {
  draft: 'proposed',
  proposed: 'confirmed',
  confirmed: null,
  rejected: null,
}

const nextStatusLabel: Record<ProposalStatus, string | null> = {
  draft: '提案中に変更',
  proposed: '確定に変更',
  confirmed: null,
  rejected: null,
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

const intentionLabel: Record<CandidateIntention, string> = {
  ok: 'OK',
  ng: 'NG',
  pending: '保留',
}

const intentionColor: Record<CandidateIntention, string> = {
  ok: 'bg-green-100 text-green-700',
  ng: 'bg-red-100 text-red-600',
  pending: 'bg-yellow-100 text-yellow-700',
}

export default function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useProposal(id!)
  const deleteCandidate = useDeleteProposalCandidate(id!)
  const updateIntention = useUpdateCandidateIntention(id!)
  const updateStatus = useUpdateProposalStatus(id!)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">提案リストが見つかりません</div>

  const next = nextStatus[data.status]
  const nextLabel = nextStatusLabel[data.status]

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/matching/proposals">
            <ArrowLeft size={14} className="mr-1" />
            一覧に戻る
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{data.project_name}</h1>
          <p className="text-sm text-slate-500 mt-1">{data.id} / 作成者: {data.created_by_name}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[data.status]}`}>
              {statusLabel[data.status]}
            </span>
          </div>
        </div>
        {next && nextLabel && (
          <Button
            onClick={() => { if (confirm(`ステータスを「${nextLabel}」に変更しますか？`)) updateStatus.mutate(next) }}
            disabled={updateStatus.isPending}
          >
            {updateStatus.isPending ? '変更中...' : nextLabel}
          </Button>
        )}
      </div>

      {data.note && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">メモ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.note}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">候補者一覧（{data.candidates.length}名）</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>所属</TableHead>
                <TableHead>種別</TableHead>
                <TableHead className="text-center">スコア</TableHead>
                <TableHead>メモ</TableHead>
                <TableHead>意向</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.candidates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-400">
                    候補者が登録されていません
                  </TableCell>
                </TableRow>
              )}
              {data.candidates.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.person_name}</TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {c.company_name ?? '自社'}
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${candidateTypeColor[c.person_type]}`}>
                      {candidateTypeLabel[c.person_type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-bold text-slate-700">{c.score_total}</span>
                    <span className="text-xs text-slate-400">/100</span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600 max-w-48">
                    {c.note ?? <span className="text-slate-300">—</span>}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={c.intention}
                      onValueChange={(v) =>
                        updateIntention.mutate({
                          candidateId: c.id,
                          intention: v as CandidateIntention,
                        })
                      }
                    >
                      <SelectTrigger size="sm" className="w-24">
                        <SelectValue>
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${intentionColor[c.intention]}`}>
                            {intentionLabel[c.intention]}
                          </span>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ok">
                          <span className="text-green-700">OK</span>
                        </SelectItem>
                        <SelectItem value="ng">
                          <span className="text-red-600">NG</span>
                        </SelectItem>
                        <SelectItem value="pending">
                          <span className="text-yellow-700">保留</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500"
                      onClick={() => {
                        if (confirm(`${c.person_name} を候補者リストから削除しますか？`))
                          deleteCandidate.mutate(c.id)
                      }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-xs text-slate-400">
        作成: {data.created_at.slice(0, 10)} / 更新: {data.updated_at.slice(0, 10)}
      </div>
    </div>
  )
}
