import { Badge } from '@/components/ui/badge'
import type { InvoiceStatus, PaymentRecordStatus } from '@/types/billing'

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  draft: 'ドラフト',
  pending_approval: '承認待ち',
  sent: '送付済',
  partially_paid: '一部入金',
  paid: '入金済',
  overdue: '未入金',
  cancelled: 'キャンセル',
}

export const paymentStatusLabel: Record<PaymentRecordStatus, string> = {
  calculating: '計算中',
  pending_review: '確認待ち',
  approved: '承認済',
  transfer_ready: '振込準備中',
  paid: '支払済',
  on_hold: '保留',
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const variantMap: Record<InvoiceStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'outline',
    pending_approval: 'secondary',
    sent: 'secondary',
    partially_paid: 'secondary',
    paid: 'default',
    overdue: 'destructive',
    cancelled: 'outline',
  }
  return <Badge variant={variantMap[status]}>{invoiceStatusLabel[status]}</Badge>
}

export function PaymentStatusBadge({ status }: { status: PaymentRecordStatus }) {
  const variantMap: Record<PaymentRecordStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    calculating: 'outline',
    pending_review: 'secondary',
    approved: 'secondary',
    transfer_ready: 'secondary',
    paid: 'default',
    on_hold: 'destructive',
  }
  return <Badge variant={variantMap[status]}>{paymentStatusLabel[status]}</Badge>
}

export function formatYen(n: number): string {
  return `¥${n.toLocaleString()}`
}
