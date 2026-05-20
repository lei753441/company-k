import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EmployeeLeavePage from './EmployeeLeavePage'

function renderPage(id = 'EMP-20240401-0001') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/employees/${id}/leave`]}>
        <Routes>
          <Route path="/employees/:id/leave" element={<EmployeeLeavePage />} />
          <Route path="/employees/:id" element={<div>社員詳細</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

test('ページタイトルと社員名が表示される', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByText('休職管理')).toBeInTheDocument())
  expect(screen.getByText(/山田 太郎/)).toBeInTheDocument()
})

test('休職開始日フィールドが存在する', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByLabelText('休職開始日 *')).toBeInTheDocument())
})
