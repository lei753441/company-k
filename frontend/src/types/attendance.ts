export type AttendanceType = 'NORMAL' | 'OVERTIME' | 'MIDNIGHT' | 'HOLIDAY_WORK' | 'PAID_LEAVE' | 'HALF_PAID_LEAVE_AM' | 'HALF_PAID_LEAVE_PM' | 'SPECIAL_LEAVE' | 'ABSENCE' | 'COMPENSATORY' | 'REMOTE'
export type TimesheetStatus = 'draft' | 'submitted' | 'rejected' | 'approved' | 'closed'
export type LeaveType = 'paid' | 'special' | 'compensatory' | 'absence' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type WorkLocation = 'office' | 'remote' | 'client'

export interface DailyRecord {
  id: string
  user_id: string
  date: string
  attendance_type: AttendanceType
  clock_in: string | null
  clock_out: string | null
  break_minutes: number
  actual_work_minutes: number
  overtime_minutes: number
  work_location: WorkLocation
  project_id: string | null
  note: string | null
  is_adjusted: boolean
}

export interface MonthlyTimesheet {
  id: string
  user_id: string
  user_name: string
  year_month: string
  project_id: string | null
  project_name: string | null
  status: TimesheetStatus
  submitted_at: string | null
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  total_work_days: number
  total_work_minutes: number
  total_overtime_minutes: number
  paid_leave_days: number
  comment: string | null
  approver_comment: string | null
  is_locked: boolean
  records: DailyRecord[]
  created_at: string
  updated_at: string
}

export interface MonthlyTimesheetListItem {
  id: string
  user_id: string
  user_name: string
  year_month: string
  project_name: string | null
  status: TimesheetStatus
  total_work_days: number
  total_work_minutes: number
  total_overtime_minutes: number
  submitted_at: string | null
}

export interface LeaveRequest {
  id: string
  user_id: string
  user_name: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  half_day: 'AM' | 'PM' | null
  reason: string | null
  status: LeaveStatus
  approved_by: string | null
  approved_by_name: string | null
  approved_at: string | null
  approver_comment: string | null
  created_at: string
  updated_at: string
}

export interface PaidLeaveBalance {
  user_id: string
  user_name: string
  granted_days: number
  used_days: number
  remaining_days: number
  expiry_date: string
}

export interface TodayClock {
  clock_in: string | null
  clock_out: string | null
  break_minutes: number
  status: 'not_started' | 'working' | 'break' | 'finished'
}

export interface TimesheetListParams {
  year_month?: string
  status?: TimesheetStatus | ''
  user_id?: string
  page?: number
}

export interface MonthlySummary {
  year_month: string
  total_employees: number
  submitted_count: number
  approved_count: number
  pending_count: number
  items: {
    user_id: string
    user_name: string
    total_work_minutes: number
    total_overtime_minutes: number
    paid_leave_days: number
    status: TimesheetStatus
  }[]
}
