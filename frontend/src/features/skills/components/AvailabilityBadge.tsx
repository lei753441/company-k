import type { WorkAvailabilityStatus } from '@/types/skill'

export const availabilityLabel: Record<WorkAvailabilityStatus, string> = {
  assigned_client: '客先常駐中',
  assigned_internal: '社内案件中',
  available: '待機中',
  available_soon: '空き予定あり',
  on_leave: '休職中',
  training: '研修中',
}

const availabilityColor: Record<WorkAvailabilityStatus, string> = {
  assigned_client: 'bg-blue-100 text-blue-700',
  assigned_internal: 'bg-indigo-100 text-indigo-700',
  available: 'bg-green-100 text-green-700',
  available_soon: 'bg-yellow-100 text-yellow-700',
  on_leave: 'bg-slate-100 text-slate-600',
  training: 'bg-teal-100 text-teal-700',
}

interface Props {
  status: WorkAvailabilityStatus
  className?: string
}

export function AvailabilityBadge({ status, className = '' }: Props) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${availabilityColor[status]} ${className}`}>
      {availabilityLabel[status]}
    </span>
  )
}
