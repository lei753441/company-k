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
import { PaymentStatusBadge, paymentStatusLabel, formatYen } from '../components/BillingBadge'
import { usePaymentRecords } from '../api/billingApi'
import type { PaymentListParams, PaymentRecordStatus } from '@/types/billing'

const ALL = '_all_'
const statusOrder: PaymentRecordStatus[] = ['calculating', 'pending_review', 'approved', 'transfer_ready', 'paid', 'on_hold']

function fmtMinutes(m: number): string {
  return `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}m` : ''}`
}

export default function PaymentListPage() {
  const [params, setParams] = useState<PaymentListParams>({ year_month: '', status: '', page: 1 })
  const { data, isLoading, isError } = usePaymentRecords(params)
  const items = data?.items ?? []
  const statusCounts = data?.status_counts ?? {}

  const update = (patch: Partial<PaymentListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">支払明細一覧</h1>
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
              {paymentStatusLabel[s]} ({statusCounts[s]})
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
          <Select value={params.status || ALL} onValueChange={(v) => update({ status: v === ALL ? '' : (v as PaymentRecordStatus) })}>
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {statusOrder.map((s) => (
                <SelectItem key={s} value={s}>{paymentStatusLabel[s]}</SelectItem>
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
                <TableHead>支払先</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>案件名</TableHead>
                <TableHead>対象年月</TableHead>
                <TableHead className="text-right">所定内</TableHead>
                <TableHead className="text-right">残業</TableHead>
                <TableHead className="text-right">支払額</TableHead>
                <TableHead>支払予定日</TableHead>
                <TableHead>ステータス</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-400">該当する支払明細が見つかりません</TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Link to={`/billing/payments/${item.id}`} className="font-medium hover:underline text-blue-600">
                        {item.payee_name}
                      </Link>
                      {!item.is_invoice_registered && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">免税</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.payee_type === 'company' ? '協力会社' : '個人事業主'}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.project_name ?? '—'}</TableCell>
                  <TableCell className="text-sm">{item.payment_year_month}</TableCell>
                  <TableCell className="text-right text-sm">{fmtMinutes(item.work_minutes_normal)}</TableCell>
                  <TableCell className="text-right text-sm">{fmtMinutes(item.work_minutes_overtime)}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatYen(item.total_payment)}</TableCell>
                  <TableCell className="text-sm">{item.scheduled_payment_date}</TableCell>
                  <TableCell><PaymentStatusBadge status={item.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
