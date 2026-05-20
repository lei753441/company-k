import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EmployeeRetirePage from './EmployeeRetirePage'

function renderPage(id = 'EMP-20240401-0001') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/employees/${id}/retire`]}>
        <Routes>
          <Route path="/employees/:id/retire" element={<EmployeeRetirePage />} />
          <Route path="/employees/:id" element={<div>社員詳細</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

test('ページタイトルに退職処理が含まれる', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByText('退職処理')).toBeInTheDocument())
})

test('退職日入力フィールドが存在する', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByLabelText('退職日 *')).toBeInTheDocument())
})

test('退職日を入力して確定ボタンをクリックするとダイアログが開く', async () => {
  renderPage()
  await waitFor(() => screen.getByLabelText('退職日 *'))

  await userEvent.type(screen.getByLabelText('退職日 *'), '2025-06-30')
  await userEvent.click(screen.getByRole('button', { name: '退職処理を確定する' }))
  await waitFor(() => expect(screen.getByText('退職処理の確認')).toBeInTheDocument())
})
