"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Lightbulb, PenLine, Trash2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import { getDilemmaLogs, deleteDilemmaLog, type DilemmaLog, type Category } from "@/lib/dilemma-store";

const ANALYSIS_THRESHOLD = 5;

const categoryConfig: Record<Category, { label: string; light: string; dark: string }> = {
  career: {
    label: "キャリア",
    light: "bg-blue-100 text-blue-700",
    dark: "dark:bg-blue-900/50 dark:text-blue-300",
  },
  relationship: {
    label: "人間関係",
    light: "bg-purple-100 text-purple-700",
    dark: "dark:bg-purple-900/50 dark:text-purple-300",
  },
  time: {
    label: "時間管理",
    light: "bg-orange-100 text-orange-700",
    dark: "dark:bg-orange-900/50 dark:text-orange-300",
  },
  self: {
    label: "自己実現",
    light: "bg-green-100 text-green-700",
    dark: "dark:bg-green-900/50 dark:text-green-300",
  },
  daily: {
    label: "日常",
    light: "bg-gray-100 text-gray-700",
    dark: "dark:bg-gray-800 dark:text-gray-300",
  },
};

const patternInsights: Record<Category, string> = {
  career: "就活や仕事選びで大切にしていることがありそう。",
  relationship: "人とのつながりを大事にしているみたい。",
  time: "時間の使い方にこだわりがあるのかも。",
  self: "自分を成長させたいという気持ちが強そう。",
  daily: "日々の小さな選択にも丁寧に向き合ってるね。",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hour = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${year}/${month}/${day} ${hour}:${min}`;
}

function CategoryTag({ category }: { category: Category }) {
  const config = categoryConfig[category];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.light} ${config.dark}`}
    >
      {config.label}
    </span>
  );
}

function CategoryFilter({
  selected,
  onSelect,
  counts,
}: {
  selected: Category | null;
  onSelect: (c: Category | null) => void;
  counts: Record<Category, number>;
}) {
  const allCategories: (Category | null)[] = [null, "career", "relationship", "time", "self", "daily"];
  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <FadeInUp {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.05 }}>
      <div className="flex flex-wrap gap-2">
        {allCategories.map((cat) => {
          const isActive = selected === cat;
          const count = cat === null ? totalCount : counts[cat];
          if (cat !== null && count === 0) return null;
          const label = cat === null ? "すべて" : categoryConfig[cat].label;

          return (
            <motion.button
              key={cat ?? "all"}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(cat)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-foreground text-background"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {label}
              <span className={`text-xs ${isActive ? "text-background/70" : "text-muted-foreground"}`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </FadeInUp>
  );
}

function PatternInsight({ logs }: { logs: DilemmaLog[] }) {
  const categorized = logs.filter((l) => l.category);
  if (categorized.length < 3) return null;

  const counts: Record<string, number> = {};
  for (const log of categorized) {
    const cat = log.category!;
    counts[cat] = (counts[cat] || 0) + 1;
  }

  const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  if (!topCategory) return null;

  const [cat, count] = topCategory as [Category, number];
  const config = categoryConfig[cat];
  const insight = patternInsights[cat];

  return (
    <FadeInUp {...fadeInUp} transition={{ ...fadeInUp.transition, delay: 0.15 }}>
      <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
            <Lightbulb className="size-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">あなたの迷いの傾向</p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              「<span className="font-medium text-foreground">{config.label}</span>」に関する迷いが
              {count}件で最も多いようです。
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {insight}
            </p>
          </div>
        </div>
      </div>
    </FadeInUp>
  );
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

function DetailModal({
  log,
  onClose,
  onDelete,
}: {
  log: DilemmaLog;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">迷いの詳細</h2>
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground">迷いの内容</p>
            <p className="mt-1 text-base font-medium">「{log.content}」</p>
          </div>

          {log.category && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">カテゴリ</p>
              <div className="mt-1">
                <CategoryTag category={log.category} />
              </div>
            </div>
          )}

          {log.answer && (
            <div>
              <p className="text-xs font-medium text-muted-foreground">判断軸</p>
              <p className="mt-1 text-sm text-foreground">{log.answer}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-medium text-muted-foreground">日時</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-foreground">
              <Clock className="size-3" />
              {formatDate(log.createdAt)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(log.id)}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <Trash2 className="size-3.5" />
            削除する
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DilemmaCard({
  log,
  onDelete,
  onSelect,
}: {
  log: DilemmaLog;
  onDelete: (id: string) => void;
  onSelect: (log: DilemmaLog) => void;
}) {
  return (
    <motion.div
      layout
      exit={{ opacity: 0, height: 0, marginTop: 0, padding: 0, overflow: "hidden" }}
      transition={{ duration: 0.3 }}
      {...staggerItem}
      className="cursor-pointer rounded-2xl border border-border/50 bg-card p-5 shadow-sm transition-colors hover:bg-accent/50"
      onClick={() => onSelect(log)}
    >
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {formatDate(log.createdAt)}
        </p>
        <div className="flex items-center gap-2">
          {log.category && <CategoryTag category={log.category} />}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(log.id);
            }}
            className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 dark:hover:text-red-400"
          >
            <Trash2 className="size-3.5" />
          </motion.button>
        </div>
      </div>
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
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedLog, setSelectedLog] = useState<DilemmaLog | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLogs(getDilemmaLogs());
      setLoaded(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleDelete = useCallback((id: string) => {
    deleteDilemmaLog(id);
    setLogs((prev) => prev.filter((log) => log.id !== id));
    setSelectedLog(null);
  }, []);

  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      career: 0,
      relationship: 0,
      time: 0,
      self: 0,
      daily: 0,
    };
    for (const log of logs) {
      if (log.category) {
        counts[log.category]++;
      }
    }
    return counts;
  }, [logs]);

  const filteredLogs = useMemo(() => {
    if (!selectedCategory) return logs;
    return logs.filter((log) => log.category === selectedCategory);
  }, [logs, selectedCategory]);

  const hasCategorized = logs.some((l) => l.category);

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
                {hasCategorized && (
                  <CategoryFilter
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                    counts={categoryCounts}
                  />
                )}
                <PatternInsight logs={logs} />
                <ProgressSection count={logs.length} />
                <MotionSection {...staggerContainer} className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredLogs.map((log) => (
                      <DilemmaCard
                        key={log.id}
                        log={log}
                        onDelete={handleDelete}
                        onSelect={setSelectedLog}
                      />
                    ))}
                  </AnimatePresence>
                </MotionSection>
                {filteredLogs.length === 0 && selectedCategory && (
                  <FadeInUp {...fadeInUp}>
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      「{categoryConfig[selectedCategory].label}」の記録はまだありません
                    </p>
                  </FadeInUp>
                )}
              </>
            )}
          </div>
        </AppShell>
      </main>

      <AnimatePresence>
        {selectedLog && (
          <DetailModal
            log={selectedLog}
            onClose={() => setSelectedLog(null)}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
