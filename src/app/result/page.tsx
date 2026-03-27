"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Check, Clock, Loader2, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { addDilemmaLog } from "@/lib/dilemma-store";

interface AxisEntry {
  label: string;
  evidence: string[];
}

function AxisBar({ label, index, delay }: { label: string; index: number; delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">軸 {index + 1}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-foreground"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{
            duration: 0.8,
            delay,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        />
      </div>
    </div>
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const input = searchParams.get("q") || "迷っていること";
  const answersParam = searchParams.get("a");

  const [axes, setAxes] = useState<AxisEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const shareText = `私の判断パターン: 「${axes[0]?.label || "分析中"}」\n#MayoLog`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "MayoLog - 判断パターン",
          text: shareText,
          url: window.location.origin,
        });
      } catch {
        // ユーザーがキャンセルした場合は何もしない
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [axes]);

  // 迷いログをlocalStorageに保存
  useEffect(() => {
    if (saved) return;
    let answer = "";
    if (answersParam) {
      try {
        const followups = JSON.parse(decodeURIComponent(answersParam)) as { question: string; answer: string }[];
        answer = followups[0]?.answer || "";
      } catch { /* ignore */ }
    }
    addDilemmaLog(input, answer);
    setSaved(true);
  }, [input, answersParam, saved]);

  useEffect(() => {
    let cancelled = false;

    async function fetchAnalysis() {
      try {
        let followups: { question: string; answer: string }[] = [];
        if (answersParam) {
          try {
            followups = JSON.parse(decodeURIComponent(answersParam));
          } catch {
            // answersParam のパースに失敗した場合は空配列で続行
          }
        }

        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logs: [{ content: input, followups }],
          }),
        });

        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setAxes(data.axes);
          } else {
            const data = await res.json().catch(() => null);
            setError(data?.error || "分析に失敗しました");
          }
        }
      } catch {
        if (!cancelled) {
          setError("通信エラーが発生しました");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalysis();
    return () => { cancelled = true; };
  }, [input, answersParam]);

  if (loading) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">AIが判断パターンを分析しています...</p>
      </div>
    );
  }

  const hasAxes = axes.length > 0;

  return (
    <div className="flex min-h-full flex-col">
      <StickyHeader>
        <Link href="/input">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            もう一度
          </Button>
        </Link>
        <Link
          href="/history"
          aria-label="迷い履歴"
          className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Clock className="size-4" />
        </Link>
      </StickyHeader>

      <main className="flex flex-1 flex-col py-8">
        <AppShell>
          {/* Analysis Card */}
          <FadeInUp {...fadeInUp}>
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
              <h1 className="text-center text-2xl font-semibold">
                あなたの判断パターン
              </h1>

              <div className="mt-6 space-y-6">
                {error && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">迷いの内容</p>
                  <p className="text-lg font-semibold">「{input}」</p>
                </div>

                {hasAxes && (
                  <>
                    <div className="h-px bg-border/50" />
                    <div className="space-y-1.5">
                      <p className="text-sm text-muted-foreground">
                        判断の傾向
                      </p>
                      <p className="text-lg font-semibold">
                        「{axes[0].label}」
                      </p>
                    </div>

                    {axes[0].evidence.length > 0 && (
                      <>
                        <div className="h-px bg-border/50" />
                        <div className="space-y-1.5">
                          <p className="text-sm text-muted-foreground">
                            今日の気づき
                          </p>
                          <p className="text-base leading-relaxed">
                            「{axes[0].evidence[0]}」
                          </p>
                        </div>
                      </>
                    )}
                  </>
                )}

                {!hasAxes && !error && (
                  <>
                    <div className="h-px bg-border/50" />
                    <p className="text-sm text-muted-foreground">
                      分析結果を取得できませんでした
                    </p>
                  </>
                )}
              </div>
            </div>
          </FadeInUp>

          {/* Axis Map */}
          {hasAxes && (
            <FadeInUp
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.2 }}
            >
              <div className="mt-8">
                <h2 className="text-lg font-semibold">あなたの判断軸マップ</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  AIが分析した判断軸
                </p>

                <div className="mt-4 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                  <div className="space-y-4">
                    {axes.map((entry, i) => (
                      <AxisBar
                        key={entry.label}
                        label={entry.label}
                        index={i}
                        delay={0.4 + i * 0.15}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </FadeInUp>
          )}

          {/* Share */}
          <FadeInUp
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.4 }}
          >
            <div className="mt-8">
              <Button
                variant="outline"
                aria-label="判断パターンをシェアする"
                className="h-12 w-full rounded-full text-base font-semibold"
                onClick={handleShare}
              >
                {copied ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  <Share2 className="size-4" aria-hidden="true" />
                )}
                {copied ? "コピーしました！" : "シェアする"}
              </Button>
            </div>
          </FadeInUp>
        </AppShell>
      </main>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-col items-center justify-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
