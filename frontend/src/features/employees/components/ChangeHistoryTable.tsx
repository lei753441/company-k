import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ChangeHistory } from '@/types/employee'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Props {
  history: ChangeHistory[]
}

export function ChangeHistoryTable({ history }: Props) {
  if (history.length === 0) {
    return <div className="text-center py-16 text-slate-400">変更履歴がありません</div>
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>変更日時</TableHead>
          <TableHead>変更者</TableHead>
          <TableHead>項目</TableHead>
          <TableHead>変更前</TableHead>
          <TableHead>変更後</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {history.map((h) => (
          <TableRow key={h.id}>
            <TableCell className="text-sm">
              {format(new Date(h.changed_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
            </TableCell>
            <TableCell className="text-sm">{h.changed_by_name}</TableCell>
            <TableCell className="font-medium">{h.field_label}</TableCell>
            <TableCell className="text-slate-500 text-sm">{h.old_value ?? '—'}</TableCell>
            <TableCell className="text-sm">{h.new_value ?? '—'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
