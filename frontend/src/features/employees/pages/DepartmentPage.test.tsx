import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DepartmentPage from './DepartmentPage'

function renderPage() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <DepartmentPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

test('部署一覧が表示される', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByText('開発部')).toBeInTheDocument())
  expect(screen.getByText('営業部')).toBeInTheDocument()
})

test('新規部署追加ボタンが表示される', async () => {
  renderPage()
  await waitFor(() => expect(screen.getByRole('button', { name: /新規部署追加/ })).toBeInTheDocument())
})

test('部署名をクリックすると編集フォームが開く', async () => {
  renderPage()
  await waitFor(() => screen.getByText('開発部'))
  await userEvent.click(screen.getByText('開発部'))
  await waitFor(() => expect(screen.getByDisplayValue('開発部')).toBeInTheDocument())
})
