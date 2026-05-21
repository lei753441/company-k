import { http, HttpResponse } from 'msw'
import type { Document, DocumentListItem } from '@/types/document'

let documents: Document[] = [
  {
    id: 'DOC-001',
    title: '顧客向け業務委託基本契約書',
    category: 'contract',
    status: 'active',
    tags: ['契約', '業務委託', '基本'],
    related_employee_id: null,
    related_employee_name: null,
    related_project_id: null,
    related_project_name: null,
    related_customer_id: 'CMP-001',
    related_customer_name: '株式会社テックコーポレーション',
    current_version: 2,
    versions: [
      {
        version: 1,
        file_name: '業務委託基本契約書_v1.pdf',
        file_size: 245760,
        mime_type: 'application/pdf',
        uploaded_by: 'EMP-20200101-0001',
        uploaded_by_name: '管理者 太郎',
        uploaded_at: '2025-04-01T09:00:00Z',
        change_comment: null,
      },
      {
        version: 2,
        file_name: '業務委託基本契約書_v2.pdf',
        file_size: 253952,
        mime_type: 'application/pdf',
        uploaded_by: 'EMP-20200101-0001',
        uploaded_by_name: '管理者 太郎',
        uploaded_at: '2026-01-15T10:30:00Z',
        change_comment: '契約期間を2026年度に更新',
      },
    ],
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2025-04-01T09:00:00Z',
    updated_at: '2026-01-15T10:30:00Z',
  },
  {
    id: 'DOC-002',
    title: '2026年5月 請求書_テックコーポレーション',
    category: 'invoice',
    status: 'active',
    tags: ['請求書', '2026年5月'],
    related_employee_id: null,
    related_employee_name: null,
    related_project_id: null,
    related_project_name: null,
    related_customer_id: 'CMP-001',
    related_customer_name: '株式会社テックコーポレーション',
    current_version: 1,
    versions: [
      {
        version: 1,
        file_name: '請求書_202605_テックコーポレーション.pdf',
        file_size: 102400,
        mime_type: 'application/pdf',
        uploaded_by: 'EMP-20200101-0001',
        uploaded_by_name: '管理者 太郎',
        uploaded_at: '2026-05-10T09:00:00Z',
        change_comment: '自動生成',
      },
    ],
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2026-05-10T09:00:00Z',
    updated_at: '2026-05-10T09:00:00Z',
  },
  {
    id: 'DOC-003',
    title: '山田太郎_スキルシート_20260520',
    category: 'skill_sheet',
    status: 'active',
    tags: ['スキルシート', 'React', 'TypeScript'],
    related_employee_id: 'EMP-20220401-0012',
    related_employee_name: '山田 太郎',
    related_project_id: null,
    related_project_name: null,
    related_customer_id: null,
    related_customer_name: null,
    current_version: 3,
    versions: [
      {
        version: 1,
        file_name: '山田太郎_スキルシート_v1.pdf',
        file_size: 184320,
        mime_type: 'application/pdf',
        uploaded_by: 'EMP-20220401-0012',
        uploaded_by_name: '山田 太郎',
        uploaded_at: '2025-10-01T09:00:00Z',
        change_comment: null,
      },
      {
        version: 2,
        file_name: '山田太郎_スキルシート_v2.pdf',
        file_size: 196608,
        mime_type: 'application/pdf',
        uploaded_by: 'EMP-20220401-0012',
        uploaded_by_name: '山田 太郎',
        uploaded_at: '2026-02-10T11:00:00Z',
        change_comment: 'AWS案件経験を追加',
      },
      {
        version: 3,
        file_name: '山田太郎_スキルシート_v3.pdf',
        file_size: 204800,
        mime_type: 'application/pdf',
        uploaded_by: 'EMP-20220401-0012',
        uploaded_by_name: '山田 太郎',
        uploaded_at: '2026-05-20T10:00:00Z',
        change_comment: '最新プロジェクト経験を追加',
      },
    ],
    created_by: 'EMP-20220401-0012',
    created_by_name: '山田 太郎',
    created_at: '2025-10-01T09:00:00Z',
    updated_at: '2026-05-20T10:00:00Z',
  },
  {
    id: 'DOC-004',
    title: '2026年5月 勤務表_山田太郎',
    category: 'timesheet',
    status: 'active',
    tags: ['勤務表', '2026年5月'],
    related_employee_id: 'EMP-20220401-0012',
    related_employee_name: '山田 太郎',
    related_project_id: null,
    related_project_name: null,
    related_customer_id: null,
    related_customer_name: null,
    current_version: 1,
    versions: [
      {
        version: 1,
        file_name: '勤務表_202605_山田太郎.pdf',
        file_size: 81920,
        mime_type: 'application/pdf',
        uploaded_by: 'EMP-20220401-0012',
        uploaded_by_name: '山田 太郎',
        uploaded_at: '2026-05-18T18:00:00Z',
        change_comment: null,
      },
    ],
    created_by: 'EMP-20220401-0012',
    created_by_name: '山田 太郎',
    created_at: '2026-05-18T18:00:00Z',
    updated_at: '2026-05-18T18:00:00Z',
  },
  {
    id: 'DOC-005',
    title: 'ECサイトリニューアル提案書',
    category: 'proposal',
    status: 'active',
    tags: ['提案書', 'EC', 'React'],
    related_employee_id: null,
    related_employee_name: null,
    related_project_id: 'PRJ-2026-0001',
    related_project_name: 'ECサイトリニューアル支援',
    related_customer_id: null,
    related_customer_name: null,
    current_version: 1,
    versions: [
      {
        version: 1,
        file_name: 'ECサイトリニューアル提案書_v1.docx',
        file_size: 327680,
        mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploaded_by: 'EMP-20200101-0001',
        uploaded_by_name: '管理者 太郎',
        uploaded_at: '2026-03-15T14:00:00Z',
        change_comment: null,
      },
    ],
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2026-03-15T14:00:00Z',
    updated_at: '2026-03-15T14:00:00Z',
  },
  {
    id: 'DOC-006',
    title: '2026年度 就業規則',
    category: 'other',
    status: 'active',
    tags: ['就業規則', '社内規程'],
    related_employee_id: null,
    related_employee_name: null,
    related_project_id: null,
    related_project_name: null,
    related_customer_id: null,
    related_customer_name: null,
    current_version: 2,
    versions: [
      {
        version: 1,
        file_name: '就業規則_2025年度.pdf',
        file_size: 512000,
        mime_type: 'application/pdf',
        uploaded_by: 'EMP-20200101-0001',
        uploaded_by_name: '管理者 太郎',
        uploaded_at: '2025-04-01T09:00:00Z',
        change_comment: null,
      },
      {
        version: 2,
        file_name: '就業規則_2026年度.pdf',
        file_size: 524288,
        mime_type: 'application/pdf',
        uploaded_by: 'EMP-20200101-0001',
        uploaded_by_name: '管理者 太郎',
        uploaded_at: '2026-04-01T09:00:00Z',
        change_comment: '2026年度改定。リモートワーク規程を追加。',
      },
    ],
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2025-04-01T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
  },
]

function toListItem(doc: Document): DocumentListItem {
  const latestVersion = doc.versions.find((v) => v.version === doc.current_version) ?? doc.versions[doc.versions.length - 1]
  const relatedName =
    doc.related_employee_name ?? doc.related_project_name ?? doc.related_customer_name ?? null
  return {
    id: doc.id,
    title: doc.title,
    category: doc.category,
    status: doc.status,
    tags: doc.tags,
    related_name: relatedName,
    current_version: doc.current_version,
    file_name: latestVersion.file_name,
    file_size: latestVersion.file_size,
    created_by_name: doc.created_by_name,
    updated_at: doc.updated_at,
  }
}

export const documentHandlers = [
  http.get('/api/documents', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const category = url.searchParams.get('category') ?? ''
    const tag = url.searchParams.get('tag') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = documents.filter((d) => d.status !== 'deleted')
    if (q) list = list.filter((d) => d.title.includes(q))
    if (category) list = list.filter((d) => d.category === category)
    if (tag) list = list.filter((d) => d.tags.includes(tag))

    const categoryCounts = documents
      .filter((d) => d.status !== 'deleted')
      .reduce<Record<string, number>>((acc, d) => {
        acc[d.category] = (acc[d.category] ?? 0) + 1
        return acc
      }, {})

    const start = (page - 1) * limit
    return HttpResponse.json({
      items: list.slice(start, start + limit).map(toListItem),
      total: list.length,
      category_counts: categoryCounts,
    })
  }),

  http.get('/api/documents/:id', ({ params }) => {
    const doc = documents.find((d) => d.id === params.id)
    if (!doc) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(doc)
  }),

  http.post('/api/documents', async ({ request }) => {
    const body = (await request.json()) as {
      title: string
      category: string
      tags: string[]
      related_employee_id?: string | null
      related_employee_name?: string | null
      related_project_id?: string | null
      related_project_name?: string | null
      related_customer_id?: string | null
      related_customer_name?: string | null
      file_name: string
      file_size: number
      mime_type: string
      change_comment?: string | null
    }
    const now = new Date().toISOString()
    const newDoc: Document = {
      id: `DOC-${Date.now()}`,
      title: body.title,
      category: body.category as Document['category'],
      status: 'active',
      tags: body.tags ?? [],
      related_employee_id: body.related_employee_id ?? null,
      related_employee_name: body.related_employee_name ?? null,
      related_project_id: body.related_project_id ?? null,
      related_project_name: body.related_project_name ?? null,
      related_customer_id: body.related_customer_id ?? null,
      related_customer_name: body.related_customer_name ?? null,
      current_version: 1,
      versions: [
        {
          version: 1,
          file_name: body.file_name,
          file_size: body.file_size,
          mime_type: body.mime_type,
          uploaded_by: 'EMP-20200101-0001',
          uploaded_by_name: '管理者 太郎',
          uploaded_at: now,
          change_comment: body.change_comment ?? null,
        },
      ],
      created_by: 'EMP-20200101-0001',
      created_by_name: '管理者 太郎',
      created_at: now,
      updated_at: now,
    }
    documents.push(newDoc)
    return HttpResponse.json(newDoc, { status: 201 })
  }),

  http.post('/api/documents/:id/versions', async ({ params, request }) => {
    const idx = documents.findIndex((d) => d.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as {
      file_name: string
      file_size: number
      mime_type: string
      change_comment?: string | null
    }
    const now = new Date().toISOString()
    const newVersion = documents[idx].current_version + 1
    documents[idx] = {
      ...documents[idx],
      current_version: newVersion,
      updated_at: now,
      versions: [
        ...documents[idx].versions,
        {
          version: newVersion,
          file_name: body.file_name,
          file_size: body.file_size,
          mime_type: body.mime_type,
          uploaded_by: 'EMP-20200101-0001',
          uploaded_by_name: '管理者 太郎',
          uploaded_at: now,
          change_comment: body.change_comment ?? null,
        },
      ],
    }
    return HttpResponse.json(documents[idx])
  }),

  http.delete('/api/documents/:id', ({ params }) => {
    const idx = documents.findIndex((d) => d.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    documents[idx] = { ...documents[idx], status: 'deleted', updated_at: new Date().toISOString() }
    return new HttpResponse(null, { status: 204 })
  }),
]
