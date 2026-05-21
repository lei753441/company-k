import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useWorkflowTasks, useApproveTask, useRejectTask } from '../api/notificationApi'
import type { WorkflowTask, WorkflowType, WorkflowStatus } from '@/types/notification'

const workflowTypeLabel: Record<WorkflowType, string> = {
  timesheet: '勤務表',
  expense: '経費申請',
  contract_renewal: '契約更新',
  invoice: '請求書',
}

const workflowTypeBadgeClass: Record<WorkflowType, string> = {
  timesheet: 'bg-blue-100 text-blue-700',
  expense: 'bg-purple-100 text-purple-700',
  contract_renewal: 'bg-amber-100 text-amber-700',
  invoice: 'bg-green-100 text-green-700',
}

const statusLabel: Record<WorkflowStatus, string> = {
  pending: '承認待ち',
  approved: '承認済み',
  rejected: '差し戻し',
  cancelled: 'キャンセル',
}

const statusBadgeVariant: Record<WorkflowStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'outline',
  approved: 'default',
  rejected: 'destructive',
  cancelled: 'secondary',
}

function WorkflowTypeBadge({ type }: { type: WorkflowType }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${workflowTypeBadgeClass[type]}`}>
      {workflowTypeLabel[type]}
    </span>
  )
}

function ApproveButton({ task }: { task: WorkflowTask }) {
  const approve = useApproveTask(task.id)
  return (
    <Button
      size="sm"
      variant="outline"
      className="text-green-600 border-green-300 hover:bg-green-50"
      onClick={() => approve.mutate()}
      disabled={approve.isPending}
    >
      <CheckCircle size={14} className="mr-1" />
      承認
    </Button>
  )
}

function RejectSheet({ task }: { task: WorkflowTask }) {
  const [open, setOpen] = useState(false)
  const [comment, setComment] = useState('')
  const reject = useRejectTask(task.id)

  const handleReject = () => {
    reject.mutate(
      { comment },
      {
        onSuccess: () => {
          setOpen(false)
          setComment('')
        },
      },
    )
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="text-red-600 border-red-300 hover:bg-red-50"
        onClick={() => setOpen(true)}
      >
        <XCircle size={14} className="mr-1" />
        差し戻し
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>差し戻し理由の入力</SheetTitle>
          </SheetHeader>
          <div className="flex-1 px-4 py-2 space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700 mb-1">対象</p>
              <p className="text-sm text-slate-600">{task.title}</p>
            </div>
            <div>
              <Label htmlFor="reject-comment">差し戻し理由</Label>
              <Textarea
                id="reject-comment"
                className="mt-1"
                rows={4}
                placeholder="差し戻しの理由を入力してください"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          </div>
          <SheetFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={reject.isPending || !comment.trim()}
            >
              差し戻す
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

type Tab = 'pending' | 'done'

export default function WorkflowListPage() {
  const [tab, setTab] = useState<Tab>('pending')

  const pendingQuery = useWorkflowTasks('pending')
  const doneQuery = useWorkflowTasks()

  const pendingItems = pendingQuery.data?.items ?? []
  const doneItems = (doneQuery.data?.items ?? []).filter((t) => t.status !== 'pending')

  const activeItems = tab === 'pending' ? pendingItems : doneItems
  const isLoading = tab === 'pending' ? pendingQuery.isLoading : doneQuery.isLoading
  const isError = tab === 'pending' ? pendingQuery.isError : doneQuery.isError

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">承認タスク一覧</h1>

      <div className="flex gap-0 border-b border-slate-200">
        <button
          onClick={() => setTab('pending')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'pending'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          承認待ち
          {pendingItems.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-xs font-bold">
              {pendingItems.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('done')}
          className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'done'
              ? 'border-slate-800 text-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          処理済み
        </button>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>種別</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>申請者</TableHead>
                <TableHead>期日</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>申請日</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    {tab === 'pending' ? '承認待ちのタスクはありません' : '処理済みのタスクはありません'}
                  </TableCell>
                </TableRow>
              )}
              {activeItems.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <WorkflowTypeBadge type={task.workflow_type} />
                  </TableCell>
                  <TableCell className="text-sm font-medium">{task.title}</TableCell>
                  <TableCell className="text-sm text-slate-600">{task.requester_name}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {task.due_date
                      ? format(new Date(task.due_date), 'M月d日', { locale: ja })
                      : '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant[task.status]}>
                      {statusLabel[task.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(new Date(task.created_at), 'M月d日', { locale: ja })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {task.status === 'pending' && (
                        <>
                          <ApproveButton task={task} />
                          <RejectSheet task={task} />
                        </>
                      )}
                      <Link
                        to={task.link_url}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        詳細へ
                        <ExternalLink size={12} />
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
