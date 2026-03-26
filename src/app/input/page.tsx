"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const placeholders = [
  "例: バイト断るか迷ってる",
  "例: インターン行くか迷ってる",
  "例: 内定AかBか迷ってる",
  "例: サークル続けるか迷ってる",
  "例: 転職するか迷ってる",
];

export default function InputPage() {
  const router = useRouter();
  const [text, setText] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const maxLength = 200;
  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= maxLength;

  return (
    <div className="flex min-h-full flex-col">
      <StickyHeader>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            戻る
          </Button>
        </Link>
        <span />
      </StickyHeader>

      <main className="flex flex-1 flex-col py-8">
        <AppShell>
          <FadeInUp {...fadeInUp}>
            <h1 className="text-2xl font-semibold">今、何に迷ってる？</h1>
          </FadeInUp>

          <FadeInUp
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
          >
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={maxLength}
              placeholder={placeholders[placeholderIndex]}
              className="mt-6 min-h-[120px] rounded-2xl border-border/50 bg-muted/50 text-base transition-colors focus-visible:bg-background"
            />
            {text.length > 0 && (
              <p className={`mt-1.5 text-right text-xs ${text.trim().length > maxLength ? 'text-destructive' : 'text-muted-foreground'}`}>
                {text.trim().length}/{maxLength}
              </p>
            )}
          </FadeInUp>

          <FadeInUp
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.2 }}
          >
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                こんな感じで書いてみて
              </p>
              <ul className="space-y-1.5">
                {placeholders.slice(1, 4).map((p) => (
                  <li
                    key={p}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <span className="size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                    {p.replace("例: ", "")}
                  </li>
                ))}
              </ul>
            </div>
          </FadeInUp>

          <FadeInUp
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
          >
            <div className="mt-8">
              <motion.button
                whileHover={canSubmit ? { scale: 1.02 } : undefined}
                whileTap={canSubmit ? { scale: 0.98 } : undefined}
                disabled={!canSubmit}
                onClick={() => {
                  if (canSubmit) {
                    router.push(
                      `/question?q=${encodeURIComponent(trimmed)}`
                    );
                  }
                }}
                className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                AIに聞く
              </motion.button>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                1文字以上入力で開始できます
              </p>
            </div>
          </FadeInUp>
        </AppShell>
      </main>
    </div>
  );
}
