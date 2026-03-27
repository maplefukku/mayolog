import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

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

// Mock fetch for APIs
const mockQuestions = {
  questions: [
    {
      text: '「バイト断るか迷ってる」ですね。\n今、どっちに傾いてる？',
      options: ['断る方に少し傾いてる', 'どっちとも言えない', '行く方に少し傾いてる'],
    },
    {
      text: 'もし結果がどうなっても後悔しないとしたら、どっちを選ぶ？',
      options: ['それでも今の傾きと同じ方を選ぶ', '逆の方を選ぶかもしれない', 'やっぱりわからない'],
    },
  ],
}

const mockAnalysis = {
  axes: [
    { label: '自分の時間', evidence: ['バイトを断ることで自分の時間を確保'] },
    { label: '人間関係', evidence: ['断ることへの罪悪感'] },
  ],
}

vi.stubGlobal('fetch', vi.fn((url: string) => {
  if (typeof url === 'string' && url.includes('/api/analyze')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockAnalysis),
    })
  }
  if (typeof url === 'string' && url.includes('/api/classify')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ category: 'work' }),
    })
  }
  return Promise.resolve({
    ok: true,
    json: () => Promise.resolve(mockQuestions),
  })
}))

import Home from '@/app/page'
import InputPage from '@/app/input/page'
import QuestionPage from '@/app/question/page'
import ResultPage from '@/app/result/page'

describe('E2Eフロー: LP → Input → Question → Result', () => {
  beforeEach(() => {
    navigationHistory.length = 0
    mockPush.mockClear()
  })

  it('LP画面で"今すぐ始める"CTAが存在する', () => {
    render(<Home />)
    const ctaLinks = screen.getAllByText('今すぐ始める')
    expect(ctaLinks.length).toBeGreaterThan(0)
    fireEvent.click(ctaLinks[0])
    expect(navigationHistory).toContain('/input')
  })

  it('Input画面でテキスト入力 → "AIに聞く"で遷移', () => {
    render(<InputPage />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'バイト断るか迷ってる' } })
    fireEvent.click(screen.getByText('AIに聞く'))
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/question?q=')
    )
  })

  it('Question画面で質問に回答 → 分析結果を見る', async () => {
    render(<QuestionPage />)

    // Wait for questions to load (fetch mock)
    await waitFor(() => {
      expect(screen.getByText(/断る方に少し傾いてる/)).toBeInTheDocument()
    })

    // Answer first question
    fireEvent.click(screen.getByText('断る方に少し傾いてる'))
    fireEvent.click(screen.getByText('次へ'))

    // Answer second question (last question with canDeepDive=true → deep dive choice)
    fireEvent.click(screen.getByText('それでも今の傾きと同じ方を選ぶ'))
    fireEvent.click(screen.getByText('次へ'))

    // Deep dive choice screen appears
    await waitFor(() => {
      expect(screen.getByText('分析結果を見る')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('分析結果を見る'))
    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/result?q=')
    )
  })

  it('Result画面で判断パターンが表示される', async () => {
    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('あなたの判断パターン')).toBeInTheDocument()
    })
  })
})
