import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Progress, ProgressLabel, ProgressValue } from '../ui/progress'

describe('Progress', () => {
  it('renders Progress component', () => {
    render(<Progress value={50} data-testid="progress" />)
    expect(screen.getByTestId('progress')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(<Progress value={30} data-testid="progress" />)
    expect(screen.getByTestId('progress')).toHaveAttribute('data-slot', 'progress')
  })

  it('renders with value 0', () => {
    render(<Progress value={0} data-testid="progress" />)
    expect(screen.getByTestId('progress')).toBeInTheDocument()
  })

  it('renders with value 100', () => {
    render(<Progress value={100} data-testid="progress" />)
    expect(screen.getByTestId('progress')).toBeInTheDocument()
  })

  it('renders track and indicator', () => {
    render(<Progress value={50} data-testid="progress" />)
    const track = document.querySelector('[data-slot="progress-track"]')
    const indicator = document.querySelector('[data-slot="progress-indicator"]')
    expect(track).toBeInTheDocument()
    expect(indicator).toBeInTheDocument()
  })

  it('applies custom className', () => {
    render(<Progress value={50} data-testid="progress" className="custom-class" />)
    expect(screen.getByTestId('progress')).toHaveClass('custom-class')
  })

  it('renders children alongside track', () => {
    render(
      <Progress value={75} data-testid="progress">
        <span>ラベル</span>
      </Progress>
    )
    expect(screen.getByText('ラベル')).toBeInTheDocument()
    expect(document.querySelector('[data-slot="progress-track"]')).toBeInTheDocument()
  })

  it('renders without value (indeterminate)', () => {
    render(<Progress data-testid="progress" />)
    expect(screen.getByTestId('progress')).toBeInTheDocument()
  })
})

describe('ProgressLabel', () => {
  it('renders label text', () => {
    render(
      <Progress value={50}>
        <ProgressLabel>進捗</ProgressLabel>
      </Progress>
    )
    expect(screen.getByText('進捗')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(
      <Progress value={50}>
        <ProgressLabel data-testid="label">ラベル</ProgressLabel>
      </Progress>
    )
    expect(screen.getByTestId('label')).toHaveAttribute('data-slot', 'progress-label')
  })

  it('applies custom className', () => {
    render(
      <Progress value={50}>
        <ProgressLabel data-testid="label" className="custom">ラベル</ProgressLabel>
      </Progress>
    )
    expect(screen.getByTestId('label')).toHaveClass('custom')
  })
})

describe('ProgressValue', () => {
  it('renders value display', () => {
    render(
      <Progress value={75}>
        <ProgressValue data-testid="value" />
      </Progress>
    )
    expect(screen.getByTestId('value')).toBeInTheDocument()
  })

  it('applies data-slot attribute', () => {
    render(
      <Progress value={75}>
        <ProgressValue data-testid="value" />
      </Progress>
    )
    expect(screen.getByTestId('value')).toHaveAttribute('data-slot', 'progress-value')
  })

  it('applies custom className', () => {
    render(
      <Progress value={75}>
        <ProgressValue data-testid="value" className="custom" />
      </Progress>
    )
    expect(screen.getByTestId('value')).toHaveClass('custom')
  })
})
