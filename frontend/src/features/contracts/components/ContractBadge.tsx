import type { ContractStatus, ContractType } from '@/types/contract'

export const contractStatusLabel: Record<ContractStatus, string> = {
  draft: '下書き',
  signing: '署名依頼中',
  active: '有効',
  renewal_due: '更新待ち',
  expired: '終了',
  cancelled: '解約',
  void: '無効',
}

const contractStatusColor: Record<ContractStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  signing: 'bg-blue-100 text-blue-700',
  active: 'bg-green-100 text-green-700',
  renewal_due: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-slate-200 text-slate-500',
  cancelled: 'bg-red-100 text-red-600',
  void: 'bg-slate-100 text-slate-400',
}

export const contractTypeLabel: Record<ContractType, string> = {
  ses_commission: '準委任',
  lump_sum: '請負',
  outsource_company: '業務委託(法人)',
  outsource_freelancer: '業務委託(個人)',
}

const contractTypeColor: Record<ContractType, string> = {
  ses_commission: 'bg-indigo-50 text-indigo-600',
  lump_sum: 'bg-purple-50 text-purple-600',
  outsource_company: 'bg-teal-50 text-teal-600',
  outsource_freelancer: 'bg-orange-50 text-orange-600',
}

interface StatusProps {
  status: ContractStatus
  className?: string
}

export function ContractStatusBadge({ status, className = '' }: StatusProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${contractStatusColor[status]} ${className}`}>
      {contractStatusLabel[status]}
    </span>
  )
}

interface TypeProps {
  type: ContractType
  className?: string
}

export function ContractTypeBadge({ type, className = '' }: TypeProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${contractTypeColor[type]} ${className}`}>
      {contractTypeLabel[type]}
    </span>
  )
}

interface ExpiryProps {
  days: number | null
}

export function ExpiryBadge({ days }: ExpiryProps) {
  if (days === null) return null

  if (days < 0) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
        {Math.abs(days)}日超過
      </span>
    )
  }
  if (days <= 30) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
        残{days}日
      </span>
    )
  }
  if (days <= 60) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-orange-700">
        残{days}日
      </span>
    )
  }
  if (days <= 90) {
    return (
      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">
        残{days}日
      </span>
    )
  }
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 text-slate-600">
      残{days}日
    </span>
  )
}
