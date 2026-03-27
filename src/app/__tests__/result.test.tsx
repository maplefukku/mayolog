import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('q=転職するか迷ってる&a=%5B%5D'),
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

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('ResultPage', () => {
  it('ローディング状態が表示される', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch
    render(<ResultPage />)
    expect(screen.getByText('AIが判断パターンを分析しています...')).toBeInTheDocument()
  })

  it('API成功時に判断パターンカードが表示される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('あなたの判断パターン')).toBeInTheDocument()
    })
    expect(screen.getByText(/転職するか迷ってる/)).toBeInTheDocument()
    expect(screen.getAllByText(/安定より挑戦を選ぶ/).length).toBeGreaterThan(0)
  })

  it('API成功時に判断軸マップが表示される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('あなたの判断軸マップ')).toBeInTheDocument()
    })
    expect(screen.getByText('安定より挑戦を選ぶ')).toBeInTheDocument()
    expect(screen.getByText('他者の期待より自分の直感を優先')).toBeInTheDocument()
  })

  it('APIエラー時にエラーメッセージが表示される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: '分析には5件以上のログが必要です' }),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('分析には5件以上のログが必要です')).toBeInTheDocument()
    })
    expect(screen.getByText('あなたの判断パターン')).toBeInTheDocument()
  })

  it('ネットワークエラー時にエラーメッセージが表示される', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('通信エラーが発生しました')).toBeInTheDocument()
    })
  })

  it('シェアボタンが表示される', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockAxes),
      })
    ) as unknown as typeof fetch

    render(<ResultPage />)
    await waitFor(() => {
      expect(screen.getByText('シェアする')).toBeInTheDocument()
    })
  })
})
