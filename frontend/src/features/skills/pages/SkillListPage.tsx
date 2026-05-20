import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { AvailabilityBadge, availabilityLabel } from '../components/AvailabilityBadge'
import { useSkillSheets } from '../api/skillApi'
import type { WorkAvailabilityStatus } from '@/types/skill'
import { FileText } from 'lucide-react'

const ALL = '_all_'

export default function SkillListPage() {
  const [q, setQ] = useState('')
  const [avStatus, setAvStatus] = useState('')
  const { data, isLoading, isError } = useSkillSheets({ q, availability_status: avStatus })
  const items = data?.items ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">スキルシート一覧</h1>
        <span className="text-sm text-slate-500">{isLoading ? '—' : `${data?.total ?? 0}件`}</span>
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex-1 min-w-48">
          <Label>氏名・社員ID検索</Label>
          <Input placeholder="氏名・社員IDで検索" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="w-44">
          <Label>稼働ステータス</Label>
          <Select
            value={avStatus || ALL}
            onValueChange={(v) => setAvStatus(v === ALL ? '' : v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="すべて" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {(Object.keys(availabilityLabel) as WorkAvailabilityStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{availabilityLabel[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>部署</TableHead>
                <TableHead>主なスキル</TableHead>
                <TableHead className="text-center">スキル数</TableHead>
                <TableHead className="text-center">資格数</TableHead>
                <TableHead>稼働状況</TableHead>
                <TableHead>空き予定日</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                    該当する社員が見つかりません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.employee_id}>
                  <TableCell className="font-medium">{item.employee_name}</TableCell>
                  <TableCell className="text-sm text-slate-600">{item.department_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.top_skills.map((s) => (
                        <span key={s} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">{item.skill_count}</TableCell>
                  <TableCell className="text-center text-sm">{item.certification_count}</TableCell>
                  <TableCell>
                    {item.availability_status ? (
                      <AvailabilityBadge status={item.availability_status} />
                    ) : (
                      <span className="text-slate-400 text-xs">未設定</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.available_from_date ?? '—'}</TableCell>
                  <TableCell>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/skills/${item.employee_id}`}>
                        <FileText size={14} className="mr-1" />詳細
                      </Link>
                    </Button>
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
