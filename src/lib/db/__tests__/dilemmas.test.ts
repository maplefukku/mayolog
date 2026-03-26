import { describe, it, expect, vi } from 'vitest'
import { createDilemma, getDilemmasByUser, getDilemmaById, deleteDilemma } from '../dilemmas'
import { createMockClient, mockDilemma } from './helpers'

describe('dilemmas', () => {
  describe('createDilemma', () => {
    it('迷いログを作成できる', async () => {
      const client = createMockClient({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockDilemma, error: null }),
        }),
      })

      const result = await createDilemma(client, {
        userId: 'user-1',
        content: '転職すべきか迷っている',
      })

      expect(result).toEqual(mockDilemma)
    })

    it('エラー時に例外を投げる', async () => {
      const client = createMockClient({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'insert error', code: '42501' },
          }),
        }),
      })

      await expect(
        createDilemma(client, { userId: 'user-1', content: 'test' }),
      ).rejects.toEqual({ message: 'insert error', code: '42501' })
    })
  })

  describe('getDilemmasByUser', () => {
    it('ユーザーの迷いログ一覧を取得できる', async () => {
      const dilemmas = [mockDilemma]
      const mockOrder = vi.fn().mockResolvedValue({ data: dilemmas, error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      const result = await getDilemmasByUser(client, 'user-1')

      expect(result).toEqual(dilemmas)
      expect(mockFrom).toHaveBeenCalledWith('dilemmas')
    })

    it('limit/offsetを指定できる', async () => {
      const mockRange = vi.fn().mockResolvedValue({ data: [], error: null })
      const mockLimit = vi.fn().mockReturnValue({ range: mockRange })
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      await getDilemmasByUser(client, 'user-1', { limit: 10, offset: 5 })

      expect(mockLimit).toHaveBeenCalledWith(10)
      expect(mockRange).toHaveBeenCalledWith(5, 14)
    })
  })

  describe('getDilemmaById', () => {
    it('IDで迷いログを取得できる', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockDilemma, error: null })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      const result = await getDilemmaById(client, 'dilemma-1')
      expect(result).toEqual(mockDilemma)
    })

    it('見つからない場合はnullを返す', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      })
      const mockEq = vi.fn().mockReturnValue({ single: mockSingle })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      const result = await getDilemmaById(client, 'nonexistent')
      expect(result).toBeNull()
    })
  })

  describe('deleteDilemma', () => {
    it('迷いログを削除できる', async () => {
      const mockEq = vi.fn().mockResolvedValue({ error: null })
      const mockDelete = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ delete: mockDelete })
      const client = { from: mockFrom } as any

      await expect(deleteDilemma(client, 'dilemma-1')).resolves.toBeUndefined()
    })
  })
})
