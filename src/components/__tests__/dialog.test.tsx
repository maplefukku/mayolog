import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog'

describe('Dialog コンポーネント', () => {
  it('DialogHeader がレンダリングされる', () => {
    render(<DialogHeader data-testid="header">ヘッダー</DialogHeader>)
    expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'dialog-header')
    expect(screen.getByText('ヘッダー')).toBeInTheDocument()
  })

  it('DialogHeader にカスタムクラスを適用できる', () => {
    render(<DialogHeader data-testid="header" className="custom-class">ヘッダー</DialogHeader>)
    expect(screen.getByTestId('header')).toHaveClass('custom-class')
  })

  it('DialogFooter がレンダリングされる', () => {
    render(<DialogFooter data-testid="footer">フッター</DialogFooter>)
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'dialog-footer')
    expect(screen.getByText('フッター')).toBeInTheDocument()
  })

  it('DialogFooter にカスタムクラスを適用できる', () => {
    render(<DialogFooter data-testid="footer" className="custom">フッター</DialogFooter>)
    expect(screen.getByTestId('footer')).toHaveClass('custom')
  })

  it('Dialog + DialogTrigger + DialogContent が連携する', async () => {
    render(
      <Dialog open>
        <DialogTrigger>開く</DialogTrigger>
        <DialogContent>
          <DialogTitle>タイトル</DialogTitle>
          <DialogDescription>説明文</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText('タイトル')).toBeInTheDocument()
    expect(screen.getByText('説明文')).toBeInTheDocument()
  })

  it('showCloseButton=false の場合、閉じるボタンが表示されない', () => {
    render(
      <Dialog open>
        <DialogContent showCloseButton={false}>
          <DialogTitle>タイトル</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    expect(screen.queryByText('Close')).not.toBeInTheDocument()
  })

  it('DialogFooter の showCloseButton で閉じるボタンを表示できる', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>テスト</DialogTitle>
          <DialogFooter showCloseButton>
            <button>カスタムボタン</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    // showCloseButton=true の場合「Close」テキストが表示される
    expect(screen.getAllByText('Close').length).toBeGreaterThanOrEqual(1)
  })
})
