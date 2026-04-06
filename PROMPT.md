# テスト修正タスク

## 問題
テスト `src/app/__tests__/input-extra.test.tsx` の1件が失敗:

```
expect(screen.getByLabelText('迷い履歴')).toBeInTheDocument()
```

「迷い履歴」というaria-labelを持つ要素が見つからないエラー。

## 修正手順
1. `src/app/__tests__/input-extra.test.tsx` の失敗テストを確認
2. `src/app/input/page.tsx` (または該当コンポーネント) で「迷い履歴」リンクの実装を確認
3. テストが実際のUIと一致するように修正（テスト側を修正するか、aria-labelを追加）
4. `npx vitest run src/app/__tests__/input-extra.test.tsx` でテストが通ることを確認

## 注意
- 最小限の修正で対応
- コミットは不要（結果を報告するだけでOK）
