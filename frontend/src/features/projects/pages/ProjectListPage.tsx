import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { ProjectStatusBadge, statusLabel } from '../components/ProjectStatusBadge'
import { useProjects } from '../api/projectApi'
import { useAuthStore } from '@/store/authStore'
import type { ProjectListParams, ProjectStatus, ProjectType } from '@/types/project'
import { Plus } from 'lucide-react'

const ALL = '_all_'

const typeLabel: Record<ProjectType, string> = {
  ses: 'SES',
  consignment: '受託開発',
}

const statusOrder: ProjectStatus[] = ['negotiating', 'proposing', 'ordered', 'in_progress', 'completed', 'lost', 'cancelled']

export default function ProjectListPage() {
  const can = useAuthStore((s) => s.can)
  const [params, setParams] = useState<ProjectListParams>({ q: '', status: '', project_type: '', page: 1 })
  const { data, isLoading, isError } = useProjects(params)
  const items = data?.items ?? []
  const statusCounts = data?.status_counts ?? {}

  const update = (patch: Partial<ProjectListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">案件一覧</h1>
        {can('edit_all') && (
          <Button asChild size="sm">
            <Link to="/projects/new"><Plus size={14} className="mr-1" />新規登録</Link>
          </Button>
        )}
      </div>

      {/* Status count chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update({ status: '' })}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            !params.status ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'
          }`}
        >
          すべて ({data?.total ?? 0})
        </button>
        {statusOrder.map((s) =>
          statusCounts[s] ? (
            <button
              key={s}
              onClick={() => update({ status: s })}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                params.status === s ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'
              }`}
            >
              {statusLabel[s]} ({statusCounts[s]})
            </button>
          ) : null,
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex-1 min-w-48">
          <Label>案件名・顧客名検索</Label>
          <Input
            placeholder="案件名・顧客名で検索"
            value={params.q ?? ''}
            onChange={(e) => update({ q: e.target.value })}
          />
        </div>
        <div className="w-36">
          <Label>案件種別</Label>
          <Select
            value={params.project_type || ALL}
            onValueChange={(v) => update({ project_type: v === ALL ? '' : (v as ProjectType) })}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              <SelectItem value="ses">SES</SelectItem>
              <SelectItem value="consignment">受託開発</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-36">
          <Label>ステータス</Label>
          <Select
            value={params.status || ALL}
            onValueChange={(v) => update({ status: v === ALL ? '' : (v as ProjectStatus) })}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {statusOrder.map((s) => (
                <SelectItem key={s} value={s}>{statusLabel[s]}</SelectItem>
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
                <TableHead>案件名</TableHead>
                <TableHead>種別</TableHead>
                <TableHead>顧客企業</TableHead>
                <TableHead>担当営業</TableHead>
                <TableHead>ステータス</TableHead>
                <TableHead>開始日</TableHead>
                <TableHead>終了日</TableHead>
                <TableHead className="text-center">人数</TableHead>
                <TableHead>スキルタグ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-slate-400">
                    該当する案件が見つかりません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-slate-50">
                  <TableCell>
                    <Link to={`/projects/${item.id}`} className="font-medium hover:underline">
                      {item.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                      item.project_type === 'ses' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      {typeLabel[item.project_type]}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{item.company_name}</TableCell>
                  <TableCell className="text-sm">{item.sales_user_name}</TableCell>
                  <TableCell><ProjectStatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-sm">{item.start_date ?? '—'}</TableCell>
                  <TableCell className="text-sm">{item.end_date ?? '—'}</TableCell>
                  <TableCell className="text-center text-sm">{item.assignment_count}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.skill_tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{t}</span>
                      ))}
                      {item.skill_tags.length > 3 && (
                        <span className="text-xs text-slate-400">+{item.skill_tags.length - 3}</span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {(data?.total ?? 0) > 20 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={(params.page ?? 1) <= 1} onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}>前へ</Button>
          <span className="px-4 py-2 text-sm">{params.page ?? 1} / {Math.ceil((data?.total ?? 0) / 20)}</span>
          <Button variant="outline" size="sm" disabled={(params.page ?? 1) >= Math.ceil((data?.total ?? 0) / 20)} onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}>次へ</Button>
        </div>
      )}
    </div>
  )
}
