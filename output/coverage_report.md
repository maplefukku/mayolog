# MayoLog テストカバレッジレポート

**Date:** 2026-03-27
**担当:** dev-3

## テスト結果

- **テストファイル数**: 16 passed (16)
- **総テスト数**: 70+
- **全テストパス**: ✅

## カバレッジ結果

| 指標 | 値 | 目標 | 結果 |
|------|------|------|------|
| Statements | 74.05% | 60% | ✅ 達成 |
| Branch | 73.94% | - | - |
| Functions | 64.28% | - | - |
| Lines | 76.12% | 60% | ✅ 達成 |

## カバレッジ詳細

### 高カバレッジ（90%以上）
- src/app/page.tsx: 100%
- src/app/input/page.tsx: 100%
- src/app/result/page.tsx: 100%
- src/app/question/page.tsx: 95.83%
- src/components/app-shell.tsx: 100%
- src/components/motion.tsx: 100%
- src/components/theme-provider.tsx: 100%
- src/lib/utils.ts: 100%
- src/lib/ai/glm.ts: 100%

### 低カバレッジ（要改善）
- src/middleware.ts: 0%
- src/lib/supabase/client.ts: 0%
- src/lib/supabase/middleware.ts: 0%
- src/lib/supabase/server.ts: 0%
- src/components/ui/card.tsx: 0%
- src/components/ui/progress.tsx: 0%

## 結論

**カバレッジ目標（60%）達成** ✅

全体的に良好なカバレッジを維持。Supabase関連とUIコンポーネントの一部が未テストだが、コア機能は十分にテストされている。
