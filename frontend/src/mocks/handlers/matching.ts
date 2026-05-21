import { http, HttpResponse } from 'msw'
import type {
  MatchingCandidate,
  Proposal,
  ProposalCandidate,
  ProposalListItem,
  MatchingSearchParams,
  CandidateIntention,
  ProposalStatus,
} from '@/types/matching'

const allCandidates: MatchingCandidate[] = [
  {
    person_id: 'EMP-001',
    person_type: 'employee',
    name: '田中 健一',
    company_name: null,
    skills: ['TypeScript', 'React', 'AWS', 'Node.js'],
    availability_status: 'available',
    available_from: '2026-06-01',
    desired_rate: null,
    score_total: 92,
    score_skill: 95,
    score_availability: 100,
    score_rate: 80,
    skill_match_details: [
      { skill: 'TypeScript', required: true, matched: true },
      { skill: 'React', required: true, matched: true },
      { skill: 'AWS', required: false, matched: true },
      { skill: 'Java', required: false, matched: false },
    ],
  },
  {
    person_id: 'EMP-002',
    person_type: 'employee',
    name: '山本 さくら',
    company_name: null,
    skills: ['TypeScript', 'React', 'GraphQL'],
    availability_status: 'available_soon',
    available_from: '2026-07-01',
    desired_rate: null,
    score_total: 78,
    score_skill: 85,
    score_availability: 60,
    score_rate: 85,
    skill_match_details: [
      { skill: 'TypeScript', required: true, matched: true },
      { skill: 'React', required: true, matched: true },
      { skill: 'AWS', required: false, matched: false },
      { skill: 'Java', required: false, matched: false },
    ],
  },
  {
    person_id: 'EMP-003',
    person_type: 'employee',
    name: '鈴木 陽介',
    company_name: null,
    skills: ['Java', 'Spring Boot', 'AWS', 'Docker'],
    availability_status: 'in_project',
    available_from: '2026-09-01',
    desired_rate: null,
    score_total: 55,
    score_skill: 40,
    score_availability: 30,
    score_rate: 90,
    skill_match_details: [
      { skill: 'TypeScript', required: true, matched: false },
      { skill: 'React', required: true, matched: false },
      { skill: 'AWS', required: false, matched: true },
      { skill: 'Java', required: false, matched: true },
    ],
  },
  {
    person_id: 'PART-001',
    person_type: 'partner_engineer',
    name: '佐藤 浩二',
    company_name: 'グローバルIT株式会社',
    skills: ['TypeScript', 'React', 'Next.js', 'AWS'],
    availability_status: 'available',
    available_from: '2026-06-15',
    desired_rate: 700000,
    score_total: 88,
    score_skill: 90,
    score_availability: 90,
    score_rate: 82,
    skill_match_details: [
      { skill: 'TypeScript', required: true, matched: true },
      { skill: 'React', required: true, matched: true },
      { skill: 'AWS', required: false, matched: true },
      { skill: 'Java', required: false, matched: false },
    ],
  },
  {
    person_id: 'PART-002',
    person_type: 'partner_engineer',
    name: '伊藤 美咲',
    company_name: 'テックパートナーズ株式会社',
    skills: ['React', 'Vue.js', 'TypeScript'],
    availability_status: 'available',
    available_from: '2026-06-01',
    desired_rate: 600000,
    score_total: 82,
    score_skill: 80,
    score_availability: 100,
    score_rate: 65,
    skill_match_details: [
      { skill: 'TypeScript', required: true, matched: true },
      { skill: 'React', required: true, matched: true },
      { skill: 'AWS', required: false, matched: false },
      { skill: 'Java', required: false, matched: false },
    ],
  },
  {
    person_id: 'FREE-001',
    person_type: 'freelancer',
    name: '高橋 誠',
    company_name: null,
    skills: ['TypeScript', 'React', 'AWS', 'Terraform', 'Node.js'],
    availability_status: 'available',
    available_from: '2026-06-01',
    desired_rate: 850000,
    score_total: 74,
    score_skill: 98,
    score_availability: 100,
    score_rate: 25,
    skill_match_details: [
      { skill: 'TypeScript', required: true, matched: true },
      { skill: 'React', required: true, matched: true },
      { skill: 'AWS', required: false, matched: true },
      { skill: 'Java', required: false, matched: false },
    ],
  },
]

let proposals: Proposal[] = [
  {
    id: 'PROP-001',
    project_id: 'PRJ-2026-0001',
    project_name: 'ECサイトリニューアル支援',
    status: 'proposed',
    note: 'TypeScript/Reactのスキルを重視して選定。',
    candidates: [
      {
        id: 'PC-001',
        proposal_id: 'PROP-001',
        person_id: 'EMP-001',
        person_name: '田中 健一',
        person_type: 'employee',
        company_name: null,
        score_total: 92,
        note: 'Reactの実務経験3年。即日稼働可能。',
        intention: 'ok',
        intention_updated_at: '2026-05-10T10:00:00Z',
      },
      {
        id: 'PC-002',
        proposal_id: 'PROP-001',
        person_id: 'PART-001',
        person_name: '佐藤 浩二',
        person_type: 'partner_engineer',
        company_name: 'グローバルIT株式会社',
        score_total: 88,
        note: 'Next.js経験豊富。単価要確認。',
        intention: 'ng',
        intention_updated_at: '2026-05-12T14:00:00Z',
      },
      {
        id: 'PC-003',
        proposal_id: 'PROP-001',
        person_id: 'FREE-001',
        person_name: '高橋 誠',
        person_type: 'freelancer',
        company_name: null,
        score_total: 74,
        note: 'フルスタック対応可。単価が高め。',
        intention: 'pending',
        intention_updated_at: null,
      },
    ],
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2026-05-08T09:00:00Z',
    updated_at: '2026-05-12T14:00:00Z',
  },
  {
    id: 'PROP-002',
    project_id: 'PRJ-2026-0002',
    project_name: '大手銀行システム刷新PJ',
    status: 'draft',
    note: null,
    candidates: [
      {
        id: 'PC-004',
        proposal_id: 'PROP-002',
        person_id: 'EMP-002',
        person_name: '山本 さくら',
        person_type: 'employee',
        company_name: null,
        score_total: 78,
        note: null,
        intention: 'pending',
        intention_updated_at: null,
      },
      {
        id: 'PC-005',
        proposal_id: 'PROP-002',
        person_id: 'PART-002',
        person_name: '伊藤 美咲',
        person_type: 'partner_engineer',
        company_name: 'テックパートナーズ株式会社',
        score_total: 82,
        note: null,
        intention: 'pending',
        intention_updated_at: null,
      },
    ],
    created_by: 'EMP-20200101-0001',
    created_by_name: '管理者 太郎',
    created_at: '2026-05-15T11:00:00Z',
    updated_at: '2026-05-15T11:00:00Z',
  },
]

function toListItem(p: Proposal): ProposalListItem {
  const confirmed = p.candidates.filter((c) => c.intention === 'ok').length
  return {
    id: p.id,
    project_id: p.project_id,
    project_name: p.project_name,
    status: p.status,
    candidate_count: p.candidates.length,
    confirmed_count: confirmed,
    created_at: p.created_at,
    updated_at: p.updated_at,
  }
}

export const matchingHandlers = [
  http.post('/api/matching/search', async ({ request }) => {
    const body = (await request.json()) as MatchingSearchParams
    const projectNames: Record<string, string> = {
      'PRJ-2026-0001': 'ECサイトリニューアル支援',
      'PRJ-2026-0002': '大手銀行システム刷新PJ',
      'PRJ-2026-0003': '在庫管理システム受託開発',
    }
    let list = [...allCandidates]
    if (body.availability_status) {
      list = list.filter((c) => c.availability_status === body.availability_status)
    }
    if (body.candidate_type) {
      list = list.filter((c) => c.person_type === body.candidate_type)
    }
    list = list
      .map((c) => ({
        ...c,
        score_total: Math.round(
          c.score_skill * body.skill_weight +
            c.score_availability * body.availability_weight +
            c.score_rate * body.rate_weight,
        ),
      }))
      .sort((a, b) => b.score_total - a.score_total)

    return HttpResponse.json({
      candidates: list,
      project_name: projectNames[body.project_id] ?? body.project_id,
    })
  }),

  http.get('/api/proposals', () => {
    const items = proposals.map(toListItem)
    return HttpResponse.json({ items, total: items.length })
  }),

  http.get('/api/proposals/:id', ({ params }) => {
    const proposal = proposals.find((p) => p.id === params.id)
    if (!proposal) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(proposal)
  }),

  http.post('/api/proposals', async ({ request }) => {
    const body = (await request.json()) as { project_id: string; note: string | null }
    const projectNames: Record<string, string> = {
      'PRJ-2026-0001': 'ECサイトリニューアル支援',
      'PRJ-2026-0002': '大手銀行システム刷新PJ',
      'PRJ-2026-0003': '在庫管理システム受託開発',
    }
    const now = new Date().toISOString()
    const newProposal: Proposal = {
      id: `PROP-${Date.now()}`,
      project_id: body.project_id,
      project_name: projectNames[body.project_id] ?? body.project_id,
      status: 'draft',
      note: body.note ?? null,
      candidates: [],
      created_by: 'EMP-20200101-0001',
      created_by_name: '管理者 太郎',
      created_at: now,
      updated_at: now,
    }
    proposals.push(newProposal)
    return HttpResponse.json(newProposal, { status: 201 })
  }),

  http.post('/api/proposals/:id/candidates', async ({ params, request }) => {
    const proposal = proposals.find((p) => p.id === params.id)
    if (!proposal) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as {
      person_id: string
      person_name: string
      person_type: string
      company_name: string | null
      score_total: number
      note: string | null
    }
    const newCandidate: ProposalCandidate = {
      id: `PC-${Date.now()}`,
      proposal_id: proposal.id,
      person_id: body.person_id,
      person_name: body.person_name,
      person_type: body.person_type as ProposalCandidate['person_type'],
      company_name: body.company_name,
      score_total: body.score_total,
      note: body.note,
      intention: 'pending',
      intention_updated_at: null,
    }
    proposal.candidates.push(newCandidate)
    proposal.updated_at = new Date().toISOString()
    return HttpResponse.json(newCandidate, { status: 201 })
  }),

  http.delete('/api/proposals/:id/candidates/:candidateId', ({ params }) => {
    const proposal = proposals.find((p) => p.id === params.id)
    if (!proposal) return new HttpResponse(null, { status: 404 })
    proposal.candidates = proposal.candidates.filter((c) => c.id !== params.candidateId)
    proposal.updated_at = new Date().toISOString()
    return new HttpResponse(null, { status: 204 })
  }),

  http.put('/api/proposals/:id/candidates/:candidateId/intention', async ({ params, request }) => {
    const proposal = proposals.find((p) => p.id === params.id)
    if (!proposal) return new HttpResponse(null, { status: 404 })
    const idx = proposal.candidates.findIndex((c) => c.id === params.candidateId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { intention: CandidateIntention }
    proposal.candidates[idx] = {
      ...proposal.candidates[idx],
      intention: body.intention,
      intention_updated_at: new Date().toISOString(),
    }
    proposal.updated_at = new Date().toISOString()
    return HttpResponse.json(proposal.candidates[idx])
  }),

  http.put('/api/proposals/:id/status', async ({ params, request }) => {
    const idx = proposals.findIndex((p) => p.id === params.id)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as { status: ProposalStatus }
    proposals[idx] = { ...proposals[idx], status: body.status, updated_at: new Date().toISOString() }
    return HttpResponse.json(proposals[idx])
  }),
]
