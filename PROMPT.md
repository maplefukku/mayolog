# Middleware to Proxy Migration - mayolog

## 目的
Next.js 16の公式移行ガイドに従って、deprecatedなmiddleware.tsをproxy.tsに移行する。

## 背景
Next.js 16からmiddlewareファイルがdeprecatedになり、proxyファイルに置き換える必要がある。
ビルド時に以下の警告が出ている:
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
```

## 移行手順

### 公式ドキュメント
https://nextjs.org/docs/messages/middleware-to-proxy

### 手順
1. 公式codemodを実行:
```bash
npx @next/codemod@canary middleware-to-proxy .
```

2. 変更内容を確認:
- middleware.ts → proxy.ts にリネーム
- export function middleware() → export function proxy() に変更

3. ビルドが通ることを確認:
```bash
npm run build
```

4. 既存テストが通ることを確認:
```bash
npx vitest run
```

## 注意事項
- SupabaseのupdateSession関数を使っているので、importパスは変更しない
- matcher configもそのまま維持
- テストカバレッジを維持（現在96.87%）

## 完了条件
- npm run build が警告なしで成功
- npx vitest run が全て成功
- TypeScriptエラーなし
