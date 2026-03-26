import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const mockSetTheme = vi.fn()
let mockTheme = 'light'

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: mockTheme,
    setTheme: mockSetTheme,
  }),
}))

vi.mock('react', async () => {
  const actual = await vi.importActual('react')
  return {
    ...actual,
    useSyncExternalStore: vi.fn(actual.useSyncExternalStore),
  }
})

import { useSyncExternalStore } from 'react'
import { ThemeToggle } from '../theme-toggle'

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockTheme = 'light'
    mockSetTheme.mockClear()
    vi.mocked(useSyncExternalStore).mockImplementation((_sub, getSnapshot) => getSnapshot())
  })

  it('レンダリングされる', () => {
    render(<ThemeToggle />)
    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByText('ダークモード')).toBeInTheDocument()
  })

  it('ボタンクリックでテーマが切り替わる', () => {
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })

  it('ダークモード時にライトモードと表示される', () => {
    mockTheme = 'dark'
    render(<ThemeToggle />)
    expect(screen.getByText('ライトモード')).toBeInTheDocument()
  })

  it('ダークモード時にクリックでlightに切り替わる', () => {
    mockTheme = 'dark'
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('未マウント時にプレースホルダーを表示する', () => {
    vi.mocked(useSyncExternalStore).mockReturnValue(false)
    const { container } = render(<ThemeToggle />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(container.querySelector('.h-9.w-\\[120px\\]')).toBeInTheDocument()
  })
})
