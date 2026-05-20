import { Link, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ChangeHistoryTable } from '../components/ChangeHistoryTable'
import { useEmployeeHistory } from '../api/employeeApi'

export default function EmployeeHistoryPage() {
  const { id } = useParams<{ id: string }>()
  const { data, isLoading, isError } = useEmployeeHistory(id!)
  const history = data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to={`/employees/${id}`}><ArrowLeft size={16} className="mr-1" />戻る</Link>
        </Button>
        <h1 className="text-2xl font-bold">変更履歴</h1>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}
      {!isLoading && !isError && <ChangeHistoryTable history={history} />}
    </div>
  )
}
