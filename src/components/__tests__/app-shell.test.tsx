import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AppShell, StickyHeader } from '../app-shell'

describe('AppShell', () => {
  it('childrenを正しくレンダリングする', () => {
    render(<AppShell>コンテンツ</AppShell>)
    expect(screen.getByText('コンテンツ')).toBeInTheDocument()
  })

  it('className プロパティが正しく適用される', () => {
    render(<AppShell className="custom-class">テスト</AppShell>)
    const el = screen.getByText('テスト').closest('div')
    expect(el?.className).toContain('custom-class')
  })
})

describe('StickyHeader', () => {
  it('正しくレンダリングされる', () => {
    render(<StickyHeader>ヘッダー</StickyHeader>)
    expect(screen.getByText('ヘッダー')).toBeInTheDocument()
    const header = screen.getByText('ヘッダー').closest('header')
    expect(header).toBeInTheDocument()
  })

  it('className プロパティが正しく適用される', () => {
    render(<StickyHeader className="header-class">テスト</StickyHeader>)
    const header = screen.getByText('テスト').closest('header')
    expect(header?.className).toContain('header-class')
  })
})
