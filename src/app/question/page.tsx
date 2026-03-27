"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { Button } from "@/components/ui/button";

interface Question {
  text: string;
  options: string[];
}

function getQuestions(input: string): Question[] {
  return [
    {
      text: `「${input}」ですね。\n今、どっちに傾いてる？`,
      options: [
        input.includes("断") ? "断る方に少し傾いてる" : "やめる方に少し傾いてる",
        "どっちとも言えない",
        input.includes("断") ? "行く方に少し傾いてる" : "やる方に少し傾いてる",
      ],
    },
    {
      text: "もし結果がどうなっても後悔しないとしたら、どっちを選ぶ？",
      options: [
        "それでも今の傾きと同じ方を選ぶ",
        "逆の方を選ぶかもしれない",
        "やっぱりわからない",
      ],
    },
  ];
}

function QuestionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const input = searchParams.get("q") || "迷っていること";
  const questions = getQuestions(input);

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);

  const question = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    if (isLast) {
      router.push(
        `/result?q=${encodeURIComponent(input)}&a=${encodeURIComponent(JSON.stringify(newAnswers))}`
      );
    } else {
      setAnswers(newAnswers);
      setSelected(null);
      setCurrentQ((prev) => prev + 1);
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <StickyHeader>
        <Link href="/input">
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="size-4" />
            戻る
          </Button>
        </Link>
        <span />
      </StickyHeader>

      <main className="flex flex-1 flex-col py-8">
        <AppShell>
          {/* AI message */}
          <FadeInUp {...fadeInUp}>
            <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                  AI
                </div>
                <span className="text-sm font-medium text-muted-foreground">
                  MayoLog AI
                </span>
              </div>
              <p className="whitespace-pre-line text-base leading-relaxed">
                {question.text}
              </p>
            </div>
          </FadeInUp>

          {/* Options */}
          <motion.div
            key={currentQ}
            role="radiogroup"
            aria-label={question.text}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="mt-6 space-y-3"
          >
            {question.options.map((option, i) => (
              <button
                key={i}
                type="button"
                role="radio"
                aria-checked={selected === i}
                onClick={() => setSelected(i)}
                className={`w-full rounded-2xl border p-4 text-left text-base transition-all ${
                  selected === i
                    ? "border-foreground bg-foreground/5 font-medium"
                    : "border-border/50 bg-card hover:border-border hover:shadow-sm"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      selected === i
                        ? "border-foreground bg-foreground"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {selected === i && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="size-2 rounded-full bg-background"
                      />
                    )}
                  </span>
                  {option}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Next button */}
          <FadeInUp
            {...fadeInUp}
            transition={{ ...fadeInUp.transition, delay: 0.3 }}
          >
            <div className="mt-8">
              <motion.button
                type="button"
                whileHover={selected !== null ? { scale: 1.02 } : undefined}
                whileTap={selected !== null ? { scale: 0.98 } : undefined}
                disabled={selected === null}
                onClick={handleNext}
                className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
              >
                {isLast ? "結果を見る" : "次へ"}
              </motion.button>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                質問 {currentQ + 1}/{questions.length}
              </p>
            </div>
          </FadeInUp>
        </AppShell>
      </main>
    </div>
  );
}

export default function QuestionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-col items-center justify-center">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      }
    >
      <QuestionContent />
    </Suspense>
  );
}
