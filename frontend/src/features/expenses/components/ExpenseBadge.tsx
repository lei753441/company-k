import type { ExpenseCategory, ExpenseStatus } from '@/types/expense'

export const expenseStatusLabel: Record<ExpenseStatus, string> = {
  draft: '下書き',
  submitted: '提出済',
  approved: '承認済',
  rejected: '差し戻し',
  paid: '精算済',
}

const expenseStatusColor: Record<ExpenseStatus, string> = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
  paid: 'bg-purple-100 text-purple-700',
}

export function ExpenseStatusBadge({ status }: { status: ExpenseStatus }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${expenseStatusColor[status]}`}>
      {expenseStatusLabel[status]}
    </span>
  )
}

export const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  transport: '交通費',
  accommodation: '宿泊費',
  entertainment: '接待費',
  supplies: '備品',
  communication: '通信費',
  other: 'その他',
}

const expenseCategoryIcon: Record<ExpenseCategory, string> = {
  transport: '🚃',
  accommodation: '🏨',
  entertainment: '🍽️',
  supplies: '🛒',
  communication: '📱',
  other: '📝',
}

export function ExpenseCategoryIcon({ category }: { category: ExpenseCategory }) {
  return (
    <span title={expenseCategoryLabel[category]} className="text-base">
      {expenseCategoryIcon[category]}
    </span>
  )
}
