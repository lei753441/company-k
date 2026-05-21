import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ContractStatusBadge,
  ContractTypeBadge,
  ExpiryBadge,
  contractTypeLabel,
} from '../components/ContractBadge'
import {
  useContract,
  useSendForSigning,
  useActivateContract,
  useCancelContract,
} from '../api/contractApi'
import { useAuthStore } from '@/store/authStore'
import { Pencil, Bell } from 'lucide-react'

const unitTypeLabel = { hourly: '時間単価', monthly: '月額', fixed: '固定額' }
const partyTypeLabel = { customer: '顧客', partner: '協力会社', freelancer: 'フリーランス' }

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { can } = useAuthStore()
  const { data, isLoading, isError } = useContract(id!)
  const sendForSigning = useSendForSigning(id!)
  const activate = useActivateContract(id!)
  const cancel = useCancelContract(id!)

  if (isLoading) return <div className="py-16 text-center text-slate-400">読み込み中...</div>
  if (isError || !data) return <div className="py-16 text-center text-red-500">契約が見つかりません</div>

  const canEdit = can('edit_all') || can('export_csv')
  const canEditForm = canEdit && (data.status === 'draft' || data.status === 'signing')

  const today = new Date('2026-05-20')
  const daysUntilExpiry = data.end_date
    ? Math.floor((new Date(data.end_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const handleSendForSigning = async () => {
    if (!confirm('署名依頼を送信しますか？')) return
    await sendForSigning.mutateAsync()
  }

  const handleActivate = async () => {
    if (!confirm('契約を有効化しますか？（署名完了として処理します）')) return
    await activate.mutateAsync()
  }

  const handleCancel = async () => {
    if (!confirm('この契約を解約しますか？')) return
    await cancel.mutateAsync()
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-sm text-slate-500">{data.contract_number}</span>
            <ContractStatusBadge status={data.status} />
            <ContractTypeBadge type={data.contract_type} />
            {daysUntilExpiry !== null && <ExpiryBadge days={daysUntilExpiry} />}
          </div>
          <h1 className="text-2xl font-bold mt-2">{data.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{data.created_by_name}</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          {data.status === 'renewal_due' && (
            <Button asChild variant="outline" size="sm">
              <Link to="/contracts/renewal-alerts"><Bell size={14} className="mr-1" />更新アラート一覧へ</Link>
            </Button>
          )}
          {canEditForm && (
            <Button asChild variant="outline" size="sm">
              <Link to={`/contracts/${id}/edit`}><Pencil size={14} className="mr-1" />編集</Link>
            </Button>
          )}
          {canEdit && data.status === 'draft' && (
            <Button size="sm" onClick={handleSendForSigning} disabled={sendForSigning.isPending}>
              {sendForSigning.isPending ? '送信中...' : '署名依頼送信'}
            </Button>
          )}
          {canEdit && data.status === 'signing' && (
            <Button size="sm" onClick={handleActivate} disabled={activate.isPending}>
              {activate.isPending ? '処理中...' : '有効化（署名完了）'}
            </Button>
          )}
          {canEdit && (data.status === 'active' || data.status === 'renewal_due') && (
            <Button size="sm" variant="destructive" onClick={handleCancel} disabled={cancel.isPending}>
              {cancel.isPending ? '処理中...' : '解約'}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">当事者情報</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-slate-500">当事者種別</dt>
              <dd className="text-sm">{partyTypeLabel[data.party_type]}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">当事者名</dt>
              <dd className="text-sm font-medium">{data.party_name}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">当事者ID</dt>
              <dd className="text-sm font-mono text-slate-500">{data.party_id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">案件・契約期間</CardTitle></CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <dt className="text-xs text-slate-500">紐付け案件</dt>
              <dd className="text-sm">{data.project_name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">契約種別</dt>
              <dd className="text-sm">{contractTypeLabel[data.contract_type]}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">自動更新</dt>
              <dd className="text-sm">{data.is_auto_renewal ? `あり（${data.renewal_notice_months}ヶ月前通知）` : 'なし'}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">開始日</dt>
              <dd className="text-sm">{data.start_date}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">終了日</dt>
              <dd className="text-sm">{data.end_date ?? '—'}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">契約条件</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {data.unit_price != null && (
              <div>
                <dt className="text-xs text-slate-500">単価</dt>
                <dd className="text-sm font-medium">¥{data.unit_price.toLocaleString()}</dd>
              </div>
            )}
            {data.unit_type != null && (
              <div>
                <dt className="text-xs text-slate-500">単価種別</dt>
                <dd className="text-sm">{unitTypeLabel[data.unit_type]}</dd>
              </div>
            )}
            {data.fixed_amount != null && (
              <div>
                <dt className="text-xs text-slate-500">固定額</dt>
                <dd className="text-sm font-medium">¥{data.fixed_amount.toLocaleString()}</dd>
              </div>
            )}
            {data.overtime_rate != null && (
              <div>
                <dt className="text-xs text-slate-500">時間外割増率</dt>
                <dd className="text-sm">{data.overtime_rate}%</dd>
              </div>
            )}
            {data.holiday_rate != null && (
              <div>
                <dt className="text-xs text-slate-500">休日割増率</dt>
                <dd className="text-sm">{data.holiday_rate}%</dd>
              </div>
            )}
            {data.standard_work_hours != null && (
              <div>
                <dt className="text-xs text-slate-500">所定労働時間</dt>
                <dd className="text-sm">{data.standard_work_hours}h</dd>
              </div>
            )}
            {data.upper_limit_hours != null && (
              <div>
                <dt className="text-xs text-slate-500">精算上限時間</dt>
                <dd className="text-sm">{data.upper_limit_hours}h</dd>
              </div>
            )}
            {data.lower_limit_hours != null && (
              <div>
                <dt className="text-xs text-slate-500">精算下限時間</dt>
                <dd className="text-sm">{data.lower_limit_hours}h</dd>
              </div>
            )}
            <div className="col-span-2 md:col-span-3">
              <dt className="text-xs text-slate-500">支払条件</dt>
              <dd className="text-sm">{data.payment_terms || '—'}</dd>
            </div>
          </dl>
          {data.note && (
            <div className="pt-3 border-t">
              <p className="text-xs text-slate-500 mb-1">メモ</p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{data.note}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>← 戻る</Button>
      </div>
    </div>
  )
}
