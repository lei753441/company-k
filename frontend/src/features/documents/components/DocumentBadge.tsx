import type { DocumentCategory } from '@/types/document'

export const documentCategoryLabel: Record<DocumentCategory, string> = {
  contract: '契約書',
  invoice: '請求書',
  skill_sheet: 'スキルシート',
  timesheet: '勤務表',
  proposal: '提案書',
  other: 'その他',
}

const documentCategoryColor: Record<DocumentCategory, string> = {
  contract: 'bg-blue-100 text-blue-700',
  invoice: 'bg-green-100 text-green-700',
  skill_sheet: 'bg-purple-100 text-purple-700',
  timesheet: 'bg-orange-100 text-orange-700',
  proposal: 'bg-cyan-100 text-cyan-700',
  other: 'bg-slate-100 text-slate-600',
}

const documentCategoryIconText: Record<DocumentCategory, string> = {
  contract: '📄',
  invoice: '💰',
  skill_sheet: '👤',
  timesheet: '⏰',
  proposal: '📊',
  other: '📁',
}

interface CategoryBadgeProps {
  category: DocumentCategory
  className?: string
}

export function DocumentCategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${documentCategoryColor[category]} ${className}`}>
      {documentCategoryLabel[category]}
    </span>
  )
}

interface CategoryIconProps {
  category: DocumentCategory
}

export function DocumentCategoryIcon({ category }: CategoryIconProps) {
  return (
    <span title={documentCategoryLabel[category]} className="text-base">
      {documentCategoryIconText[category]}
    </span>
  )
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${Math.round(bytes / 1024)} KB`
}
