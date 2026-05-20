import { useNavigate } from 'react-router-dom'
import { EmployeeForm } from '../components/EmployeeForm'
import { useCreateEmployee } from '../api/employeeApi'
import type { Employee } from '@/types/employee'

export default function EmployeeNewPage() {
  const navigate = useNavigate()
  const { mutate, isPending } = useCreateEmployee()

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">社員登録</h1>
      <EmployeeForm
        isLoading={isPending}
        onSubmit={(data) =>
          mutate(data as Record<string, unknown>, {
            onSuccess: (emp: Employee) => navigate(`/employees/${emp.employee_id}`),
          })
        }
      />
    </div>
  )
}
