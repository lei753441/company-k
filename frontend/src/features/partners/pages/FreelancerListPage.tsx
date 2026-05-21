import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { InvoiceRegistrationBadge, AvailabilityBadge, availabilityLabel, invoiceRegistrationLabel } from '../components/PartnerBadge'
import type { AvailabilityStatus } from '../components/PartnerBadge'
import { useFreelancers } from '../api/partnerApi'
import { useAuthStore } from '@/store/authStore'
import type { FreelancerListParams, InvoiceRegistrationStatus } from '@/types/partner'
import { Plus } from 'lucide-react'

const ALL = '_all_'

export default function FreelancerListPage() {
  const can = useAuthStore((s) => s.can)
  const [params, setParams] = useState<FreelancerListParams>({ q: '', availability_status: '', invoice_status: '', page: 1 })
  const { data, isLoading, isError } = useFreelancers(params)
  const items = data?.items ?? []

  const update = (patch: Partial<FreelancerListParams>) => setParams((p) => ({ ...p, ...patch, page: 1 }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">フリーランス一覧</h1>
        {(can('edit_all') || can('manage_office')) && (
          <Button asChild size="sm">
            <Link to="/freelancers/new"><Plus size={14} className="mr-1" />新規登録</Link>
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-lg border">
        <div className="flex-1 min-w-48">
          <Label>氏名・屋号検索</Label>
          <Input placeholder="氏名または屋号で検索" value={params.q ?? ''} onChange={(e) => update({ q: e.target.value })} />
        </div>
        <div className="w-40">
          <Label>稼働状況</Label>
          <Select
            value={params.availability_status || ALL}
            onValueChange={(v) => update({ availability_status: v === ALL ? '' : v })}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {(Object.keys(availabilityLabel) as AvailabilityStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{availabilityLabel[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-40">
          <Label>インボイス状況</Label>
          <Select
            value={params.invoice_status || ALL}
            onValueChange={(v) => update({ invoice_status: v === ALL ? '' : (v as InvoiceRegistrationStatus) })}
          >
            <SelectTrigger><SelectValue placeholder="すべて" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>すべて</SelectItem>
              {(Object.keys(invoiceRegistrationLabel) as InvoiceRegistrationStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{invoiceRegistrationLabel[s]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && <div className="text-center py-16 text-slate-400">読み込み中...</div>}
      {isError && <div className="text-center py-16 text-red-500">読み込みに失敗しました</div>}

      {!isLoading && !isError && (
        <div className="bg-white rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>氏名</TableHead>
                <TableHead>屋号</TableHead>
                <TableHead>稼働状況</TableHead>
                <TableHead>インボイス状況</TableHead>
                <TableHead>希望単価</TableHead>
                <TableHead>スキル</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">該当するフリーランスが見つかりません</TableCell>
                </TableRow>
              )}
              {items.map((item) => (
                <TableRow
                  key={item.id}
                  className={item.invoice_registration_status === 'not_registered' ? 'bg-red-50' : ''}
                >
                  <TableCell>
                    <Link to={`/freelancers/${item.id}`} className="font-medium hover:underline">
                      {item.last_name} {item.first_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{item.trade_name ?? '—'}</TableCell>
                  <TableCell><AvailabilityBadge status={item.availability_status} /></TableCell>
                  <TableCell><InvoiceRegistrationBadge status={item.invoice_registration_status} /></TableCell>
                  <TableCell className="text-sm text-slate-700">
                    {item.unit_price != null ? `¥${item.unit_price.toLocaleString()}` : '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {item.skills.slice(0, 3).map((s) => (
                        <span key={s} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">{s}</span>
                      ))}
                    </div>
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
