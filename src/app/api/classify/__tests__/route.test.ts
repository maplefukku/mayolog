import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockCreate = vi.fn()

vi.mock('@/lib/ai/glm', () => ({
  glmClient: {
    chat: { completions: { create: mockCreate } },
  },
  GLM_MODEL: 'glm-4.7',
}))

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/classify', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/classify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('キャリア関連の迷いをcareerに分類する', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'career' } }],
    })

    const { POST } = await import('@/app/api/classify/route')
    const res = await POST(makeRequest({ dilemma: 'バイト断るか迷ってる' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.category).toBe('career')
  })

  it('人間関係の迷いをrelationshipに分類する', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'relationship' } }],
    })

    const { POST } = await import('@/app/api/classify/route')
    const res = await POST(makeRequest({ dilemma: '友達と遊ぶか迷ってる' }))
    const data = await res.json()

    expect(data.category).toBe('relationship')
  })

  it('不明なカテゴリはdailyにフォールバックする', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'unknown_category' } }],
    })

    const { POST } = await import('@/app/api/classify/route')
    const res = await POST(makeRequest({ dilemma: 'テスト' }))
    const data = await res.json()

    expect(data.category).toBe('daily')
  })

  it('空の入力を400で拒否する', async () => {
    const { POST } = await import('@/app/api/classify/route')
    const res = await POST(makeRequest({ dilemma: '' }))
    expect(res.status).toBe(400)
  })

  it('API失敗時はdailyにフォールバックする', async () => {
    mockCreate.mockRejectedValue(new Error('API error'))

    const { POST } = await import('@/app/api/classify/route')
    const res = await POST(makeRequest({ dilemma: 'テスト' }))
    const data = await res.json()

    expect(data.category).toBe('daily')
  })
})
