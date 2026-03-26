import { vi } from 'vitest'
import type { Dilemma, FollowupResponse, AxisAnalysis } from '@/types/database'

export const mockDilemma: Dilemma = {
  id: 'dilemma-1',
  user_id: 'user-1',
  content: '転職すべきか迷っている',
  created_at: '2026-03-27T00:00:00Z',
}

export const mockFollowup: FollowupResponse = {
  id: 'followup-1',
  dilemma_id: 'dilemma-1',
  question: '何が一番気になっていますか？',
  answer: '安定した収入を失うリスク',
  created_at: '2026-03-27T00:00:00Z',
}

export const mockAxisAnalysis: AxisAnalysis = {
  id: 'axis-1',
  user_id: 'user-1',
  axes: [{ label: '安定より挑戦', evidence: ['転職を検討', '新しいスキルに興味'] }],
  created_at: '2026-03-27T00:00:00Z',
  updated_at: '2026-03-27T00:00:00Z',
}

/**
 * Supabase クライアントの簡易モック
 * insert チェーン用: from().insert().select().single()
 */
export function createMockClient(overrides: {
  select?: ReturnType<typeof vi.fn>
}) {
  const mockInsert = vi.fn().mockReturnValue({
    select: overrides.select ?? vi.fn().mockReturnValue({
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  })
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert })

  return { from: mockFrom } as any
}
