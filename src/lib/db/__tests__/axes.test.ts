import { describe, it, expect, vi } from 'vitest'
import { upsertAxisAnalysis, getLatestAxisAnalysis, getAxisAnalysisHistory } from '../axes'
import { mockAxisAnalysis } from './helpers'

describe('axes', () => {
  describe('upsertAxisAnalysis', () => {
    it('既存がない場合は新規作成する', async () => {
      const mockInsertSingle = vi.fn().mockResolvedValue({ data: mockAxisAnalysis, error: null })
      const mockInsertSelect = vi.fn().mockReturnValue({ single: mockInsertSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockInsertSelect })

      // 既存チェック: 見つからない
      const mockExistingSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })
      const mockExistingLimit = vi.fn().mockReturnValue({ single: mockExistingSingle })
      const mockExistingOrder = vi.fn().mockReturnValue({ limit: mockExistingLimit })
      const mockExistingEq = vi.fn().mockReturnValue({ order: mockExistingOrder })
      const mockExistingSelect = vi.fn().mockReturnValue({ eq: mockExistingEq })

      let callCount = 0
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return { select: mockExistingSelect }
        }
        return { insert: mockInsert }
      })
      const client = { from: mockFrom } as any

      const result = await upsertAxisAnalysis(client, {
        userId: 'user-1',
        axes: [{ label: '安定より挑戦', evidence: ['転職を検討'] }],
      })

      expect(result).toEqual(mockAxisAnalysis)
    })

    it('既存がある場合は更新する', async () => {
      const updated = { ...mockAxisAnalysis, axes: [{ label: '新しい軸', evidence: ['新証拠'] }] }

      const mockUpdateSingle = vi.fn().mockResolvedValue({ data: updated, error: null })
      const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle })
      const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })

      // 既存チェック: 見つかる
      const mockExistingSingle = vi.fn().mockResolvedValue({
        data: { id: 'axis-1' },
        error: null,
      })
      const mockExistingLimit = vi.fn().mockReturnValue({ single: mockExistingSingle })
      const mockExistingOrder = vi.fn().mockReturnValue({ limit: mockExistingLimit })
      const mockExistingEq = vi.fn().mockReturnValue({ order: mockExistingOrder })
      const mockExistingSelect = vi.fn().mockReturnValue({ eq: mockExistingEq })

      let callCount = 0
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return { select: mockExistingSelect }
        }
        return { update: mockUpdate }
      })
      const client = { from: mockFrom } as any

      const result = await upsertAxisAnalysis(client, {
        userId: 'user-1',
        axes: [{ label: '新しい軸', evidence: ['新証拠'] }],
      })

      expect(result).toEqual(updated)
    })
  })

  describe('getLatestAxisAnalysis', () => {
    it('最新の分析結果を取得できる', async () => {
      const mockSingle = vi.fn().mockResolvedValue({ data: mockAxisAnalysis, error: null })
      const mockLimit = vi.fn().mockReturnValue({ single: mockSingle })
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      const result = await getLatestAxisAnalysis(client, 'user-1')
      expect(result).toEqual(mockAxisAnalysis)
    })

    it('分析結果がない場合はnullを返す', async () => {
      const mockSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      })
      const mockLimit = vi.fn().mockReturnValue({ single: mockSingle })
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      const result = await getLatestAxisAnalysis(client, 'user-1')
      expect(result).toBeNull()
    })

    it('PGRST116以外のエラーで例外を投げる', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' }
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const mockLimit = vi.fn().mockReturnValue({ single: mockSingle })
      const mockOrder = vi.fn().mockReturnValue({ limit: mockLimit })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      await expect(getLatestAxisAnalysis(client, 'user-1')).rejects.toEqual(dbError)
    })
  })

  describe('getAxisAnalysisHistory', () => {
    it('分析結果の履歴を取得できる', async () => {
      const mockOrder = vi.fn().mockResolvedValue({ data: [mockAxisAnalysis], error: null })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      const result = await getAxisAnalysisHistory(client, 'user-1')
      expect(result).toEqual([mockAxisAnalysis])
    })

    it('エラー時に例外を投げる', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' }
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const mockEq = vi.fn().mockReturnValue({ order: mockOrder })
      const mockSelect = vi.fn().mockReturnValue({ eq: mockEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockSelect })
      const client = { from: mockFrom } as any

      await expect(getAxisAnalysisHistory(client, 'user-1')).rejects.toEqual(dbError)
    })
  })

  describe('upsertAxisAnalysis エラーケース', () => {
    it('既存チェックでPGRST116以外のエラーが出たら例外を投げる', async () => {
      const dbError = { code: '42P01', message: 'relation does not exist' }
      const mockExistingSingle = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const mockExistingLimit = vi.fn().mockReturnValue({ single: mockExistingSingle })
      const mockExistingOrder = vi.fn().mockReturnValue({ limit: mockExistingLimit })
      const mockExistingEq = vi.fn().mockReturnValue({ order: mockExistingOrder })
      const mockExistingSelect = vi.fn().mockReturnValue({ eq: mockExistingEq })
      const mockFrom = vi.fn().mockReturnValue({ select: mockExistingSelect })
      const client = { from: mockFrom } as any

      await expect(
        upsertAxisAnalysis(client, { userId: 'user-1', axes: [{ label: 'test', evidence: [] }] }),
      ).rejects.toEqual(dbError)
    })

    it('更新時にエラーが出たら例外を投げる', async () => {
      const dbError = { code: '42501', message: 'permission denied' }
      const mockUpdateSingle = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const mockUpdateSelect = vi.fn().mockReturnValue({ single: mockUpdateSingle })
      const mockUpdateEq = vi.fn().mockReturnValue({ select: mockUpdateSelect })
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq })

      const mockExistingSingle = vi.fn().mockResolvedValue({ data: { id: 'axis-1' }, error: null })
      const mockExistingLimit = vi.fn().mockReturnValue({ single: mockExistingSingle })
      const mockExistingOrder = vi.fn().mockReturnValue({ limit: mockExistingLimit })
      const mockExistingEq = vi.fn().mockReturnValue({ order: mockExistingOrder })
      const mockExistingSelect = vi.fn().mockReturnValue({ eq: mockExistingEq })

      let callCount = 0
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) return { select: mockExistingSelect }
        return { update: mockUpdate }
      })
      const client = { from: mockFrom } as any

      await expect(
        upsertAxisAnalysis(client, { userId: 'user-1', axes: [{ label: 'test', evidence: [] }] }),
      ).rejects.toEqual(dbError)
    })

    it('新規作成時にエラーが出たら例外を投げる', async () => {
      const dbError = { code: '42501', message: 'permission denied' }
      const mockInsertSingle = vi.fn().mockResolvedValue({ data: null, error: dbError })
      const mockInsertSelect = vi.fn().mockReturnValue({ single: mockInsertSingle })
      const mockInsert = vi.fn().mockReturnValue({ select: mockInsertSelect })

      const mockExistingSingle = vi.fn().mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      })
      const mockExistingLimit = vi.fn().mockReturnValue({ single: mockExistingSingle })
      const mockExistingOrder = vi.fn().mockReturnValue({ limit: mockExistingLimit })
      const mockExistingEq = vi.fn().mockReturnValue({ order: mockExistingOrder })
      const mockExistingSelect = vi.fn().mockReturnValue({ eq: mockExistingEq })

      let callCount = 0
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) return { select: mockExistingSelect }
        return { insert: mockInsert }
      })
      const client = { from: mockFrom } as any

      await expect(
        upsertAxisAnalysis(client, { userId: 'user-1', axes: [{ label: 'test', evidence: [] }] }),
      ).rejects.toEqual(dbError)
    })
  })
})
