import type { Department, EmployeeListParams, EmployeeStatus, EmploymentType } from '@/types/employee'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  params: EmployeeListParams
  departments: Department[]
  onChange: (params: EmployeeListParams) => void
}

const ALL = '_all_'

export function EmployeeFilter({ params, departments, onChange }: Props) {
  const update = (patch: Partial<EmployeeListParams>) => onChange({ ...params, ...patch, page: 1 })

  const toSelectValue = (v: string | undefined) => v || ALL
  const fromSelectValue = (v: string) => (v === ALL ? '' : v)

  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
      <div className="flex-1 min-w-48">
        <Label htmlFor="search">氏名・社員ID検索</Label>
        <Input
          id="search"
          placeholder="氏名・社員ID・メールで検索"
          value={params.q ?? ''}
          onChange={(e) => update({ q: e.target.value })}
        />
      </div>

      <div className="w-40">
        <Label htmlFor="status">在籍ステータス</Label>
        <Select
          value={toSelectValue(params.status)}
          onValueChange={(v) => update({ status: fromSelectValue(v) as EmployeeStatus | '' })}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="すべて" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>すべて</SelectItem>
            <SelectItem value="active">在籍</SelectItem>
            <SelectItem value="on_leave">休職</SelectItem>
            <SelectItem value="retiring">退職予定</SelectItem>
            <SelectItem value="retired">退職</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="w-40">
        <Label htmlFor="dept">部署</Label>
        <Select
          value={toSelectValue(params.department_id)}
          onValueChange={(v) => update({ department_id: fromSelectValue(v) })}
        >
          <SelectTrigger id="dept">
            <SelectValue placeholder="すべて" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>すべて</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.department_id} value={d.department_id}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-44">
        <Label htmlFor="employment">雇用形態</Label>
        <Select
          value={toSelectValue(params.employment_type)}
          onValueChange={(v) => update({ employment_type: fromSelectValue(v) as EmploymentType | '' })}
        >
          <SelectTrigger id="employment">
            <SelectValue placeholder="すべて" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>すべて</SelectItem>
            <SelectItem value="full_time">正社員</SelectItem>
            <SelectItem value="contract">契約社員</SelectItem>
            <SelectItem value="part_time">パート/アルバイト</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
