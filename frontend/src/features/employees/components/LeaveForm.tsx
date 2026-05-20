import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { LeaveRequest } from '@/types/employee'

const schema = z.object({
  leave_start_date: z.string().min(1, '休職開始日を入力してください'),
  leave_end_date: z.string().min(1, '休職予定終了日を入力してください'),
  leave_reason: z.string().min(1, '休職事由を入力してください'),
}).refine((d) => d.leave_end_date >= d.leave_start_date, {
  message: '終了日は開始日以降にしてください',
  path: ['leave_end_date'],
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (data: LeaveRequest) => void
  isLoading: boolean
}

export function LeaveForm({ onSubmit, isLoading }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="leave_start_date">休職開始日 *</Label>
        <Input id="leave_start_date" type="date" {...register('leave_start_date')} />
        {errors.leave_start_date && <p className="text-red-500 text-xs mt-1">{errors.leave_start_date.message}</p>}
      </div>
      <div>
        <Label htmlFor="leave_end_date">休職予定終了日 *</Label>
        <Input id="leave_end_date" type="date" {...register('leave_end_date')} />
        {errors.leave_end_date && <p className="text-red-500 text-xs mt-1">{errors.leave_end_date.message}</p>}
      </div>
      <div>
        <Label htmlFor="leave_reason">休職事由 *</Label>
        <Textarea id="leave_reason" {...register('leave_reason')} rows={3} />
        {errors.leave_reason && <p className="text-red-500 text-xs mt-1">{errors.leave_reason.message}</p>}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? '処理中...' : '休職登録'}
      </Button>
    </form>
  )
}
