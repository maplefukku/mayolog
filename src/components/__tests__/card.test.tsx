import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from '../ui/card'

describe('Card', () => {
  it('renders Card with children', () => {
    render(<Card>カードの内容</Card>)
    expect(screen.getByText('カードの内容')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<Card data-testid="card">内容</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('data-slot', 'card')
  })

  it('applies default size', () => {
    render(<Card data-testid="card">内容</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('data-size', 'default')
  })

  it('applies sm size', () => {
    render(<Card data-testid="card" size="sm">内容</Card>)
    expect(screen.getByTestId('card')).toHaveAttribute('data-size', 'sm')
  })

  it('applies custom className', () => {
    render(<Card data-testid="card" className="custom-class">内容</Card>)
    expect(screen.getByTestId('card')).toHaveClass('custom-class')
  })
})

describe('CardHeader', () => {
  it('renders with children', () => {
    render(<CardHeader>ヘッダー</CardHeader>)
    expect(screen.getByText('ヘッダー')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<CardHeader data-testid="header">ヘッダー</CardHeader>)
    expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'card-header')
  })

  it('applies custom className', () => {
    render(<CardHeader data-testid="header" className="custom">ヘッダー</CardHeader>)
    expect(screen.getByTestId('header')).toHaveClass('custom')
  })
})

describe('CardTitle', () => {
  it('renders with children', () => {
    render(<CardTitle>タイトル</CardTitle>)
    expect(screen.getByText('タイトル')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<CardTitle data-testid="title">タイトル</CardTitle>)
    expect(screen.getByTestId('title')).toHaveAttribute('data-slot', 'card-title')
  })
})

describe('CardDescription', () => {
  it('renders with children', () => {
    render(<CardDescription>説明テキスト</CardDescription>)
    expect(screen.getByText('説明テキスト')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<CardDescription data-testid="desc">説明</CardDescription>)
    expect(screen.getByTestId('desc')).toHaveAttribute('data-slot', 'card-description')
  })
})

describe('CardAction', () => {
  it('renders with children', () => {
    render(<CardAction>アクション</CardAction>)
    expect(screen.getByText('アクション')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<CardAction data-testid="action">アクション</CardAction>)
    expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'card-action')
  })
})

describe('CardContent', () => {
  it('renders with children', () => {
    render(<CardContent>コンテンツ</CardContent>)
    expect(screen.getByText('コンテンツ')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<CardContent data-testid="content">コンテンツ</CardContent>)
    expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'card-content')
  })
})

describe('CardFooter', () => {
  it('renders with children', () => {
    render(<CardFooter>フッター</CardFooter>)
    expect(screen.getByText('フッター')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<CardFooter data-testid="footer">フッター</CardFooter>)
    expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'card-footer')
  })
})

describe('Card composition', () => {
  it('renders full card with all subcomponents', () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>タイトル</CardTitle>
          <CardDescription>説明</CardDescription>
          <CardAction>ボタン</CardAction>
        </CardHeader>
        <CardContent>メインコンテンツ</CardContent>
        <CardFooter>フッター情報</CardFooter>
      </Card>
    )

    expect(screen.getByTestId('card')).toBeInTheDocument()
    expect(screen.getByText('タイトル')).toBeInTheDocument()
    expect(screen.getByText('説明')).toBeInTheDocument()
    expect(screen.getByText('ボタン')).toBeInTheDocument()
    expect(screen.getByText('メインコンテンツ')).toBeInTheDocument()
    expect(screen.getByText('フッター情報')).toBeInTheDocument()
  })
})
