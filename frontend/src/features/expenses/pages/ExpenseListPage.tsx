import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ExpenseStatusBadge, expenseStatusLabel } from '../components/ExpenseBadge'
import { useExpenseReports, useCreateExpenseReport } from '../api/expenseApi'
import type { ExpenseListParams, ExpenseStatus } from '@/types/expense'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const ALL = '_all_'

const createSchema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  year_month: z.string().min(1, '対象年月を入力してください'),
  project_id: z.string().optional(),
})
type CreateVals = z.infer<typeof createSchema>

export default function ExpenseListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<ExpenseListParams>({ year_month: '', status: '', page: 1 })
  const [sheetOpen, setSheetOpen] = useState(false)
  const { data, isLoading, isError } = useExpenseReports(params)
  const createReport = useCreateExpenseReport()

  const items = data?.items ?? []

  const update = (patch: Partial<ExpenseListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<CreateVals>({
    resolver: zodResolver(createSchema),
    defaultValues: { title: '', year_month: '', project_id: '' },
  })

  const onSubmit = async (vals: CreateVals) => {
    const result = await createReport.mutateAsync({
      title: vals.title,
      year_month: vals.year_month,
      project_id: vals.project_id || undefined,
    })
    reset()
    setSheetOpen(false)
    navigate(`/expenses/${result.id}`)
  }

  const statusOrder: ExpenseStatus[] = ['draft', 'submitted', 'approved', 'rejected', 'paid']
  const statusCounts = data?.status_counts ?? {}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">経費申請一覧</h1>
        <Button size="sm" onClick={() => setSheetOpen(true)}>
          <Plus size={14} className="mr-1" />新規申請
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update({ status: '' })}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${!params.status ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}
        >
          すべて ({data?.total ?? 0})
        </button>
        {statusOrder.map((s) =>
          statusCounts[s] ? (
            <button
              key={s}
              onClick={() => update({ status: s })}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${params.status === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}
            >
              {expenseStatusLabel[s]} ({statusCounts[s]})
            </button>
          ) : null,
        )}
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="w-44">
          <Label>対象年月</Label>
          <Input
            type="month"
            value={params.year_month ?? ''}
            onChange={(e) => update({ year_month: e.target.value })}
          />
        </div>
        <div className="w-36">
          <Label>ステータス</Label>
          <Select
            value={params.status || ALL}
            onValueChange={(v) => update({ status: v === ALL ? '' : (v as ExpenseStatus) })}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {statusOrder.map((s) => (
                <SelectItem key={s} value={s}>{expenseStatusLabel[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>タイトル</TableHead>
                <TableHead>対象年月</TableHead>
                <TableHead>案件名</TableHead>
                <TableHead className="text-center">件数</TableHead>
                <TableHead className="text-right">合計金額</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>提出日</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    申請が見つかりません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link to={`/expenses/${item.id}`} className="font-medium hover:underline">
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm">{item.year_month}</TableCell>
                  <TableCell className="text-sm text-slate-600">{item.project_name ?? '—'}</TableCell>
                  <TableCell className="text-center text-sm">{item.item_count}</TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    ¥{item.total_amount.toLocaleString()}
                  </TableCell>
                  <TableCell><ExpenseStatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {item.submitted_at
                      ? format(new Date(item.submitted_at), 'M月d日', { locale: ja })
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={(o) => !o && setSheetOpen(false)}>
        <SheetContent>
          <SheetHeader><SheetTitle>新規経費申請</SheetTitle></SheetHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div>
              <Label>タイトル *</Label>
              <Input {...register('title')} placeholder="例: 2026年5月経費申請" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <Label>対象年月 *</Label>
              <Input type="month" {...register('year_month')} />
              {errors.year_month && <p className="text-red-500 text-xs mt-1">{errors.year_month.message}</p>}
            </div>
            <div>
              <Label>案件名（任意）</Label>
              <Input {...register('project_id')} placeholder="案件名を入力" />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createReport.isPending}>
                {createReport.isPending ? '作成中...' : '作成'}
              </Button>
              <Button type="button" variant="outline" onClick={() => { setSheetOpen(false); reset() }}>
                キャンセル
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
