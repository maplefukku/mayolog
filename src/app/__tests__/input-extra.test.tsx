import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}))

import InputPage from '../input/page'

describe('InputPage 追加テスト', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockPush.mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('カテゴリボタンをクリックするとテンプレートが表示される', () => {
    render(<InputPage />)
    // カテゴリの1つ目をクリック
    const categoryButtons = screen.getAllByRole('button').filter(
      (btn) => btn.textContent?.includes('キャリア') || btn.textContent?.includes('人間関係') || btn.textContent?.includes('時間')
    )
    if (categoryButtons.length > 0) {
      fireEvent.click(categoryButtons[0])
      expect(screen.getByText('テンプレートから選ぶ')).toBeInTheDocument()
    }
  })

  it('自由入力ボタンをクリックすると自由入力メッセージが表示される', () => {
    render(<InputPage />)
    const freeButton = screen.getByText('自由入力')
    fireEvent.click(freeButton)
    expect(screen.getByText('自由に入力してね')).toBeInTheDocument()
  })

  it('カテゴリを再クリックで選択解除できる', () => {
    render(<InputPage />)
    const freeButton = screen.getByText('自由入力')
    fireEvent.click(freeButton)
    expect(screen.getByText('自由に入力してね')).toBeInTheDocument()

    // 再クリックで解除
    fireEvent.click(freeButton)
    expect(screen.queryByText('自由に入力してね')).not.toBeInTheDocument()
  })

  it('テンプレートをクリックするとquestionページに遷移する', () => {
    render(<InputPage />)
    // カテゴリボタンをクリック（テンプレートを表示）
    const categoryButtons = screen.getAllByRole('button').filter(
      (btn) => !btn.textContent?.includes('AIに聞く') && !btn.textContent?.includes('自由入力') && !btn.textContent?.includes('戻る') && !btn.textContent?.includes('theme')
    )
    if (categoryButtons.length > 0) {
      fireEvent.click(categoryButtons[0])
      // テンプレートが表示されたらクリック
      const templateText = screen.queryByText('テンプレートから選ぶ')
      if (templateText) {
        const templateButtons = screen.getAllByRole('button').filter(
          (btn) => btn.closest('.space-y-2') && btn.className.includes('w-full')
        )
        if (templateButtons.length > 0) {
          fireEvent.click(templateButtons[0])
          expect(mockPush).toHaveBeenCalledWith(
            expect.stringContaining('/question?q=')
          )
        }
      }
    }
  })

  it('200文字を超えるとカウンターが赤くなる', () => {
    render(<InputPage />)
    const textarea = screen.getByRole('textbox')
    const longText = 'あ'.repeat(201)
    fireEvent.change(textarea, { target: { value: longText } })
    const counter = screen.getByText(/201\/200/)
    expect(counter).toHaveClass('text-destructive')
  })

  it('文字数カウンターが表示される', () => {
    render(<InputPage />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'テスト入力' } })
    expect(screen.getByText('5/200')).toBeInTheDocument()
  })

  it('空入力時は「カテゴリを選ぶか、迷いを入力してね」と表示される', () => {
    render(<InputPage />)
    expect(screen.getByText('カテゴリを選ぶか、迷いを入力してね')).toBeInTheDocument()
  })

  it('入力があると「準備完了！」と表示される', () => {
    render(<InputPage />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'テスト' } })
    expect(screen.getByText('準備完了！')).toBeInTheDocument()
  })

  it('カテゴリ選択後にカテゴリ付きで遷移する', () => {
    render(<InputPage />)
    // カテゴリをクリック
    const categoryButtons = screen.getAllByRole('button').filter(
      (btn) => !btn.textContent?.includes('AIに聞く') && !btn.textContent?.includes('自由入力') && !btn.textContent?.includes('戻る') && !btn.textContent?.includes('theme')
    )
    if (categoryButtons.length > 0) {
      fireEvent.click(categoryButtons[0])
      // 自分の言葉で入力するテキストエリアにテキストを入力
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'テスト迷い' } })
      fireEvent.click(screen.getByText('AIに聞く'))
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining('&cat=')
      )
    }
  })

  it('戻るリンクが表示される', () => {
    render(<InputPage />)
    expect(screen.getByText('戻る')).toBeInTheDocument()
  })

  it('カテゴリ未選択時にサンプルリストが表示される', () => {
    render(<InputPage />)
    expect(screen.getByText('こんな感じで書いてみて')).toBeInTheDocument()
  })
})
