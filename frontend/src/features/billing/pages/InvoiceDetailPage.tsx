import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InvoiceStatusBadge, formatYen } from '../components/BillingBadge'
import {
  useInvoice,
  useApproveInvoice,
  useSendInvoice,
  useReceivePayment,
} from '../api/billingApi'
import { ArrowLeft } from 'lucide-react'

const workTypeLabel = {
  normal: '所定内',
  overtime: '時間外',
  holiday: '休日',
  midnight: '深夜',
}

const receiveSchema = z.object({
  amount: z.coerce.number().min(1, '金額を入力してください'),
  date: z.string().min(1, '入金日を入力してください'),
})
type ReceiveVals = z.infer<typeof receiveSchema>

function ReceivePaymentSheet({
  open,
  invoiceId,
  remaining,
  onClose,
}: {
  open: boolean
  invoiceId: string
  remaining: number
  onClose: () => void
}) {
  const receivePayment = useReceivePayment(invoiceId)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReceiveVals>({
    resolver: zodResolver(receiveSchema) as Resolver<ReceiveVals>,
    defaultValues: { amount: remaining, date: new Date().toISOString().slice(0, 10) },
  })

  const onSubmit = async (data: ReceiveVals) => {
    await receivePayment.mutateAsync(data)
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader><SheetTitle>入金登録</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label>入金額 *（円）</Label>
            <Input type="number" step="1" {...register('amount')} />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <Label>入金日 *</Label>
            <Input type="date" {...register('date')} />
            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={receivePayment.isPending}>
              {receivePayment.isPending ? '登録中...' : '入金登録'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = useInvoice(id!)
  const approve = useApproveInvoice(id!)
  const send = useSendInvoice(id!)
  const [receiveSheet, setReceiveSheet] = useState(false)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">請求書が見つかりません</div>

  const remaining = data.total_amount - data.payment_received_amount
  const receivedPct = data.total_amount > 0
    ? Math.min(100, Math.round((data.payment_received_amount / data.total_amount) * 100))
    : 0

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-1" />戻る
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.invoice_number}</h1>
            <InvoiceStatusBadge status={data.status} />
          </div>
          <p className="text-slate-600 mt-1">{data.customer_name}</p>
          {data.project_name && <p className="text-sm text-slate-500">{data.project_name}</p>}
          <p className="text-sm text-slate-500 mt-1">支払期日: {data.due_date}</p>
        </div>
        <div className="flex gap-2">
          {data.status === 'draft' && !data.is_locked && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => approve.mutate()}
                disabled={approve.isPending}
              >
                {approve.isPending ? '処理中...' : '承認依頼'}
              </Button>
              <Button
                size="sm"
                onClick={() => send.mutate()}
                disabled={send.isPending}
              >
                {send.isPending ? '処理中...' : '送付'}
              </Button>
            </>
          )}
          {data.status === 'sent' && (
            <Button size="sm" onClick={() => setReceiveSheet(true)}>入金登録</Button>
          )}
          {data.status === 'partially_paid' && (
            <Button size="sm" onClick={() => setReceiveSheet(true)}>追加入金登録</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">請求明細</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>摘要</TableHead>
                <TableHead>担当者</TableHead>
                <TableHead>種別</TableHead>
                <TableHead className="text-right">数量</TableHead>
                <TableHead>単位</TableHead>
                <TableHead className="text-right">単価</TableHead>
                <TableHead className="text-right">金額</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">{item.description}</TableCell>
                  <TableCell className="text-sm text-slate-600">{item.worker_name ?? '—'}</TableCell>
                  <TableCell className="text-sm">{workTypeLabel[item.work_type]}</TableCell>
                  <TableCell className="text-right text-sm">{item.quantity.toLocaleString()}</TableCell>
                  <TableCell className="text-sm">{item.unit}</TableCell>
                  <TableCell className="text-right text-sm">{formatYen(item.unit_price)}</TableCell>
                  <TableCell className="text-right text-sm font-medium">{formatYen(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">小計</span>
                <span>{formatYen(data.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">消費税（{Math.round(data.tax_rate * 100)}%）</span>
                <span>{formatYen(data.tax_amount)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>合計</span>
                <span>{formatYen(data.total_amount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">入金状況</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">入金済</span>
            <span className="font-medium">{formatYen(data.payment_received_amount)} / {formatYen(data.total_amount)}</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-3 rounded-full transition-all ${receivedPct >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
              style={{ width: `${receivedPct}%` }}
            />
          </div>
          {data.payment_received_date && (
            <p className="text-xs text-slate-500">最終入金日: {data.payment_received_date}</p>
          )}
          {remaining > 0 && data.status !== 'cancelled' && (
            <p className="text-sm font-medium text-red-600">未入金残額: {formatYen(remaining)}</p>
          )}
        </CardContent>
      </Card>

      {data.note && (
        <Card>
          <CardHeader><CardTitle className="text-base">備考</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.note}</p>
          </CardContent>
        </Card>
      )}

      <ReceivePaymentSheet
        open={receiveSheet}
        invoiceId={id!}
        remaining={remaining}
        onClose={() => setReceiveSheet(false)}
      />
    </div>
  )
}
