import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RetireForm } from '../components/RetireForm'
import { useEmployee, useRetireEmployee } from '../api/employeeApi'
import type { RetireRequest } from '@/types/employee'

export default function EmployeeRetirePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: emp, isLoading } = useEmployee(id!)
  const { mutate, isPending } = useRetireEmployee(id!)
  const [pendingData, setPendingData] = useState<RetireRequest | null>(null)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (!emp) return <div className="py-16 text-center text-red-500">社員が見つかりません</div>

  const handleConfirm = () => {
    if (!pendingData) return
    mutate(pendingData, { onSuccess: () => navigate(`/employees/${id}`) })
  }

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold">退職処理</h1>
        <p className="text-slate-600 mt-1">
          <span className="font-semibold">{emp.last_name} {emp.first_name}</span>（{emp.employee_id}）の退職処理を行います。
        </p>
        <p className="text-sm text-amber-600 mt-2 p-3 bg-amber-50 rounded">
          退職処理を確定すると、在籍ステータスが「退職予定」に変更され、関連モジュールへ通知されます。
        </p>
      </div>

      <RetireForm onSubmit={(data) => setPendingData(data)} isLoading={isPending} />

      <AlertDialog open={!!pendingData} onOpenChange={(open) => { if (!open) setPendingData(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>退職処理の確認</AlertDialogTitle>
            <AlertDialogDescription>
              {emp.last_name} {emp.first_name}（{emp.employee_id}）の退職処理を実行します。
              退職日: {pendingData?.retirement_date}。この操作は管理者のみが取り消せます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm} variant="destructive">
              確定する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
