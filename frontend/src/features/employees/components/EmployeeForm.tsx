import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDepartments, usePositions } from '../api/departmentApi'
import type { EmploymentType } from '@/types/employee'

const schema = z.object({
  last_name: z.string().min(1, '姓を入力してください'),
  first_name: z.string().min(1, '名を入力してください'),
  last_name_kana: z.string().min(1, '姓（カナ）を入力してください'),
  first_name_kana: z.string().min(1, '名（カナ）を入力してください'),
  birth_date: z.string().min(1, '生年月日を入力してください'),
  email_company: z.string().email('有効なメールアドレスを入力してください'),
  email_private: z.string().email().optional().or(z.literal('')),
  phone_company: z.string().optional(),
  employment_type: z.enum(['full_time', 'contract', 'part_time']),
  hire_date: z.string().min(1, '入社日を入力してください'),
  department_id: z.string().min(1, '部署を選択してください'),
  position_id: z.string().optional(),
})

export type EmployeeFormValues = z.infer<typeof schema>

interface Props {
  defaultValues?: Partial<EmployeeFormValues>
  onSubmit: (data: EmployeeFormValues) => void
  isLoading: boolean
  submitLabel?: string
}

export function EmployeeForm({ defaultValues, onSubmit, isLoading, submitLabel = '登録' }: Props) {
  const { data: deptData } = useDepartments()
  const { data: posData } = usePositions()
  const departments = deptData?.items ?? []
  const positions = posData?.items ?? []

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employment_type: 'full_time',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="last_name">姓 *</Label>
          <Input id="last_name" {...register('last_name')} />
          {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="first_name">名 *</Label>
          <Input id="first_name" {...register('first_name')} />
          {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
        </div>
        <div>
          <Label htmlFor="last_name_kana">姓（カナ） *</Label>
          <Input id="last_name_kana" {...register('last_name_kana')} />
          {errors.last_name_kana && <p className="text-red-500 text-xs mt-1">{errors.last_name_kana.message}</p>}
        </div>
        <div>
          <Label htmlFor="first_name_kana">名（カナ） *</Label>
          <Input id="first_name_kana" {...register('first_name_kana')} />
          {errors.first_name_kana && <p className="text-red-500 text-xs mt-1">{errors.first_name_kana.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="birth_date">生年月日 *</Label>
          <Input id="birth_date" type="date" {...register('birth_date')} />
          {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date.message}</p>}
        </div>
        <div>
          <Label htmlFor="email_company">会社メールアドレス *</Label>
          <Input id="email_company" type="email" {...register('email_company')} />
          {errors.email_company && <p className="text-red-500 text-xs mt-1">{errors.email_company.message}</p>}
        </div>
        <div>
          <Label htmlFor="phone_company">会社携帯番号</Label>
          <Input id="phone_company" {...register('phone_company')} />
        </div>
        <div>
          <Label htmlFor="hire_date">入社日 *</Label>
          <Input id="hire_date" type="date" {...register('hire_date')} />
          {errors.hire_date && <p className="text-red-500 text-xs mt-1">{errors.hire_date.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="employment_type">雇用形態 *</Label>
          <Select
            value={watch('employment_type')}
            onValueChange={(v) => setValue('employment_type', (v ?? '') as EmploymentType)}
          >
            <SelectTrigger id="employment_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full_time">正社員</SelectItem>
              <SelectItem value="contract">契約社員</SelectItem>
              <SelectItem value="part_time">パート/アルバイト</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="department_id">部署 *</Label>
          <Select
            value={watch('department_id') ?? ''}
            onValueChange={(v) => setValue('department_id', v ?? '')}
          >
            <SelectTrigger id="department_id">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.department_id} value={d.department_id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department_id && <p className="text-red-500 text-xs mt-1">{errors.department_id.message}</p>}
        </div>
        <div>
          <Label htmlFor="position_id">役職</Label>
          <Select
            value={watch('position_id') ?? ''}
            onValueChange={(v) => setValue('position_id', v ?? '')}
          >
            <SelectTrigger id="position_id">
              <SelectValue placeholder="選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">なし</SelectItem>
              {positions.map((p) => (
                <SelectItem key={p.position_id} value={p.position_id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" disabled={isLoading}>
        {isLoading ? '処理中...' : submitLabel}
      </Button>
    </form>
  )
}
