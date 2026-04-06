import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCreateBrowserClient = vi.fn().mockReturnValue({ from: vi.fn() })

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: mockCreateBrowserClient,
}))

vi.mock('@/types/database', () => ({}))

describe('Supabase ブラウザクライアント', () => {
  beforeEach(() => {
    vi.resetModules()
    mockCreateBrowserClient.mockClear()
  })

  it('環境変数が設定されている場合、クライアントを作成できる', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const { createClient } = await import('../client')
    const client = createClient()

    expect(mockCreateBrowserClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'test-anon-key',
    )
    expect(client).toBeDefined()
  })

  it('NEXT_PUBLIC_SUPABASE_URL が未設定の場合エラーを投げる', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const { createClient } = await import('../client')
    expect(() => createClient()).toThrow('NEXT_PUBLIC_SUPABASE_URL を .env.local に設定してください')
  })

  it('NEXT_PUBLIC_SUPABASE_ANON_KEY が未設定の場合エラーを投げる', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const { createClient } = await import('../client')
    expect(() => createClient()).toThrow('NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定してください')
  })
})
