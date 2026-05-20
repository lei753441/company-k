import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { EmployeeTable } from './EmployeeTable'
import type { Employee } from '@/types/employee'

const baseEmployee: Employee = {
  employee_id: 'EMP-20240401-0001',
  last_name: '山田',
  first_name: '太郎',
  last_name_kana: 'ヤマダ',
  first_name_kana: 'タロウ',
  birth_date: '1990-05-15',
  gender: 'male',
  email_company: 'yamada@example.com',
  email_private: null,
  phone_company: null,
  phone_private: null,
  postal_code: null,
  address_pref: null,
  address_city: null,
  address_detail: null,
  employment_type: 'full_time',
  hire_date: '2024-04-01',
  retirement_date: null,
  status: 'active',
  department_id: 'DEPT-001',
  department_name: '開発部',
  position_id: null,
  position_name: null,
  manager_employee_id: null,
  created_at: '2024-04-01T00:00:00Z',
  updated_at: '2024-04-01T00:00:00Z',
  created_by: 'admin',
  updated_by: 'admin',
}

test('社員データが行として表示される', () => {
  render(
    <MemoryRouter>
      <EmployeeTable employees={[baseEmployee]} />
    </MemoryRouter>,
  )
  expect(screen.getByText('山田 太郎')).toBeInTheDocument()
  expect(screen.getByText('EMP-20240401-0001')).toBeInTheDocument()
  expect(screen.getByText('開発部')).toBeInTheDocument()
  expect(screen.getByText('在籍')).toBeInTheDocument()
})

test('データが0件のときに空メッセージが表示される', () => {
  render(
    <MemoryRouter>
      <EmployeeTable employees={[]} />
    </MemoryRouter>,
  )
  expect(screen.getByText('社員が見つかりません')).toBeInTheDocument()
})
