import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-40 h-14 flex items-center justify-end px-6 bg-white border-b border-gray-200">
          <NotificationBell />
        </header>
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
