import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EmployeeDetailPage from './EmployeeDetailPage'

function renderPage(id = 'EMP-20240401-0001') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/employees/${id}`]}>
        <Routes>
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

test('社員の氏名が表示される', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByText('山田 太郎')).toBeInTheDocument())
})

test('社員IDが表示される', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByText('EMP-20240401-0001')).toBeInTheDocument())
})

test('編集へのリンクが表示される', async () => {
  renderPage()
  await waitFor(() => {
    expect(screen.getByRole('link', { name: /編集/ })).toBeInTheDocument()
  })
})
