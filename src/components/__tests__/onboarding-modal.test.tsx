import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OnboardingModal } from '../onboarding-modal'

const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    clear: vi.fn(() => { store = {} }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    get length() { return Object.keys(store).length },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  }
})()

Object.defineProperty(window, 'localStorage', { value: localStorageMock })

describe('OnboardingModal', () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it('初回アクセス時にモーダルが表示される', () => {
    const onComplete = vi.fn()
    render(<OnboardingModal onComplete={onComplete} />)
    expect(screen.getByText('迷ったら5秒で記録しよう')).toBeInTheDocument()
    expect(screen.getByText('何に迷ってるか書くだけで、AIが判断パターンを分析します。')).toBeInTheDocument()
  })

  it('2回目以降はモーダルが表示されない', () => {
    localStorage.setItem('mayolog_onboarded', 'true')
    const onComplete = vi.fn()
    render(<OnboardingModal onComplete={onComplete} />)
    expect(screen.queryByText('迷ったら5秒で記録しよう')).not.toBeInTheDocument()
  })

  it('スキップボタンでLocalStorageに保存される', () => {
    const onComplete = vi.fn()
    render(<OnboardingModal onComplete={onComplete} />)
    fireEvent.click(screen.getByText('スキップ'))
    expect(localStorage.getItem('mayolog_onboarded')).toBe('true')
    expect(onComplete).toHaveBeenCalledWith()
  })

  it('体験ボタンでサンプルテキストが渡される', () => {
    const onComplete = vi.fn()
    render(<OnboardingModal onComplete={onComplete} />)
    fireEvent.click(screen.getByText('体験してみる'))
    expect(localStorage.getItem('mayolog_onboarded')).toBe('true')
    expect(onComplete).toHaveBeenCalledTimes(1)
    const sampleText = onComplete.mock.calls[0][0]
    expect([
      'バイト断るか迷ってる',
      'インターン行くか迷ってる',
      'サークル続けるか迷ってる',
    ]).toContain(sampleText)
  })

  it('サンプル迷いが3つ表示される', () => {
    const onComplete = vi.fn()
    render(<OnboardingModal onComplete={onComplete} />)
    expect(screen.getByText('バイト断るか迷ってる')).toBeInTheDocument()
    expect(screen.getByText('インターン行くか迷ってる')).toBeInTheDocument()
    expect(screen.getByText('サークル続けるか迷ってる')).toBeInTheDocument()
  })

  it('Xボタンでスキップと同じ動作をする', () => {
    const onComplete = vi.fn()
    render(<OnboardingModal onComplete={onComplete} />)
    // X button is the first button (close button)
    const closeButton = screen.getByText('スキップ').closest('div')!.parentElement!.querySelector('button')!
    fireEvent.click(closeButton)
    expect(localStorage.getItem('mayolog_onboarded')).toBe('true')
    expect(onComplete).toHaveBeenCalledWith()
  })
})
