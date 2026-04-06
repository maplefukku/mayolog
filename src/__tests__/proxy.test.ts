import { describe, it, expect, vi } from 'vitest'
import { NextRequest, NextResponse } from 'next/server'

vi.mock('@/lib/supabase/middleware', () => ({
  updateSession: vi.fn().mockResolvedValue(NextResponse.next()),
}))

import { proxy, config } from '../proxy'
import { updateSession } from '@/lib/supabase/middleware'

describe('ルートプロキシ', () => {
  it('updateSession を呼び出す', async () => {
    const request = new NextRequest('http://localhost:3000/')
    await proxy(request)
    expect(updateSession).toHaveBeenCalledWith(request)
  })

  it('updateSession のレスポンスを返す', async () => {
    const expectedResponse = NextResponse.next()
    vi.mocked(updateSession).mockResolvedValue(expectedResponse)

    const request = new NextRequest('http://localhost:3000/test')
    const response = await proxy(request)
    expect(response).toBe(expectedResponse)
  })

  it('matcher パターンが設定されている', () => {
    expect(config.matcher).toBeDefined()
    expect(config.matcher.length).toBeGreaterThan(0)
    expect(config.matcher[0]).toContain('_next/static')
  })
})
