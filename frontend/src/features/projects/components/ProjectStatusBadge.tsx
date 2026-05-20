import type { ProjectStatus } from '@/types/project'

export const statusLabel: Record<ProjectStatus, string> = {
  negotiating: '商談中',
  proposing: '提案中',
  ordered: '受注',
  in_progress: '進行中',
  completed: '完了',
  lost: '失注',
  cancelled: '中止',
}

const statusColor: Record<ProjectStatus, string> = {
  negotiating: 'bg-slate-100 text-slate-600',
  proposing: 'bg-blue-100 text-blue-700',
  ordered: 'bg-indigo-100 text-indigo-700',
  in_progress: 'bg-green-100 text-green-700',
  completed: 'bg-teal-100 text-teal-700',
  lost: 'bg-red-100 text-red-600',
  cancelled: 'bg-orange-100 text-orange-600',
}

interface Props {
  status: ProjectStatus
  className?: string
}

export function ProjectStatusBadge({ status, className = '' }: Props) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[status]} ${className}`}>
      {statusLabel[status]}
    </span>
  )
}

// valid next statuses for each current status
export const nextStatuses: Record<ProjectStatus, ProjectStatus[]> = {
  negotiating: ['proposing', 'lost'],
  proposing: ['ordered', 'lost'],
  ordered: ['in_progress', 'cancelled'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  lost: [],
  cancelled: [],
}

export const requiresReason: ProjectStatus[] = ['lost', 'cancelled']
