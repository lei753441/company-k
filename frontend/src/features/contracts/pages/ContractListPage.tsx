import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'
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
import { ContractStatusBadge, ContractTypeBadge, ExpiryBadge, contractStatusLabel, contractTypeLabel } from '../components/ContractBadge'
import { useContracts } from '../api/contractApi'
import { useAuthStore } from '@/store/authStore'
import type { ContractListParams, ContractStatus, ContractType } from '@/types/contract'
import { Plus, Bell } from 'lucide-react'

const ALL = '_all_'

export default function ContractListPage() {
  const can = useAuthStore((s) => s.can)
  const [params, setParams] = useState<ContractListParams>({ q: '', status: '', contract_type: '', page: 1 })
  const { data, isLoading, isError } = useContracts(params)
  const items = data?.items ?? []

  const update = (patch: Partial<ContractListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  const getRowClass = (days: number | null) => {
    if (days === null) return ''
    if (days < 0) return 'bg-red-50'
    if (days <= 30) return 'bg-yellow-50'
    return ''
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">契約一覧</h1>
        <div className="flex gap-2">
          <Link to="/contracts/renewal-alerts" className={buttonVariants({ variant: 'outline', size: 'sm' })}><Bell size={14} className="mr-1" />更新アラート</Link>
          {(can('edit_all') || can('export_csv')) && (
            <Link to="/contracts/new" className={buttonVariants({ size: 'sm' })}><Plus size={14} className="mr-1" />新規作成</Link>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex-1 min-w-48">
          <Label>検索</Label>
          <Input
            placeholder="契約番号・件名・当事者名で検索"
            value={params.q ?? ''}
            onChange={(e) => update({ q: e.target.value })}
          />
        </div>
        <div className="w-40">
          <Label>ステータス</Label>
          <Select
            value={params.status || ALL}
            onValueChange={(v) => update({ status: (v ?? '') === ALL ? '' : ((v ?? '') as ContractStatus) })}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {(Object.keys(contractStatusLabel) as ContractStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{contractStatusLabel[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-44">
          <Label>契約種別</Label>
          <Select
            value={params.contract_type || ALL}
            onValueChange={(v) => update({ contract_type: (v ?? '') === ALL ? '' : ((v ?? '') as ContractType) })}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {(Object.keys(contractTypeLabel) as ContractType[]).map((t) => (
                <SelectItem key={t} value={t}>{contractTypeLabel[t]}</SelectItem>
              ))}
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
                <TableHead>契約番号</TableHead>
                <TableHead>当事者名</TableHead>
                <TableHead>案件名</TableHead>
                <TableHead>契約件名</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>有効期間</TableHead>
                <TableHead>残日数</TableHead>
                <TableHead className="text-right">単価</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                    該当する契約が見つかりません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id} className={getRowClass(item.days_until_expiry)}>
                  <TableCell>
                    <Link to={`/contracts/${item.id}`} className="font-mono text-sm font-medium hover:underline">
                      {item.contract_number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{item.party_name}</TableCell>
                  <TableCell className="text-sm text-slate-600">{item.project_name ?? '—'}</TableCell>
                  <TableCell className="text-sm max-w-48 truncate">{item.title}</TableCell>
                  <TableCell><ContractTypeBadge type={item.contract_type} /></TableCell>
                  <TableCell><ContractStatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-xs text-slate-600">
                    {item.start_date} 〜 {item.end_date ?? '—'}
                  </TableCell>
                  <TableCell>
                    <ExpiryBadge days={item.days_until_expiry} />
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.unit_price != null ? `¥${item.unit_price.toLocaleString()}` : '—'}
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
