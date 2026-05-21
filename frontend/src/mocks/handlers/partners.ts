import { http, HttpResponse } from 'msw'
import type { Partner, PartnerListItem, PartnerEngineer, Freelancer, PartnerStatus } from '@/types/partner'

let partners: Partner[] = [
  {
    id: 'PRT-001',
    name: '株式会社グローバルIT開発',
    name_kana: 'カブシキガイシャグローバルアイティーカイハツ',
    corporate_number: '1234567890001',
    invoice_number: 'T1234567890001',
    prefecture: '東京都',
    address: '千代田区神田1-1-1 グローバルビル5F',
    phone: '03-1111-2222',
    website_url: 'https://global-it.example.com',
    status: 'active',
    tags: ['Java', 'AWS', '大規模'],
    notes: '主要協力会社。対応力高い。',
    created_at: '2024-04-01T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'PRT-002',
    name: 'テックパートナーズ合同会社',
    name_kana: 'テックパートナーズゴウドウガイシャ',
    corporate_number: '9876543210002',
    invoice_number: 'T9876543210002',
    prefecture: '大阪府',
    address: '大阪市北区梅田2-2-2',
    phone: '06-3333-4444',
    website_url: null,
    status: 'active',
    tags: ['React', 'TypeScript', 'フロントエンド'],
    notes: 'フロントエンド専門チーム。',
    created_at: '2024-06-01T09:00:00Z',
    updated_at: '2026-03-15T09:00:00Z',
  },
  {
    id: 'PRT-003',
    name: '有限会社スマートソリューション',
    name_kana: 'ユウゲンガイシャスマートソリューション',
    corporate_number: null,
    invoice_number: null,
    prefecture: '神奈川県',
    address: '横浜市西区3-3-3',
    phone: '045-555-6666',
    website_url: null,
    status: 'dormant',
    tags: ['インフラ'],
    notes: '現在休眠中。',
    created_at: '2023-01-15T09:00:00Z',
    updated_at: '2025-06-01T09:00:00Z',
  },
]

let engineers: PartnerEngineer[] = [
  {
    id: 'PENG-001',
    partner_id: 'PRT-001',
    last_name: '山田',
    first_name: '太郎',
    last_name_kana: 'ヤマダ',
    first_name_kana: 'タロウ',
    email: 'yamada@global-it.example.com',
    phone: '090-1111-2222',
    status: 'active',
    availability_status: 'in_project',
    available_from: null,
    unit_price: 700000,
    skills: ['Java', 'Spring Boot', 'AWS'],
    notes: 'バックエンドリード経験あり。',
    created_at: '2024-04-01T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'PENG-002',
    partner_id: 'PRT-001',
    last_name: '鈴木',
    first_name: '次郎',
    last_name_kana: 'スズキ',
    first_name_kana: 'ジロウ',
    email: 'suzuki@global-it.example.com',
    phone: '090-3333-4444',
    status: 'active',
    availability_status: 'available',
    available_from: '2026-06-01',
    unit_price: 600000,
    skills: ['Python', 'Django', 'GCP'],
    notes: null,
    created_at: '2024-07-01T09:00:00Z',
    updated_at: '2026-05-01T09:00:00Z',
  },
  {
    id: 'PENG-003',
    partner_id: 'PRT-002',
    last_name: '佐藤',
    first_name: '花子',
    last_name_kana: 'サトウ',
    first_name_kana: 'ハナコ',
    email: 'sato@techpartners.example.com',
    phone: null,
    status: 'active',
    availability_status: 'available_soon',
    available_from: '2026-07-01',
    unit_price: 650000,
    skills: ['React', 'TypeScript', 'Next.js'],
    notes: 'UIデザインも対応可。',
    created_at: '2024-06-01T09:00:00Z',
    updated_at: '2026-04-15T09:00:00Z',
  },
]

let freelancers: Freelancer[] = [
  {
    id: 'FRL-001',
    last_name: '田中',
    first_name: 'フリー太郎',
    last_name_kana: 'タナカ',
    first_name_kana: 'フリータロウ',
    email: 'tanaka-free@example.com',
    phone: '090-1234-5678',
    trade_name: 'タナカ技術事務所',
    invoice_registration_status: 'registered',
    invoice_number: 'T1111111111111',
    prefecture: '東京都',
    status: 'active',
    availability_status: 'available',
    available_from: '2026-06-01',
    unit_price: 750000,
    skills: ['React', 'Node.js', 'TypeScript'],
    notes: 'フルスタック対応可。',
    created_at: '2024-05-01T09:00:00Z',
    updated_at: '2026-05-01T09:00:00Z',
  },
  {
    id: 'FRL-002',
    last_name: '鈴木',
    first_name: '独立花子',
    last_name_kana: 'スズキ',
    first_name_kana: 'ドクリツハナコ',
    email: 'suzuki-free@example.com',
    phone: '080-2345-6789',
    trade_name: null,
    invoice_registration_status: 'not_registered',
    invoice_number: null,
    prefecture: '大阪府',
    status: 'active',
    availability_status: 'in_project',
    available_from: null,
    unit_price: 600000,
    skills: ['Java', 'Spring', 'Oracle'],
    notes: 'インボイス未登録。経過措置適用中。',
    created_at: '2024-08-01T09:00:00Z',
    updated_at: '2026-03-01T09:00:00Z',
  },
  {
    id: 'FRL-003',
    last_name: '佐藤',
    first_name: '事業三郎',
    last_name_kana: 'サトウ',
    first_name_kana: 'ジギョウサブロウ',
    email: 'sato-jigyou@example.com',
    phone: '070-3456-7890',
    trade_name: '佐藤ITコンサルティング',
    invoice_registration_status: 'pending',
    invoice_number: null,
    prefecture: '神奈川県',
    status: 'active',
    availability_status: 'available_soon',
    available_from: '2026-08-01',
    unit_price: 800000,
    skills: ['AWS', 'Terraform', 'アーキテクチャ設計'],
    notes: 'インボイス申請中。',
    created_at: '2025-01-15T09:00:00Z',
    updated_at: '2026-04-10T09:00:00Z',
  },
]

function toListItem(p: Partner): PartnerListItem {
  const eng = engineers.filter((e) => e.partner_id === p.id && e.status === 'active')
  const activeProj = eng.filter((e) => e.availability_status === 'in_project').length
  return {
    id: p.id,
    name: p.name,
    prefecture: p.prefecture,
    status: p.status,
    engineer_count: eng.length,
    active_project_count: activeProj,
    tags: p.tags,
    updated_at: p.updated_at,
  }
}

export const partnerHandlers = [
  http.get('/api/partners', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = [...partners]
    if (q) list = list.filter((p) => p.name.includes(q) || p.name_kana?.includes(q))
    if (status) list = list.filter((p) => p.status === status)

    const statusCounts = partners.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1
      return acc
    }, {})

    const start = (page - 1) * limit
    return HttpResponse.json({
      items: list.slice(start, start + limit).map(toListItem),
      total: list.length,
      status_counts: statusCounts,
    })
  }),

  http.get('/api/partners/:id', ({ params }) => {
    const partner = partners.find((p) => p.id === params.id)
    if (!partner) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      ...partner,
      engineers: engineers.filter((e) => e.partner_id === params.id),
    })
  }),

  http.post('/api/partners', async ({ request }) => {
    const body = (await request.json()) as Partial<Partner>
    const now = new Date().toISOString()
    const newPartner: Partner = {
      id: `PRT-${Date.now()}`,
      name: body.name ?? '',
      name_kana: body.name_kana ?? null,
      corporate_number: body.corporate_number ?? null,
      invoice_number: body.invoice_number ?? null,
      prefecture: body.prefecture ?? null,
      address: body.address ?? null,
      phone: body.phone ?? null,
      website_url: body.website_url ?? null,
      status: body.status ?? 'active',
      tags: body.tags ?? [],
      notes: body.notes ?? null,
      created_at: now,
      updated_at: now,
    }
    partners.push(newPartner)
    return HttpResponse.json(newPartner, { status: 201 })
  }),

  http.put('/api/partners/:id', async ({ params, request }) => {
    const idx = partners.findIndex((p) => p.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<Partner>
    partners[idx] = { ...partners[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(partners[idx])
  }),

  http.get('/api/partners/:id/engineers', ({ params }) => {
    const list = engineers.filter((e) => e.partner_id === params.id)
    return HttpResponse.json({ items: list })
  }),

  http.post('/api/partners/:id/engineers', async ({ params, request }) => {
    const body = (await request.json()) as Partial<PartnerEngineer>
    const now = new Date().toISOString()
    const newEngineer: PartnerEngineer = {
      id: `PENG-${Date.now()}`,
      partner_id: params.id as string,
      last_name: body.last_name ?? '',
      first_name: body.first_name ?? '',
      last_name_kana: body.last_name_kana ?? null,
      first_name_kana: body.first_name_kana ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      status: 'active',
      availability_status: body.availability_status ?? 'available',
      available_from: body.available_from ?? null,
      unit_price: body.unit_price ?? null,
      skills: body.skills ?? [],
      notes: body.notes ?? null,
      created_at: now,
      updated_at: now,
    }
    engineers.push(newEngineer)
    return HttpResponse.json(newEngineer, { status: 201 })
  }),

  http.put('/api/partners/:id/engineers/:engineerId', async ({ params, request }) => {
    const idx = engineers.findIndex((e) => e.id === params.engineerId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<PartnerEngineer>
    engineers[idx] = { ...engineers[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(engineers[idx])
  }),

  http.get('/api/freelancers', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const availabilityStatus = url.searchParams.get('availability_status') ?? ''
    const invoiceStatus = url.searchParams.get('invoice_status') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = [...freelancers]
    if (q) list = list.filter((f) => `${f.last_name}${f.first_name}`.includes(q) || f.trade_name?.includes(q))
    if (availabilityStatus) list = list.filter((f) => f.availability_status === availabilityStatus)
    if (invoiceStatus) list = list.filter((f) => f.invoice_registration_status === invoiceStatus)

    const start = (page - 1) * limit
    return HttpResponse.json({
      items: list.slice(start, start + limit),
      total: list.length,
    })
  }),

  http.get('/api/freelancers/:id', ({ params }) => {
    const freelancer = freelancers.find((f) => f.id === params.id)
    if (!freelancer) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(freelancer)
  }),

  http.post('/api/freelancers', async ({ request }) => {
    const body = (await request.json()) as Partial<Freelancer>
    const now = new Date().toISOString()
    const newFreelancer: Freelancer = {
      id: `FRL-${Date.now()}`,
      last_name: body.last_name ?? '',
      first_name: body.first_name ?? '',
      last_name_kana: body.last_name_kana ?? null,
      first_name_kana: body.first_name_kana ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      trade_name: body.trade_name ?? null,
      invoice_registration_status: body.invoice_registration_status ?? 'not_registered',
      invoice_number: body.invoice_number ?? null,
      prefecture: body.prefecture ?? null,
      status: body.status ?? 'active',
      availability_status: body.availability_status ?? 'available',
      available_from: body.available_from ?? null,
      unit_price: body.unit_price ?? null,
      skills: body.skills ?? [],
      notes: body.notes ?? null,
      created_at: now,
      updated_at: now,
    }
    freelancers.push(newFreelancer)
    return HttpResponse.json(newFreelancer, { status: 201 })
  }),

  http.put('/api/freelancers/:id', async ({ params, request }) => {
    const idx = freelancers.findIndex((f) => f.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<Freelancer>
    freelancers[idx] = { ...freelancers[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(freelancers[idx])
  }),
]
