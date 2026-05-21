import { useParams, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  InvoiceRegistrationBadge,
  AvailabilityBadge,
  invoiceRegistrationLabel,
} from '../components/PartnerBadge'
import { useFreelancer } from '../api/partnerApi'
import { useAuthStore } from '@/store/authStore'
import { Pencil } from 'lucide-react'

export default function FreelancerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useAuthStore()
  const { data, isLoading, isError } = useFreelancer(id!)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">フリーランスが見つかりません</div>

  const canEdit = can('edit_all') || can('manage_office')

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{data.last_name} {data.first_name}</h1>
            <AvailabilityBadge status={data.availability_status} />
          </div>
          {(data.last_name_kana || data.first_name_kana) && (
            <p className="text-sm text-slate-400 mt-0.5">{data.last_name_kana} {data.first_name_kana}</p>
          )}
          <p className="text-xs text-slate-400 mt-1">{data.id}</p>
        </div>
        {canEdit && (
          <Button asChild variant="outline" size="sm">
            <Link to={`/freelancers/${id}/edit`}><Pencil size={14} className="mr-1" />編集</Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">基本情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.trade_name && (
              <div><dt className="text-xs text-slate-500">屋号</dt><dd className="text-sm">{data.trade_name}</dd></div>
            )}
            <div><dt className="text-xs text-slate-500">所在地</dt><dd className="text-sm">{data.prefecture ?? '—'}</dd></div>
            {data.email && (
              <div>
                <dt className="text-xs text-slate-500">メール</dt>
                <dd className="text-sm"><a href={`mailto:${data.email}`} className="text-blue-500 hover:underline">{data.email}</a></dd>
              </div>
            )}
            {data.phone && (
              <div><dt className="text-xs text-slate-500">電話</dt><dd className="text-sm">{data.phone}</dd></div>
            )}
            <div>
              <dt className="text-xs text-slate-500">月額単価</dt>
              <dd className="text-sm">{data.unit_price != null ? `¥${data.unit_price.toLocaleString()}` : '—'}</dd>
            </div>
            {data.available_from && (
              <div><dt className="text-xs text-slate-500">稼働可能日</dt><dd className="text-sm">{data.available_from}</dd></div>
            )}
          </dl>
          {data.notes && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-slate-500 mb-1">メモ</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">インボイス登録状況</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <InvoiceRegistrationBadge status={data.invoice_registration_status} />
            <span className="text-sm text-slate-600">{invoiceRegistrationLabel[data.invoice_registration_status]}</span>
          </div>
          {data.invoice_number && (
            <p className="text-sm"><span className="text-slate-500">番号: </span><span className="font-mono">{data.invoice_number}</span></p>
          )}
          {data.invoice_registration_status === 'not_registered' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              インボイス未登録のため、仕入税額控除の適用に制限があります。経過措置の期限に注意してください。取引継続の場合は登録を促してください。
            </div>
          )}
          {data.invoice_registration_status === 'pending' && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
              インボイス登録申請中です。登録番号が発行され次第、更新してください。
            </div>
          )}
        </CardContent>
      </Card>

      {data.skills.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">スキル</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((s) => (
                <span key={s} className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full">{s}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
