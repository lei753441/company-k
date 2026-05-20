import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EmployeeListPage from './EmployeeListPage'

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <EmployeeListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

test('社員一覧が表示される', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByText('山田 太郎')).toBeInTheDocument())
  expect(screen.getByText('鈴木 花子')).toBeInTheDocument()
})

test('ページタイトルが表示される', () => {
  renderPage()
  expect(screen.getByText('社員一覧')).toBeInTheDocument()
})
