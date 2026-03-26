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
  return new NextRequest('http://localhost/api/question', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/question', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('迷いテキストからフォローアップ質問を生成する', async () => {
    const mockResponse = {
      questions: [
        { text: '一番手放したくないものは？', options: ['安定した収入', '自由な時間', '成長機会'] },
      ],
    }
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    })

    const { POST } = await import('@/app/api/question/route')
    const res = await POST(makeRequest({ dilemma: '転職すべきか迷っている' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.questions).toHaveLength(1)
    expect(data.questions[0].options.length).toBeGreaterThanOrEqual(2)
  })

  it('空の入力を400で拒否する', async () => {
    const { POST } = await import('@/app/api/question/route')
    const res = await POST(makeRequest({ dilemma: '' }))
    expect(res.status).toBe(400)
  })

  it('200文字超の入力を400で拒否する', async () => {
    const { POST } = await import('@/app/api/question/route')
    const res = await POST(makeRequest({ dilemma: 'あ'.repeat(201) }))
    expect(res.status).toBe(400)
  })

  it('AIの応答が不正な場合502を返す', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'これはJSONではありません' } }],
    })

    const { POST } = await import('@/app/api/question/route')
    const res = await POST(makeRequest({ dilemma: '転職すべきか' }))
    expect(res.status).toBe(502)
  })

  it('API呼び出し失敗時に500を返す', async () => {
    mockCreate.mockRejectedValue(new Error('API error'))

    const { POST } = await import('@/app/api/question/route')
    const res = await POST(makeRequest({ dilemma: '転職すべきか' }))
    expect(res.status).toBe(500)

    const data = await res.json()
    expect(data.error).toContain('質問なしで記録')
  })
})
