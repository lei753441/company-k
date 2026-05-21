import { useState } from 'react'
import { format } from 'date-fns'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatYen, invoiceStatusLabel, paymentStatusLabel } from '../components/BillingBadge'
import { useBillingSummary } from '../api/billingApi'
import type { InvoiceStatus, PaymentRecordStatus } from '@/types/billing'

function currentYearMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

const invoiceStatusOrder: InvoiceStatus[] = ['draft', 'pending_approval', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled']
const paymentStatusOrder: PaymentRecordStatus[] = ['calculating', 'pending_review', 'approved', 'transfer_ready', 'paid', 'on_hold']

export default function BillingSummaryPage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const { data, isLoading, isError } = useBillingSummary(yearMonth)

  const yearMonthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return format(d, 'yyyy-MM')
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">月次集計</h1>
        <div className="w-40">
          <Label>年月</Label>
          <Select value={yearMonth} onValueChange={(v) => setYearMonth(v ?? '')}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {yearMonthOptions.map((ym) => (
                <SelectItem key={ym} value={ym}>{ym}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">請求総額</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{formatYen(data.total_invoiced)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">入金済</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-green-600">{formatYen(data.total_received)}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">未入金</CardTitle></CardHeader>
              <CardContent>
                <p className={`text-2xl font-bold ${data.total_outstanding > 0 ? 'text-red-600' : 'text-slate-400'}`}>
                  {formatYen(data.total_outstanding)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">支払総額</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold text-blue-600">{formatYen(data.total_payment)}</p></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader><CardTitle className="text-base">請求ステータス別内訳</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {invoiceStatusOrder.map((s) => {
                    const count = data.invoice_count_by_status[s]
                    if (!count) return null
                    return (
                      <div key={s} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{invoiceStatusLabel[s]}</span>
                        <span className="font-medium">{count}件</span>
                      </div>
                    )
                  })}
                  {Object.keys(data.invoice_count_by_status).length === 0 && (
                    <p className="text-sm text-slate-400">データなし</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">支払ステータス別内訳</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {paymentStatusOrder.map((s) => {
                    const count = data.payment_count_by_status[s]
                    if (!count) return null
                    return (
                      <div key={s} className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">{paymentStatusLabel[s]}</span>
                        <span className="font-medium">{count}件</span>
                      </div>
                    )
                  })}
                  {Object.keys(data.payment_count_by_status).length === 0 && (
                    <p className="text-sm text-slate-400">データなし</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
