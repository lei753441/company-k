import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { useNotifications, useMarkRead, useMarkAllRead } from '../api/notificationApi'
import type { Notification } from '@/types/notification'

function NotificationItem({ notification, onClose }: { notification: Notification; onClose: () => void }) {
  const navigate = useNavigate()
  const markRead = useMarkRead(notification.id)

  const handleClick = () => {
    if (!notification.is_read) {
      markRead.mutate()
    }
    onClose()
    if (notification.link_url) {
      navigate(notification.link_url)
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 transition-colors ${
        !notification.is_read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {!notification.is_read && (
          <span className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-blue-500" />
        )}
        <div className={!notification.is_read ? '' : 'pl-4'}>
          <p className="text-sm font-medium text-slate-800 line-clamp-1">{notification.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notification.body}</p>
          <p className="text-xs text-slate-400 mt-1">
            {format(new Date(notification.created_at), 'M月d日 HH:mm', { locale: ja })}
          </p>
        </div>
      </div>
    </button>
  )
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data } = useNotifications()
  const markAllRead = useMarkAllRead()

  const notifications = data?.items ?? []
  const unread_count = data?.unread_count ?? 0
  const recent = notifications.slice(0, 5)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [isOpen])

  const handleMarkAllRead = () => {
    markAllRead.mutate()
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        aria-label="通知"
      >
        <Bell size={20} />
        {unread_count > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unread_count > 99 ? '99+' : unread_count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-800">通知</span>
            {unread_count > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
              >
                すべて既読
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">通知はありません</div>
            ) : (
              recent.map((n) => (
                <NotificationItem key={n.id} notification={n} onClose={() => setIsOpen(false)} />
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-2">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-xs text-blue-600 hover:text-blue-800 py-1.5 transition-colors"
            >
              すべての通知を見る
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
