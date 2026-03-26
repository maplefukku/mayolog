"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, BookmarkPlus, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { Button } from "@/components/ui/button";

interface AxisEntry {
  label: string;
  value: number;
}

const mockAxes: AxisEntry[] = [
  { label: "自由", value: 80 },
  { label: "安定", value: 50 },
  { label: "成長", value: 40 },
  { label: "収入", value: 30 },
];

function AxisBar({ entry, delay }: { entry: AxisEntry; delay: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{entry.label}</span>
        <span className="text-muted-foreground">{entry.value}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-foreground"
          initial={{ width: 0 }}
          animate={{ width: `${entry.value}%` }}
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

  const priority = "自分の時間";
  const tendency = input.includes("断")
    ? "断る方向に傾きやすい"
    : "慎重に検討する傾向がある";
  const insight = `自分の時間を大切にする傾向があります。「${input}」のような場面では、自由や余裕を重視して判断することが多いようです。`;

  return (
    <div className="flex min-h-full flex-col">
      <StickyHeader>
        <Link href="/input">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            もう一度
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <BookmarkPlus className="size-4" />
          履歴に追加
        </Button>
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
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">
                    重視していること
                  </p>
                  <p className="text-lg font-semibold">「{priority}」</p>
                </div>

                <div className="h-px bg-border/50" />

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">判断の傾向</p>
                  <p className="text-lg font-semibold">「{tendency}」</p>
                </div>

                <div className="h-px bg-border/50" />

                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">今日の気づき</p>
                  <p className="text-base leading-relaxed">「{insight}」</p>
                </div>
              </div>
            </div>
          </FadeInUp>

          {/* Axis Map */}
          <FadeInUp
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <div className="mt-8">
              <h2 className="text-lg font-semibold">あなたの判断軸マップ</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                3回以上の記録で表示されます（サンプル）
              </p>

              <div className="mt-4 rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  {mockAxes.map((entry, i) => (
                    <AxisBar
                      key={entry.label}
                      entry={entry}
                      delay={0.4 + i * 0.15}
                    />
                  ))}
                </div>
              </div>
            </div>
          </FadeInUp>

          {/* Share */}
          <FadeInUp
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.4 }}
          >
            <div className="mt-8">
              <Button
                variant="outline"
                className="h-12 w-full rounded-full text-base font-semibold"
              >
                <Share2 className="size-4" />
                シェアする
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
