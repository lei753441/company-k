import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DocumentCategoryBadge, DocumentCategoryIcon, documentCategoryLabel, formatFileSize } from '../components/DocumentBadge'
import { useDocuments } from '../api/documentApi'
import type { DocumentCategory, DocumentListParams } from '@/types/document'
import { Plus } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const categoryOrder: DocumentCategory[] = ['contract', 'invoice', 'skill_sheet', 'timesheet', 'proposal', 'other']

export default function DocumentListPage() {
  const navigate = useNavigate()
  const [params, setParams] = useState<DocumentListParams>({ q: '', category: '', page: 1 })
  const { data, isLoading, isError } = useDocuments(params)
  const items = data?.items ?? []
  const categoryCounts = data?.category_counts ?? {}

  const update = (patch: Partial<DocumentListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">書類管理</h1>
        <Button size="sm" onClick={() => navigate('/documents/upload')}>
          <Plus size={14} className="mr-1" />アップロード
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => update({ category: '' })}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${!params.category ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}
        >
          すべて ({data?.total ?? 0})
        </button>
        {categoryOrder.map((c) =>
          categoryCounts[c] ? (
            <button
              key={c}
              onClick={() => update({ category: c })}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${params.category === c ? 'bg-slate-800 text-white border-slate-800' : 'border-slate-300 text-slate-600 hover:border-slate-500'}`}
            >
              {documentCategoryLabel[c]} ({categoryCounts[c]})
            </button>
          ) : null,
        )}
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex-1 min-w-48">
          <Input
            placeholder="タイトルで検索"
            value={params.q ?? ''}
            onChange={(e) => update({ q: e.target.value })}
          />
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>カテゴリ</TableHead>
                <TableHead>関連先</TableHead>
                <TableHead>タグ</TableHead>
                <TableHead className="text-center">バージョン</TableHead>
                <TableHead>ファイルサイズ</TableHead>
                <TableHead>更新日時</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                    該当する書類が見つかりません
                  </TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <DocumentCategoryIcon category={item.category} />
                  </TableCell>
                  <TableCell>
                    <Link to={`/documents/${item.id}`} className="font-medium hover:underline">
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <DocumentCategoryBadge category={item.category} />
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.related_name ?? '—'}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-center text-sm">v{item.current_version}</TableCell>
                  <TableCell className="text-sm text-slate-500">{formatFileSize(item.file_size)}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(new Date(item.updated_at), 'M月d日', { locale: ja })}
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
