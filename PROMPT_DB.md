# MayoLog 認証+DB実装タスク

## 概要
MayoLog（マヨログ）は「迷った瞬間を5秒で記録するメモアプリ」。
ユーザーの日常の迷いを蓄積し、AIが判断パターンを分析して「自分の軸」を可視化する。

## PRDから抽出した必要機能
1. ユーザー認証（Supabase Auth）
2. 迷いログの保存
3. フォローアップ質問への回答保存
4. 判断軸分析結果の保存

## DBスキーマ設計

```sql
-- ユーザープロファイル
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 迷いログ
CREATE TABLE dilemmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- フォローアップ回答
CREATE TABLE followup_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dilemma_id UUID REFERENCES dilemmas(id) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 判断軸分析結果
CREATE TABLE axis_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  axes JSONB NOT NULL, -- [{"label": "安定より挑戦", "evidence": ["ログ1", "ログ2"]}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## RLSポリシー
- profiles: ユーザーは自分のプロファイルのみアクセス可能
- dilemmas: ユーザーは自分の迷いログのみアクセス可能
- followup_responses: ユーザーは自分の回答のみアクセス可能
- axis_analyses: ユーザーは自分の分析結果のみアクセス可能

## データアクセス層
- src/lib/supabase/client.ts - クライアントサイド用
- src/lib/supabase/server.ts - サーバーサイド用
- src/lib/db/dilemmas.ts - 迷いログ操作
- src/lib/db/followup.ts - フォローアップ回答操作
- src/lib/db/axes.ts - 判断軸分析操作

## Migration作成
- supabase/migrations/20260327000000_initial_schema.sql

## 注意
- 制限時間45分
- Claude Codeに委任して実装
- LLM: GLM API (GLM-4.7) のみ使用
- OpenAI/GPT/OpenRouter禁止

## 実行手順
1. supabase init
2. migration作成
3. Supabaseクライアント設定
4. データアクセス層実装
5. テスト作成
6. npm run build で確認
