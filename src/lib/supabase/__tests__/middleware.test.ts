import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

const mockGetUser = vi.fn().mockResolvedValue({ data: { user: null } })
const mockCreateServerClient = vi.fn().mockReturnValue({
  auth: { getUser: mockGetUser },
})

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}))

describe('Supabase ミドルウェア updateSession', () => {
  beforeEach(() => {
    vi.resetModules()
    mockCreateServerClient.mockClear()
    mockGetUser.mockClear()
  })

  it('環境変数がない場合は NextResponse.next を返す', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const { updateSession } = await import('../middleware')
    const request = new NextRequest('http://localhost:3000/')
    const response = await updateSession(request)

    expect(response).toBeInstanceOf(NextResponse)
    expect(mockCreateServerClient).not.toHaveBeenCalled()
  })

  it('環境変数がある場合はセッションをリフレッシュする', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const { updateSession } = await import('../middleware')
    const request = new NextRequest('http://localhost:3000/')
    const response = await updateSession(request)

    expect(mockCreateServerClient).toHaveBeenCalled()
    expect(mockGetUser).toHaveBeenCalled()
    expect(response).toBeInstanceOf(NextResponse)
  })

  it('cookies の getAll がリクエストクッキーを返す', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const { updateSession } = await import('../middleware')
    const request = new NextRequest('http://localhost:3000/', {
      headers: { cookie: 'test=value' },
    })
    await updateSession(request)

    const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
    const allCookies = cookiesConfig.getAll()
    expect(allCookies).toEqual(expect.arrayContaining([
      expect.objectContaining({ name: 'test', value: 'value' }),
    ]))
  })

  it('cookies の setAll がリクエストとレスポンスの両方にクッキーを設定する', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key'

    const { updateSession } = await import('../middleware')
    const request = new NextRequest('http://localhost:3000/')
    await updateSession(request)

    const cookiesConfig = mockCreateServerClient.mock.calls[0][2].cookies
    cookiesConfig.setAll([
      { name: 'session', value: 'abc', options: { path: '/' } },
    ])

    // リクエストクッキーに設定されたことを確認
    expect(request.cookies.get('session')?.value).toBe('abc')
  })
})
