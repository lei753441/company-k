import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/store/authStore'
import { useAdminDashboard, useEmployeeDashboard } from '../api/dashboardApi'

function fmtMinutes(m: number): string {
  return `${Math.floor(m / 60)}h${m % 60}m`
}

function fmtCurrency(n: number): string {
  return `¥${n.toLocaleString()}`
}

function timesheetStatusLabel(status: string | null): string {
  const map: Record<string, string> = {
    draft: '下書き',
    submitted: '提出済み',
    rejected: '差し戻し',
    approved: '承認済み',
    closed: '締め済み',
  }
  return status ? (map[status] ?? status) : '未作成'
}

function timesheetStatusVariant(status: string | null): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (!status || status === 'draft') return 'outline'
  if (status === 'submitted') return 'secondary'
  if (status === 'rejected') return 'destructive'
  return 'default'
}

function AdminDashboard() {
  const { data, isLoading, isError } = useAdminDashboard()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">管理ダッシュボード</h1>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {data && (
        <>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">稼働状況サマリー</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500">社員総数</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{data.headcount.total}名</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500">稼働中</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-blue-600">{data.headcount.in_project}名</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500">稼働空き</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-green-600">{data.headcount.available}名</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500">勤務表未提出（当月）</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-slate-400">{data.headcount.leave}名</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">今月の請求・支払サマリー</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500">請求総額（当月）</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">{fmtCurrency(data.billing_summary.invoiced)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500">入金済</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-green-600">{fmtCurrency(data.billing_summary.received)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-slate-500">支払予定</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-orange-500">{fmtCurrency(data.billing_summary.payment_due)}</p>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">案件パイプライン</h2>
            <Card>
              <CardContent className="pt-6 space-y-3">
                {(
                  [
                    { label: '提案中', value: data.project_pipeline.proposing, color: 'bg-blue-400' },
                    { label: '交渉中', value: data.project_pipeline.negotiating, color: 'bg-yellow-400' },
                    { label: '受注', value: data.project_pipeline.contracted, color: 'bg-green-400' },
                    { label: '進行中', value: data.project_pipeline.in_progress, color: 'bg-emerald-600' },
                  ] as const
                ).map(({ label, value, color }) => {
                  const max = Math.max(
                    data.project_pipeline.proposing,
                    data.project_pipeline.negotiating,
                    data.project_pipeline.contracted,
                    data.project_pipeline.in_progress,
                    1,
                  )
                  const pct = Math.round((value / max) * 100)
                  return (
                    <div key={label} className="flex items-center gap-3">
                      <span className="w-16 text-sm text-slate-600 shrink-0">{label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-4">
                        <div
                          className={`h-4 rounded-full ${color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-sm font-semibold text-right">{value}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">承認待ちアクション</h2>
            <Card>
              <CardContent className="pt-4">
                <div className="divide-y">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm">勤務表承認待ち</span>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{data.pending_approvals.timesheets}件</Badge>
                      <Link to="/attendance/approval" className="text-sm text-blue-600 hover:underline">
                        一覧へ
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm">経費申請承認待ち</span>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{data.pending_approvals.expenses}件</Badge>
                      <Link to="/expenses/approval" className="text-sm text-blue-600 hover:underline">
                        一覧へ
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">フォローアップ期限</h2>
            <Card>
              <CardContent className="pt-4">
                {data.followups.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">期限間近のフォローアップはありません</p>
                )}
                <ul className="divide-y">
                  {data.followups.map((f) => (
                    <li key={f.id} className="py-3 flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">{f.subject}</p>
                        <p className="text-xs text-slate-500">{f.company_name}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-slate-600">{f.follow_up_date}</p>
                        <Link to="/customers/followup" className="text-xs text-blue-600 hover:underline">
                          詳細
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}

function EmployeeDashboard() {
  const { data, isLoading, isError } = useEmployeeDashboard()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">マイダッシュボード</h1>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {data && (
        <>
          <section className="space-y-2">
            <h2 className="text-lg font-semibold">今日の勤怠</h2>
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">出勤状況:</span>
                  <Badge variant={data.today_clock.clock_in ? 'default' : 'outline'}>
                    {data.today_clock.clock_in ? '出勤済み' : '未出勤'}
                  </Badge>
                  {data.today_clock.clock_in && (
                    <span className="text-xs text-slate-400">
                      {new Date(data.today_clock.clock_in).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div>
                    <p className="text-xs text-slate-500">今月の実働時間</p>
                    <p className="text-xl font-bold">{fmtMinutes(data.monthly_work.total_minutes)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">残業時間</p>
                    <p className="text-xl font-bold text-orange-500">{fmtMinutes(data.monthly_work.overtime_minutes)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">有給残日数</p>
                    <p className="text-xl font-bold text-green-600">{data.monthly_work.paid_leave_remaining}日</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">今月の勤務表</h2>
            <Card>
              <CardContent className="pt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={timesheetStatusVariant(data.timesheet.status)}>
                    {timesheetStatusLabel(data.timesheet.status)}
                  </Badge>
                  <span className="text-sm text-slate-500">{data.timesheet.year_month}</span>
                </div>
                <Link to="/attendance/timesheets" className="text-sm text-blue-600 hover:underline">
                  提出する
                </Link>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">自分のアクティブ案件</h2>
            <Card>
              <CardContent className="pt-4">
                {data.active_projects.length === 0 && (
                  <p className="text-sm text-slate-400 py-4 text-center">参画中の案件はありません</p>
                )}
                <ul className="divide-y">
                  {data.active_projects.map((p) => (
                    <li key={p.id} className="py-3">
                      <p className="text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {p.customer_name} ・ 〜{p.end_date}
                      </p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-semibold">お知らせ</h2>
            <Card>
              <CardContent className="pt-4 space-y-2">
                <p className="text-sm">フォローアップ: {data.active_projects.length}件が期限間近</p>
                <p className="text-sm">勤務表提出期限: 今月末</p>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const can = useAuthStore((s) => s.can)

  if (can('edit_all')) {
    return <AdminDashboard />
  }
  return <EmployeeDashboard />
}
