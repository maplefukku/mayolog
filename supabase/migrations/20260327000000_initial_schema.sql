-- ============================================================
-- MayoLog initial schema
-- ============================================================

-- ユーザープロファイル
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 迷いログ
CREATE TABLE dilemmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- フォローアップ回答
CREATE TABLE followup_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dilemma_id UUID REFERENCES dilemmas(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 判断軸分析結果
CREATE TABLE axis_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  axes JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_dilemmas_user_id ON dilemmas(user_id);
CREATE INDEX idx_dilemmas_created_at ON dilemmas(created_at DESC);
CREATE INDEX idx_followup_responses_dilemma_id ON followup_responses(dilemma_id);
CREATE INDEX idx_axis_analyses_user_id ON axis_analyses(user_id);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE dilemmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE followup_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE axis_analyses ENABLE ROW LEVEL SECURITY;

-- profiles: 自分のプロファイルのみ
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- dilemmas: 自分の迷いログのみ
CREATE POLICY "dilemmas_select_own" ON dilemmas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "dilemmas_insert_own" ON dilemmas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "dilemmas_delete_own" ON dilemmas
  FOR DELETE USING (auth.uid() = user_id);

-- followup_responses: 自分の回答のみ（dilemma経由で確認）
CREATE POLICY "followup_select_own" ON followup_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM dilemmas
      WHERE dilemmas.id = followup_responses.dilemma_id
        AND dilemmas.user_id = auth.uid()
    )
  );
CREATE POLICY "followup_insert_own" ON followup_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM dilemmas
      WHERE dilemmas.id = followup_responses.dilemma_id
        AND dilemmas.user_id = auth.uid()
    )
  );

-- axis_analyses: 自分の分析結果のみ
CREATE POLICY "axes_select_own" ON axis_analyses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "axes_insert_own" ON axis_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "axes_update_own" ON axis_analyses
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Trigger: updated_at の自動更新
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER axis_analyses_updated_at
  BEFORE UPDATE ON axis_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Trigger: auth.users 作成時に profiles を自動作成
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
