import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

let bypassDisabled = false

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, disabled, variant: _v, size: _s, className: _c, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <button disabled={bypassDisabled ? false : disabled as boolean} {...props as React.ButtonHTMLAttributes<HTMLButtonElement>}>{children}</button>
  ),
}))

import EsPage from '@/app/es/page'
import { getDilemmaLogs } from '@/lib/dilemma-store'

const mockGetDilemmaLogs = getDilemmaLogs as ReturnType<typeof vi.fn>

describe('ES生成ページ', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    bypassDisabled = false
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

  it('ログがない状態で生成を試みるとエラーメッセージを表示する', async () => {
    mockGetDilemmaLogs.mockReturnValue([])
    bypassDisabled = true
    const user = userEvent.setup()
    render(<EsPage />)

    const button = screen.getByRole('button', { name: /AIで文章を生成する/ })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/迷いログがありません/)).toBeInTheDocument()
    })
  })

  it('ネットワークエラー時にエラーメッセージを表示する', async () => {
    mockGetDilemmaLogs.mockReturnValue([
      { id: '1', content: 'テスト', answer: '回答', category: 'career', createdAt: '2025-01-01' },
    ])

    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const user = userEvent.setup()
    render(<EsPage />)

    const button = screen.getByRole('button', { name: /AIで文章を生成する/ })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/通信エラーが発生しました/)).toBeInTheDocument()
    })
  })

  it('APIエラー時にエラーメッセージを表示する', async () => {
    mockGetDilemmaLogs.mockReturnValue([
      { id: '1', content: 'テスト', answer: '回答', category: 'career', createdAt: '2025-01-01' },
    ])

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: '生成に失敗しました' }),
    })

    const user = userEvent.setup()
    render(<EsPage />)

    const button = screen.getByRole('button', { name: /AIで文章を生成する/ })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/生成に失敗しました/)).toBeInTheDocument()
    })
  })

  it('フォーマットを切り替えられる', async () => {
    mockGetDilemmaLogs.mockReturnValue([])
    const user = userEvent.setup()
    render(<EsPage />)

    const interviewButton = screen.getByText('面接用').closest('button')!
    await user.click(interviewButton)

    expect(interviewButton.className).toContain('border-foreground')
  })

  it('複数カテゴリのログを正しく集計する', async () => {
    mockGetDilemmaLogs.mockReturnValue([
      { id: '1', content: 'テスト1', answer: '回答1', category: 'career', createdAt: '2025-01-01' },
      { id: '2', content: 'テスト2', answer: '回答2', category: 'relationship', createdAt: '2025-01-02' },
      { id: '3', content: 'テスト3', answer: '回答3', category: 'career', createdAt: '2025-01-03' },
    ])

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: '生成されたテキスト' }),
    })

    const user = userEvent.setup()
    render(<EsPage />)

    const button = screen.getByRole('button', { name: /AIで文章を生成する/ })
    await user.click(button)

    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0]
    const body = JSON.parse(fetchCall[1].body)
    expect(body.axes).toHaveLength(2)
    expect(body.axes[0].label).toBe('キャリア・成長')
  })

  it('未知のカテゴリでも正しく動作する', async () => {
    mockGetDilemmaLogs.mockReturnValue([
      { id: '1', content: 'テスト', answer: '回答', category: 'unknown', createdAt: '2025-01-01' },
      { id: '2', content: 'テスト2', answer: '回答2', category: 'unknown', createdAt: '2025-01-02' },
    ])

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ text: '生成されたテキスト' }),
    })

    const user = userEvent.setup()
    render(<EsPage />)

    const button = screen.getByRole('button', { name: /AIで文章を生成する/ })
    await user.click(button)

    expect(global.fetch).toHaveBeenCalled()
  })
})
