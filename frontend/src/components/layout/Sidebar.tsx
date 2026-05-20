import { NavLink } from 'react-router-dom'
import { Users, Building2, FileText, Activity, Search, Briefcase, Building, Bell, Clock, CalendarDays, Umbrella, CheckSquare, BarChart3, Lock } from 'lucide-react'
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
  {
    label: '案件管理',
    items: [
      { to: '/projects', label: '案件一覧', icon: Briefcase },
    ],
  },
  {
    label: '顧客管理',
    items: [
      { to: '/customers', label: '顧客・取引先', icon: Building },
      { to: '/customers/followup', label: 'フォローアップ', icon: Bell },
    ],
  },
  {
    label: '勤怠管理',
    items: [
      { to: '/attendance/clock', label: '打刻', icon: Clock, end: true },
      { to: '/attendance/timesheets', label: '勤務表', icon: CalendarDays, end: true },
      { to: '/attendance/leaves', label: '休暇申請', icon: Umbrella, end: true },
      { to: '/attendance/approval', label: '承認一覧', icon: CheckSquare, end: true },
      { to: '/attendance/summary', label: '月次集計', icon: BarChart3, end: true },
      { to: '/attendance/close', label: '月次締め', icon: Lock, end: true },
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
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
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
