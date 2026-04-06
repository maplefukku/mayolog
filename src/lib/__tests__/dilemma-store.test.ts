import { describe, it, expect, beforeEach } from 'vitest'
import {
  getDilemmaLogs,
  addDilemmaLog,
  deleteDilemmaLog,
  updateDilemmaCategory,
} from '../dilemma-store'

describe('dilemma-store', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('getDilemmaLogs', () => {
    it('データがない場合は空配列を返す', () => {
      expect(getDilemmaLogs()).toEqual([])
    })

    it('保存済みのログを取得できる', () => {
      const logs = [{ id: '1', content: 'テスト', answer: '回答', createdAt: '2025-01-01' }]
      localStorage.setItem('mayolog_dilemmas', JSON.stringify(logs))
      expect(getDilemmaLogs()).toEqual(logs)
    })

    it('不正なJSONの場合は空配列を返す', () => {
      localStorage.setItem('mayolog_dilemmas', 'invalid json')
      expect(getDilemmaLogs()).toEqual([])
    })
  })

  describe('addDilemmaLog', () => {
    it('ログを追加できる', () => {
      const log = addDilemmaLog('迷い', '回答')
      expect(log.content).toBe('迷い')
      expect(log.answer).toBe('回答')
      expect(log.id).toBeDefined()
      expect(log.createdAt).toBeDefined()
    })

    it('カテゴリ付きでログを追加できる', () => {
      const log = addDilemmaLog('迷い', '回答', 'career')
      expect(log.category).toBe('career')
    })

    it('追加したログがリストの先頭に来る', () => {
      addDilemmaLog('迷い1', '回答1')
      addDilemmaLog('迷い2', '回答2')
      const logs = getDilemmaLogs()
      expect(logs[0].content).toBe('迷い2')
      expect(logs[1].content).toBe('迷い1')
    })
  })

  describe('deleteDilemmaLog', () => {
    it('ログを削除できる', () => {
      const log = addDilemmaLog('削除するログ', '回答')
      deleteDilemmaLog(log.id)
      const logs = getDilemmaLogs()
      expect(logs.find((l) => l.id === log.id)).toBeUndefined()
    })

    it('存在しないIDの場合は何も変わらない', () => {
      addDilemmaLog('残るログ', '回答')
      deleteDilemmaLog('non-existent-id')
      expect(getDilemmaLogs()).toHaveLength(1)
    })
  })

  describe('updateDilemmaCategory', () => {
    it('カテゴリを更新できる', () => {
      const log = addDilemmaLog('迷い', '回答')
      updateDilemmaCategory(log.id, 'career')
      const logs = getDilemmaLogs()
      expect(logs[0].category).toBe('career')
    })

    it('存在しないIDの場合は何も変わらない', () => {
      addDilemmaLog('迷い', '回答')
      updateDilemmaCategory('non-existent-id', 'career')
      const logs = getDilemmaLogs()
      expect(logs[0].category).toBeUndefined()
    })
  })
})
