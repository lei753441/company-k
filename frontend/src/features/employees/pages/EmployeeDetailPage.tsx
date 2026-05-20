import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Pencil, UserX, Pause, History } from 'lucide-react'
import { useEmployee } from '../api/employeeApi'
import { useAuthStore } from '@/store/authStore'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import type { EmployeeStatus } from '@/types/employee'

const statusLabel: Record<EmployeeStatus, string> = { active: '在籍', on_leave: '休職', retiring: '退職予定', retired: '退職' }
const statusVariant: Record<EmployeeStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default', on_leave: 'secondary', retiring: 'outline', retired: 'destructive',
}
const employmentTypeLabel = { full_time: '正社員', contract: '契約社員', part_time: 'パート/アルバイト' }

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="text-sm font-medium">{value ?? '—'}</dd>
    </div>
  )
}

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user, can } = useAuthStore()
  const { data: emp, isLoading, isError } = useEmployee(id!)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !emp) return <div className="py-16 text-center text-red-500">社員が見つかりません</div>

  const isSelf = user?.employee_id === emp.employee_id
  const canEdit = can('edit_all') || isSelf
  const canRetire = can('retire') && emp.status === 'active'
  const canLeave = can('retire') && emp.status === 'active'

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">{emp.last_name} {emp.first_name}</h1>
          <p className="text-slate-500 text-sm">{emp.last_name_kana} {emp.first_name_kana}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-mono text-sm text-slate-600">{emp.employee_id}</span>
            <Badge variant={statusVariant[emp.status]}>{statusLabel[emp.status]}</Badge>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {canEdit && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/employees/${id}/edit`}><Pencil size={14} className="mr-1" />編集</Link>
            </Button>
          )}
          {canLeave && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/employees/${id}/leave`}><Pause size={14} className="mr-1" />休職登録</Link>
            </Button>
          )}
          {canRetire && (
            <Button asChild variant="destructive" size="sm">
              <Link to={`/employees/${id}/retire`}><UserX size={14} className="mr-1" />退職処理</Link>
            </Button>
          )}
          {can('edit_all') && (
            <Button asChild variant="ghost" size="sm">
              <Link to={`/employees/${id}/history`}><History size={14} className="mr-1" />変更履歴</Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="生年月日" value={emp.birth_date ? format(new Date(emp.birth_date), 'yyyy年MM月dd日', { locale: ja }) : null} />
            <Field label="会社メール" value={emp.email_company} />
            <Field label="個人メール" value={emp.email_private} />
            <Field label="会社携帯" value={emp.phone_company} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">住所・連絡先</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <Field label="郵便番号" value={emp.postal_code} />
            <Field label="都道府県" value={emp.address_pref} />
            <Field label="市区町村" value={emp.address_city} />
            <Field label="番地・建物" value={emp.address_detail} />
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">雇用情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Field label="雇用形態" value={employmentTypeLabel[emp.employment_type]} />
            <Field label="入社日" value={emp.hire_date ? format(new Date(emp.hire_date), 'yyyy年MM月dd日', { locale: ja }) : null} />
            <Field label="退職日" value={emp.retirement_date ? format(new Date(emp.retirement_date), 'yyyy年MM月dd日', { locale: ja }) : null} />
            <Field label="部署" value={emp.department_name} />
            <Field label="役職" value={emp.position_name} />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
