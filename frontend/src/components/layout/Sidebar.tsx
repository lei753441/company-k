import { NavLink } from 'react-router-dom'
import { Users, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/employees', label: '社員一覧', icon: Users },
  { to: '/departments', label: '部署管理', icon: Building2 },
]

export function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="p-4 text-lg font-bold border-b border-slate-700">Company K</div>
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded text-sm',
                isActive ? 'bg-slate-700 text-white' : 'hover:bg-slate-800',
              )
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
