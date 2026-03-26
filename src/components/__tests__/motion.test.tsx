import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FadeInUp, MotionSection, fadeInUp, staggerContainer, staggerItem } from '../motion'

describe('motion', () => {
  it('FadeInUp コンポーネントが正しくレンダリングされる', () => {
    render(<FadeInUp data-testid="fadeinup">テスト</FadeInUp>)
    expect(screen.getByTestId('fadeinup')).toHaveTextContent('テスト')
  })

  it('MotionSection コンポーネントが正しくレンダリングされる', () => {
    render(<MotionSection data-testid="section">セクション</MotionSection>)
    expect(screen.getByTestId('section')).toHaveTextContent('セクション')
  })

  it('fadeInUp バリアントが正しい値を持つ', () => {
    expect(fadeInUp.initial).toEqual({ opacity: 0, y: 20 })
    expect(fadeInUp.animate).toEqual({ opacity: 1, y: 0 })
    expect(fadeInUp.transition).toEqual({
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94],
    })
  })

  it('staggerContainer バリアントが正しい値を持つ', () => {
    expect(staggerContainer.initial).toBe('hidden')
    expect(staggerContainer.animate).toBe('visible')
    expect(staggerContainer.variants?.visible).toEqual({
      transition: { staggerChildren: 0.12 },
    })
  })

  it('staggerItem バリアントが正しい値を持つ', () => {
    expect(staggerItem.variants?.hidden).toEqual({ opacity: 0, y: 20 })
    expect(staggerItem.variants?.visible).toMatchObject({
      opacity: 1,
      y: 0,
    })
  })
})
