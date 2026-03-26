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
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

function makeLogs(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    content: `迷い${i + 1}`,
    followups: [{ question: `質問${i + 1}`, answer: `回答${i + 1}` }],
  }))
}

describe('POST /api/analyze', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('5件以上のログから判断軸を抽出する', async () => {
    const mockResponse = {
      axes: [
        { label: '安定より挑戦を選ぶ', evidence: ['転職を検討', '新しいスキル'] },
        { label: '他者より自分を優先', evidence: ['自分の直感を信じた'] },
      ],
    }
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: JSON.stringify(mockResponse) } }],
    })

    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeRequest({ logs: makeLogs(5) }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.axes).toHaveLength(2)
    expect(data.axes[0].label).toBe('安定より挑戦を選ぶ')
    expect(data.axes[0].evidence.length).toBeGreaterThan(0)
  })

  it('5件未満のログを400で拒否する', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeRequest({ logs: makeLogs(3) }))
    expect(res.status).toBe(400)

    const data = await res.json()
    expect(data.error).toContain('5件以上')
  })

  it('不正なデータを400で拒否する', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeRequest({ logs: 'not-an-array' }))
    expect(res.status).toBe(400)
  })

  it('AIの応答が不正な場合502を返す', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '分析結果をテキストで返します' } }],
    })

    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeRequest({ logs: makeLogs(5) }))
    expect(res.status).toBe(502)
  })

  it('API失敗時に500を返す', async () => {
    mockCreate.mockRejectedValue(new Error('API error'))

    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeRequest({ logs: makeLogs(5) }))
    expect(res.status).toBe(500)
  })
})
