import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next/navigation', () => ({
  useSearchParams: () => new URLSearchParams('q=転職するか迷ってる&a=[0,1]'),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import ResultPage from '../result/page'

describe('ResultPage', () => {
  it('判断パターンカードが表示される', () => {
    render(<ResultPage />)
    expect(screen.getByText('あなたの判断パターン')).toBeInTheDocument()
  })

  it('重視していること、判断の傾向、今日の気づきが表示される', () => {
    render(<ResultPage />)
    expect(screen.getByText('重視していること')).toBeInTheDocument()
    expect(screen.getAllByText(/自分の時間/).length).toBeGreaterThan(0)
    expect(screen.getByText('判断の傾向')).toBeInTheDocument()
    expect(screen.getByText(/慎重に検討する傾向がある/)).toBeInTheDocument()
    expect(screen.getByText('今日の気づき')).toBeInTheDocument()
  })

  it('判断軸マップが表示される', () => {
    render(<ResultPage />)
    expect(screen.getByText('あなたの判断軸マップ')).toBeInTheDocument()
    expect(screen.getByText('自由')).toBeInTheDocument()
    expect(screen.getByText('安定')).toBeInTheDocument()
    expect(screen.getByText('成長')).toBeInTheDocument()
    expect(screen.getByText('収入')).toBeInTheDocument()
  })

  it('プログレスバーが正しく描画される', () => {
    render(<ResultPage />)
    expect(screen.getByText('80%')).toBeInTheDocument()
    expect(screen.getByText('50%')).toBeInTheDocument()
    expect(screen.getByText('40%')).toBeInTheDocument()
    expect(screen.getByText('30%')).toBeInTheDocument()
  })
})
