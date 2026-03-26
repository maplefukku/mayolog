import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

// Track navigation
const navigationHistory: string[] = []
const mockPush = vi.fn((url: string) => { navigationHistory.push(url) })

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} onClick={() => navigationHistory.push(href)}>{children}</a>
  ),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('q=バイト断るか迷ってる'),
}))

import Home from '@/app/page'
import InputPage from '@/app/input/page'
import QuestionPage from '@/app/question/page'
import ResultPage from '@/app/result/page'

describe('E2Eフロー: LP → Input → Question → Result', () => {
  it('LP → Input → Question → Result の完全なフロー', () => {
    // 1. LPで"今すぐ始める"をクリック
    const { unmount: unmountHome } = render(<Home />)
    const ctaLinks = screen.getAllByText('今すぐ始める')
    fireEvent.click(ctaLinks[0])
    expect(navigationHistory).toContain('/input')
    unmountHome()

    // 2. Input画面でテキストを入力
    const { unmount: unmountInput } = render(<InputPage />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'バイト断るか迷ってる' } })

    // 3. "AIに聞く"をクリック
    fireEvent.click(screen.getByText('AIに聞く'))
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/question?q=')
    )
    unmountInput()

    // 4. Question画面で質問に回答
    const { unmount: unmountQuestion } = render(<QuestionPage />)
    expect(screen.getByText(/バイト断るか迷ってる/)).toBeInTheDocument()
    fireEvent.click(screen.getByText('断る方に少し傾いてる'))

    // 5. "次へ" → "結果を見る"
    fireEvent.click(screen.getByText('次へ'))
    fireEvent.click(screen.getByText('それでも今の傾きと同じ方を選ぶ'))
    fireEvent.click(screen.getByText('結果を見る'))
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/result?q=')
    )
    unmountQuestion()

    // 6. Result画面で分析結果が表示される
    render(<ResultPage />)
    expect(screen.getByText('あなたの判断パターン')).toBeInTheDocument()
    expect(screen.getAllByText(/自分の時間/).length).toBeGreaterThan(0)
    expect(screen.getByText('あなたの判断軸マップ')).toBeInTheDocument()
  })
})
