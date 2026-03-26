import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="mock-theme-provider">{children}</div>
  ),
}))

import { ThemeProvider } from '../theme-provider'

describe('ThemeProvider', () => {
  it('子要素を正しくレンダリングする', () => {
    render(
      <ThemeProvider>
        <div>テスト子要素</div>
      </ThemeProvider>
    )
    expect(screen.getByText('テスト子要素')).toBeInTheDocument()
  })

  it('NextThemesProviderでラップされる', () => {
    render(
      <ThemeProvider>
        <span>内容</span>
      </ThemeProvider>
    )
    expect(screen.getByTestId('mock-theme-provider')).toBeInTheDocument()
    expect(screen.getByText('内容')).toBeInTheDocument()
  })
})
