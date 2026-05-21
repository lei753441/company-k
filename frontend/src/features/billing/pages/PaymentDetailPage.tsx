import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { PaymentStatusBadge, formatYen } from '../components/BillingBadge'
import { usePaymentRecord, useApprovePaymentRecord, useMarkPaymentPaid } from '../api/billingApi'
import { ArrowLeft } from 'lucide-react'

function fmtMinutes(m: number): string {
  return `${Math.floor(m / 60)}h${m % 60 > 0 ? `${m % 60}m` : ''}`
}

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError } = usePaymentRecord(id!)
  const approve = useApprovePaymentRecord(id!)
  const markPaid = useMarkPaymentPaid(id!)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">支払明細が見つかりません</div>

  const isFreelancer = data.payee_type === 'freelancer'
  const isExempt = !data.is_invoice_registered

  const overtimeUnitPrice = Math.round(data.unit_price * 1.25)
  const normalWorkHours = data.work_minutes_normal / 60
  const overtimeWorkHours = data.work_minutes_overtime / 60

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} className="mr-1" />戻る
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.payee_name}</h1>
            <PaymentStatusBadge status={data.status} />
            {isExempt && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded font-medium">免税事業者</span>
            )}
          </div>
          <p className="text-slate-500 text-sm mt-1">
            {data.payee_type === 'company' ? '協力会社' : '個人事業主'} / {data.payment_year_month}
          </p>
          {data.project_name && <p className="text-sm text-slate-500">{data.project_name}</p>}
        </div>
        <div className="flex gap-2">
          {data.status === 'pending_review' && !data.is_locked && (
            <Button
              size="sm"
              onClick={() => approve.mutate()}
              disabled={approve.isPending}
            >
              {approve.isPending ? '処理中...' : '承認'}
            </Button>
          )}
          {data.status === 'approved' && !data.is_locked && (
            <Button
              size="sm"
              onClick={() => markPaid.mutate()}
              disabled={markPaid.isPending}
            >
              {markPaid.isPending ? '処理中...' : '支払完了'}
            </Button>
          )}
        </div>
      </div>

      {isExempt && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm font-medium text-yellow-800 mb-1">インボイス制度 経過措置について</p>
          <p className="text-sm text-yellow-700">
            この支払先は免税事業者（インボイス未登録）です。
            令和5年10月1日〜令和8年9月30日の経過措置により、仕入税額控除は消費税額の
            {Math.round(data.deductible_tax_ratio * 100)}%が適用されます。
            控除できない消費税額（{formatYen(data.tax_amount_full - data.deductible_tax_amount)}）は費用として計上されます。
          </p>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">支払先情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500">支払先ID</dt>
              <dd>{data.payee_id}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">事業者区分</dt>
              <dd>{data.is_invoice_registered ? '課税事業者（インボイス登録済）' : '免税事業者（未登録）'}</dd>
            </div>
            {data.invoice_registration_number && (
              <div>
                <dt className="text-xs text-slate-500">インボイス登録番号</dt>
                <dd className="font-mono">{data.invoice_registration_number}</dd>
              </div>
            )}
            {isExempt && (
              <div>
                <dt className="text-xs text-slate-500">経過措置割合</dt>
                <dd>{Math.round(data.deductible_tax_ratio * 100)}%</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">計算内訳</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell className="text-slate-600">所定内実働</TableCell>
                <TableCell className="text-right text-slate-500">{fmtMinutes(data.work_minutes_normal)} × {formatYen(data.unit_price)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatYen(Math.round(normalWorkHours * data.unit_price / 160 * data.work_minutes_normal / data.work_minutes_normal * data.subtotal))}
                </TableCell>
              </TableRow>
              {data.work_minutes_overtime > 0 && (
                <TableRow>
                  <TableCell className="text-slate-600">残業実働（1.25倍）</TableCell>
                  <TableCell className="text-right text-slate-500">{fmtMinutes(data.work_minutes_overtime)} × {formatYen(overtimeUnitPrice)}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatYen(Math.round(overtimeWorkHours * overtimeUnitPrice / 160))}
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-medium">小計</TableCell>
                <TableCell />
                <TableCell className="text-right font-medium">{formatYen(data.subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-slate-600">
                  消費税（{Math.round(data.tax_rate * 100)}%）
                  {isExempt && <span className="ml-1 text-xs text-yellow-600">免税事業者</span>}
                </TableCell>
                <TableCell />
                <TableCell className="text-right">{formatYen(data.tax_amount_full)}</TableCell>
              </TableRow>
              {isExempt && (
                <TableRow>
                  <TableCell className="text-slate-600">
                    控除可能消費税額（経過措置{Math.round(data.deductible_tax_ratio * 100)}%）
                  </TableCell>
                  <TableCell />
                  <TableCell className="text-right">{formatYen(data.deductible_tax_amount)}</TableCell>
                </TableRow>
              )}
              {isFreelancer && data.withholding_tax_amount > 0 && (
                <TableRow>
                  <TableCell className="text-slate-600">源泉徴収額（△）</TableCell>
                  <TableCell />
                  <TableCell className="text-right text-red-600">-{formatYen(data.withholding_tax_amount)}</TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell className="font-bold text-base border-t">実支払額</TableCell>
                <TableCell className="border-t" />
                <TableCell className="text-right font-bold text-base border-t">{formatYen(data.total_payment)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">支払情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-slate-500">支払予定日</dt>
              <dd>{data.scheduled_payment_date}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">実際支払日</dt>
              <dd>{data.actual_payment_date ?? '—'}</dd>
            </div>
            {data.approved_by_name && (
              <div>
                <dt className="text-xs text-slate-500">承認者</dt>
                <dd>{data.approved_by_name}</dd>
              </div>
            )}
            {data.approved_at && (
              <div>
                <dt className="text-xs text-slate-500">承認日時</dt>
                <dd>{data.approved_at.slice(0, 10)}</dd>
              </div>
            )}
          </dl>
          {data.note && (
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-slate-500 mb-1">備考</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.note}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
