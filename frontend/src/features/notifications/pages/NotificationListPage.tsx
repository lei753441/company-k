import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  CheckCircle,
  XCircle,
  FileText,
  DollarSign,
  RefreshCw,
  Receipt,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { useNotifications, useMarkRead, useMarkAllRead } from '../api/notificationApi'
import type { Notification, NotificationType } from '@/types/notification'

const typeIcon: Record<NotificationType, React.ReactNode> = {
  timesheet_submitted: <FileText size={18} className="text-blue-500" />,
  timesheet_approved: <CheckCircle size={18} className="text-green-500" />,
  timesheet_rejected: <XCircle size={18} className="text-red-500" />,
  expense_submitted: <DollarSign size={18} className="text-blue-500" />,
  expense_approved: <CheckCircle size={18} className="text-green-500" />,
  expense_rejected: <XCircle size={18} className="text-red-500" />,
  contract_renewal: <RefreshCw size={18} className="text-amber-500" />,
  invoice_approved: <Receipt size={18} className="text-green-500" />,
  followup_due: <Calendar size={18} className="text-orange-500" />,
  system: <AlertCircle size={18} className="text-slate-500" />,
}

function NotificationRow({ notification }: { notification: Notification }) {
  const navigate = useNavigate()
  const markRead = useMarkRead(notification.id)

  const handleClick = () => {
    if (!notification.is_read) {
      markRead.mutate()
    }
    if (notification.link_url) {
      navigate(notification.link_url)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left flex items-start gap-4 px-5 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 ${
        !notification.is_read ? 'border-l-4 border-l-blue-500 bg-blue-50/50 hover:bg-blue-50' : ''
      }`}
    >
      <div className="mt-0.5 shrink-0">{typeIcon[notification.type]}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={`text-sm ${!notification.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
            {notification.title}
          </p>
          {!notification.is_read && (
            <span className="shrink-0 w-2 h-2 rounded-full bg-blue-500" />
          )}
        </div>
        <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{notification.body}</p>
        <p className="text-xs text-slate-400 mt-1">
          {format(new Date(notification.created_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
        </p>
      </div>
      {notification.link_url && (
        <span className="shrink-0 text-xs text-blue-500 mt-1">詳細 &rarr;</span>
      )}
    </button>
  )
}

export default function NotificationListPage() {
  const [unreadOnly, setUnreadOnly] = useState(false)
  const { data, isLoading, isError } = useNotifications()
  const markAllRead = useMarkAllRead()

  const all = data?.items ?? []
  const items = unreadOnly ? all.filter((n) => !n.is_read) : all
  const unread_count = data?.unread_count ?? 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">通知一覧</h1>
          {unread_count > 0 && (
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-500 text-white text-xs font-bold">
              {unread_count}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
              className="rounded"
            />
            未読のみ表示
          </label>
          {unread_count > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending}
            >
              <Bell size={14} className="mr-1" />
              すべて既読にする
            </Button>
          )}
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          {items.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              {unreadOnly ? '未読の通知はありません' : '通知はありません'}
            </div>
          ) : (
            items.map((n) => <NotificationRow key={n.id} notification={n} />)
          )}
        </div>
      )}
    </div>
  )
}
