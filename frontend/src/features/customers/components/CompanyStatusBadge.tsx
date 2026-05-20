import type { CompanyStatus, CompanyType, InteractionType } from '@/types/customer'

export const companyStatusLabel: Record<CompanyStatus, string> = {
  prospect: '見込み',
  active: '取引中',
  dormant: '休眠',
  suspended: '取引停止',
}

const companyStatusColor: Record<CompanyStatus, string> = {
  prospect: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  dormant: 'bg-slate-100 text-slate-600',
  suspended: 'bg-red-100 text-red-600',
}

export const companyTypeLabel: Record<CompanyType, string> = {
  customer: '顧客',
  partner: '取引先',
  both: '顧客/取引先',
}

export const interactionTypeLabel: Record<InteractionType, string> = {
  meeting: '対面MTG',
  online: 'オンラインMTG',
  phone: '電話',
  email: 'メール',
  other: 'その他',
}

const interactionTypeIcon: Record<InteractionType, string> = {
  meeting: '🤝',
  online: '💻',
  phone: '📞',
  email: '✉️',
  other: '📝',
}

interface StatusProps {
  status: CompanyStatus
  className?: string
}

export function CompanyStatusBadge({ status, className = '' }: StatusProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${companyStatusColor[status]} ${className}`}>
      {companyStatusLabel[status]}
    </span>
  )
}

interface TypeProps {
  type: CompanyType
}

export function CompanyTypeBadge({ type }: TypeProps) {
  const color =
    type === 'customer'
      ? 'bg-indigo-50 text-indigo-600'
      : type === 'partner'
        ? 'bg-teal-50 text-teal-600'
        : 'bg-purple-50 text-purple-600'
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${color}`}>
      {companyTypeLabel[type]}
    </span>
  )
}

interface InteractionIconProps {
  type: InteractionType
}

export function InteractionTypeIcon({ type }: InteractionIconProps) {
  return (
    <span title={interactionTypeLabel[type]} className="text-base">
      {interactionTypeIcon[type]}
    </span>
  )
}
