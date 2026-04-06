import { describe, it, expect } from 'vitest'
import { GET } from '../route'

describe('GET /api/logs', () => {
  it('空の dilemmas 配列を返す', async () => {
    const response = await GET()
    const data = await response.json()
    expect(data).toEqual({ dilemmas: [] })
  })

  it('ステータスコード200を返す', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
  })
})
