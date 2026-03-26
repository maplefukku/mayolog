import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreate = vi.fn()

vi.mock('openai', () => {
  class MockOpenAI {
    chat = { completions: { create: mockCreate } }
    constructor(public config: Record<string, unknown>) {}
  }
  return { default: MockOpenAI }
})

describe('GLM client', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('openai SDKをGLM設定で初期化する', async () => {
    const { glmClient } = await import('@/lib/ai/glm')
    const config = (glmClient as unknown as { config: Record<string, unknown> }).config
    expect(config.baseURL).toContain('api.z.ai')
  })

  it('GLM_MODELをエクスポートする', async () => {
    const { GLM_MODEL } = await import('@/lib/ai/glm')
    expect(typeof GLM_MODEL).toBe('string')
    expect(GLM_MODEL.length).toBeGreaterThan(0)
  })
})
