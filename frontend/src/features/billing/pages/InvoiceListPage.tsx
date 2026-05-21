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
import { InvoiceStatusBadge, invoiceStatusLabel, formatYen } from '../components/BillingBadge'
import { useInvoices } from '../api/billingApi'
import { useAuthStore } from '@/store/authStore'
import type { InvoiceListParams, InvoiceStatus } from '@/types/billing'
import { Plus } from 'lucide-react'

const ALL = '_all_'
const statusOrder: InvoiceStatus[] = ['draft', 'pending_approval', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled']

export default function InvoiceListPage() {
  const can = useAuthStore((s) => s.can)
  const [params, setParams] = useState<InvoiceListParams>({ year_month: '', status: '', page: 1 })
  const { data, isLoading, isError } = useInvoices(params)
  const items = data?.items ?? []
  const statusCounts = data?.status_counts ?? {}

  const update = (patch: Partial<InvoiceListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">請求書一覧</h1>
        {can('edit_all') && (
          <Button asChild size="sm">
            <Link to="/billing/invoices/new"><Plus size={14} className="mr-1" />新規作成</Link>
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
              {invoiceStatusLabel[s]} ({statusCounts[s]})
            </button>
          ) : null,
        )}
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="w-48">
          <Label>年月</Label>
          <Input
            type="month"
            value={params.year_month ?? ''}
            onChange={(e) => update({ year_month: e.target.value })}
          />
        </div>
        <div className="w-40">
          <Label>ステータス</Label>
          <Select value={params.status || ALL} onValueChange={(v) => update({ status: v === ALL ? '' : (v as InvoiceStatus) })}>
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {statusOrder.map((s) => (
                <SelectItem key={s} value={s}>{invoiceStatusLabel[s]}</SelectItem>
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
                <TableHead>請求書番号</TableHead>
                <TableHead>顧客名</TableHead>
                <TableHead>案件名</TableHead>
                <TableHead>請求年月</TableHead>
                <TableHead>請求日</TableHead>
                <TableHead>支払期日</TableHead>
                <TableHead className="text-right">請求額</TableHead>
                <TableHead className="text-right">入金額</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-400">該当する請求書が見つかりません</TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.status === 'overdue' ? 'bg-red-50' : undefined}
                >
                  <TableCell>
                    <Link to={`/billing/invoices/${item.id}`} className="font-medium hover:underline text-blue-600">
                      {item.invoice_number}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{item.customer_name}</TableCell>
                  <TableCell className="text-sm text-slate-600">{item.project_name ?? '—'}</TableCell>
                  <TableCell className="text-sm">{item.billing_year_month}</TableCell>
                  <TableCell className="text-sm">{item.invoice_date}</TableCell>
                  <TableCell className="text-sm">{item.due_date}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatYen(item.total_amount)}</TableCell>
                  <TableCell className="text-right text-sm">{formatYen(item.payment_received_amount)}</TableCell>
                  <TableCell><InvoiceStatusBadge status={item.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
