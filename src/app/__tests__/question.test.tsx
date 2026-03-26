import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

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

describe('QuestionPage', () => {
  it('質問が表示される', () => {
    render(<QuestionPage />)
    expect(screen.getByText(/バイト断るか迷ってる/)).toBeInTheDocument()
    expect(screen.getByText(/どっちに傾いてる/)).toBeInTheDocument()
  })

  it('選択肢が3つ表示される', () => {
    render(<QuestionPage />)
    expect(screen.getByText('断る方に少し傾いてる')).toBeInTheDocument()
    expect(screen.getByText('どっちとも言えない')).toBeInTheDocument()
    expect(screen.getByText('行く方に少し傾いてる')).toBeInTheDocument()
  })

  it('選択肢を選択できる', () => {
    render(<QuestionPage />)
    const option = screen.getByText('断る方に少し傾いてる')
    fireEvent.click(option)
    const button = option.closest('button')
    expect(button?.className).toContain('border-foreground')
  })

  it('選択後に"次へ"ボタンが活性化する', () => {
    render(<QuestionPage />)
    const nextButton = screen.getByText('次へ')
    expect(nextButton).toBeDisabled()

    fireEvent.click(screen.getByText('断る方に少し傾いてる'))
    expect(nextButton).not.toBeDisabled()
  })

  it('2問目に進める', () => {
    render(<QuestionPage />)
    fireEvent.click(screen.getByText('断る方に少し傾いてる'))
    fireEvent.click(screen.getByText('次へ'))

    expect(screen.getByText(/後悔しないとしたら/)).toBeInTheDocument()
    expect(screen.getByText('質問 2/2')).toBeInTheDocument()
  })

  it('最後の質問後に"結果を見る"で /result に遷移する', () => {
    render(<QuestionPage />)
    // Q1
    fireEvent.click(screen.getByText('断る方に少し傾いてる'))
    fireEvent.click(screen.getByText('次へ'))
    // Q2
    fireEvent.click(screen.getByText('それでも今の傾きと同じ方を選ぶ'))
    fireEvent.click(screen.getByText('結果を見る'))

    expect(mockPush).toHaveBeenCalledWith(
      expect.stringContaining('/result?q=')
    )
  })
})
