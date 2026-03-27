import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { OnboardingModal } from '../onboarding-modal'

describe('OnboardingModal', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('初回アクセス時にモーダルが表示される', async () => {
    const onComplete = vi.fn()
    await act(async () => {
      render(<OnboardingModal onComplete={onComplete} />)
    })
    expect(screen.getByText('迷ったら5秒で記録しよう')).toBeInTheDocument()
    expect(screen.getByText('何に迷ってるか書くだけで、AIが判断パターンを分析します。')).toBeInTheDocument()
  })

  it('2回目以降はモーダルが表示されない', () => {
    localStorage.setItem('mayolog_onboarded', 'true')
    const onComplete = vi.fn()
    render(<OnboardingModal onComplete={onComplete} />)
    expect(screen.queryByText('迷ったら5秒で記録しよう')).not.toBeInTheDocument()
  })

  it('スキップボタンでLocalStorageに保存される', async () => {
    const onComplete = vi.fn()
    await act(async () => {
      render(<OnboardingModal onComplete={onComplete} />)
    })
    fireEvent.click(screen.getByText('スキップ'))
    expect(localStorage.setItem).toHaveBeenCalledWith('mayolog_onboarded', 'true')
    expect(onComplete).toHaveBeenCalledWith()
  })

  it('体験ボタンでサンプルテキストが渡される', async () => {
    const onComplete = vi.fn()
    await act(async () => {
      render(<OnboardingModal onComplete={onComplete} />)
    })
    fireEvent.click(screen.getByText('体験してみる'))
    expect(localStorage.setItem).toHaveBeenCalledWith('mayolog_onboarded', 'true')
    expect(onComplete).toHaveBeenCalledTimes(1)
    const sampleText = onComplete.mock.calls[0][0]
    expect([
      'バイト断るか迷ってる',
      'インターン行くか迷ってる',
      'サークル続けるか迷ってる',
    ]).toContain(sampleText)
  })

  it('サンプル迷いが3つ表示される', async () => {
    const onComplete = vi.fn()
    await act(async () => {
      render(<OnboardingModal onComplete={onComplete} />)
    })
    expect(screen.getByText('バイト断るか迷ってる')).toBeInTheDocument()
    expect(screen.getByText('インターン行くか迷ってる')).toBeInTheDocument()
    expect(screen.getByText('サークル続けるか迷ってる')).toBeInTheDocument()
  })

  it('Xボタンでスキップと同じ動作をする', async () => {
    const onComplete = vi.fn()
    const { container } = await act(async () => {
      return render(<OnboardingModal onComplete={onComplete} />)
    })
    // X button is the close button in the top-right corner (find by X icon)
    const closeButton = container.querySelector('button[aria-label="閉じる"]') as HTMLElement
    expect(closeButton).toBeTruthy()
    fireEvent.click(closeButton)
    expect(localStorage.setItem).toHaveBeenCalledWith('mayolog_onboarded', 'true')
    expect(onComplete).toHaveBeenCalledWith()
  })
})
