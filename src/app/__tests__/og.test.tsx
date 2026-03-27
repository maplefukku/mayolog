import { describe, it, expect } from 'vitest'
import { GET } from '../api/og/route'

describe('/api/og', () => {
  it('デフォルトパラメータでImageResponseを返す', async () => {
    const request = new Request('http://localhost:3000/api/og')
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('image/png')
  })

  it('カスタムパラメータでImageResponseを返す', async () => {
    const request = new Request(
      'http://localhost:3000/api/og?d=転職するか迷ってる&a=安定より挑戦を選ぶ'
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('image/png')
  })

  it('日本語パラメータがエンコードされていても動作する', async () => {
    const d = encodeURIComponent('転職するか迷ってる')
    const a = encodeURIComponent('安定より挑戦を選ぶ')
    const request = new Request(
      `http://localhost:3000/api/og?d=${d}&a=${a}`
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
  })
})
