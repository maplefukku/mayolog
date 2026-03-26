import { describe, it, expect, vi } from 'vitest'
import { createFollowup, getFollowupsByDilemma } from '../followup'
import { createMockClient, mockFollowup } from './helpers'

describe('followup', () => {
  describe('createFollowup', () => {
    it('フォローアップ回答を作成できる', async () => {
      const client = createMockClient({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockFollowup, error: null }),
        }),
      })

      const result = await createFollowup(client, {
        dilemmaId: 'dilemma-1',
        question: '何が一番気になっていますか？',
        answer: '安定した収入を失うリスク',
      })

      expect(result).toEqual(mockFollowup)
    })
  })

  describe('getFollowupsByDilemma', () => {
    it('迷いログに紐づくフォローアップを取得できる', async () => {
      const followups = [mockFollowup]
      const mockOrder = vi.fn().mockResolvedValue({ data: followups, error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      const result = await getFollowupsByDilemma(client, 'dilemma-1')

      expect(result).toEqual(followups)
      expect(mockEq).toHaveBeenCalledWith('dilemma_id', 'dilemma-1')
    })
  })
})
