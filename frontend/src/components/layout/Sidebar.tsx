import { NavLink } from 'react-router-dom'
import { Users, Building2, FileText, Activity, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const navGroups = [
  {
    label: '社員管理',
    items: [
      { to: '/employees', label: '社員一覧', icon: Users },
      { to: '/departments', label: '部署管理', icon: Building2 },
    ],
  },
  {
    label: 'スキル・キャリア',
    items: [
      { to: '/skills', label: 'スキルシート', icon: FileText },
      { to: '/skills/search', label: 'スキル検索', icon: Search },
      { to: '/availability', label: '稼働状況', icon: Activity },
    ],
  },
]

export function Sidebar() {
  return (
    <aside className="w-56 min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <div className="p-4 text-lg font-bold border-b border-slate-700">Company K</div>
      <nav className="flex-1 p-2 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs text-slate-500 uppercase tracking-wide px-3 py-1">{group.label}</p>
            <div className="space-y-1">
              {group.items.map(({ to, label, icon: Icon }) => (
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
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
