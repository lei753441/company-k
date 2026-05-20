import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EmployeeHistoryPage from './EmployeeHistoryPage'

function renderPage(id = 'EMP-20240401-0001') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/employees/${id}/history`]}>
        <Routes>
          <Route path="/employees/:id/history" element={<EmployeeHistoryPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

test('変更履歴ページタイトルが表示される', () => {
  renderPage()
  expect(screen.getByText('変更履歴')).toBeInTheDocument()
})

test('変更履歴データが表示される', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByText('部署')).toBeInTheDocument())
})
