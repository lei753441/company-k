import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Plus, Download } from 'lucide-react'
import { EmployeeFilter } from '../components/EmployeeFilter'
import { EmployeeTable } from '../components/EmployeeTable'
import { useEmployees } from '../api/employeeApi'
import { useDepartments } from '../api/departmentApi'
import { useAuthStore } from '@/store/authStore'
import type { EmployeeListParams } from '@/types/employee'

export default function EmployeeListPage() {
  const can = useAuthStore((s) => s.can)
  const [params, setParams] = useState<EmployeeListParams>({ q: '', status: '', page: 1 })
  const { data, isLoading, isError } = useEmployees(params)
  const { data: deptData } = useDepartments()

  const departments = deptData?.items ?? []
  const employees = data?.items ?? []
  const total = data?.total ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">社員一覧</h1>
          {!isLoading && <p className="text-sm text-slate-500">{total}件</p>}
        </div>
        <div className="flex gap-2">
          {can('export_csv') && (
            <Button variant="outline" size="sm">
              <Download size={16} className="mr-1" />
              CSV出力
            </Button>
          )}
          {can('edit_all') && (
            <Button asChild size="sm">
              <Link to="/employees/new">
                <Plus size={16} className="mr-1" />
                新規登録
              </Link>
            </Button>
          )}
        </div>
      </div>

      <EmployeeFilter params={params} departments={departments} onChange={setParams} />

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}
      {!isLoading && !isError && <EmployeeTable employees={employees} />}

      {total > 50 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={(params.page ?? 1) <= 1}
            onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
          >
            前へ
          </Button>
          <span className="px-4 py-2 text-sm">{params.page ?? 1} / {Math.ceil(total / 50)}</span>
          <Button
            variant="outline"
            size="sm"
            disabled={(params.page ?? 1) >= Math.ceil(total / 50)}
            onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
          >
            次へ
          </Button>
        </div>
      )}
    </div>
  )
}
