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
  return new NextRequest('http://localhost/api/es', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const sampleAxes = [
  { label: 'キャリア・成長', value: 60 },
  { label: '人間関係・つながり', value: 40 },
]

describe('POST /api/es', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('ES形式の文章を生成する', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '私は常に成長を重視して判断してきました。' } }],
    })

    const { POST } = await import('@/app/api/es/route')
    const res = await POST(makeRequest({ axes: sampleAxes, format: 'es' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.text).toBe('私は常に成長を重視して判断してきました。')
  })

  it('面接形式の文章を生成する', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '私は成長を大切にしていると考えています。' } }],
    })

    const { POST } = await import('@/app/api/es/route')
    const res = await POST(makeRequest({ axes: sampleAxes, format: 'interview' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.text).toBeDefined()
  })

  it('自己紹介形式の文章を生成する', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '成長と挑戦を大切にしています。' } }],
    })

    const { POST } = await import('@/app/api/es/route')
    const res = await POST(makeRequest({ axes: sampleAxes, format: 'intro' }))
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.text).toBeDefined()
  })

  it('空の判断軸で400を返す', async () => {
    const { POST } = await import('@/app/api/es/route')
    const res = await POST(makeRequest({ axes: [], format: 'es' }))
    expect(res.status).toBe(400)
  })

  it('判断軸が配列でない場合400を返す', async () => {
    const { POST } = await import('@/app/api/es/route')
    const res = await POST(makeRequest({ axes: 'invalid', format: 'es' }))
    expect(res.status).toBe(400)
  })

  it('AIの応答が空の場合502を返す', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '' } }],
    })

    const { POST } = await import('@/app/api/es/route')
    const res = await POST(makeRequest({ axes: sampleAxes, format: 'es' }))
    expect(res.status).toBe(502)
  })

  it('API呼び出し失敗時に500を返す', async () => {
    mockCreate.mockRejectedValue(new Error('API error'))

    const { POST } = await import('@/app/api/es/route')
    const res = await POST(makeRequest({ axes: sampleAxes, format: 'es' }))
    expect(res.status).toBe(500)

    const data = await res.json()
    expect(data.error).toBe('生成に失敗しました')
  })

  it('タイムアウト時に504を返す', async () => {
    mockCreate.mockRejectedValue(new Error('Request timed out'))

    const { POST } = await import('@/app/api/es/route')
    const res = await POST(makeRequest({ axes: sampleAxes, format: 'es' }))
    expect(res.status).toBe(504)
  })

  it('不正なフォーマットの場合はES形式にフォールバックする', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: '私は成長を重視します。' } }],
    })

    const { POST } = await import('@/app/api/es/route')
    const res = await POST(makeRequest({ axes: sampleAxes, format: 'invalid' }))
    expect(res.status).toBe(200)
  })
})
