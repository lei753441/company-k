import { useState } from 'react'
import { ChevronRight, ChevronDown, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Department } from '@/types/employee'

interface NodeProps {
  dept: Department
  children: Department[]
  onEdit: (d: Department) => void
}

function DeptNode({ dept, children, onEdit }: NodeProps) {
  const [open, setOpen] = useState(true)
  const hasChildren = children.length > 0

  return (
    <div>
      <div className="flex items-center gap-2 py-2 px-3 rounded hover:bg-slate-50 group">
        {hasChildren ? (
          <button onClick={() => setOpen((o) => !o)} className="text-slate-400">
            {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-[14px]" />
        )}
        <button
          className="flex-1 text-left text-sm font-medium"
          onClick={() => onEdit(dept)}
        >
          {dept.name}
        </button>
        <Button
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
          onClick={() => onEdit(dept)}
        >
          <Pencil size={12} />
        </Button>
      </div>
      {hasChildren && open && (
        <div className="ml-6 border-l pl-2">
          {children.map((child) => (
            <DeptNode key={child.department_id} dept={child} children={[]} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  )
}

interface Props {
  departments: Department[]
  onEdit: (dept: Department) => void
}

export function DepartmentTree({ departments, onEdit }: Props) {
  const roots = departments.filter((d) => !d.parent_department_id)
  const childrenOf = (parentId: string) => departments.filter((d) => d.parent_department_id === parentId)

  if (roots.length === 0) {
    return <div className="text-center py-8 text-slate-400">部署がありません</div>
  }

  return (
    <div className="space-y-1">
      {roots.map((dept) => (
        <DeptNode key={dept.department_id} dept={dept} children={childrenOf(dept.department_id)} onEdit={onEdit} />
      ))}
    </div>
  )
}
