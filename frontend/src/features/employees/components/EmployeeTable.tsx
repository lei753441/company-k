import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { Employee, EmployeeStatus } from '@/types/employee'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const statusLabel: Record<EmployeeStatus, string> = {
  active: '在籍',
  on_leave: '休職',
  retiring: '退職予定',
  retired: '退職',
}

const statusVariant: Record<EmployeeStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  on_leave: 'secondary',
  retiring: 'outline',
  retired: 'destructive',
}

const employmentTypeLabel: Record<Employee['employment_type'], string> = {
  full_time: '正社員',
  contract: '契約社員',
  part_time: 'パート',
}

interface Props {
  employees: Employee[]
}

export function EmployeeTable({ employees }: Props) {
  if (employees.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">社員が見つかりません</div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>社員ID</TableHead>
          <TableHead>氏名</TableHead>
          <TableHead>部署</TableHead>
          <TableHead>雇用形態</TableHead>
          <TableHead>入社日</TableHead>
          <TableHead>ステータス</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {employees.map((emp) => (
          <TableRow key={emp.employee_id}>
            <TableCell className="font-mono text-sm">{emp.employee_id}</TableCell>
            <TableCell>
              <Link to={`/employees/${emp.employee_id}`} className="text-blue-600 hover:underline">
                {emp.last_name} {emp.first_name}
              </Link>
              <div className="text-xs text-slate-400">{emp.last_name_kana} {emp.first_name_kana}</div>
            </TableCell>
            <TableCell>{emp.department_name}</TableCell>
            <TableCell>{employmentTypeLabel[emp.employment_type]}</TableCell>
            <TableCell>{format(new Date(emp.hire_date), 'yyyy/MM/dd', { locale: ja })}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[emp.status]}>{statusLabel[emp.status]}</Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
