import { Badge } from '@/components/ui/badge'
import type { TimesheetStatus, AttendanceType, LeaveStatus } from '@/types/attendance'

export const timesheetStatusLabel: Record<TimesheetStatus, string> = {
  draft: '下書き',
  submitted: '提出済み',
  rejected: '差し戻し',
  approved: '承認済み',
  closed: '締め済み',
}

export const attendanceTypeLabel: Record<AttendanceType, string> = {
  NORMAL: '通常',
  OVERTIME: '残業',
  MIDNIGHT: '深夜',
  HOLIDAY_WORK: '休日出勤',
  PAID_LEAVE: '有給',
  HALF_PAID_LEAVE_AM: '午前半休',
  HALF_PAID_LEAVE_PM: '午後半休',
  SPECIAL_LEAVE: '特別休暇',
  ABSENCE: '欠勤',
  COMPENSATORY: '代休',
  REMOTE: 'リモート',
}

export const leaveStatusLabel: Record<LeaveStatus, string> = {
  pending: '申請中',
  approved: '承認済み',
  rejected: '却下',
  cancelled: '取消済み',
}

export function TimesheetStatusBadge({ status }: { status: TimesheetStatus }) {
  const variantMap: Record<TimesheetStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    draft: 'outline',
    submitted: 'secondary',
    rejected: 'destructive',
    approved: 'default',
    closed: 'secondary',
  }
  return <Badge variant={variantMap[status]}>{timesheetStatusLabel[status]}</Badge>
}

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const variantMap: Record<LeaveStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    pending: 'outline',
    approved: 'default',
    rejected: 'destructive',
    cancelled: 'secondary',
  }
  return <Badge variant={variantMap[status]}>{leaveStatusLabel[status]}</Badge>
}
