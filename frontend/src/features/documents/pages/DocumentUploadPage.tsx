import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { documentCategoryLabel } from '../components/DocumentBadge'
import { useCreateDocument } from '../api/documentApi'
import type { DocumentCategory } from '@/types/document'
import { formatFileSize } from '../components/DocumentBadge'

const CATEGORY_NONE = '_none_'
const RELATED_NONE = '_none_'

type RelatedType = 'employee' | 'project' | 'customer' | 'none'

const schema = z.object({
  title: z.string().min(1, 'タイトルを入力してください'),
  category: z.enum(['contract', 'invoice', 'skill_sheet', 'timesheet', 'proposal', 'other'], {
    errorMap: () => ({ message: 'カテゴリを選択してください' }),
  }),
  tags_raw: z.string().optional(),
  related_type: z.enum(['employee', 'project', 'customer', 'none']),
  related_name: z.string().optional(),
  related_id: z.string().optional(),
  change_comment: z.string().optional(),
})
type FormVals = z.infer<typeof schema>

export default function DocumentUploadPage() {
  const navigate = useNavigate()
  const createDocument = useCreateDocument()
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string } | null>(null)
  const [categoryVal, setCategoryVal] = useState<string>(CATEGORY_NONE)
  const [relatedTypeVal, setRelatedTypeVal] = useState<RelatedType>('none')

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      tags_raw: '',
      related_type: 'none',
      related_name: '',
      related_id: '',
      change_comment: '',
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile({ name: file.name, size: file.size, type: file.type || 'application/octet-stream' })
    }
  }

  const onSubmit = async (data: FormVals) => {
    const tags = data.tags_raw
      ? data.tags_raw.split(',').map((t) => t.trim()).filter(Boolean)
      : []

    const relatedEmployee = data.related_type === 'employee' ? data.related_name : null
    const relatedProject = data.related_type === 'project' ? data.related_name : null
    const relatedCustomer = data.related_type === 'customer' ? data.related_name : null
    const relatedId = data.related_id || null

    const result = await createDocument.mutateAsync({
      title: data.title,
      category: data.category,
      tags,
      related_employee_id: data.related_type === 'employee' ? (relatedId ?? `EMP-${Date.now()}`) : null,
      related_employee_name: relatedEmployee,
      related_project_id: data.related_type === 'project' ? (relatedId ?? `PRJ-${Date.now()}`) : null,
      related_project_name: relatedProject,
      related_customer_id: data.related_type === 'customer' ? (relatedId ?? `CMP-${Date.now()}`) : null,
      related_customer_name: relatedCustomer,
      file_name: selectedFile?.name ?? 'document.pdf',
      file_size: selectedFile?.size ?? 0,
      mime_type: selectedFile?.type ?? 'application/pdf',
      change_comment: data.change_comment || null,
    })
    navigate(`/documents/${result.id}`)
  }

  const relatedType = watch('related_type')

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">書類アップロード</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">書類情報</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>タイトル *</Label>
              <Input {...register('title')} placeholder="書類のタイトルを入力してください" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <Label>カテゴリ *</Label>
              <Select
                value={categoryVal}
                onValueChange={(v) => {
                  setCategoryVal(v)
                  if (v !== CATEGORY_NONE) setValue('category', v as DocumentCategory)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="カテゴリを選択" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CATEGORY_NONE}>カテゴリを選択</SelectItem>
                  {(Object.keys(documentCategoryLabel) as DocumentCategory[]).map((c) => (
                    <SelectItem key={c} value={c}>{documentCategoryLabel[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
            </div>

            <div>
              <Label>タグ（カンマ区切り）</Label>
              <Input {...register('tags_raw')} placeholder="例: 契約, 2026年度, 重要" />
            </div>

            <div>
              <Label>関連先種別</Label>
              <Select
                value={relatedTypeVal}
                onValueChange={(v) => {
                  const rt = v as RelatedType
                  setRelatedTypeVal(rt)
                  setValue('related_type', rt)
                  setValue('related_name', '')
                  setValue('related_id', '')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">なし</SelectItem>
                  <SelectItem value="employee">社員</SelectItem>
                  <SelectItem value="project">案件</SelectItem>
                  <SelectItem value="customer">顧客</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {relatedType !== 'none' && (
              <div>
                <Label>
                  {relatedType === 'employee' ? '社員名' : relatedType === 'project' ? '案件名' : '顧客名'}
                </Label>
                <Input
                  {...register('related_name')}
                  placeholder={
                    relatedType === 'employee'
                      ? '例: 山田 太郎'
                      : relatedType === 'project'
                        ? '例: ECサイトリニューアル支援'
                        : '例: 株式会社テックコーポレーション'
                  }
                />
              </div>
            )}

            <div>
              <Label>ファイル選択</Label>
              <input
                type="file"
                className="block w-full text-sm text-slate-500 mt-1 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                onChange={handleFileChange}
              />
              {selectedFile && (
                <p className="text-xs text-slate-500 mt-1">
                  {selectedFile.name} — {formatFileSize(selectedFile.size)}
                </p>
              )}
            </div>

            <div>
              <Label>変更コメント（任意）</Label>
              <Textarea {...register('change_comment')} placeholder="初版のコメントなど" rows={3} />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={createDocument.isPending}>
                {createDocument.isPending ? 'アップロード中...' : 'アップロード'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/documents')}>
                キャンセル
              </Button>
            </div>

            {createDocument.isError && (
              <p className="text-red-500 text-sm">アップロードに失敗しました</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
