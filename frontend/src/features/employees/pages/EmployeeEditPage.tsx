import { useNavigate, useParams } from 'react-router-dom'
import { EmployeeForm } from '../components/EmployeeForm'
import { useEmployee, useUpdateEmployee } from '../api/employeeApi'
import type { Employee } from '@/types/employee'

export default function EmployeeEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: emp, isLoading } = useEmployee(id!)
  const { mutate, isPending } = useUpdateEmployee(id!)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (!emp) return <div className="py-16 text-center text-red-500">社員が見つかりません</div>

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">社員編集 — {emp.last_name} {emp.first_name}</h1>
      <EmployeeForm
        defaultValues={emp}
        isLoading={isPending}
        submitLabel="更新"
        onSubmit={(data) =>
          mutate(data as Partial<Employee>, {
            onSuccess: () => navigate(`/employees/${id}`),
          })
        }
      />
    </div>
  )
}
