"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, PenLine } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FadeInUp,
  MotionSection,
  fadeInUp,
  staggerContainer,
  staggerItem,
} from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getDilemmaLogs, type DilemmaLog } from "@/lib/dilemma-store";

const ANALYSIS_THRESHOLD = 5;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hour}:${min}`;
}

function ProgressSection({ count }: { count: number }) {
  const remaining = Math.max(0, ANALYSIS_THRESHOLD - count);
  const ratio = Math.min(count / ANALYSIS_THRESHOLD, 1);

  if (remaining === 0) return null;

  return (
    <FadeInUp {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.1 }}>
      <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
        <p className="text-sm font-medium">
          あと{remaining}件で分析可能
        </p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-foreground"
            initial={{ width: 0 }}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-muted-foreground">
          {count}/{ANALYSIS_THRESHOLD}
        </p>
      </div>
    </FadeInUp>
  );
}

function EmptyState() {
  return (
    <FadeInUp {...fadeInUp}>
      <div className="flex flex-col items-center rounded-2xl border border-border/50 bg-card px-6 py-16 text-center shadow-sm">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-secondary">
          <PenLine className="size-6 text-muted-foreground" />
        </div>
        <h2 className="text-lg font-semibold">まだ記録がないよ</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          迷ったことを記録してみよう
        </p>
        <Link href="/input" className="mt-6">
          <motion.span
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            迷いを記録する
          </motion.span>
        </Link>
      </div>
    </FadeInUp>
  );
}

function DilemmaCard({ log }: { log: DilemmaLog }) {
  return (
    <motion.div
      {...staggerItem}
      className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm"
    >
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Clock className="size-3" />
        {formatDate(log.createdAt)}
      </p>
      <p className="mt-3 text-base font-medium">
        「{log.content}」
      </p>
      {log.answer && (
        <p className="mt-2 text-sm text-muted-foreground">
          回答: {log.answer}
        </p>
      )}
    </motion.div>
  );
}

export default function HistoryPage() {
  const [logs, setLogs] = useState<DilemmaLog[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs(getDilemmaLogs());
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!loaded) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

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
          <FadeInUp {...fadeInUp}>
            <h1 className="text-2xl font-semibold">迷い履歴</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              これまでの迷いと向き合った記録
            </p>
          </FadeInUp>

          <div className="mt-6 space-y-4">
            {logs.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <ProgressSection count={logs.length} />
                <MotionSection {...staggerContainer} className="space-y-3">
                  {logs.map((log) => (
                    <DilemmaCard key={log.id} log={log} />
                  ))}
                </MotionSection>
              </>
            )}
          </div>
        </AppShell>
      </main>
    </div>
  );
}
