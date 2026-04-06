import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('q=転職するか迷ってる&a=%5B%7B%22question%22%3A%22%E3%81%AA%E3%81%9C%EF%BC%9F%22%2C%22answer%22%3A%22%E6%88%90%E9%95%B7%E3%81%97%E3%81%9F%E3%81%84%22%7D%5D'),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import ResultPage from '../result/page'

const mockAxes = {
  axes: [
    { label: '安定より挑戦を選ぶ', evidence: ['新しい環境への興味が強い'] },
    { label: '他者の期待より自分の直感を優先', evidence: ['自分の気持ちを重視する傾向'] },
  ],
}

describe('ResultPage 追加テスト', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('フィードバック「しっくりくる」をクリックするとフィードバックが保存される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('この分析はしっくりきましたか？')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('しっくりくる'))
    expect(screen.getByText('フィードバックありがとうございます！')).toBeInTheDocument()

    const feedback = JSON.parse(localStorage.getItem('mayolog_feedback') || '[]')
    expect(feedback).toHaveLength(1)
    expect(feedback[0].feedback).toBe('good')
  })

  it('フィードバック「ピンとこない」をクリックするとフィードバックが保存される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('この分析はしっくりきましたか？')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('ピンとこない'))
    expect(screen.getByText('フィードバックありがとうございます！')).toBeInTheDocument()

    const feedback = JSON.parse(localStorage.getItem('mayolog_feedback') || '[]')
    expect(feedback[0].feedback).toBe('bad')
  })

  it('シェアボタンクリックでクリップボードにコピーされる（navigator.share非対応時）', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
      share: undefined,
    })

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('リンクをコピー')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByLabelText('判断パターンをシェアする'))
    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalled()
    })
  })

  it('Xでシェアボタンが動作する', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    const mockOpen = vi.fn()
    vi.spyOn(window, 'open').mockImplementation(mockOpen)

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('X でシェア')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('X でシェア'))
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('twitter.com/intent/tweet'),
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('LinkedInでシェアボタンが動作する', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    const mockOpen = vi.fn()
    vi.spyOn(window, 'open').mockImplementation(mockOpen)

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('LinkedIn でシェア')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('LinkedIn でシェア'))
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('linkedin.com/sharing'),
      '_blank',
      'noopener,noreferrer'
    )
  })

  it('axesが空の場合はメッセージを表示する', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ axes: [] }),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('最初の判断パターンを記録しました！')).toBeInTheDocument()
    })
  })

  it('APIレスポンスのjsonパースに失敗した場合はデフォルトエラーを表示する', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.reject(new Error('parse error')),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('分析に失敗しました')).toBeInTheDocument()
    })
  })

  it('もう一度リンクが表示される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('もう一度')).toBeInTheDocument()
    })
  })

  it('迷いの内容が表示される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText(/転職するか迷ってる/)).toBeInTheDocument()
    })
  })
})
