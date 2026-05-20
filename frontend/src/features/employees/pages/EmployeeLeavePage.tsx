import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { LeaveForm } from '../components/LeaveForm'
import { useEmployee, useLeaveEmployee, useReturnEmployee } from '../api/employeeApi'
import type { LeaveRequest } from '@/types/employee'

export default function EmployeeLeavePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: emp, isLoading } = useEmployee(id!)
  const { mutate: submitLeave, isPending: isLeavePending } = useLeaveEmployee(id!)
  const { mutate: returnFromLeave, isPending: isReturnPending } = useReturnEmployee(id!)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (!emp) return <div className="py-16 text-center text-red-500">社員が見つかりません</div>

  const isOnLeave = emp.status === 'on_leave'

  const handleLeave = (data: LeaveRequest) =>
    submitLeave(data, { onSuccess: () => navigate(`/employees/${id}`) })

  const handleReturn = () =>
    returnFromLeave(undefined, { onSuccess: () => navigate(`/employees/${id}`) })

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">休職管理</h1>
        <p className="text-slate-600 mt-1">
          <span className="font-semibold">{emp.last_name} {emp.first_name}</span>（{emp.employee_id}）
        </p>
      </div>

      {isOnLeave ? (
        <div className="space-y-4">
          <p className="text-sm p-3 bg-blue-50 text-blue-700 rounded">
            現在休職中です。復職する場合は下のボタンをクリックしてください。
          </p>
          <Button variant="outline" disabled={isReturnPending} onClick={handleReturn}>
            {isReturnPending ? '処理中...' : '復職処理'}
          </Button>
        </div>
      ) : (
        <LeaveForm onSubmit={handleLeave} isLoading={isLeavePending} />
      )}
    </div>
  )
}
