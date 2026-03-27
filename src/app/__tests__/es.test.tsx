import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, variants: _variants, transition: _transition, ...rest } = props as Record<string, unknown>
      return <div {...rest as React.HTMLAttributes<HTMLDivElement>}>{children}</div>
    },
    button: ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => {
      const { whileHover: _whileHover, whileTap: _whileTap, initial: _initial, animate: _animate, variants: _variants, transition: _transition, ...rest } = props as Record<string, unknown>
      return <button {...rest as React.ButtonHTMLAttributes<HTMLButtonElement>}>{children}</button>
    },
  },
}))

vi.mock('@/lib/dilemma-store', () => ({
  getDilemmaLogs: vi.fn(),
}))

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button>theme</button>,
}))

import EsPage from '@/app/es/page'
import { getDilemmaLogs } from '@/lib/dilemma-store'

const mockGetDilemmaLogs = getDilemmaLogs as ReturnType<typeof vi.fn>

describe('ES生成ページ', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ログがない場合、生成ボタンが無効になる', () => {
    mockGetDilemmaLogs.mockReturnValue([])
    render(<EsPage />)

    const button = screen.getByRole('button', { name: /AIで文章を生成する/ })
    expect(button).toBeDisabled()
  })

  it('3つの出力形式が表示される', () => {
    mockGetDilemmaLogs.mockReturnValue([])
    render(<EsPage />)

    expect(screen.getByText('ES用400字')).toBeInTheDocument()
    expect(screen.getByText('面接用')).toBeInTheDocument()
    expect(screen.getByText('自己紹介用')).toBeInTheDocument()
  })

  it('ページタイトルが表示される', () => {
    mockGetDilemmaLogs.mockReturnValue([])
    render(<EsPage />)

    expect(screen.getByText('ES文章を生成')).toBeInTheDocument()
  })

  it('ログがある場合、生成ボタンが有効になる', () => {
    mockGetDilemmaLogs.mockReturnValue([
      { id: '1', content: 'テスト', answer: '回答', category: 'career', createdAt: '2025-01-01' },
    ])
    render(<EsPage />)

    const button = screen.getByRole('button', { name: /AIで文章を生成する/ })
    expect(button).not.toBeDisabled()
  })

  it('生成ボタンクリックでAPIを呼び出す', async () => {
    mockGetDilemmaLogs.mockReturnValue([
      { id: '1', content: 'テスト', answer: '回答', category: 'career', createdAt: '2025-01-01' },
    ])

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: '生成されたテキスト' }),
    })

    const user = userEvent.setup()
    render(<EsPage />)

    const button = screen.getByRole('button', { name: /AIで文章を生成する/ })
    await user.click(button)

    expect(global.fetch).toHaveBeenCalledWith('/api/es', expect.objectContaining({
      method: 'POST',
    }))
  })

  it('戻るリンクがある', () => {
    mockGetDilemmaLogs.mockReturnValue([])
    render(<EsPage />)

    expect(screen.getByText('戻る')).toBeInTheDocument()
  })
})
