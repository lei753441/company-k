import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ExpenseStatusBadge,
  ExpenseCategoryIcon,
  expenseCategoryLabel,
} from '../components/ExpenseBadge'
import {
  useExpenseReport,
  useSubmitExpenseReport,
  useApproveExpenseReport,
  useRejectExpenseReport,
} from '../api/expenseApi'
import { useAuthStore } from '@/store/authStore'

const paymentMethodLabel: Record<string, string> = {
  personal: '個人立替',
  corporate_card: '法人カード',
}

export default function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const can = useAuthStore((s) => s.can)
  const isAdmin = can('edit_all')

  const { data, isLoading, isError } = useExpenseReport(id!)
  const submit = useSubmitExpenseReport(id!)
  const approve = useApproveExpenseReport(id!)
  const reject = useRejectExpenseReport(id!)

  const [rejectSheet, setRejectSheet] = useState(false)
  const { register, handleSubmit, reset } = useForm<{ comment: string }>({
    defaultValues: { comment: '' },
  })

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">申請が見つかりません</div>

  const canSubmit = data.status === 'draft'
  const canApprove = isAdmin && data.status === 'submitted'

  const onReject = async (vals: { comment: string }) => {
    await reject.mutateAsync({ comment: vals.comment })
    reset()
    setRejectSheet(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{data.title}</h1>
          <p className="text-slate-500 text-sm mt-1">
            {data.user_name} / {data.year_month}
            {data.project_name && ` / ${data.project_name}`}
          </p>
          <div className="mt-2 flex items-center gap-3">
            <ExpenseStatusBadge status={data.status} />
            <span className="text-sm text-slate-500">{data.id}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {canSubmit && (
            <Button onClick={() => submit.mutate()} disabled={submit.isPending}>
              {submit.isPending ? '提出中...' : '提出'}
            </Button>
          )}
          {canApprove && (
            <>
              <Button onClick={() => approve.mutate({ comment: '' })} disabled={approve.isPending}>
                {approve.isPending ? '承認中...' : '承認'}
              </Button>
              <Button variant="outline" onClick={() => setRejectSheet(true)}>差し戻し</Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">申請サマリー</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <dt className="text-xs text-slate-500">対象年月</dt>
              <dd className="text-lg font-semibold">{data.year_month}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">明細件数</dt>
              <dd className="text-lg font-semibold">{data.items.length}件</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">合計金額</dt>
              <dd className="text-lg font-semibold">¥{data.total_amount.toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">ステータス</dt>
              <dd className="mt-1"><ExpenseStatusBadge status={data.status} /></dd>
            </div>
          </dl>
          {data.approver_comment && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-slate-500">
                承認者コメント（{data.approved_by_name}）
              </p>
              <p className="text-sm mt-1">{data.approver_comment}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">明細一覧（{data.items.length}件）</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>日付</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead>摘要</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead>支払方法</TableHead>
                  <TableHead>備考</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                      明細なし
                    </TableCell>
                  </TableRow>
                )}
                {data.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-sm">{item.date}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1 text-sm">
                        <ExpenseCategoryIcon category={item.category} />
                        {expenseCategoryLabel[item.category]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">{item.description}</TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      ¥{item.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {paymentMethodLabel[item.payment_method]}
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">{item.note ?? '—'}</TableCell>
                  </TableRow>
                ))}
                {data.items.length > 0 && (
                  <TableRow className="bg-slate-50 font-semibold">
                    <TableCell colSpan={3} className="text-right text-sm">合計</TableCell>
                    <TableCell className="text-right text-sm">
                      ¥{data.total_amount.toLocaleString()}
                    </TableCell>
                    <TableCell colSpan={2} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Sheet open={rejectSheet} onOpenChange={(o) => !o && setRejectSheet(false)}>
        <SheetContent>
          <SheetHeader><SheetTitle>差し戻し</SheetTitle></SheetHeader>
          <form onSubmit={handleSubmit(onReject)} className="space-y-4 mt-4">
            <div>
              <Label>差し戻し理由</Label>
              <Textarea
                {...register('comment')}
                placeholder="差し戻しの理由を入力してください"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="destructive" disabled={reject.isPending}>
                {reject.isPending ? '処理中...' : '差し戻し'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setRejectSheet(false)}>
                キャンセル
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
