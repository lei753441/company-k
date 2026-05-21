import { NavLink } from 'react-router-dom'
import { Users, Building2, FileText, Activity, Search, Briefcase, Building, Bell, Clock, CalendarDays, Umbrella, CheckSquare, BarChart3, Lock, Receipt, CreditCard, AlertTriangle, GitMerge, List, UserCheck, UserCircle, ScrollText, Wallet, LayoutDashboard } from 'lucide-react'
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
  {
    label: '請求・支払',
    items: [
      { to: '/billing/invoices', label: '請求書', icon: Receipt, end: true },
      { to: '/billing/payments', label: '支払管理', icon: CreditCard, end: true },
      { to: '/billing/receivables', label: '未入金管理', icon: AlertTriangle, end: true },
      { to: '/billing/summary', label: '月次集計', icon: BarChart3, end: true },
      { to: '/billing/close', label: '月次締め', icon: Lock, end: true },
    ],
  },
  {
    label: 'マッチング',
    items: [
      { to: '/matching', label: 'マッチング検索', icon: GitMerge, end: true },
      { to: '/matching/proposals', label: '提案リスト', icon: List, end: true },
    ],
  },
  {
    label: '協力会社・FL',
    items: [
      { to: '/partners', label: '協力会社', icon: UserCheck, end: true },
      { to: '/freelancers', label: 'フリーランス', icon: UserCircle, end: true },
    ],
  },
  {
    label: '契約管理',
    items: [
      { to: '/contracts', label: '契約一覧', icon: ScrollText, end: true },
      { to: '/contracts/renewals', label: '更新アラート', icon: AlertTriangle, end: true },
    ],
  },
  {
    label: '経費管理',
    items: [
      { to: '/expenses', label: '経費申請', icon: Wallet, end: true },
      { to: '/expenses/approval', label: '承認一覧', icon: CheckSquare, end: true },
      { to: '/expenses/summary', label: '月次集計', icon: BarChart3, end: true },
    ],
  },
  {
    label: 'ダッシュボード',
    items: [
      { to: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard, end: true },
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
