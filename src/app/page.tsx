"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Zap, MessageCircle, Compass, Clock, FileText, TrendingUp } from "lucide-react";
import { AppShell, StickyHeader } from "@/components/app-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  FadeInUp,
  MotionSection,
  fadeInUp,
  staggerContainer,
  staggerItem,
} from "@/components/motion";
import { ProgressBar } from "@/components/progress-bar";

const features = [
  {
    icon: Zap,
    title: "5秒で完了",
    description: "迷った瞬間をサッと入力。考え込む前に記録できる。",
  },
  {
    icon: MessageCircle,
    title: "AIが深掘り",
    description: "記録をもとにAIが質問。自分でも気づかない本音が見える。",
  },
  {
    icon: Compass,
    title: "判断軸が見える",
    description: "迷いのパターンを分析して、あなただけの判断基準を可視化。",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <StickyHeader>
        <span className="text-base font-semibold tracking-tight">
          MayoLog
        </span>
        <div className="flex items-center gap-2">
          <Link
            href="/growth"
            aria-label="成長グラフ"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <TrendingUp className="size-4" />
          </Link>
          <Link
            href="/es"
            aria-label="ES生成"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <FileText className="size-4" />
          </Link>
          <Link
            href="/history"
            aria-label="迷い履歴"
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Clock className="size-4" />
          </Link>
          <ThemeToggle />
        </div>
      </StickyHeader>

      <main className="flex flex-1 flex-col">
        {/* 進捗バー */}
        <AppShell className="pt-4">
          <ProgressBar />
        </AppShell>

        {/* ヒーロー */}
        <section className="flex flex-1 items-center py-20">
          <AppShell>
            <FadeInUp {...fadeInUp} className="flex flex-col items-center text-center">
              <span className="mb-4 inline-flex items-center rounded-full bg-secondary px-4 py-1.5 text-xs font-medium text-muted-foreground">
                迷いを、自分の軸に変える
              </span>
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
                迷ったら5秒で記録、
                <br />
                勝手に自分の軸が見える
              </h1>
              <p className="mt-4 max-w-sm text-base leading-relaxed text-muted-foreground">
                日常の「どうしよう」を記録するだけ。
                <br />
                AIが判断パターンを分析して、あなたの本当の価値観を映し出します。
              </p>
              <Link href="/input" className="mt-8">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex h-12 items-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  今すぐ始める
                </motion.span>
              </Link>
              <p className="mt-3 text-xs text-muted-foreground">
                無料で使える・登録不要
              </p>
            </FadeInUp>
          </AppShell>
        </section>

        {/* 特徴 */}
        <section className="border-t border-border/50 py-20">
          <AppShell>
            <MotionSection {...staggerContainer}>
              <FadeInUp {...fadeInUp} className="mb-12 text-center">
                <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                  シンプルに、でも深く
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  3つのステップで迷いが資産になる
                </p>
              </FadeInUp>

              <div className="grid gap-4">
                {features.map((feature) => (
                  <motion.div
                    key={feature.title}
                    {...staggerItem}
                    className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm"
                  >
                    <div className="mb-3 inline-flex size-10 items-center justify-center rounded-2xl bg-secondary">
                      <feature.icon className="size-5 text-foreground" />
                    </div>
                    <h3 className="text-base font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </MotionSection>
          </AppShell>
        </section>

        {/* CTA */}
        <section className="border-t border-border/50 py-20">
          <AppShell>
            <FadeInUp
              {...fadeInUp}
              className="flex flex-col items-center text-center"
            >
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
                迷うことは、悪いことじゃない
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                迷いの中にこそ、あなたの大切にしているものが隠れている。
                MayoLogで、それを見つけよう。
              </p>
              <Link href="/input" className="mt-8">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex h-12 items-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  今すぐ始める
                </motion.span>
              </Link>
            </FadeInUp>
          </AppShell>
        </section>
      </main>

      {/* フッター */}
      <footer className="border-t border-border/50 py-8">
        <AppShell className="text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 MayoLog
          </p>
        </AppShell>
      </footer>
    </div>
  );
}
