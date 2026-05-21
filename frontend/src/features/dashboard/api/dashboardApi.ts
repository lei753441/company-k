import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

interface Followup {
  id: string
  company_name: string
  subject: string
  follow_up_date: string
  interaction_type: string
}

export interface AdminDashboard {
  headcount: { total: number; in_project: number; available: number; leave: number }
  billing_summary: { invoiced: number; received: number; payment_due: number }
  project_pipeline: { proposing: number; negotiating: number; contracted: number; in_progress: number }
  pending_approvals: { timesheets: number; expenses: number }
  followups: Followup[]
}

export interface EmployeeDashboard {
  today_clock: { clock_in: string | null; clock_out: string | null; status: string }
  monthly_work: { total_minutes: number; overtime_minutes: number; paid_leave_remaining: number }
  timesheet: { id: string | null; status: string | null; year_month: string }
  active_projects: { id: string; name: string; customer_name: string; end_date: string }[]
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => api.get<AdminDashboard>('/api/dashboard/admin'),
  })
}

export function useEmployeeDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'employee'],
    queryFn: () => api.get<EmployeeDashboard>('/api/dashboard/employee'),
  })
}
