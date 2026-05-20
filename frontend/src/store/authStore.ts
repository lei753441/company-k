import { create } from 'zustand'
import type { UserRole } from '@/types/employee'

interface AuthUser {
  employee_id: string
  name: string
  role: UserRole
  email: string
}

interface AuthState {
  user: AuthUser | null
  setUser: (user: AuthUser) => void
  clearUser: () => void
  can: (action: 'edit_all' | 'edit_sensitive' | 'view_sensitive' | 'retire' | 'export_csv') => boolean
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: {
    employee_id: 'EMP-20200101-0001',
    name: '管理者 太郎',
    role: 'ROLE_ADMIN',
    email: 'admin@company.example.com',
  },
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  can: (action) => {
    const role = get().user?.role
    if (!role) return false
    const permissions: Record<typeof action, UserRole[]> = {
      edit_all: ['ROLE_ADMIN', 'ROLE_OFFICE'],
      edit_sensitive: ['ROLE_ADMIN', 'ROLE_OFFICE'],
      view_sensitive: ['ROLE_ADMIN', 'ROLE_OFFICE'],
      retire: ['ROLE_ADMIN', 'ROLE_OFFICE'],
      export_csv: ['ROLE_ADMIN', 'ROLE_OFFICE'],
    }
    return permissions[action].includes(role)
  },
}))
