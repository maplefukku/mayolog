"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { OnboardingModal } from "@/components/onboarding-modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { categories, type CategoryKey } from "@/lib/templates";

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
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey | "free" | null>(null);

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

  function handleCategorySelect(key: CategoryKey | "free") {
    setSelectedCategory(key === selectedCategory ? null : key);
    if (key === "free") {
      setText("");
    }
  }

  function handleTemplateSelect(template: string, categoryKey: CategoryKey) {
    setText(template);
    router.push(
      `/question?q=${encodeURIComponent(template)}&cat=${categoryKey}`
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;
    const catParam = selectedCategory && selectedCategory !== "free" ? `&cat=${selectedCategory}` : "";
    router.push(
      `/question?q=${encodeURIComponent(trimmed)}${catParam}`
    );
  }

  const maxLength = 200;
  const trimmed = text.trim();
  const canSubmit = trimmed.length > 0 && trimmed.length <= maxLength;

  const selectedCategoryData = selectedCategory && selectedCategory !== "free"
    ? categories.find((c) => c.key === selectedCategory)
    : null;

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
            <h1 className="text-2xl font-semibold">どんな迷い？</h1>
          </FadeInUp>

          {/* Category selection */}
          <FadeInUp
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.1 }}
          >
            <div className="mt-5 flex flex-wrap gap-2">
              {categories.map((cat) => (
                <motion.button
                  key={cat.key}
                  type="button"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleCategorySelect(cat.key)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                    selectedCategory === cat.key
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/60 bg-card text-foreground hover:border-border hover:shadow-sm"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.label}
                </motion.button>
              ))}
              <motion.button
                type="button"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleCategorySelect("free")}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all ${
                  selectedCategory === "free"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border/60 bg-card text-foreground hover:border-border hover:shadow-sm"
                }`}
              >
                <Pencil className="size-3.5" />
                自由入力
              </motion.button>
            </div>
          </FadeInUp>

          {/* Template list for selected category */}
          <AnimatePresence mode="wait">
            {selectedCategoryData && (
              <motion.div
                key={selectedCategoryData.key}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    テンプレートから選ぶ
                  </p>
                  <div className="space-y-2">
                    {selectedCategoryData.templates.map((tmpl) => (
                      <motion.button
                        key={tmpl}
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() =>
                          handleTemplateSelect(tmpl, selectedCategoryData.key)
                        }
                        className="flex w-full items-center gap-3 rounded-2xl border border-border/50 bg-card p-4 text-left text-sm transition-all hover:border-border hover:shadow-sm"
                      >
                        <span className="text-base">{selectedCategoryData.icon}</span>
                        <span>{tmpl}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Free input area — shown when "free" selected or a category is selected (for custom input) */}
          <FadeInUp
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.15 }}
          >
            <div className="mt-5">
              {selectedCategory === "free" && (
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  自由に入力してね
                </p>
              )}
              {selectedCategoryData && (
                <p className="mb-2 text-sm font-medium text-muted-foreground">
                  または自分の言葉で入力
                </p>
              )}
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={maxLength}
                placeholder={placeholders[placeholderIndex]}
                aria-label="迷っていることを入力"
                className="min-h-[120px] rounded-2xl border-border/50 bg-muted/50 text-base transition-colors focus-visible:bg-background"
              />
              {text.length > 0 && (
                <p className={`mt-1.5 text-right text-xs ${text.trim().length > maxLength ? "text-destructive" : "text-muted-foreground"}`}>
                  {text.trim().length}/{maxLength}
                </p>
              )}
            </div>
          </FadeInUp>

          {/* Examples — only show when no category selected */}
          {!selectedCategory && (
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
          )}

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
                        onClick={handleSubmit}
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
              <p className={`mt-3 text-center text-sm transition-colors ${canSubmit ? "text-muted-foreground" : "text-destructive font-medium"}`}>
                {canSubmit ? "準備完了！" : "カテゴリを選ぶか、迷いを入力してね"}
              </p>
            </div>
          </FadeInUp>
        </AppShell>
      </main>
    </div>
  );
}
