import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ExpenseStatusBadge, expenseCategoryLabel } from '../components/ExpenseBadge'
import { useExpenseSummary } from '../api/expenseApi'
import type { ExpenseCategory } from '@/types/expense'

const categoryOrder: ExpenseCategory[] = [
  'transport',
  'accommodation',
  'entertainment',
  'supplies',
  'communication',
  'other',
]

export default function ExpenseSummaryPage() {
  const [yearMonth, setYearMonth] = useState('2026-05')
  const { data, isLoading, isError } = useExpenseSummary(yearMonth)

  const maxCategory = data
    ? Math.max(...categoryOrder.map((c) => data.by_category[c] ?? 0), 1)
    : 1

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">経費月次集計</h1>
      </div>

      <div className="flex gap-4 p-4 bg-white rounded-lg border w-fit">
        <div className="w-44">
          <Label>対象年月</Label>
          <Input
            type="month"
            value={yearMonth}
            onChange={(e) => setYearMonth(e.target.value)}
          />
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {data && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">総額</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">¥{data.total_amount.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">申請件数</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{data.items.length}件</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">承認済金額</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-700">
                  ¥{((data.by_status['approved'] ?? 0) + (data.by_status['paid'] ?? 0)).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-base">カテゴリ別内訳</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {categoryOrder.map((cat) => {
                const amount = data.by_category[cat] ?? 0
                const pct = maxCategory > 0 ? Math.round((amount / maxCategory) * 100) : 0
                return (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700">{expenseCategoryLabel[cat]}</span>
                      <span className="font-medium">¥{amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">個人別集計</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>氏名</TableHead>
                    <TableHead className="text-right">合計金額</TableHead>
                    <TableHead>ステータス</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-slate-400">
                        データなし
                      </TableCell>
                    </TableRow>
                  )}
                  {data.items.map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-sm font-medium">{item.user_name}</TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        ¥{item.total_amount.toLocaleString()}
                      </TableCell>
                      <TableCell><ExpenseStatusBadge status={item.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
