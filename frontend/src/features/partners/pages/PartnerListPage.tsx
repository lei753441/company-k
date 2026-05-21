import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { PartnerStatusBadge, partnerStatusLabel } from '../components/PartnerBadge'
import { usePartners } from '../api/partnerApi'
import { useAuthStore } from '@/store/authStore'
import type { PartnerListParams, PartnerStatus } from '@/types/partner'
import { Plus } from 'lucide-react'

const ALL = '_all_'
const statusOrder: PartnerStatus[] = ['active', 'dormant', 'suspended']

export default function PartnerListPage() {
  const can = useAuthStore((s) => s.can)
  const [params, setParams] = useState<PartnerListParams>({ q: '', status: '', page: 1 })
  const { data, isLoading, isError } = usePartners(params)
  const items = data?.items ?? []
  const statusCounts = data?.status_counts ?? {}

  const update = (patch: Partial<PartnerListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">協力会社一覧</h1>
        {(can('edit_all') || can('manage_office')) && (
          <Button asChild size="sm">
            <Link to="/partners/new"><Plus size={14} className="mr-1" />新規登録</Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update({ status: '' })}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${!params.status ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}
        >
          すべて ({data?.total ?? 0})
        </button>
        {statusOrder.map((s) =>
          statusCounts[s] ? (
            <button
              key={s}
              onClick={() => update({ status: s })}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${params.status === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}
            >
              {partnerStatusLabel[s]} ({statusCounts[s]})
            </button>
          ) : null,
        )}
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex-1 min-w-48">
          <Label>企業名検索</Label>
          <Input placeholder="企業名・カナで検索" value={params.q ?? ''} onChange={(e) => update({ q: e.target.value })} />
        </div>
        <div className="w-36">
          <Label>ステータス</Label>
          <Select value={params.status || ALL} onValueChange={(v) => update({ status: v === ALL ? '' : (v as PartnerStatus) })}>
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {statusOrder.map((s) => <SelectItem key={s} value={s}>{partnerStatusLabel[s]}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>企業名</TableHead>
                <TableHead>所在地</TableHead>
                <TableHead className="text-center">エンジニア数</TableHead>
                <TableHead className="text-center">稼働中案件数</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>タグ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">該当する協力会社が見つかりません</TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link to={`/partners/${item.id}`} className="font-medium hover:underline">{item.name}</Link>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.prefecture ?? '—'}</TableCell>
                  <TableCell className="text-center text-sm">{item.engineer_count}</TableCell>
                  <TableCell className="text-center text-sm">{item.active_project_count}</TableCell>
                  <TableCell><PartnerStatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
