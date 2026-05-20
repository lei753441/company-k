import { http, HttpResponse } from 'msw'
import type { Company, CompanyListItem, Contact, Interaction, CompanyStatus } from '@/types/customer'

let companies: Company[] = [
  {
    id: 'CMP-001',
    company_type: 'customer',
    name: '株式会社テックコーポレーション',
    name_kana: 'カブシキガイシャテックコーポレーション',
    corporate_number: '1234567890123',
    industry: 'IT・通信',
    prefecture: '東京都',
    address: '渋谷区渋谷1-1-1 テックビル8F',
    phone: '03-1234-5678',
    website_url: 'https://techcorp.example.com',
    status: 'active',
    tags: ['SES', '大手', 'React'],
    notes: '主要取引先。毎期複数名の常駐依頼あり。担当: 田中部長',
    created_by: 'EMP-20200101-0001',
    created_at: '2024-01-10T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'CMP-002',
    company_type: 'customer',
    name: '大手銀行グループ',
    name_kana: 'オオテギンコウグループ',
    corporate_number: '9876543210987',
    industry: '金融・保険',
    prefecture: '東京都',
    address: '千代田区丸の内2-2-2',
    phone: '03-9876-5432',
    website_url: null,
    status: 'active',
    tags: ['金融', 'Java', '大規模'],
    notes: '機密情報多数。担当者の名刺管理に注意。',
    created_by: 'EMP-20200101-0001',
    created_at: '2024-03-15T09:00:00Z',
    updated_at: '2026-03-20T09:00:00Z',
  },
  {
    id: 'CMP-003',
    company_type: 'customer',
    name: '日本流通株式会社',
    name_kana: 'ニホンリュウツウカブシキガイシャ',
    corporate_number: null,
    industry: '物流・運送',
    prefecture: '神奈川県',
    address: '横浜市西区みなとみらい3-3-3',
    phone: '045-111-2222',
    website_url: 'https://nichiryutsu.example.com',
    status: 'active',
    tags: ['受託', '物流', 'AWS'],
    notes: '在庫管理システムの受託開発中。',
    created_by: 'EMP-20200101-0001',
    created_at: '2025-11-01T09:00:00Z',
    updated_at: '2026-02-15T09:00:00Z',
  },
  {
    id: 'CMP-004',
    company_type: 'both',
    name: 'グローバルIT株式会社',
    name_kana: 'グローバルアイティーカブシキガイシャ',
    corporate_number: null,
    industry: 'IT・通信',
    prefecture: '大阪府',
    address: '大阪市北区梅田1-1-1',
    phone: '06-3333-4444',
    website_url: null,
    status: 'dormant',
    tags: ['パートナー'],
    notes: '以前は協力会社として活用。現在は取引休止中。',
    created_by: 'EMP-20200101-0001',
    created_at: '2023-06-01T09:00:00Z',
    updated_at: '2025-01-01T09:00:00Z',
  },
]

let contacts: Contact[] = [
  { id: 'CON-001', company_id: 'CMP-001', last_name: '田中', first_name: '一郎', last_name_kana: 'タナカ', first_name_kana: 'イチロウ', department: '情報システム部', title: '部長', email: 'tanaka@techcorp.example.com', phone: '03-1234-5679', mobile: '090-1111-2222', status: 'active', notes: 'キーマン。意思決定権あり。', created_at: '2024-01-10T09:00:00Z', updated_at: '2024-01-10T09:00:00Z' },
  { id: 'CON-002', company_id: 'CMP-001', last_name: '佐藤', first_name: '次郎', last_name_kana: 'サトウ', first_name_kana: 'ジロウ', department: '情報システム部', title: '課長', email: 'sato@techcorp.example.com', phone: null, mobile: '090-3333-4444', status: 'active', notes: '実務担当者。要件の詳細はこちらから。', created_at: '2024-02-01T09:00:00Z', updated_at: '2024-02-01T09:00:00Z' },
  { id: 'CON-003', company_id: 'CMP-002', last_name: '山本', first_name: '三郎', last_name_kana: 'ヤマモト', first_name_kana: 'サブロウ', department: 'システム企画部', title: 'マネージャー', email: 'yamamoto@bank.example.com', phone: '03-9876-0001', mobile: null, status: 'active', notes: null, created_at: '2024-03-15T09:00:00Z', updated_at: '2024-03-15T09:00:00Z' },
  { id: 'CON-004', company_id: 'CMP-003', last_name: '伊藤', first_name: '四郎', last_name_kana: 'イトウ', first_name_kana: 'シロウ', department: 'IT推進部', title: '課長', email: 'ito@nichiryutsu.example.com', phone: '045-111-3333', mobile: '080-5555-6666', status: 'active', notes: 'プロジェクトオーナー。', created_at: '2025-11-01T09:00:00Z', updated_at: '2025-11-01T09:00:00Z' },
]

let interactions: Interaction[] = [
  { id: 'INT-001', company_id: 'CMP-001', project_id: 'PRJ-2026-0001', project_name: 'ECサイトリニューアル支援', interaction_type: 'meeting', interacted_at: '2026-05-10T14:00:00Z', our_attendees: ['EMP-20200101-0001'], client_contact_ids: ['CON-001', 'CON-002'], client_contact_names: ['田中 一郎', '佐藤 次郎'], subject: '5月月次報告・6月計画確認', content: '進捗報告を実施。フロントエンド実装が予定通り進捗していることを確認。6月は決済フローの実装に着手する予定。', next_action: '6月5日までに決済フロー設計書を提出', follow_up_date: '2026-06-05', created_by: 'EMP-20200101-0001', created_by_name: '管理者 太郎', created_at: '2026-05-10T16:00:00Z', updated_at: '2026-05-10T16:00:00Z' },
  { id: 'INT-002', company_id: 'CMP-001', project_id: null, project_name: null, interaction_type: 'phone', interacted_at: '2026-04-15T11:00:00Z', our_attendees: ['EMP-20200101-0001'], client_contact_ids: ['CON-001'], client_contact_names: ['田中 一郎'], subject: '追加案件の打診', content: '田中部長より新たなAPI基盤整備案件について打診があった。7月以降に本格的に要件ヒアリングを行う予定。', next_action: '7月上旬に要件ヒアリングのアポ取り', follow_up_date: '2026-06-30', created_by: 'EMP-20200101-0001', created_by_name: '管理者 太郎', created_at: '2026-04-15T12:00:00Z', updated_at: '2026-04-15T12:00:00Z' },
  { id: 'INT-003', company_id: 'CMP-002', project_id: 'PRJ-2026-0002', project_name: '大手銀行システム刷新PJ', interaction_type: 'online', interacted_at: '2026-05-08T10:00:00Z', our_attendees: ['EMP-20200101-0001'], client_contact_ids: ['CON-003'], client_contact_names: ['山本 三郎'], subject: '提案内容の確認MTG', content: '先月提出した提案書についての質疑応答。スキル要件と体制案を中心に詳細確認。追加で架電耐障害設計の実績を求められた。', next_action: '実績資料を追加して再提案', follow_up_date: '2026-05-20', created_by: 'EMP-20200101-0001', created_by_name: '管理者 太郎', created_at: '2026-05-08T12:00:00Z', updated_at: '2026-05-08T12:00:00Z' },
  { id: 'INT-004', company_id: 'CMP-003', project_id: 'PRJ-2026-0003', project_name: '在庫管理システム受託開発', interaction_type: 'meeting', interacted_at: '2026-04-25T13:00:00Z', our_attendees: ['EMP-20200101-0001'], client_contact_ids: ['CON-004'], client_contact_names: ['伊藤 四郎'], subject: 'キックオフMTG', content: '受託開発案件のキックオフを実施。伊藤課長よりプロジェクト背景と期待を説明いただいた。マイルストーンと連絡体制を合意。', next_action: '5月中に基本設計書の第1版を提出', follow_up_date: null, created_by: 'EMP-20200101-0001', created_by_name: '管理者 太郎', created_at: '2026-04-25T15:00:00Z', updated_at: '2026-04-25T15:00:00Z' },
]

function toListItem(c: Company): CompanyListItem {
  const compContacts = contacts.filter((ct) => ct.company_id === c.id && ct.status === 'active')
  const compInteractions = interactions.filter((i) => i.company_id === c.id)
  const lastInteraction = compInteractions.sort((a, b) => b.interacted_at.localeCompare(a.interacted_at))[0]
  return {
    id: c.id,
    company_type: c.company_type,
    name: c.name,
    industry: c.industry,
    prefecture: c.prefecture,
    status: c.status,
    tags: c.tags,
    contact_count: compContacts.length,
    last_interaction_at: lastInteraction?.interacted_at ?? null,
    updated_at: c.updated_at,
  }
}

export const customerHandlers = [
  http.get('/api/companies', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const type = url.searchParams.get('company_type') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = [...companies]
    if (q) list = list.filter((c) => c.name.includes(q) || c.name_kana?.includes(q))
    if (status) list = list.filter((c) => c.status === status)
    if (type) list = list.filter((c) => c.company_type === type)

    const statusCounts = companies.reduce<Record<string, number>>((acc, c) => {
      acc[c.status] = (acc[c.status] ?? 0) + 1
      return acc
    }, {})

    const start = (page - 1) * limit
    return HttpResponse.json({
      items: list.slice(start, start + limit).map(toListItem),
      total: list.length,
      page,
      limit,
      status_counts: statusCounts,
    })
  }),

  http.get('/api/companies/:id', ({ params }) => {
    const company = companies.find((c) => c.id === params.id)
    if (!company) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      ...company,
      contacts: contacts.filter((c) => c.company_id === params.id),
      interactions: interactions
        .filter((i) => i.company_id === params.id)
        .sort((a, b) => b.interacted_at.localeCompare(a.interacted_at)),
    })
  }),

  http.post('/api/companies', async ({ request }) => {
    const body = (await request.json()) as Partial<Company>
    const now = new Date().toISOString()
    const newCompany: Company = {
      id: `CMP-${Date.now()}`,
      company_type: body.company_type ?? 'customer',
      name: body.name ?? '',
      name_kana: body.name_kana ?? null,
      corporate_number: body.corporate_number ?? null,
      industry: body.industry ?? null,
      prefecture: body.prefecture ?? null,
      address: body.address ?? null,
      phone: body.phone ?? null,
      website_url: body.website_url ?? null,
      status: body.status ?? 'prospect',
      tags: body.tags ?? [],
      notes: body.notes ?? null,
      created_by: 'EMP-20200101-0001',
      created_at: now,
      updated_at: now,
    }
    companies.push(newCompany)
    return HttpResponse.json(newCompany, { status: 201 })
  }),

  http.put('/api/companies/:id', async ({ params, request }) => {
    const idx = companies.findIndex((c) => c.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<Company>
    companies[idx] = { ...companies[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(companies[idx])
  }),

  // Contacts
  http.post('/api/companies/:id/contacts', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Contact>
    const now = new Date().toISOString()
    const newContact: Contact = {
      id: `CON-${Date.now()}`,
      company_id: params.id as string,
      last_name: body.last_name ?? '',
      first_name: body.first_name ?? '',
      last_name_kana: body.last_name_kana ?? null,
      first_name_kana: body.first_name_kana ?? null,
      department: body.department ?? null,
      title: body.title ?? null,
      email: body.email ?? null,
      phone: body.phone ?? null,
      mobile: body.mobile ?? null,
      status: 'active',
      notes: body.notes ?? null,
      created_at: now,
      updated_at: now,
    }
    contacts.push(newContact)
    return HttpResponse.json(newContact, { status: 201 })
  }),

  http.put('/api/companies/:id/contacts/:contactId', async ({ params, request }) => {
    const idx = contacts.findIndex((c) => c.id === params.contactId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<Contact>
    contacts[idx] = { ...contacts[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(contacts[idx])
  }),

  http.delete('/api/companies/:id/contacts/:contactId', ({ params }) => {
    const idx = contacts.findIndex((c) => c.id === params.contactId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    contacts[idx] = { ...contacts[idx], status: 'resigned', updated_at: new Date().toISOString() }
    return HttpResponse.json(contacts[idx])
  }),

  // Interactions
  http.post('/api/companies/:id/interactions', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Interaction>
    const now = new Date().toISOString()
    const newInteraction: Interaction = {
      id: `INT-${Date.now()}`,
      company_id: params.id as string,
      project_id: body.project_id ?? null,
      project_name: body.project_name ?? null,
      interaction_type: body.interaction_type ?? 'meeting',
      interacted_at: body.interacted_at ?? now,
      our_attendees: body.our_attendees ?? ['EMP-20200101-0001'],
      client_contact_ids: body.client_contact_ids ?? [],
      client_contact_names: body.client_contact_names ?? [],
      subject: body.subject ?? '',
      content: body.content ?? '',
      next_action: body.next_action ?? null,
      follow_up_date: body.follow_up_date ?? null,
      created_by: 'EMP-20200101-0001',
      created_by_name: '管理者 太郎',
      created_at: now,
      updated_at: now,
    }
    interactions.push(newInteraction)
    return HttpResponse.json(newInteraction, { status: 201 })
  }),

  http.put('/api/companies/:id/interactions/:interactionId', async ({ params, request }) => {
    const idx = interactions.findIndex((i) => i.id === params.interactionId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<Interaction>
    interactions[idx] = { ...interactions[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(interactions[idx])
  }),

  // Follow-up list
  http.get('/api/interactions/followup', ({ request }) => {
    const today = new Date().toISOString().slice(0, 10)
    const list = interactions
      .filter((i) => i.follow_up_date && i.follow_up_date <= today)
      .sort((a, b) => (a.follow_up_date ?? '').localeCompare(b.follow_up_date ?? ''))
      .map((i) => {
        const company = companies.find((c) => c.id === i.company_id)
        return { ...i, company_name: company?.name ?? '' }
      })
    return HttpResponse.json({ items: list, total: list.length })
  }),

  // Company search (used by project form)
  http.get('/api/companies/search', ({ request }) => {
    const q = new URL(request.url).searchParams.get('q') ?? ''
    const list = companies
      .filter((c) => c.name.includes(q) || c.name_kana?.includes(q))
      .slice(0, 10)
      .map((c) => ({ id: c.id, name: c.name }))
    return HttpResponse.json({ items: list })
  }),
]
