import { http, HttpResponse } from 'msw'
import type { Contract, ContractListItem } from '@/types/contract'

let contracts: Contract[] = [
  {
    id: 'CTR-001',
    contract_number: 'CON-2024-0001',
    contract_type: 'ses_commission',
    party_type: 'customer',
    party_id: 'CMP-001',
    party_name: '株式会社テックコーポレーション',
    project_id: 'PRJ-2026-0001',
    project_name: 'ECサイトリニューアル支援',
    title: 'SES準委任契約（ECサイトリニューアル）',
    status: 'active',
    start_date: '2024-04-01',
    end_date: '2026-09-30',
    is_auto_renewal: true,
    renewal_notice_months: 3,
    unit_price: 800000,
    unit_type: 'monthly',
    overtime_rate: 125,
    holiday_rate: 135,
    standard_work_hours: 160,
    upper_limit_hours: 180,
    lower_limit_hours: 140,
    fixed_amount: null,
    payment_terms: '月末締め翌月末払い',
    note: null,
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2024-03-15T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'CTR-002',
    contract_number: 'CON-2025-0001',
    contract_type: 'lump_sum',
    party_type: 'customer',
    party_id: 'CMP-003',
    party_name: '日本流通株式会社',
    project_id: 'PRJ-2026-0003',
    project_name: '在庫管理システム受託開発',
    title: '在庫管理システム開発請負契約',
    status: 'active',
    start_date: '2025-11-01',
    end_date: '2026-07-31',
    is_auto_renewal: false,
    renewal_notice_months: 2,
    unit_price: null,
    unit_type: null,
    overtime_rate: null,
    holiday_rate: null,
    standard_work_hours: null,
    upper_limit_hours: null,
    lower_limit_hours: null,
    fixed_amount: 5000000,
    payment_terms: '検収完了後30日以内',
    note: '中間納品時に50%、最終検収後に50%支払い。',
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2025-10-20T09:00:00Z',
    updated_at: '2025-11-01T09:00:00Z',
  },
  {
    id: 'CTR-003',
    contract_number: 'CON-2026-0001',
    contract_type: 'outsource_company',
    party_type: 'partner',
    party_id: 'PTR-001',
    party_name: '株式会社グローバルIT開発',
    project_id: 'PRJ-2026-0001',
    project_name: 'ECサイトリニューアル支援',
    title: '業務委託契約（協力会社）',
    status: 'active',
    start_date: '2026-04-01',
    end_date: '2026-09-30',
    is_auto_renewal: false,
    renewal_notice_months: 2,
    unit_price: 600000,
    unit_type: 'monthly',
    overtime_rate: null,
    holiday_rate: null,
    standard_work_hours: null,
    upper_limit_hours: null,
    lower_limit_hours: null,
    fixed_amount: null,
    payment_terms: '月末締め翌月末払い',
    note: null,
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2026-03-20T09:00:00Z',
    updated_at: '2026-04-01T09:00:00Z',
  },
  {
    id: 'CTR-004',
    contract_number: 'CON-2025-0002',
    contract_type: 'outsource_freelancer',
    party_type: 'freelancer',
    party_id: 'FRL-001',
    party_name: '田中フリー太郎',
    project_id: 'PRJ-2026-0002',
    project_name: '大手銀行システム刷新PJ',
    title: '業務委託契約（個人）',
    status: 'renewal_due',
    start_date: '2025-04-01',
    end_date: '2026-05-31',
    is_auto_renewal: false,
    renewal_notice_months: 2,
    unit_price: 550000,
    unit_type: 'monthly',
    overtime_rate: null,
    holiday_rate: null,
    standard_work_hours: null,
    upper_limit_hours: null,
    lower_limit_hours: null,
    fixed_amount: null,
    payment_terms: '月末締め翌月末払い',
    note: '更新要確認。スキルマッチ良好。',
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2025-03-15T09:00:00Z',
    updated_at: '2026-05-10T09:00:00Z',
  },
]

function toListItem(c: Contract): ContractListItem {
  return {
    id: c.id,
    contract_number: c.contract_number,
    contract_type: c.contract_type,
    party_name: c.party_name,
    project_name: c.project_name,
    title: c.title,
    status: c.status,
    start_date: c.start_date,
    end_date: c.end_date,
    days_until_expiry: getDaysUntilExpiry(c),
    unit_price: c.unit_price ?? c.fixed_amount,
  }
}

function getDaysUntilExpiry(c: Contract): number | null {
  if (!c.end_date) return null
  const today = new Date('2026-05-20')
  const end = new Date(c.end_date)
  const diff = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return diff
}

export const contractHandlers = [
  http.get('/api/contracts/renewal-alerts', () => {
    const list = contracts
      .filter((c) => {
        const days = getDaysUntilExpiry(c)
        return days !== null && days <= 90
      })
      .map(toListItem)
    return HttpResponse.json({ items: list, total: list.length })
  }),

  http.get('/api/contracts', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const contractType = url.searchParams.get('contract_type') ?? ''
    const partyType = url.searchParams.get('party_type') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = [...contracts]
    if (q) list = list.filter((c) => c.title.includes(q) || c.party_name.includes(q) || c.contract_number.includes(q))
    if (status) list = list.filter((c) => c.status === status)
    if (contractType) list = list.filter((c) => c.contract_type === contractType)
    if (partyType) list = list.filter((c) => c.party_type === partyType)

    const statusCounts = contracts.reduce<Record<string, number>>((acc, c) => {
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

  http.get('/api/contracts/:id', ({ params }) => {
    const contract = contracts.find((c) => c.id === params.id)
    if (!contract) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(contract)
  }),

  http.post('/api/contracts', async ({ request }) => {
    const body = (await request.json()) as Partial<Contract>
    const now = new Date().toISOString()
    const year = new Date().getFullYear()
    const seq = String(contracts.length + 1).padStart(4, '0')
    const newContract: Contract = {
      id: `CTR-${Date.now()}`,
      contract_number: `CON-${year}-${seq}`,
      contract_type: body.contract_type ?? 'ses_commission',
      party_type: body.party_type ?? 'customer',
      party_id: body.party_id ?? '',
      party_name: body.party_name ?? '',
      project_id: body.project_id ?? null,
      project_name: body.project_name ?? null,
      title: body.title ?? '',
      status: 'draft',
      start_date: body.start_date ?? '',
      end_date: body.end_date ?? null,
      is_auto_renewal: body.is_auto_renewal ?? false,
      renewal_notice_months: body.renewal_notice_months ?? 2,
      unit_price: body.unit_price ?? null,
      unit_type: body.unit_type ?? null,
      overtime_rate: body.overtime_rate ?? null,
      holiday_rate: body.holiday_rate ?? null,
      standard_work_hours: body.standard_work_hours ?? null,
      upper_limit_hours: body.upper_limit_hours ?? null,
      lower_limit_hours: body.lower_limit_hours ?? null,
      fixed_amount: body.fixed_amount ?? null,
      payment_terms: body.payment_terms ?? '',
      note: body.note ?? null,
      created_by: 'EMP-20200101-0001',
      created_by_name: '管理者 太郎',
      created_at: now,
      updated_at: now,
    }
    contracts.push(newContract)
    return HttpResponse.json(newContract, { status: 201 })
  }),

  http.put('/api/contracts/:id', async ({ params, request }) => {
    const idx = contracts.findIndex((c) => c.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<Contract>
    contracts[idx] = { ...contracts[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(contracts[idx])
  }),

  http.post('/api/contracts/:id/send-for-signing', ({ params }) => {
    const idx = contracts.findIndex((c) => c.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    contracts[idx] = { ...contracts[idx], status: 'signing', updated_at: new Date().toISOString() }
    return HttpResponse.json(contracts[idx])
  }),

  http.post('/api/contracts/:id/activate', ({ params }) => {
    const idx = contracts.findIndex((c) => c.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    contracts[idx] = { ...contracts[idx], status: 'active', updated_at: new Date().toISOString() }
    return HttpResponse.json(contracts[idx])
  }),

  http.post('/api/contracts/:id/cancel', ({ params }) => {
    const idx = contracts.findIndex((c) => c.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    contracts[idx] = { ...contracts[idx], status: 'cancelled', updated_at: new Date().toISOString() }
    return HttpResponse.json(contracts[idx])
  }),
]
