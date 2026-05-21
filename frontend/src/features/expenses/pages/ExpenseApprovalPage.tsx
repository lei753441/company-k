import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { ExpenseStatusBadge, expenseStatusLabel } from '../components/ExpenseBadge'
import { useExpenseReports } from '../api/expenseApi'
import type { ExpenseListParams, ExpenseStatus } from '@/types/expense'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const ALL = '_all_'
const approvalStatuses: ExpenseStatus[] = ['submitted', 'approved', 'rejected']

export default function ExpenseApprovalPage() {
  const [params, setParams] = useState<ExpenseListParams>({ year_month: '', status: 'submitted', page: 1 })
  const { data, isLoading, isError } = useExpenseReports(params)

  const items = data?.items ?? []
  const update = (patch: Partial<ExpenseListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  const statusCounts = data?.status_counts ?? {}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">経費申請 承認一覧</h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update({ status: '' })}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${!params.status ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}
        >
          すべて ({data?.total ?? 0})
        </button>
        {approvalStatuses.map((s) =>
          statusCounts[s] ? (
            <button
              key={s}
              onClick={() => update({ status: s })}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${params.status === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}
            >
              {expenseStatusLabel[s]} ({statusCounts[s]})
            </button>
          ) : null,
        )}
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="w-44">
          <Label>対象年月</Label>
          <Input
            type="month"
            value={params.year_month ?? ''}
            onChange={(e) => update({ year_month: e.target.value })}
          />
        </div>
        <div className="w-36">
          <Label>ステータス</Label>
          <Select
            value={params.status || ALL}
            onValueChange={(v) => update({ status: v === ALL ? '' : (v as ExpenseStatus) })}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {approvalStatuses.map((s) => (
                <SelectItem key={s} value={s}>{expenseStatusLabel[s]}</SelectItem>
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
                <TableHead>申請者名</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>対象年月</TableHead>
                <TableHead className="text-right">合計金額</TableHead>
                <TableHead>提出日</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    該当する申請が見つかりません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm font-medium">{item.user_name}</TableCell>
                  <TableCell className="text-sm">{item.title}</TableCell>
                  <TableCell className="text-sm">{item.year_month}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    ¥{item.total_amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {item.submitted_at
                      ? format(new Date(item.submitted_at), 'M月d日', { locale: ja })
                      : '—'}
                  </TableCell>
                  <TableCell><ExpenseStatusBadge status={item.status} /></TableCell>
                  <TableCell>
                    <Link
                      to={`/expenses/${item.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      詳細
                    </Link>
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
