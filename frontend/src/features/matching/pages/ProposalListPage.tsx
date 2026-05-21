import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useProposals, useCreateProposal } from '../api/matchingApi'
import type { ProposalStatus } from '@/types/matching'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const ALL = '_all_'

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

const projectOptions = [
  { id: 'PRJ-2026-0001', name: 'ECサイトリニューアル支援' },
  { id: 'PRJ-2026-0002', name: '大手銀行システム刷新PJ' },
  { id: 'PRJ-2026-0003', name: '在庫管理システム受託開発' },
]

function NewProposalSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [projectId, setProjectId] = useState('')
  const [note, setNote] = useState('')
  const create = useCreateProposal()

  const handleSubmit = async () => {
    if (!projectId) return
    await create.mutateAsync({ project_id: projectId, note: note || null })
    setProjectId('')
    setNote('')
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>提案リスト新規作成</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label>案件 *</Label>
            <Select
              value={projectId || ALL}
              onValueChange={(v) => setProjectId(v === ALL ? '' : v)}
            >
              <SelectTrigger className="w-full">
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
          <div>
            <Label>メモ（任意）</Label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring/50 mt-1"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="提案リストに関するメモ"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={!projectId || create.isPending}>
              {create.isPending ? '作成中...' : '作成'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              キャンセル
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function ProposalListPage() {
  const { data, isLoading, isError } = useProposals()
  const items = data?.items ?? []
  const [newSheet, setNewSheet] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">提案リスト一覧</h1>
        <Button size="sm" onClick={() => setNewSheet(true)}>
          <Plus size={14} className="mr-1" />
          新規作成
        </Button>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>案件名</TableHead>
                <TableHead className="text-center">候補者数</TableHead>
                <TableHead className="text-center">確定数</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>作成日</TableHead>
                <TableHead>更新日</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    提案リストがありません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.project_name}</p>
                      <p className="text-xs text-slate-400">{item.id}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{item.candidate_count}名</TableCell>
                  <TableCell className="text-center text-sm">
                    <span className={item.confirmed_count > 0 ? 'text-green-600 font-medium' : 'text-slate-400'}>
                      {item.confirmed_count}名
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${statusColor[item.status]}`}>
                      {statusLabel[item.status]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(new Date(item.created_at), 'M月d日', { locale: ja })}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(new Date(item.updated_at), 'M月d日', { locale: ja })}
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/matching/proposals/${item.id}`}>詳細</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <NewProposalSheet open={newSheet} onClose={() => setNewSheet(false)} />
    </div>
  )
}
