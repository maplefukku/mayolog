import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import InputPage from '../input/page'

describe('InputPage', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('テキストエリアがレンダリングされる', () => {
    render(<InputPage />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('プレースホルダーが5秒ごとに切り替わる', () => {
    render(<InputPage />)
    const textarea = screen.getByRole('textbox')
    const firstPlaceholder = textarea.getAttribute('placeholder')
    expect(firstPlaceholder).toContain('例:')

    act(() => { vi.advanceTimersByTime(5000) })
    const secondPlaceholder = textarea.getAttribute('placeholder')
    expect(secondPlaceholder).toContain('例:')
    expect(secondPlaceholder).not.toBe(firstPlaceholder)
  })

  it('空文字ではボタンが無効化されている', () => {
    render(<InputPage />)
    const button = screen.getByText('AIに聞く')
    expect(button).toBeDisabled()
  })

  it('1文字以上入力でボタンが活性化する', () => {
    render(<InputPage />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'テスト' } })
    const button = screen.getByText('AIに聞く')
    expect(button).not.toBeDisabled()
  })

  it('無効化ボタンにホバーするとツールチップが表示される', async () => {
    vi.useRealTimers()
    const user = userEvent.setup()
    render(<InputPage />)
    const button = screen.getByText('AIに聞く')
    expect(button).toBeDisabled()
    const trigger = button.closest('[data-slot="tooltip-trigger"]') || button
    await user.hover(trigger)
    await waitFor(
      () => {
        expect(screen.getByText('迷いを入力してください')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
    vi.useFakeTimers()
  })

  it('"AIに聞く"ボタンクリックで /question に遷移する', () => {
    render(<InputPage />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: '転職するか迷ってる' } })
    fireEvent.click(screen.getByText('AIに聞く'))
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/question?q=')
    )
  })
})
