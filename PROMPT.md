# PROMPT.md - MayoLog（マヨログ）

## 概要
迷った瞬間を5秒で記録するメモアプリ

## 技術スタック
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Backend: Supabase (Auth, DB) + Next.js API Routes
- AI: GLM API (glm-4.7)
  - baseURL: https://api.z.ai/api/coding/paas/v4/
  - env: GLM_API_KEY
- Hosting: Vercel
- Domain: mayolog.vercel.app

## コア機能
1. **迷い5秒キャプチャ** — 1画面で迷いをフリーテキスト入力 → AIが1-2問だけフォローアップ質問 → 回答を記録
2. **判断パターン可視化（軸マップ）** — 蓄積された迷いログをAIが分析し、ユーザー固有の判断軸を自動抽出・可視化する

## 画面フロー
LP → 迷い入力 → AI質問 → 分析結果 → 判断軸マップ（3回以上）

## LLM設定
```env
GLM_API_KEY=d4d5b41fda2845b48f8f55c4e3a1e3e9.TMSBR1aLRdCgSkEo
GLM_BASE_URL=https://api.z.ai/api/coding/paas/v4/
GLM_MODEL=glm-4.7
```

## 実装指示
1. LP画面（サービス説明 + CTA）
2. 迷い入力画面（5秒で完了するシンプルなフォーム）
3. AI質問画面（1-2問のフォローアップ質問）
4. 分析結果画面（判断パターン + 軸マップ）
5. API Route (/api/analyze) - GLM API連携
6. Supabase設定（迷いログ保存用）
7. テスト作成（TDD）

## AI活用ポイント
1. **フォローアップ質問生成** — ユーザーの迷いテキストを受け取り、判断軸を炙り出すための質問を1-2問だけ生成
2. **判断パターン分析** — 5件以上の迷いログ＋フォローアップ回答を入力として、ユーザーの判断軸を抽出

## デザインルール
- Apple/Notion/Linearレベルの品質
- グレースケール + 1アクセントカラー
- rounded-2xl / shadow-sm / backdrop-blur-xl
- 1画面1意思決定
- ダークモード必須
- framer-motionでアニメーション
