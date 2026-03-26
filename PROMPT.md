# MayoLog デザイン仕上げタスク

## 担当範囲（dev-5）
- framer-motionアニメーション
- ダークモード(next-themes)
- レスポンシブ対応(375px)
- DESIGN_SYSTEM.md禁止事項チェック
- 日本語UI品質

## アプリ概要
MayoLog（マヨログ）— 迷った瞬間を5秒で記録するメモアプリ
ユーザーが日常の迷いを入力すると、AIが判断パターンを分析し、自分の軸が可視化される。

## 現在の状態
- create-next-app直後のデフォルト状態
- framer-motion, next-themes, lucide-reactはインストール済み
- UIコンポーネントは未実装

## やるべきこと

### 1. next-themes セットアップ
```tsx
// src/app/layout.tsx に ThemeProvider を追加
import { ThemeProvider } from "next-themes";

<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
  {children}
</ThemeProvider>
```

### 2. globals.css のデザインシステム対応
DESIGN_SYSTEM.mdのカラーシステムを実装:
- ライトモード: foreground=#0A0A0A, background=#FFFFFF, muted=#F5F5F5
- ダークモード: foreground=#FAFAFA, background=#0A0A0A, muted=#171717

### 3. 基本レイアウトコンポーネント作成
- AppShell: max-w-lg センタリング、sticky header with backdrop-blur
- HeroSection: ヒーローセクション（framer-motionでアニメーション）
- Card: rounded-2xl border bg-card p-6 shadow-sm

### 4. framer-motion アニメーション設定
```tsx
// ページ遷移アニメーション
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
```

### 5. LP（ランディングページ）のベース作成
PRDとUXデザインに基づいてLPのベース構造を作成:
- ヒーロー: 「迷ったら5秒で記録、勝手に自分の軸が見える」
- CTA: 「今すぐ始める」ボタン（rounded-full h-12）
- 3つの特徴: 5秒で完了 / AIが質問 / 判断軸が見える

## 禁止事項（DESIGN_SYSTEM.mdより）
1. グラデーション背景 — 安っぽくなる
2. 影が濃すぎる — shadow-lg以上は原則禁止
3. ボーダーが目立ちすぎる — border-border/50で薄く
4. 色を3色以上使う — グレースケール + アクセント1色
5. 角丸がバラバラ — rounded-2xlかrounded-fullに統一
6. フォントサイズの乱立 — スケールに従う
7. 余白が狭い — p-4未満のパディングは使わない
8. アイコンだけのボタン（ラベルなし）
9. 英語のまま残す — 全て日本語
10. デフォルトのshadcn/uiそのまま — 必ずカスタマイズ

## 品質基準
- lint警告0
- build成功
- Apple/Notion/Linear レベルの洗練度
- モバイルファースト（max-w-lg センタリング）
- タップターゲット48px以上
- 320px幅で崩れない

## 実装手順
1. globals.css をデザインシステムに合わせて修正
2. layout.tsx に ThemeProvider を追加
3. src/components/ui/ に基本コンポーネントを作成
4. src/app/page.tsx をLP用に書き換え
5. framer-motion アニメーションを追加
6. lint/build確認

## 注意
- 自分でコードを書かない
- Claude Codeに委任して実装させる
- 修正したファイルのみコミット（git add -A 禁止）
