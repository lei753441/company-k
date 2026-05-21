import type { PartnerStatus, InvoiceRegistrationStatus } from '@/types/partner'

export const partnerStatusLabel: Record<PartnerStatus, string> = {
  active: '取引中',
  dormant: '休眠',
  suspended: '取引停止',
}

const partnerStatusColor: Record<PartnerStatus, string> = {
  active: 'bg-green-100 text-green-700',
  dormant: 'bg-slate-100 text-slate-600',
  suspended: 'bg-red-100 text-red-600',
}

export function PartnerStatusBadge({ status }: { status: PartnerStatus }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${partnerStatusColor[status]}`}>
      {partnerStatusLabel[status]}
    </span>
  )
}

export const invoiceRegistrationLabel: Record<InvoiceRegistrationStatus, string> = {
  registered: '登録済',
  pending: '申請中',
  not_registered: '未登録',
}

const invoiceRegistrationColor: Record<InvoiceRegistrationStatus, string> = {
  registered: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  not_registered: 'bg-red-100 text-red-700',
}

export function InvoiceRegistrationBadge({ status }: { status: InvoiceRegistrationStatus }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${invoiceRegistrationColor[status]}`}>
      {invoiceRegistrationLabel[status]}
    </span>
  )
}

export type AvailabilityStatus = 'available' | 'available_soon' | 'in_project' | 'unavailable'

export const availabilityLabel: Record<AvailabilityStatus, string> = {
  available: '即稼働可',
  available_soon: '稼働間近',
  in_project: '参画中',
  unavailable: '稼働不可',
}

const availabilityColor: Record<AvailabilityStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700',
  available_soon: 'bg-blue-100 text-blue-700',
  in_project: 'bg-purple-100 text-purple-700',
  unavailable: 'bg-slate-100 text-slate-500',
}

export function AvailabilityBadge({ status }: { status: AvailabilityStatus }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${availabilityColor[status]}`}>
      {availabilityLabel[status]}
    </span>
  )
}
