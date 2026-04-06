import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockCookieStore = {
  getAll: vi.fn().mockReturnValue([]),
  set: vi.fn(),
}

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue(mockCookieStore),
}))

const mockCreateServerClient = vi.fn().mockReturnValue({ from: vi.fn() })

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}))

vi.mock('@/types/database', () => ({}))

describe('Supabase サーバークライアント', () => {
  beforeEach(() => {
    vi.resetModules()
    mockCreateServerClient.mockClear()
    mockCookieStore.getAll.mockClear()
    mockCookieStore.set.mockClear()
  })

  it('環境変数が設定されている場合、クライアントを作成できる', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const { createClient } = await import('../server')
    const client = await createClient()

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      'https://example.supabase.co',
      'test-anon-key',
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      }),
    )
    expect(client).toBeDefined()
  })

  it('環境変数が未設定の場合エラーを投げる', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const { createClient } = await import('../server')
    await expect(createClient()).rejects.toThrow(
      'NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を .env.local に設定してください',
    )
  })

  it('cookies の getAll が呼ばれる', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const { createClient } = await import('../server')
    await createClient()

    // createServerClient に渡された cookies.getAll を呼び出す
    const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
    cookiesConfig.getAll()
    expect(mockCookieStore.getAll).toHaveBeenCalled()
  })

  it('cookies の setAll が正常に動作する', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const { createClient } = await import('../server')
    await createClient()

    const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
    const testCookies = [
      { name: 'session', value: 'abc123', options: { path: '/' } },
    ]
    cookiesConfig.setAll(testCookies)
    expect(mockCookieStore.set).toHaveBeenCalledWith('session', 'abc123', { path: '/' })
  })

  it('setAll で例外が発生しても無視される（Server Component対応）', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    mockCookieStore.set.mockImplementation(() => {
      throw new Error('Server Component では set できません')
    })

    const { createClient } = await import('../server')
    await createClient()

    const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
    // 例外が発生しても throw しないことを確認
    expect(() =>
      cookiesConfig.setAll([{ name: 'test', value: 'val', options: {} }]),
    ).not.toThrow()
  })
})
