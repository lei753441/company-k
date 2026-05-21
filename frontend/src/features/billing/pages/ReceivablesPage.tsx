import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatYen } from '../components/BillingBadge'
import { useInvoices } from '../api/billingApi'

function overdueDaysBadge(days: number) {
  if (days >= 60) {
    return <Badge variant="destructive">{days}日超過</Badge>
  }
  if (days >= 30) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">
        {days}日超過
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-700">
      {days}日超過
    </span>
  )
}

function calcOverdueDays(dueDate: string): number {
  const today = new Date('2026-05-20')
  const due = new Date(dueDate)
  const diff = Math.floor((today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export default function ReceivablesPage() {
  const { data, isLoading, isError } = useInvoices({ status: 'overdue' })
  const items = data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">未入金管理</h1>
        <p className="text-sm text-slate-500">支払期日超過の請求書一覧</p>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>請求書番号</TableHead>
                <TableHead>顧客名</TableHead>
                <TableHead className="text-right">請求額</TableHead>
                <TableHead className="text-right">入金済</TableHead>
                <TableHead className="text-right">残額</TableHead>
                <TableHead>支払期日</TableHead>
                <TableHead>超過日数</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">未入金の請求書はありません</TableCell>
                </TableRow>
              )}
              {items.map((item) => {
                const remaining = item.total_amount - item.payment_received_amount
                const days = calcOverdueDays(item.due_date)
                return (
                  <TableRow key={item.id} className="bg-red-50">
                    <TableCell>
                      <Link to={`/billing/invoices/${item.id}`} className="font-medium hover:underline text-blue-600">
                        {item.invoice_number}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">{item.customer_name}</TableCell>
                    <TableCell className="text-right text-sm font-medium">{formatYen(item.total_amount)}</TableCell>
                    <TableCell className="text-right text-sm">{formatYen(item.payment_received_amount)}</TableCell>
                    <TableCell className="text-right text-sm font-bold text-red-600">{formatYen(remaining)}</TableCell>
                    <TableCell className="text-sm">{item.due_date}</TableCell>
                    <TableCell>{overdueDaysBadge(days)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
