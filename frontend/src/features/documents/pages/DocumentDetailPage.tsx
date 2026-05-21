import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DocumentCategoryBadge, formatFileSize } from '../components/DocumentBadge'
import { useDocument, useAddDocumentVersion, useDeleteDocument } from '../api/documentApi'
import { useAuthStore } from '@/store/authStore'
import { Download } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

const versionSchema = z.object({
  file_name: z.string().min(1, 'ファイル名を入力してください'),
  change_comment: z.string().optional(),
})
type VersionVals = z.infer<typeof versionSchema>

function AddVersionSheet({
  open,
  documentId,
  onClose,
}: {
  open: boolean
  documentId: string
  onClose: () => void
}) {
  const addVersion = useAddDocumentVersion(documentId)
  const [fileSize, setFileSize] = useState<number>(0)
  const [mimeType, setMimeType] = useState<string>('application/pdf')

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<VersionVals>({
    resolver: zodResolver(versionSchema),
    defaultValues: { file_name: '', change_comment: '' },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setValue('file_name', file.name)
      setFileSize(file.size)
      setMimeType(file.type || 'application/octet-stream')
    }
  }

  const onSubmit = async (data: VersionVals) => {
    await addVersion.mutateAsync({
      file_name: data.file_name,
      file_size: fileSize || 1024,
      mime_type: mimeType,
      change_comment: data.change_comment || null,
    })
    reset()
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent>
        <SheetHeader><SheetTitle>新バージョン追加</SheetTitle></SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div>
            <Label>ファイル選択</Label>
            <input type="file" className="block w-full text-sm text-slate-500 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200" onChange={handleFileChange} />
          </div>
          <div>
            <Label>ファイル名 *</Label>
            <Input {...register('file_name')} placeholder="例: 書類_v2.pdf" />
            {errors.file_name && <p className="text-red-500 text-xs mt-1">{errors.file_name.message}</p>}
          </div>
          <div>
            <Label>変更コメント（任意）</Label>
            <Textarea {...register('change_comment')} placeholder="変更内容を入力してください" rows={3} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={addVersion.isPending}>
              {addVersion.isPending ? '追加中...' : '追加'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>キャンセル</Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export default function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const can = useAuthStore((s) => s.can)
  const { data, isLoading, isError } = useDocument(id!)
  const deleteDocument = useDeleteDocument()
  const [versionSheet, setVersionSheet] = useState(false)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">書類が見つかりません</div>

  const canManage = can('edit_all')

  const handleDelete = async () => {
    if (!confirm('この書類を削除しますか？')) return
    await deleteDocument.mutateAsync(id!)
    window.location.href = '/documents'
  }

  const handleDownload = (fileName: string) => {
    alert(`ダウンロード開始（モック）: ${fileName}`)
  }

  const sortedVersions = [...data.versions].sort((a, b) => b.version - a.version)

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold">{data.title}</h1>
            <DocumentCategoryBadge category={data.category} />
          </div>
          {data.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.tags.map((t) => (
                <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={() => setVersionSheet(true)}>
            新バージョン追加
          </Button>
          {canManage && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => alert('アーカイブ（モック）')}
              >
                アーカイブ
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteDocument.isPending}
              >
                削除
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">メタデータ</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-slate-500">現在バージョン</dt>
              <dd className="text-sm font-medium">v{data.current_version}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">作成者</dt>
              <dd className="text-sm">{data.created_by_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">作成日</dt>
              <dd className="text-sm">{format(new Date(data.created_at), 'yyyy年M月d日', { locale: ja })}</dd>
            </div>
            {data.related_employee_name && (
              <div>
                <dt className="text-xs text-slate-500">関連社員</dt>
                <dd className="text-sm">{data.related_employee_name}</dd>
              </div>
            )}
            {data.related_project_name && (
              <div>
                <dt className="text-xs text-slate-500">関連案件</dt>
                <dd className="text-sm">{data.related_project_name}</dd>
              </div>
            )}
            {data.related_customer_name && (
              <div>
                <dt className="text-xs text-slate-500">関連顧客</dt>
                <dd className="text-sm">{data.related_customer_name}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">バージョン履歴</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">バージョン</TableHead>
                <TableHead>ファイル名</TableHead>
                <TableHead>サイズ</TableHead>
                <TableHead>アップロード日時</TableHead>
                <TableHead>アップロード者</TableHead>
                <TableHead>変更コメント</TableHead>
                <TableHead className="text-center">DL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedVersions.map((v) => (
                <TableRow key={v.version}>
                  <TableCell className="text-center">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${v.version === data.current_version ? 'bg-blue-100 text-blue-700' : 'text-slate-500'}`}>
                      v{v.version}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm">{v.file_name}</TableCell>
                  <TableCell className="text-sm text-slate-500">{formatFileSize(v.file_size)}</TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {format(new Date(v.uploaded_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                  </TableCell>
                  <TableCell className="text-sm">{v.uploaded_by_name}</TableCell>
                  <TableCell className="text-sm text-slate-500">{v.change_comment ?? '—'}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(v.file_name)}
                    >
                      <Download size={14} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AddVersionSheet
        open={versionSheet}
        documentId={id!}
        onClose={() => setVersionSheet(false)}
      />
    </div>
  )
}
