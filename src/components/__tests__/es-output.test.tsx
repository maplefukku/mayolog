import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { EsOutput } from '../es-output'

describe('EsOutput', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('ローディング中はスピナーとメッセージを表示する', () => {
    render(<EsOutput text={null} loading={true} error={null} />)
    expect(screen.getByText('AIが文章を生成しています...')).toBeInTheDocument()
  })

  it('エラー時はエラーメッセージを表示する', () => {
    render(<EsOutput text={null} loading={false} error="APIエラーが発生しました" />)
    expect(screen.getByText('APIエラーが発生しました')).toBeInTheDocument()
  })

  it('テキストがnullの場合は何も表示しない', () => {
    const { container } = render(<EsOutput text={null} loading={false} error={null} />)
    expect(container.innerHTML).toBe('')
  })

  it('テキストがある場合は生成結果を表示する', () => {
    render(<EsOutput text="生成されたテキストです" loading={false} error={null} />)
    expect(screen.getByText('生成結果')).toBeInTheDocument()
    expect(screen.getByText('生成されたテキストです')).toBeInTheDocument()
  })

  it('文字数が表示される', () => {
    render(<EsOutput text="あいうえお" loading={false} error={null} />)
    expect(screen.getByText('5文字')).toBeInTheDocument()
  })

  it('コピーボタンをクリックするとクリップボードにコピーされる', async () => {
    const mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: mockWriteText },
    })

    render(<EsOutput text="コピーするテキスト" loading={false} error={null} />)

    const copyButton = screen.getByLabelText('コピー')
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('コピーするテキスト')
    })
    expect(screen.getByText('コピー済み')).toBeInTheDocument()
  })

  it('コピーボタンが表示される', () => {
    render(<EsOutput text="テスト" loading={false} error={null} />)
    expect(screen.getByLabelText('コピー')).toBeInTheDocument()
    expect(screen.getByText('コピー')).toBeInTheDocument()
  })
})
