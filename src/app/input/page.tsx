"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

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

  const handleOnboardingComplete = (sampleText?: string) => {
    if (sampleText) {
      setText(sampleText);
      router.push(`/question?q=${encodeURIComponent(sampleText)}`);
    }
  };

  const maxLength = 200;
  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= maxLength;

  return (
    <div className="flex min-h-full flex-col">
      <OnboardingModal onComplete={handleOnboardingComplete} />
      <StickyHeader>
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            戻る
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
              aria-label="迷っていることを入力"
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
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span className="block w-full">
                      <motion.button
                        type="button"
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
                        className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        AIに聞く
                      </motion.button>
                    </span>
                  }
                />
                {!canSubmit && (
                  <TooltipContent>迷いを入力してください</TooltipContent>
                )}
              </Tooltip>
              <p className={`mt-3 text-center text-sm transition-colors ${canSubmit ? 'text-muted-foreground' : 'text-destructive font-medium'}`}>
                {canSubmit ? '準備完了！' : '迷いを入力してください'}
              </p>
            </div>
          </FadeInUp>
        </AppShell>
      </main>
    </div>
  );
}
