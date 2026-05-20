import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Plus } from 'lucide-react'
import { DepartmentTree } from '../components/DepartmentTree'
import { useDepartments, useCreateDepartment, useUpdateDepartment } from '../api/departmentApi'
import type { Department } from '@/types/employee'

export default function DepartmentPage() {
  const { data, isLoading } = useDepartments()
  const departments = data?.items ?? []
  const [editTarget, setEditTarget] = useState<Partial<Department> | null>(null)

  const { mutate: create, isPending: isCreating } = useCreateDepartment()
  const { mutate: update, isPending: isUpdating } = useUpdateDepartment(editTarget?.department_id ?? '')

  const isNew = editTarget && !editTarget.department_id
  const isPending = isCreating || isUpdating

  const handleSave = () => {
    if (!editTarget?.name) return
    if (isNew) {
      create(
        { name: editTarget.name, parent_department_id: editTarget.parent_department_id ?? null, manager_employee_id: null },
        { onSuccess: () => setEditTarget(null) },
      )
    } else {
      update(
        { name: editTarget.name },
        { onSuccess: () => setEditTarget(null) },
      )
    }
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">部署管理</h1>
        <Button size="sm" onClick={() => setEditTarget({})}>
          <Plus size={16} className="mr-1" />
          新規部署追加
        </Button>
      </div>

      <div className="bg-white border rounded-lg p-4">
        {isLoading && <div className="text-center py-8 text-slate-400">読み込み中...</div>}
        {!isLoading && <DepartmentTree departments={departments} onEdit={setEditTarget} />}
      </div>

      <Sheet open={!!editTarget} onOpenChange={(open) => { if (!open) setEditTarget(null) }}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{isNew ? '新規部署追加' : '部署編集'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 mt-6 p-4">
            <div>
              <Label htmlFor="dept-name">部署名 *</Label>
              <Input
                id="dept-name"
                value={editTarget?.name ?? ''}
                onChange={(e) => setEditTarget((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <Button onClick={handleSave} disabled={isPending || !editTarget?.name}>
              {isPending ? '保存中...' : '保存'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
