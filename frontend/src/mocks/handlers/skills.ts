import { http, HttpResponse } from 'msw'
import type {
  EmployeeSkill,
  Certification,
  CareerHistory,
  WorkAvailability,
  SkillMaster,
  ProficiencyLevel,
} from '@/types/skill'

const skillMasters: SkillMaster[] = [
  { id: 'SKM-001', name: 'Java', category_large: 'プログラミング言語', category_medium: 'バックエンド', is_active: true },
  { id: 'SKM-002', name: 'TypeScript', category_large: 'プログラミング言語', category_medium: 'フロントエンド', is_active: true },
  { id: 'SKM-003', name: 'React', category_large: 'フレームワーク・ライブラリ', category_medium: 'フロントエンドFW', is_active: true },
  { id: 'SKM-004', name: 'Spring Boot', category_large: 'フレームワーク・ライブラリ', category_medium: 'バックエンドFW', is_active: true },
  { id: 'SKM-005', name: 'AWS', category_large: 'クラウド・インフラ', category_medium: 'AWS', is_active: true },
  { id: 'SKM-006', name: 'Python', category_large: 'プログラミング言語', category_medium: 'バックエンド', is_active: true },
  { id: 'SKM-007', name: 'Docker', category_large: 'クラウド・インフラ', category_medium: 'コンテナ', is_active: true },
  { id: 'SKM-008', name: 'PostgreSQL', category_large: 'データベース', category_medium: 'RDB', is_active: true },
  { id: 'SKM-009', name: 'DynamoDB', category_large: 'データベース', category_medium: 'NoSQL', is_active: true },
  { id: 'SKM-010', name: 'Git', category_large: '開発手法・ツール', category_medium: 'バージョン管理', is_active: true },
  { id: 'SKM-011', name: 'Go', category_large: 'プログラミング言語', category_medium: 'バックエンド', is_active: true },
  { id: 'SKM-012', name: 'Kubernetes', category_large: 'クラウド・インフラ', category_medium: 'コンテナ', is_active: true },
  { id: 'SKM-013', name: 'Vue.js', category_large: 'フレームワーク・ライブラリ', category_medium: 'フロントエンドFW', is_active: true },
  { id: 'SKM-014', name: 'Next.js', category_large: 'フレームワーク・ライブラリ', category_medium: 'フロントエンドFW', is_active: true },
  { id: 'SKM-015', name: 'MySQL', category_large: 'データベース', category_medium: 'RDB', is_active: true },
]

let mutableSkills: EmployeeSkill[] = [
  { id: 'ESKL-001', employee_id: 'EMP-20240401-0001', skill_master_id: 'SKM-002', skill_name: 'TypeScript', category_large: 'プログラミング言語', category_medium: 'フロントエンド', proficiency_level: 4, experience_years: 3, last_used_year: 2026, note: null },
  { id: 'ESKL-002', employee_id: 'EMP-20240401-0001', skill_master_id: 'SKM-003', skill_name: 'React', category_large: 'フレームワーク・ライブラリ', category_medium: 'フロントエンドFW', proficiency_level: 3, experience_years: 2, last_used_year: 2026, note: null },
  { id: 'ESKL-003', employee_id: 'EMP-20240401-0001', skill_master_id: 'SKM-005', skill_name: 'AWS', category_large: 'クラウド・インフラ', category_medium: 'AWS', proficiency_level: 3, experience_years: 2, last_used_year: 2025, note: null },
  { id: 'ESKL-004', employee_id: 'EMP-20230601-0002', skill_master_id: 'SKM-001', skill_name: 'Java', category_large: 'プログラミング言語', category_medium: 'バックエンド', proficiency_level: 5, experience_years: 8, last_used_year: 2026, note: 'Spring Boot, Micronaut 経験あり' },
  { id: 'ESKL-005', employee_id: 'EMP-20230601-0002', skill_master_id: 'SKM-004', skill_name: 'Spring Boot', category_large: 'フレームワーク・ライブラリ', category_medium: 'バックエンドFW', proficiency_level: 5, experience_years: 6, last_used_year: 2026, note: null },
  { id: 'ESKL-006', employee_id: 'EMP-20230601-0002', skill_master_id: 'SKM-009', skill_name: 'DynamoDB', category_large: 'データベース', category_medium: 'NoSQL', proficiency_level: 4, experience_years: 3, last_used_year: 2026, note: null },
]

let mutableCerts: Certification[] = [
  { id: 'CERT-001', employee_id: 'EMP-20240401-0001', name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', acquired_date: '2024-08-15', expiry_date: '2027-08-15', score: null },
  { id: 'CERT-002', employee_id: 'EMP-20230601-0002', name: '基本情報技術者試験', issuer: 'IPA', acquired_date: '2016-11-20', expiry_date: null, score: null },
  { id: 'CERT-003', employee_id: 'EMP-20230601-0002', name: '応用情報技術者試験', issuer: 'IPA', acquired_date: '2018-12-01', expiry_date: null, score: null },
]

let mutableCareers: CareerHistory[] = [
  { id: 'CAREER-001', employee_id: 'EMP-20240401-0001', project_name: '社内業務管理システム刷新', client_name: null, industry: null, start_date: '2024-06-01', end_date: null, role: 'フロントエンドエンジニア', team_size: 6, description: 'React + TypeScript を用いた社内業務管理システムのフロントエンド開発。デザインシステムの構築も担当。', achievements: 'コンポーネントライブラリの整備により開発速度を30%向上。', display_order: 1, is_client_name_hidden: false, skill_names: ['TypeScript', 'React', 'AWS'] },
  { id: 'CAREER-002', employee_id: 'EMP-20230601-0002', project_name: '大手製造業ERPシステム開発', client_name: '某製造業大手', industry: '製造', start_date: '2022-04-01', end_date: '2024-03-31', role: 'テックリード', team_size: 12, description: 'Spring Bootを用いた大規模ERPシステムのバックエンド開発。アーキテクチャ設計からレビューまで担当。', achievements: 'マイクロサービス移行を主導し、デプロイ頻度を月1回から週3回に改善。', display_order: 1, is_client_name_hidden: true, skill_names: ['Java', 'Spring Boot', 'DynamoDB'] },
  { id: 'CAREER-003', employee_id: 'EMP-20230601-0002', project_name: 'ECサイトリプレイス', client_name: null, industry: 'EC・小売', start_date: '2020-01-01', end_date: '2022-03-31', role: 'バックエンドエンジニア', team_size: 8, description: 'レガシーERPからAWSベースのマイクロサービスへのリプレイスプロジェクト。', achievements: null, display_order: 2, is_client_name_hidden: false, skill_names: ['Java', 'Spring Boot', 'AWS'] },
]

let mutableAvailability: WorkAvailability[] = [
  { employee_id: 'EMP-20240401-0001', status: 'assigned_internal', current_assignment_end_date: '2026-09-30', available_from_date: '2026-10-01', working_style: 'リモート優先', preferred_location: '東京都内', note: null, updated_at: '2026-04-01T09:00:00Z' },
  { employee_id: 'EMP-20230601-0002', status: 'available_soon', current_assignment_end_date: '2026-06-30', available_from_date: '2026-07-01', working_style: 'ハイブリッド', preferred_location: '東京・神奈川', note: 'PM/PLポジション希望', updated_at: '2026-05-01T09:00:00Z' },
]

const empMeta = [
  { id: 'EMP-20240401-0001', name: '山田 太郎', dept: '開発部' },
  { id: 'EMP-20230601-0002', name: '鈴木 花子', dept: '営業部' },
]

export const skillHandlers = [
  http.get('/api/skill-masters', ({ request }) => {
    const q = new URL(request.url).searchParams.get('q') ?? ''
    const filtered = skillMasters.filter((s) => s.is_active && (!q || s.name.toLowerCase().includes(q.toLowerCase())))
    return HttpResponse.json({ items: filtered, total: filtered.length })
  }),

  http.get('/api/skills', ({ request }) => {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') ?? ''
    const avStatus = url.searchParams.get('availability_status') ?? ''

    let list = empMeta.map((e) => {
      const skills = mutableSkills.filter((s) => s.employee_id === e.id)
      const avail = mutableAvailability.find((a) => a.employee_id === e.id)
      return {
        employee_id: e.id,
        employee_name: e.name,
        department_name: e.dept,
        skill_count: skills.length,
        certification_count: mutableCerts.filter((c) => c.employee_id === e.id).length,
        top_skills: skills.slice(0, 3).map((s) => s.skill_name),
        availability_status: avail?.status ?? null,
        available_from_date: avail?.available_from_date ?? null,
        updated_at: new Date().toISOString(),
      }
    })
    if (q) list = list.filter((i) => i.employee_name.includes(q) || i.employee_id.includes(q))
    if (avStatus) list = list.filter((i) => i.availability_status === avStatus)
    return HttpResponse.json({ items: list, total: list.length })
  }),

  http.get('/api/skills/search', ({ request }) => {
    const url = new URL(request.url)
    const skillNames = url.searchParams.getAll('skill_names')
    const minProf = Number(url.searchParams.get('min_proficiency') ?? 1)
    const avStatuses = url.searchParams.getAll('availability_statuses')

    let candidates = empMeta.map((e) => ({
      employee_id: e.id,
      employee_name: e.name,
      department_name: e.dept,
      skills: mutableSkills.filter((s) => s.employee_id === e.id),
      availability: mutableAvailability.find((a) => a.employee_id === e.id) ?? null,
    }))

    if (skillNames.length > 0) {
      candidates = candidates.filter((c) =>
        skillNames.every((name) => c.skills.some((s) => s.skill_name === name && s.proficiency_level >= minProf)),
      )
    }
    if (avStatuses.length > 0) {
      candidates = candidates.filter((c) => c.availability && avStatuses.includes(c.availability.status))
    }
    return HttpResponse.json({ items: candidates, total: candidates.length })
  }),

  http.get('/api/skills/:employeeId', ({ params }) => {
    const emp = empMeta.find((e) => e.id === params.employeeId)
    if (!emp) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({
      employee_id: emp.id,
      employee_name: emp.name,
      department_name: emp.dept,
      summary: null,
      years_of_experience: null,
      education: null,
      skills: mutableSkills.filter((s) => s.employee_id === emp.id),
      certifications: mutableCerts.filter((c) => c.employee_id === emp.id),
      career_histories: mutableCareers.filter((c) => c.employee_id === emp.id).sort((a, b) => a.display_order - b.display_order),
      availability: mutableAvailability.find((a) => a.employee_id === emp.id) ?? null,
      version: 1,
      updated_at: new Date().toISOString(),
    })
  }),

  http.post('/api/skills/:employeeId/skills', async ({ params, request }) => {
    const body = (await request.json()) as Partial<EmployeeSkill>
    const master = skillMasters.find((m) => m.id === body.skill_master_id)
    const newSkill: EmployeeSkill = {
      id: `ESKL-${Date.now()}`,
      employee_id: params.employeeId as string,
      skill_master_id: body.skill_master_id ?? '',
      skill_name: master?.name ?? '',
      category_large: master?.category_large ?? '',
      category_medium: master?.category_medium ?? '',
      proficiency_level: (body.proficiency_level ?? 3) as ProficiencyLevel,
      experience_years: body.experience_years ?? null,
      last_used_year: body.last_used_year ?? null,
      note: body.note ?? null,
    }
    mutableSkills.push(newSkill)
    return HttpResponse.json(newSkill, { status: 201 })
  }),

  http.put('/api/skills/:employeeId/skills/:skillId', async ({ params, request }) => {
    const idx = mutableSkills.findIndex((s) => s.id === params.skillId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<EmployeeSkill>
    mutableSkills[idx] = { ...mutableSkills[idx], ...body }
    return HttpResponse.json(mutableSkills[idx])
  }),

  http.delete('/api/skills/:employeeId/skills/:skillId', ({ params }) => {
    const idx = mutableSkills.findIndex((s) => s.id === params.skillId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    mutableSkills.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/skills/:employeeId/certifications', async ({ params, request }) => {
    const body = (await request.json()) as Partial<Certification>
    const newCert: Certification = {
      id: `CERT-${Date.now()}`,
      employee_id: params.employeeId as string,
      name: body.name ?? '',
      issuer: body.issuer ?? null,
      acquired_date: body.acquired_date ?? '',
      expiry_date: body.expiry_date ?? null,
      score: body.score ?? null,
    }
    mutableCerts.push(newCert)
    return HttpResponse.json(newCert, { status: 201 })
  }),

  http.put('/api/skills/:employeeId/certifications/:certId', async ({ params, request }) => {
    const idx = mutableCerts.findIndex((c) => c.id === params.certId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<Certification>
    mutableCerts[idx] = { ...mutableCerts[idx], ...body }
    return HttpResponse.json(mutableCerts[idx])
  }),

  http.delete('/api/skills/:employeeId/certifications/:certId', ({ params }) => {
    const idx = mutableCerts.findIndex((c) => c.id === params.certId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    mutableCerts.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.post('/api/skills/:employeeId/career-histories', async ({ params, request }) => {
    const body = (await request.json()) as Partial<CareerHistory>
    const maxOrder = Math.max(0, ...mutableCareers.filter((c) => c.employee_id === params.employeeId).map((c) => c.display_order))
    const newCareer: CareerHistory = {
      id: `CAREER-${Date.now()}`,
      employee_id: params.employeeId as string,
      project_name: body.project_name ?? '',
      client_name: body.client_name ?? null,
      industry: body.industry ?? null,
      start_date: body.start_date ?? '',
      end_date: body.end_date ?? null,
      role: body.role ?? '',
      team_size: body.team_size ?? null,
      description: body.description ?? '',
      achievements: body.achievements ?? null,
      display_order: maxOrder + 1,
      is_client_name_hidden: body.is_client_name_hidden ?? false,
      skill_names: body.skill_names ?? [],
    }
    mutableCareers.push(newCareer)
    return HttpResponse.json(newCareer, { status: 201 })
  }),

  http.put('/api/skills/:employeeId/career-histories/:careerId', async ({ params, request }) => {
    const idx = mutableCareers.findIndex((c) => c.id === params.careerId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as Partial<CareerHistory>
    mutableCareers[idx] = { ...mutableCareers[idx], ...body }
    return HttpResponse.json(mutableCareers[idx])
  }),

  http.delete('/api/skills/:employeeId/career-histories/:careerId', ({ params }) => {
    const idx = mutableCareers.findIndex((c) => c.id === params.careerId)
    if (idx === -1) return new HttpResponse(null, { status: 404 })
    mutableCareers.splice(idx, 1)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get('/api/availability', ({ request }) => {
    const status = new URL(request.url).searchParams.get('status') ?? ''
    let list = empMeta.map((e) => ({
      employee_id: e.id,
      employee_name: e.name,
      department_name: e.dept,
      availability: mutableAvailability.find((a) => a.employee_id === e.id) ?? null,
    }))
    if (status) list = list.filter((i) => i.availability?.status === status)
    return HttpResponse.json({ items: list, total: list.length })
  }),

  http.put('/api/availability/:employeeId', async ({ params, request }) => {
    const body = (await request.json()) as Partial<WorkAvailability>
    const idx = mutableAvailability.findIndex((a) => a.employee_id === params.employeeId)
    const updated: WorkAvailability = {
      employee_id: params.employeeId as string,
      status: body.status ?? 'available',
      current_assignment_end_date: body.current_assignment_end_date ?? null,
      available_from_date: body.available_from_date ?? null,
      working_style: body.working_style ?? null,
      preferred_location: body.preferred_location ?? null,
      note: body.note ?? null,
      updated_at: new Date().toISOString(),
    }
    if (idx === -1) mutableAvailability.push(updated)
    else mutableAvailability[idx] = updated
    return HttpResponse.json(updated)
  }),
]
