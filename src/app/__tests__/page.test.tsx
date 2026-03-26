import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}))

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import Home from '../page'

describe('Home (LP)', () => {
  it('ヒーローセクションが表示される', () => {
    render(<Home />)
    expect(screen.getByText(/迷ったら5秒で記録/)).toBeInTheDocument()
    expect(screen.getByText(/勝手に自分の軸が見える/)).toBeInTheDocument()
  })

  it('特徴セクションが3つ表示される', () => {
    render(<Home />)
    expect(screen.getByText('5秒で完了')).toBeInTheDocument()
    expect(screen.getByText('AIが深掘り')).toBeInTheDocument()
    expect(screen.getByText('判断軸が見える')).toBeInTheDocument()
  })

  it('"今すぐ始める"ボタンが /input にリンクしている', () => {
    render(<Home />)
    const links = screen.getAllByText('今すぐ始める')
    const link = links[0].closest('a')
    expect(link).toHaveAttribute('href', '/input')
  })
})
