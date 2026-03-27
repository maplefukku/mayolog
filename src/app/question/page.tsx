"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { getCategoryByKey } from "@/lib/templates";

interface Question {
  text: string;
  options: string[];
}

const MAX_QUESTIONS = 5;

function getFallbackQuestions(input: string): Question[] {
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
  const categoryKey = searchParams.get("cat") || "";
  const categoryData = getCategoryByKey(categoryKey);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error_, setError] = useState<string | null>(null);
  void error_;
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [deepDiveLoading, setDeepDiveLoading] = useState(false);
  const [showDeepDiveChoice, setShowDeepDiveChoice] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchQuestions() {
      try {
        const res = await fetch("/api/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dilemma: input, category: categoryKey || undefined }),
        });

        if (!cancelled) {
          if (res.ok) {
            const data = await res.json();
            setQuestions(data.questions);
          } else {
            const data = await res.json().catch(() => null);
            setError(data?.error || "質問の生成に失敗しました");
            setQuestions(getFallbackQuestions(input));
          }
        }
      } catch {
        if (!cancelled) {
          setError("通信エラーが発生しました");
          setQuestions(getFallbackQuestions(input));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchQuestions();
    return () => { cancelled = true; };
  }, [input, categoryKey]);

  if (loading) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">AIが質問を考えています...</p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3">
        <p className="text-muted-foreground">質問を生成できませんでした</p>
        <Link href="/input">
          <Button variant="outline">戻る</Button>
        </Link>
      </div>
    );
  }

  const question = questions[currentQ];
  const isLast = currentQ === questions.length - 1;
  const canDeepDive = questions.length < MAX_QUESTIONS;

  function buildHistory(newAnswers: number[]) {
    return questions.slice(0, newAnswers.length).map((q, i) => ({
      question: q.text,
      answer: q.options[newAnswers[i]] || "",
    }));
  }

  function goToResult(finalAnswers: number[]) {
    const questionsParam = encodeURIComponent(
      JSON.stringify(questions.map((q, i) => ({
        question: q.text,
        answer: q.options[finalAnswers[i]] || "",
      })))
    );
    const catParam = categoryKey ? `&cat=${categoryKey}` : "";
    router.push(
      `/result?q=${encodeURIComponent(input)}&a=${questionsParam}${catParam}`
    );
  }

  function handleNext() {
    if (selected === null) return;
    const newAnswers = [...answers, selected];

    if (isLast) {
      if (canDeepDive) {
        setAnswers(newAnswers);
        setShowDeepDiveChoice(true);
      } else {
        goToResult(newAnswers);
      }
    } else {
      setAnswers(newAnswers);
      setSelected(null);
      setCurrentQ((prev) => prev + 1);
    }
  }

  async function handleDeepDive() {
    setDeepDiveLoading(true);
    setShowDeepDiveChoice(false);

    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dilemma: input,
          history: buildHistory(answers),
          category: categoryKey || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions((prev) => [...prev, data.questions[0]]);
          setSelected(null);
          setCurrentQ(questions.length);
        }
      } else {
        goToResult(answers);
      }
    } catch {
      goToResult(answers);
    } finally {
      setDeepDiveLoading(false);
    }
  }

  function recordSkipEvent(questionText: string) {
    const skipEvent = {
      question: questionText,
      input,
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("mayolog_skip_events") || "[]");
    existing.push(skipEvent);
    localStorage.setItem("mayolog_skip_events", JSON.stringify(existing));
  }

  function handleSkip() {
    recordSkipEvent(question.text);
    goToResult(answers);
  }

  function handleGoToResult() {
    setShowDeepDiveChoice(false);
    goToResult(answers);
  }

  if (deepDiveLoading) {
    return (
      <div className="flex min-h-full flex-col items-center justify-center gap-3">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">さらに深い質問を考えています...</p>
      </div>
    );
  }

  if (showDeepDiveChoice) {
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

        <main className="flex flex-1 flex-col items-center justify-center py-8">
          <AppShell>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm w-full">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
                    AI
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    MayoLog AI
                  </span>
                </div>
                <p className="text-base leading-relaxed">
                  ここまでの回答で分析できますが、もう少し深掘りすると、より正確な結果が出せます。
                </p>
              </div>

              {/* Category-specific deep dive hints */}
              {categoryData && (
                <div className="w-full rounded-2xl border border-border/30 bg-muted/30 p-4">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    {categoryData.icon} {categoryData.label}の迷いでは、こんな視点も大事
                  </p>
                  <ul className="space-y-1">
                    {categoryData.deepDiveQuestions.map((q) => (
                      <li
                        key={q}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <span className="size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex w-full flex-col gap-3">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoToResult}
                  className="h-12 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  分析結果を見る
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeepDive}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-border bg-background text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <ChevronDown className="size-4" />
                  もっと深掘りする
                  <span className="text-xs text-muted-foreground">
                    （あと{MAX_QUESTIONS - questions.length}問）
                  </span>
                </motion.button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                質問 {questions.length}/{MAX_QUESTIONS} 回答済み
              </p>
            </motion.div>
          </AppShell>
        </main>
      </div>
    );
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
        {categoryData && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {categoryData.icon} {categoryData.label}
          </span>
        )}
        {!categoryData && <span />}
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
                {isLast
                  ? canDeepDive
                    ? "次へ"
                    : "分析結果を見る"
                  : "次へ"}
              </motion.button>
              <button
                type="button"
                onClick={handleSkip}
                className="mt-3 w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                スキップして結果を見る
              </button>
              <p className="mt-3 text-center text-sm text-muted-foreground">
                質問 {currentQ + 1}/{questions.length}
                {questions.length < MAX_QUESTIONS && (
                  <span className="text-muted-foreground/60">
                    {" "}（最大{MAX_QUESTIONS}問）
                  </span>
                )}
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
