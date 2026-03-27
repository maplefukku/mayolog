import { NextResponse } from "next/server";

// Supabase認証が未実装のため、このエンドポイントは
// クライアント側のlocalStorageと連携する設計。
// 将来的にSupabaseのdilemmasテーブルから取得するように置き換え可能。

export async function GET() {
  // 認証・DB未接続のため空配列を返す
  // クライアント側でlocalStorageから取得してフォールバック
  return NextResponse.json({ dilemmas: [] });
}
