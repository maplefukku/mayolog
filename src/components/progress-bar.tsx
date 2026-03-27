"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { getDilemmaLogs } from "@/lib/dilemma-store";

const TARGET_COUNT = 5;

export interface ProgressBarProps {
  /** Override record count (for testing). When omitted, reads from localStorage. */
  count?: number;
}

export function ProgressBar({ count: countProp }: ProgressBarProps) {
  const [count, setCount] = useState<number | null>(
    countProp !== undefined ? countProp : null,
  );

  useEffect(() => {
    if (countProp !== undefined) return;
    setCount(getDilemmaLogs().length);
  }, [countProp]);

  // SSR or loading
  if (count === null) return null;

  const completed = count >= TARGET_COUNT;
  const progress = Math.min(count / TARGET_COUNT, 1);
  const remaining = TARGET_COUNT - count;

  return (
    <div
      data-testid="progress-bar"
      className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm"
    >
      {completed ? (
        <div className="flex items-center gap-2.5">
          <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary/10">
            <Check className="size-3.5 text-primary" />
          </span>
          <span className="text-sm font-medium text-foreground">
            あなたの軸が見えるようになりました！
          </span>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-foreground">
              あと{remaining}回であなたの軸が見えます
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {count}/{TARGET_COUNT}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
