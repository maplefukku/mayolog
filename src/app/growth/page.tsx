"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getAxisHistory, getLatestSnapshot } from "@/lib/axis-history";
import type { AxisSnapshot } from "@/lib/axis-history";
import { AxisChart } from "@/components/axis-chart";

function ComparisonCard({
  latest,
  previous,
}: {
  latest: AxisSnapshot;
  previous: AxisSnapshot | null;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground">最新の判断軸</h3>
      <div className="mt-3 space-y-3">
        {latest.axes.map((axis) => {
          const prev = previous?.axes.find((a) => a.label === axis.label);
          const diff = prev ? axis.value - prev.value : null;
          return (
            <div key={axis.label} className="flex items-center justify-between">
              <span className="text-sm font-medium">{axis.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">{axis.value}</span>
                {diff !== null && diff !== 0 && (
                  <span
                    className={`text-xs font-medium ${
                      diff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {diff > 0 ? `+${diff}` : diff}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {new Date(latest.date).toLocaleDateString("ja-JP", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
        時点
      </p>
    </div>
  );
}

export default function GrowthPage() {
  const [snapshots, setSnapshots] = useState<AxisSnapshot[]>([]);
  const [latest, setLatest] = useState<AxisSnapshot | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const history = getAxisHistory();
      setSnapshots(history);
      setLatest(getLatestSnapshot());
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const hasData = snapshots.length > 0;
  const previous = snapshots.length >= 2 ? snapshots[snapshots.length - 2] : null;

  return (
    <div className="flex min-h-full flex-col">
      <StickyHeader>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            ホーム
          </Button>
        </Link>
      </StickyHeader>

      <main className="flex flex-1 flex-col py-8">
        <AppShell>
          <FadeInUp {...fadeInUp}>
            <div className="flex items-center gap-2">
              <TrendingUp className="size-5" />
              <h1 className="text-2xl font-semibold">判断軸の進化</h1>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              あなたの判断パターンの変化を時系列で確認できます
            </p>
          </FadeInUp>

          {!hasData && (
            <FadeInUp
              {...fadeInUp}
              transition={{ ...fadeInUp.transition, delay: 0.1 }}
            >
              <div className="mt-8 rounded-2xl border border-border/50 bg-card p-8 shadow-sm text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <TrendingUp className="mx-auto size-12 text-muted-foreground/40" />
                </motion.div>
                <h2 className="mt-4 text-lg font-semibold">まだデータがありません</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  迷いを記録して分析すると、判断軸の変化がここに表示されます
                </p>
                <Link href="/input" className="mt-6 inline-block">
                  <Button className="rounded-full px-6">迷いを記録する</Button>
                </Link>
              </div>
            </FadeInUp>
          )}

          {hasData && (
            <>
              {/* グラフ */}
              <FadeInUp
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: 0.1 }}
              >
                <div className="mt-8 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                  <h2 className="mb-4 text-base font-semibold">進化グラフ</h2>
                  <AxisChart snapshots={snapshots} />
                </div>
              </FadeInUp>

              {/* 最新スナップショット比較 */}
              {latest && (
                <FadeInUp
                  {...fadeInUp}
                  transition={{ ...fadeInUp.transition, delay: 0.2 }}
                >
                  <div className="mt-6">
                    <ComparisonCard latest={latest} previous={previous} />
                  </div>
                </FadeInUp>
              )}

              {/* 記録数 */}
              <FadeInUp
                {...fadeInUp}
                transition={{ ...fadeInUp.transition, delay: 0.3 }}
              >
                <p className="mt-6 text-center text-xs text-muted-foreground">
                  {snapshots.length}件のスナップショットを記録済み
                </p>
              </FadeInUp>
            </>
          )}
        </AppShell>
      </main>
    </div>
  );
}
