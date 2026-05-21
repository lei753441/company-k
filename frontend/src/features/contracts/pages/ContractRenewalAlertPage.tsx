import { Link } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ContractStatusBadge, ExpiryBadge } from '../components/ContractBadge'
import { useRenewalAlerts } from '../api/contractApi'

export default function ContractRenewalAlertPage() {
  const { data, isLoading, isError } = useRenewalAlerts()
  const items = data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">更新アラート一覧</h1>
          <p className="text-sm text-slate-500 mt-1">終了まで90日以内または期限超過の契約</p>
        </div>
        <Link to="/contracts" className="text-sm text-slate-500 hover:underline">← 契約一覧に戻る</Link>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>契約番号</TableHead>
                <TableHead>当事者名</TableHead>
                <TableHead>契約件名</TableHead>
                <TableHead>終了日</TableHead>
                <TableHead>残日数</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400">
                    更新アラート対象の契約はありません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className={
                    item.days_until_expiry !== null && item.days_until_expiry < 0
                      ? 'bg-red-50'
                      : item.days_until_expiry !== null && item.days_until_expiry <= 30
                        ? 'bg-yellow-50'
                        : ''
                  }
                >
                  <TableCell>
                    <span className="font-mono text-sm">{item.contract_number}</span>
                  </TableCell>
                  <TableCell className="text-sm">{item.party_name}</TableCell>
                  <TableCell className="text-sm max-w-48 truncate">{item.title}</TableCell>
                  <TableCell className="text-sm">{item.end_date ?? '—'}</TableCell>
                  <TableCell>
                    <ExpiryBadge days={item.days_until_expiry} />
                  </TableCell>
                  <TableCell>
                    <ContractStatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>
                    <Link
                      to={`/contracts/${item.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      詳細を見る
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
