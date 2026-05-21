import { http, HttpResponse } from 'msw'
import type { Invoice, InvoiceListItem, PaymentRecord, BillingSummary } from '@/types/billing'

let invoices: Invoice[] = [
  {
    id: 'INV-2026-05-001',
    invoice_number: 'INV-2026-05-001',
    customer_id: 'CUST-001',
    customer_name: '株式会社テックコーポレーション',
    project_id: 'PRJ-2026-0001',
    project_name: 'ECサイトリニューアル支援',
    billing_year_month: '2026-05',
    invoice_date: '2026-05-31',
    due_date: '2026-06-30',
    status: 'sent',
    subtotal: 1000000,
    tax_rate: 0.1,
    tax_amount: 100000,
    total_amount: 1100000,
    our_invoice_number: 'OUR-2026-05-001',
    payment_received_amount: 0,
    payment_received_date: null,
    note: null,
    sent_at: '2026-05-31T10:00:00Z',
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-05-30T15:00:00Z',
    parent_invoice_id: null,
    is_locked: false,
    items: [
      {
        id: 'ITEM-001-1',
        invoice_id: 'INV-2026-05-001',
        line_number: 1,
        description: '山田 太郎 SES業務（5月）',
        worker_name: '山田 太郎',
        work_type: 'normal',
        quantity: 160,
        unit: '時間',
        unit_price: 5000,
        amount: 800000,
        tax_rate: 0.1,
      },
      {
        id: 'ITEM-001-2',
        invoice_id: 'INV-2026-05-001',
        line_number: 2,
        description: '山田 太郎 残業代（5月）',
        worker_name: '山田 太郎',
        work_type: 'overtime',
        quantity: 40,
        unit: '時間',
        unit_price: 5000,
        amount: 200000,
        tax_rate: 0.1,
      },
    ],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-31T10:00:00Z',
  },
  {
    id: 'INV-2026-05-002',
    invoice_number: 'INV-2026-05-002',
    customer_id: 'CUST-002',
    customer_name: '大手銀行グループ',
    project_id: 'PRJ-2026-0002',
    project_name: '大手銀行システム刷新PJ',
    billing_year_month: '2026-05',
    invoice_date: '2026-05-31',
    due_date: '2026-06-30',
    status: 'paid',
    subtotal: 500000,
    tax_rate: 0.1,
    tax_amount: 50000,
    total_amount: 550000,
    our_invoice_number: 'OUR-2026-05-002',
    payment_received_amount: 550000,
    payment_received_date: '2026-06-15',
    note: '入金確認済み',
    sent_at: '2026-05-31T11:00:00Z',
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-05-30T16:00:00Z',
    parent_invoice_id: null,
    is_locked: true,
    items: [
      {
        id: 'ITEM-002-1',
        invoice_id: 'INV-2026-05-002',
        line_number: 1,
        description: '鈴木 花子 SES業務（5月）',
        worker_name: '鈴木 花子',
        work_type: 'normal',
        quantity: 176,
        unit: '時間',
        unit_price: 2840,
        amount: 500000,
        tax_rate: 0.1,
      },
    ],
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-06-15T00:00:00Z',
  },
  {
    id: 'INV-2026-04-001',
    invoice_number: 'INV-2026-04-001',
    customer_id: 'CUST-003',
    customer_name: '製造業大手株式会社',
    project_id: 'PRJ-2026-0003',
    project_name: '在庫管理システム受託開発',
    billing_year_month: '2026-04',
    invoice_date: '2026-04-30',
    due_date: '2026-05-31',
    status: 'overdue',
    subtotal: 800000,
    tax_rate: 0.1,
    tax_amount: 80000,
    total_amount: 880000,
    our_invoice_number: 'OUR-2026-04-001',
    payment_received_amount: 0,
    payment_received_date: null,
    note: '支払期日超過。督促中。',
    sent_at: '2026-04-30T10:00:00Z',
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-04-29T15:00:00Z',
    parent_invoice_id: null,
    is_locked: false,
    items: [
      {
        id: 'ITEM-003-1',
        invoice_id: 'INV-2026-04-001',
        line_number: 1,
        description: '在庫管理システム開発（4月）',
        worker_name: null,
        work_type: 'normal',
        quantity: 1,
        unit: '式',
        unit_price: 800000,
        amount: 800000,
        tax_rate: 0.1,
      },
    ],
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-04-30T10:00:00Z',
  },
  {
    id: 'INV-2026-05-003',
    invoice_number: 'INV-2026-05-003',
    customer_id: 'CUST-001',
    customer_name: '株式会社テックコーポレーション',
    project_id: null,
    project_name: null,
    billing_year_month: '2026-05',
    invoice_date: '2026-05-31',
    due_date: '2026-06-30',
    status: 'draft',
    subtotal: 700000,
    tax_rate: 0.1,
    tax_amount: 70000,
    total_amount: 770000,
    our_invoice_number: 'OUR-2026-05-003',
    payment_received_amount: 0,
    payment_received_date: null,
    note: null,
    sent_at: null,
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    parent_invoice_id: null,
    is_locked: false,
    items: [
      {
        id: 'ITEM-004-1',
        invoice_id: 'INV-2026-05-003',
        line_number: 1,
        description: '田中 次郎 SES業務（5月）',
        worker_name: '田中 次郎',
        work_type: 'normal',
        quantity: 140,
        unit: '時間',
        unit_price: 5000,
        amount: 700000,
        tax_rate: 0.1,
      },
    ],
    created_at: '2026-05-15T00:00:00Z',
    updated_at: '2026-05-15T00:00:00Z',
  },
]

let paymentRecords: PaymentRecord[] = [
  {
    id: 'PAY-2026-05-001',
    payee_id: 'PARTNER-001',
    payee_name: '株式会社サポートテック',
    payee_type: 'company',
    project_id: 'PRJ-2026-0001',
    project_name: 'ECサイトリニューアル支援',
    payment_year_month: '2026-05',
    status: 'approved',
    work_minutes_normal: 9600,
    work_minutes_overtime: 1200,
    work_minutes_holiday: 0,
    unit_price: 400000,
    subtotal: 400000,
    is_invoice_registered: true,
    invoice_registration_number: 'T1234567890123',
    tax_rate: 0.1,
    tax_amount_full: 40000,
    deductible_tax_ratio: 1.0,
    deductible_tax_amount: 40000,
    withholding_tax_amount: 0,
    total_payment: 440000,
    scheduled_payment_date: '2026-06-25',
    actual_payment_date: null,
    note: null,
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-05-31T10:00:00Z',
    is_locked: false,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-31T10:00:00Z',
  },
  {
    id: 'PAY-2026-05-002',
    payee_id: 'FREELANCER-001',
    payee_name: '佐藤 一郎',
    payee_type: 'freelancer',
    project_id: 'PRJ-2026-0002',
    project_name: '大手銀行システム刷新PJ',
    payment_year_month: '2026-05',
    status: 'pending_review',
    work_minutes_normal: 8400,
    work_minutes_overtime: 600,
    work_minutes_holiday: 0,
    unit_price: 350000,
    subtotal: 350000,
    is_invoice_registered: false,
    invoice_registration_number: null,
    tax_rate: 0.1,
    tax_amount_full: 35000,
    deductible_tax_ratio: 0.8,
    deductible_tax_amount: 28000,
    withholding_tax_amount: 35700,
    total_payment: 356000,
    scheduled_payment_date: '2026-06-25',
    actual_payment_date: null,
    note: '経過措置80%適用（免税事業者）',
    approved_by: null,
    approved_by_name: null,
    approved_at: null,
    is_locked: false,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-20T00:00:00Z',
  },
  {
    id: 'PAY-2026-05-003',
    payee_id: 'PARTNER-002',
    payee_name: '株式会社クリエイティブIT',
    payee_type: 'company',
    project_id: 'PRJ-2026-0003',
    project_name: '在庫管理システム受託開発',
    payment_year_month: '2026-05',
    status: 'paid',
    work_minutes_normal: 7680,
    work_minutes_overtime: 0,
    work_minutes_holiday: 0,
    unit_price: 300000,
    subtotal: 300000,
    is_invoice_registered: true,
    invoice_registration_number: 'T9876543210987',
    tax_rate: 0.1,
    tax_amount_full: 30000,
    deductible_tax_ratio: 1.0,
    deductible_tax_amount: 30000,
    withholding_tax_amount: 0,
    total_payment: 330000,
    scheduled_payment_date: '2026-05-25',
    actual_payment_date: '2026-05-25',
    note: null,
    approved_by: 'EMP-20200101-0001',
    approved_by_name: '管理者 太郎',
    approved_at: '2026-05-20T09:00:00Z',
    is_locked: true,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-05-25T00:00:00Z',
  },
]

function toListItem(inv: Invoice): InvoiceListItem {
  return {
    id: inv.id,
    invoice_number: inv.invoice_number,
    customer_name: inv.customer_name,
    project_name: inv.project_name,
    billing_year_month: inv.billing_year_month,
    invoice_date: inv.invoice_date,
    due_date: inv.due_date,
    status: inv.status,
    total_amount: inv.total_amount,
    payment_received_amount: inv.payment_received_amount,
    sent_at: inv.sent_at,
  }
}

export const billingHandlers = [
  http.get('/api/invoices', ({ request }) => {
    const url = new URL(request.url)
    const yearMonth = url.searchParams.get('year_month') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const customerId = url.searchParams.get('customer_id') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = [...invoices]
    if (yearMonth) list = list.filter((inv) => inv.billing_year_month === yearMonth)
    if (status) list = list.filter((inv) => inv.status === status)
    if (customerId) list = list.filter((inv) => inv.customer_id === customerId)

    const statusCounts = invoices.reduce<Record<string, number>>((acc, inv) => {
      acc[inv.status] = (acc[inv.status] ?? 0) + 1
      return acc
    }, {})

    const start = (page - 1) * limit
    return HttpResponse.json({
      items: list.slice(start, start + limit).map(toListItem),
      total: list.length,
      page,
      status_counts: statusCounts,
    })
  }),

  http.get('/api/invoices/:id', ({ params }) => {
    const inv = invoices.find((i) => i.id === params.id)
    if (!inv) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(inv)
  }),

  http.put('/api/invoices/:id', async ({ params, request }) => {
    const idx = invoices.findIndex((i) => i.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<Invoice>
    invoices[idx] = { ...invoices[idx], ...body, updated_at: new Date().toISOString() }
    return HttpResponse.json(invoices[idx])
  }),

  http.post('/api/invoices/:id/send', ({ params }) => {
    const idx = invoices.findIndex((i) => i.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    invoices[idx] = {
      ...invoices[idx],
      status: 'sent',
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(invoices[idx])
  }),

  http.post('/api/invoices/:id/approve', ({ params }) => {
    const idx = invoices.findIndex((i) => i.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    invoices[idx] = {
      ...invoices[idx],
      status: 'pending_approval',
      approved_by: 'EMP-20200101-0001',
      approved_by_name: '管理者 太郎',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(invoices[idx])
  }),

  http.post('/api/invoices/:id/receive-payment', async ({ params, request }) => {
    const idx = invoices.findIndex((i) => i.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { amount: number; date: string }
    const newReceived = invoices[idx].payment_received_amount + body.amount
    const total = invoices[idx].total_amount
    const newStatus = newReceived >= total ? 'paid' : 'partially_paid'
    invoices[idx] = {
      ...invoices[idx],
      payment_received_amount: newReceived,
      payment_received_date: body.date,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(invoices[idx])
  }),

  http.get('/api/payment-records', ({ request }) => {
    const url = new URL(request.url)
    const yearMonth = url.searchParams.get('year_month') ?? ''
    const status = url.searchParams.get('status') ?? ''
    const page = Number(url.searchParams.get('page') ?? 1)
    const limit = 20

    let list = [...paymentRecords]
    if (yearMonth) list = list.filter((p) => p.payment_year_month === yearMonth)
    if (status) list = list.filter((p) => p.status === status)

    const statusCounts = paymentRecords.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1
      return acc
    }, {})

    const start = (page - 1) * limit
    return HttpResponse.json({
      items: list.slice(start, start + limit),
      total: list.length,
      page,
      status_counts: statusCounts,
    })
  }),

  http.get('/api/payment-records/:id', ({ params }) => {
    const rec = paymentRecords.find((p) => p.id === params.id)
    if (!rec) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(rec)
  }),

  http.post('/api/payment-records/:id/approve', ({ params }) => {
    const idx = paymentRecords.findIndex((p) => p.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    paymentRecords[idx] = {
      ...paymentRecords[idx],
      status: 'approved',
      approved_by: 'EMP-20200101-0001',
      approved_by_name: '管理者 太郎',
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(paymentRecords[idx])
  }),

  http.post('/api/payment-records/:id/mark-paid', ({ params }) => {
    const idx = paymentRecords.findIndex((p) => p.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    paymentRecords[idx] = {
      ...paymentRecords[idx],
      status: 'paid',
      actual_payment_date: new Date().toISOString().slice(0, 10),
      is_locked: true,
      updated_at: new Date().toISOString(),
    }
    return HttpResponse.json(paymentRecords[idx])
  }),

  http.get('/api/billing/summary/:yearMonth', ({ params }) => {
    const ym = params.yearMonth as string
    const filteredInv = invoices.filter((inv) => inv.billing_year_month === ym)
    const filteredPay = paymentRecords.filter((p) => p.payment_year_month === ym)

    const total_invoiced = filteredInv.reduce((s, i) => s + i.total_amount, 0)
    const total_received = filteredInv.reduce((s, i) => s + i.payment_received_amount, 0)
    const total_outstanding = total_invoiced - total_received
    const total_payment = filteredPay.reduce((s, p) => s + p.total_payment, 0)

    const invoice_count_by_status = filteredInv.reduce<Record<string, number>>((acc, inv) => {
      acc[inv.status] = (acc[inv.status] ?? 0) + 1
      return acc
    }, {})

    const payment_count_by_status = filteredPay.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1
      return acc
    }, {})

    const summary: BillingSummary = {
      year_month: ym,
      total_invoiced,
      total_received,
      total_outstanding,
      total_payment,
      invoice_count_by_status,
      payment_count_by_status,
    }
    return HttpResponse.json(summary)
  }),
]
