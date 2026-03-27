import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams('q=バイト断るか迷ってる'),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import QuestionPage from '../question/page'

const mockQuestions = {
  questions: [
    {
      text: '「バイト断るか迷ってる」ですね。今、どっちに傾いてる？',
      options: ['断る方に少し傾いてる', 'どっちとも言えない', '行く方に少し傾いてる'],
    },
    {
      text: 'もし結果がどうなっても後悔しないとしたら、どっちを選ぶ？',
      options: ['それでも今の傾きと同じ方を選ぶ', '逆の方を選ぶかもしれない', 'やっぱりわからない'],
    },
  ],
}

beforeEach(() => {
  mockPush.mockClear()
  vi.restoreAllMocks()
})

describe('QuestionPage', () => {
  it('ローディング状態が表示される', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch
    render(<QuestionPage />)
    expect(screen.getByText('AIが質問を考えています...')).toBeInTheDocument()
  })

  it('API成功時に質問が表示される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    ) as unknown as typeof fetch

    render(<QuestionPage />)
    await waitFor(() => {
      expect(screen.getByText(/バイト断るか迷ってる/)).toBeInTheDocument()
    })
    expect(screen.getByText('断る方に少し傾いてる')).toBeInTheDocument()
    expect(screen.getByText('どっちとも言えない')).toBeInTheDocument()
    expect(screen.getByText('行く方に少し傾いてる')).toBeInTheDocument()
  })

  it('APIエラー時にフォールバック質問が表示される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'AI質問生成に失敗しました' }),
      })
    ) as unknown as typeof fetch

    render(<QuestionPage />)
    await waitFor(() => {
      expect(screen.getByText(/バイト断るか迷ってる/)).toBeInTheDocument()
    })
  })

  it('ネットワークエラー時にフォールバック質問が表示される', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as unknown as typeof fetch

    render(<QuestionPage />)
    await waitFor(() => {
      expect(screen.getByText(/バイト断るか迷ってる/)).toBeInTheDocument()
    })
  })

  it('選択肢を選択できる', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    ) as unknown as typeof fetch

    render(<QuestionPage />)
    await waitFor(() => {
      expect(screen.getByText('断る方に少し傾いてる')).toBeInTheDocument()
    })

    const option = screen.getByText('断る方に少し傾いてる')
    fireEvent.click(option)
    const button = option.closest('button')
    expect(button?.className).toContain('border-foreground')
  })

  it('選択後に"次へ"ボタンが活性化する', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    ) as unknown as typeof fetch

    render(<QuestionPage />)
    await waitFor(() => {
      expect(screen.getByText('次へ')).toBeInTheDocument()
    })

    const nextButton = screen.getByText('次へ')
    expect(nextButton).toBeDisabled()

    fireEvent.click(screen.getByText('断る方に少し傾いてる'))
    expect(nextButton).not.toBeDisabled()
  })

  it('2問目に進める', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    ) as unknown as typeof fetch

    render(<QuestionPage />)
    await waitFor(() => {
      expect(screen.getByText('断る方に少し傾いてる')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('断る方に少し傾いてる'))
    fireEvent.click(screen.getByText('次へ'))

    expect(screen.getByText(/後悔しないとしたら/)).toBeInTheDocument()
    expect(screen.getByText(/質問 2\/2/)).toBeInTheDocument()
  })

  it('最後の質問後に深掘り選択画面が表示される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    ) as unknown as typeof fetch

    render(<QuestionPage />)
    await waitFor(() => {
      expect(screen.getByText('断る方に少し傾いてる')).toBeInTheDocument()
    })

    // Q1
    fireEvent.click(screen.getByText('断る方に少し傾いてる'))
    fireEvent.click(screen.getByText('次へ'))
    // Q2
    fireEvent.click(screen.getByText('それでも今の傾きと同じ方を選ぶ'))
    fireEvent.click(screen.getByText('次へ'))

    // Deep dive choice screen
    expect(screen.getByText('分析結果を見る')).toBeInTheDocument()
    expect(screen.getByText(/もっと深掘りする/)).toBeInTheDocument()
  })

  it('深掘り選択画面から"分析結果を見る"で /result に遷移する', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuestions),
      })
    ) as unknown as typeof fetch

    render(<QuestionPage />)
    await waitFor(() => {
      expect(screen.getByText('断る方に少し傾いてる')).toBeInTheDocument()
    })

    // Q1
    fireEvent.click(screen.getByText('断る方に少し傾いてる'))
    fireEvent.click(screen.getByText('次へ'))
    // Q2
    fireEvent.click(screen.getByText('それでも今の傾きと同じ方を選ぶ'))
    fireEvent.click(screen.getByText('次へ'))

    // Click 分析結果を見る
    fireEvent.click(screen.getByText('分析結果を見る'))

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/result?q=')
    )
  })

  it('深掘りボタンで追加質問が表示される', async () => {
    const deepDiveQuestion = {
      questions: [
        { text: 'この選択で一番怖いことは？', options: ['失敗すること', '後悔すること', '変化そのもの'] },
      ],
    }

    let callCount = 0
    global.fetch = vi.fn(() => {
      callCount++
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(callCount === 1 ? mockQuestions : deepDiveQuestion),
      })
    }) as unknown as typeof fetch

    render(<QuestionPage />)
    await waitFor(() => {
      expect(screen.getByText('断る方に少し傾いてる')).toBeInTheDocument()
    })

    // Q1
    fireEvent.click(screen.getByText('断る方に少し傾いてる'))
    fireEvent.click(screen.getByText('次へ'))
    // Q2
    fireEvent.click(screen.getByText('それでも今の傾きと同じ方を選ぶ'))
    fireEvent.click(screen.getByText('次へ'))

    // Click deep dive
    fireEvent.click(screen.getByText(/もっと深掘りする/))

    await waitFor(() => {
      expect(screen.getByText('この選択で一番怖いことは？')).toBeInTheDocument()
    })
  })
})
