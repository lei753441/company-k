import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTodayClock, useClockIn, useClockOut, useTimesheets } from '../api/attendanceApi'
import { useAuthStore } from '@/store/authStore'
import { timesheetStatusLabel, attendanceTypeLabel } from '../components/AttendanceBadge'

function fmtMinutes(m: number): string {
  return `${Math.floor(m / 60)}時間${m % 60}分`
}

function fmtTime(iso: string | null): string {
  if (!iso) return '—'
  return format(new Date(iso), 'HH:mm')
}

export default function ClockPage() {
  const user = useAuthStore((s) => s.user)
  const [now, setNow] = useState(new Date())
  const { data: clock } = useTodayClock()
  const clockIn = useClockIn()
  const clockOut = useClockOut()
  const { data: tsData } = useTimesheets({ user_id: user?.employee_id, year_month: format(new Date(), 'yyyy-MM') })

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const isWorking = clock?.status === 'working'
  const isFinished = clock?.status === 'finished'
  const hasStarted = clock?.status !== 'not_started'

  const workedMinutes = (() => {
    if (!clock?.clock_in) return 0
    const inTime = new Date(clock.clock_in).getTime()
    const outTime = clock.clock_out ? new Date(clock.clock_out).getTime() : now.getTime()
    return Math.max(0, Math.floor((outTime - inTime) / 60000) - (clock.break_minutes ?? 0))
  })()

  const currentTs = tsData?.items[0]

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">打刻</h1>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-slate-500 text-sm">{format(now, 'yyyy年M月d日（E）', { locale: ja })}</p>
            <p className="text-5xl font-mono font-bold tracking-widest">{format(now, 'HH:mm:ss')}</p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-500">出勤</p>
              <p className="text-xl font-semibold">{fmtTime(clock?.clock_in ?? null)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">退勤</p>
              <p className="text-xl font-semibold">{fmtTime(clock?.clock_out ?? null)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">実働</p>
              <p className="text-xl font-semibold">{hasStarted ? fmtMinutes(workedMinutes) : '—'}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-4">
            <Button
              size="lg"
              disabled={hasStarted || clockIn.isPending}
              onClick={() => clockIn.mutate()}
              className="min-w-32"
            >
              {clockIn.isPending ? '処理中...' : '出勤'}
            </Button>
            <Button
              size="lg"
              variant="outline"
              disabled={!isWorking || clockOut.isPending}
              onClick={() => clockOut.mutate()}
              className="min-w-32"
            >
              {clockOut.isPending ? '処理中...' : '退勤'}
            </Button>
          </div>

          {isFinished && (
            <p className="text-center text-sm text-slate-500 mt-4">本日の勤務は終了しました。お疲れ様でした。</p>
          )}
        </CardContent>
      </Card>

      {currentTs && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">今月の勤務状況</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <dt className="text-xs text-slate-500">勤務日数</dt>
                <dd className="text-xl font-semibold">{currentTs.total_work_days}日</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">総実働</dt>
                <dd className="text-xl font-semibold">{fmtMinutes(currentTs.total_work_minutes)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">残業</dt>
                <dd className={`text-xl font-semibold ${currentTs.total_overtime_minutes > 2700 ? 'text-red-600' : ''}`}>
                  {fmtMinutes(currentTs.total_overtime_minutes)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">ステータス</dt>
                <dd className="text-sm font-medium mt-1">{timesheetStatusLabel[currentTs.status]}</dd>
              </div>
            </dl>
            {currentTs.project_name && (
              <p className="text-xs text-slate-500 mt-3">担当案件: {currentTs.project_name}</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">勤怠種別</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(Object.entries(attendanceTypeLabel) as [string, string][]).map(([key, label]) => (
              <span key={key} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">{label}</span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
