"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Mic, User } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { EsOutput } from "@/components/es-output";
import { getDilemmaLogs } from "@/lib/dilemma-store";

type Format = "es" | "interview" | "intro";

const formats: { key: Format; label: string; icon: typeof FileText; description: string }[] = [
  { key: "es", label: "ES用400字", icon: FileText, description: "正式な文章形式" },
  { key: "interview", label: "面接用", icon: Mic, description: "話し言葉形式" },
  { key: "intro", label: "自己紹介用", icon: User, description: "100-150字の短文" },
];

function buildAxesFromLogs(): { label: string; value: number }[] {
  const logs = getDilemmaLogs();
  if (logs.length === 0) return [];

  const categoryLabels: Record<string, string> = {
    career: "キャリア・成長",
    relationship: "人間関係・つながり",
    time: "時間の使い方",
    self: "自分らしさ",
    daily: "日常の選択",
  };

  const counts: Record<string, number> = {};
  for (const log of logs) {
    const cat = log.category || "daily";
    counts[cat] = (counts[cat] || 0) + 1;
  }

  const total = logs.length;
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, count]) => ({
      label: categoryLabels[cat] || cat,
      value: Math.round((count / total) * 100),
    }));
}

export default function EsPage() {
  const [format, setFormat] = useState<Format>("es");
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [axes, setAxes] = useState<{ label: string; value: number }[]>([]);

  useEffect(() => {
    setAxes(buildAxesFromLogs());
  }, []);

  const handleGenerate = async () => {
    if (axes.length === 0) {
      setError("迷いログがありません。先に迷いを記録してください。");
      return;
    }

    setLoading(true);
    setError(null);
    setText(null);

    try {
      const res = await fetch("/api/es", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ axes, format }),
      });

      const data = await res.json();

      if (res.ok) {
        setText(data.text);
      } else {
        setError(data.error || "生成に失敗しました");
      }
    } catch {
      setError("通信エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col">
      <StickyHeader>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            戻る
          </Button>
        </Link>
        <ThemeToggle />
      </StickyHeader>

      <main className="flex flex-1 flex-col py-8">
        <AppShell>
          {/* タイトル */}
          <FadeInUp {...fadeInUp}>
            <h1 className="text-2xl font-bold tracking-tight">ES文章を生成</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              蓄積された迷いログから、就活で使える「私の判断基準」文章をAIが生成します。
            </p>
          </FadeInUp>

          {/* フォーマット選択 */}
          <FadeInUp {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.1 }}>
            <div className="mt-8">
              <p className="text-sm font-medium text-muted-foreground">出力形式</p>
              <div className="mt-3 grid gap-3">
                {formats.map((f) => (
                  <motion.button
                    key={f.key}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormat(f.key)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                      format === f.key
                        ? "border-foreground bg-secondary shadow-sm"
                        : "border-border/50 hover:border-border hover:bg-secondary/50"
                    }`}
                  >
                    <div className={`inline-flex size-10 items-center justify-center rounded-2xl ${
                      format === f.key ? "bg-foreground text-background" : "bg-secondary"
                    }`}>
                      <f.icon className="size-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{f.label}</p>
                      <p className="text-sm text-muted-foreground">{f.description}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </FadeInUp>

          {/* 生成ボタン */}
          <FadeInUp {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.2 }}>
            <div className="mt-8">
              <Button
                onClick={handleGenerate}
                disabled={loading || axes.length === 0}
                className="h-12 w-full rounded-full text-base font-semibold"
              >
                {loading ? "生成中..." : "AIで文章を生成する"}
              </Button>
              {axes.length === 0 && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  迷いログを記録すると生成できます
                </p>
              )}
            </div>
          </FadeInUp>

          {/* 生成結果 */}
          <div className="mt-8">
            <EsOutput text={text} loading={loading} error={error} />
          </div>
        </AppShell>
      </main>
    </div>
  );
}
