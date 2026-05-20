import { Link } from 'react-router-dom'
import { useFollowUpList, useUpdateInteraction } from '../api/customerApi'
import { InteractionTypeIcon } from '../components/CompanyStatusBadge'
import { format, isPast, isToday } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import type { Interaction } from '@/types/customer'

type FollowUpItem = Interaction & { company_name: string }

function MarkDoneButton({ companyId, interactionId }: { companyId: string; interactionId: string }) {
  const update = useUpdateInteraction(companyId, interactionId)
  return (
    <Button
      size="sm"
      variant="outline"
      className="shrink-0 gap-1"
      disabled={update.isPending}
      onClick={() => update.mutate({ follow_up_date: null })}
    >
      <CheckCircle size={14} />
      完了
    </Button>
  )
}

function FollowUpCard({ item }: { item: FollowUpItem }) {
  const dueDate = new Date(item.follow_up_date!)
  const overdue = isPast(dueDate) && !isToday(dueDate)
  const dueToday = isToday(dueDate)

  return (
    <div
      className={`bg-white rounded-lg border p-4 flex items-start gap-4 ${overdue ? 'border-red-300 bg-red-50' : dueToday ? 'border-yellow-300 bg-yellow-50' : ''}`}
    >
      <div className="mt-0.5">
        <InteractionTypeIcon type={item.interaction_type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <Link to={`/customers/${item.company_id}`} className="font-medium hover:underline text-slate-800">
            {item.company_name}
          </Link>
          {overdue && <Badge variant="destructive" className="text-xs">期限超過</Badge>}
          {dueToday && <Badge className="text-xs bg-yellow-500 hover:bg-yellow-600">本日期限</Badge>}
        </div>
        <p className="text-sm font-medium text-slate-700">{item.subject}</p>
        <p className="text-sm text-slate-500 line-clamp-1">{item.content}</p>
        {item.next_action && (
          <p className="text-sm text-slate-700 mt-1">
            <span className="font-medium">次のアクション: </span>{item.next_action}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-1">
          期日: {format(dueDate, 'M月d日(E)', { locale: ja })}
          {'　'}記録日: {format(new Date(item.interacted_at), 'M月d日', { locale: ja })}
        </p>
      </div>
      <MarkDoneButton companyId={item.company_id} interactionId={item.id} />
    </div>
  )
}

export default function FollowUpPage() {
  const { data, isLoading, isError } = useFollowUpList()
  const items = data?.items ?? []

  if (isLoading) return <div className="text-center py-16 text-slate-400">読み込み中...</div>
  if (isError) return <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">フォローアップ管理</h1>
        <span className="text-sm text-slate-500">{items.length} 件</span>
      </div>

      {items.length === 0 && (
        <div className="text-center py-16 text-slate-400 bg-white rounded-lg border">
          フォローアップ対象はありません
        </div>
      )}

      <div className="space-y-3">
        {items.map((item) => (
          <FollowUpCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  )
}
