import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { RetireRequest } from '@/types/employee'

const schema = z.object({
  retirement_date: z.string().min(1, '退職日を入力してください'),
  retirement_reason: z.enum(['voluntary', 'company', 'mandatory', 'expiry', 'other']),
  retirement_note: z.string().optional().default(''),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSubmit: (data: RetireRequest) => void
  isLoading: boolean
}

export function RetireForm({ onSubmit, isLoading }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: { retirement_reason: 'voluntary', retirement_note: '' },
  })

  return (
    <form onSubmit={handleSubmit((d) => onSubmit(d as unknown as RetireRequest))} className="space-y-4">
      <div>
        <Label htmlFor="retirement_date">退職日 *</Label>
        <Input id="retirement_date" type="date" {...register('retirement_date')} />
        {errors.retirement_date && <p className="text-red-500 text-xs mt-1">{errors.retirement_date.message}</p>}
      </div>
      <div>
        <Label htmlFor="retirement_reason">退職区分 *</Label>
        <Select
          value={watch('retirement_reason')}
          onValueChange={(v) => setValue('retirement_reason', (v ?? '') as FormValues['retirement_reason'])}
        >
          <SelectTrigger id="retirement_reason">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="voluntary">自己都合</SelectItem>
            <SelectItem value="company">会社都合</SelectItem>
            <SelectItem value="mandatory">定年</SelectItem>
            <SelectItem value="expiry">契約満了</SelectItem>
            <SelectItem value="other">その他</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="retirement_note">備考</Label>
        <Textarea id="retirement_note" {...register('retirement_note')} rows={3} />
      </div>
      <Button type="submit" variant="destructive" disabled={isLoading}>
        {isLoading ? '処理中...' : '退職処理を確定する'}
      </Button>
    </form>
  )
}
