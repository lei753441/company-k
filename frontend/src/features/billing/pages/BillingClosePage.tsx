import { useState } from 'react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useInvoices } from '../api/billingApi'
import { usePaymentRecords } from '../api/billingApi'
import { CheckCircle } from 'lucide-react'

function currentYearMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export default function BillingClosePage() {
  const [yearMonth, setYearMonth] = useState(currentYearMonth())
  const [closed, setClosed] = useState(false)

  const { data: invData } = useInvoices({ year_month: yearMonth })
  const { data: payData } = usePaymentRecords({ year_month: yearMonth })

  const invoices = invData?.items ?? []
  const payments = payData?.items ?? []

  const sentCount = invoices.filter((i) => i.status === 'sent' || i.status === 'partially_paid' || i.status === 'paid').length
  const paidCount = invoices.filter((i) => i.status === 'paid').length
  const unpaidCount = invoices.filter((i) => i.status === 'overdue' || i.status === 'sent' || i.status === 'partially_paid').length
  const approvedPayCount = payments.filter((p) => p.status === 'approved' || p.status === 'paid').length

  const allDone = unpaidCount === 0 && invoices.length > 0

  const yearMonthOptions = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    return format(d, 'yyyy-MM')
  })

  const handleClose = () => {
    if (!allDone) return
    setClosed(true)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">月次締め処理</h1>
        <div className="w-40">
          <Label>対象年月</Label>
          <Select value={yearMonth} onValueChange={(v) => { setYearMonth(v ?? ''); setClosed(false) }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {yearMonthOptions.map((ym) => (
                <SelectItem key={ym} value={ym}>{ym}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {closed && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="text-green-600" size={24} />
          <div>
            <p className="font-medium text-green-800">{yearMonth} の月次締めが完了しました</p>
            <p className="text-sm text-green-600">データは確定済みとなりロックされました</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">送付済件数</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold">{sentCount}件</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">入金済件数</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-green-600">{paidCount}件</p></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">未入金件数</CardTitle></CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${unpaidCount > 0 ? 'text-red-600' : 'text-slate-400'}`}>
              {unpaidCount}件
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-500">承認済支払件数</CardTitle></CardHeader>
          <CardContent><p className="text-3xl font-bold text-blue-600">{approvedPayCount}件</p></CardContent>
        </Card>
      </div>

      {!closed && (
        <div className="p-4 bg-white rounded-lg border">
          {!allDone && (
            <p className="text-sm text-slate-500 mb-3">
              未入金の請求書が残っています。全件入金完了後に締め処理が可能です。
            </p>
          )}
          {allDone && (
            <p className="text-sm text-green-600 mb-3">
              全件入金完了。締め処理を実行できます。
            </p>
          )}
          <Button
            onClick={handleClose}
            disabled={!allDone}
            className={allDone ? '' : 'opacity-50 cursor-not-allowed'}
          >
            締め処理実行
          </Button>
        </div>
      )}
    </div>
  )
}
