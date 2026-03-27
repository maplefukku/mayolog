"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const SAMPLE_DILEMMAS = [
  "バイト断るか迷ってる",
  "インターン行くか迷ってる",
  "サークル続けるか迷ってる",
];

export function OnboardingModal({ onComplete }: { onComplete: (sampleText?: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const onboarded = localStorage.getItem("mayolog_onboarded");
      if (!onboarded) {
        setIsOpen(true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleSkip = () => {
    localStorage.setItem("mayolog_onboarded", "true");
    setIsOpen(false);
    onComplete();
  };

  const handleTry = () => {
    localStorage.setItem("mayolog_onboarded", "true");
    setIsOpen(false);
    const randomSample = SAMPLE_DILEMMAS[Math.floor(Math.random() * SAMPLE_DILEMMAS.length)];
    onComplete(randomSample);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-md rounded-2xl border border-border/50 bg-card p-6 shadow-lg"
        >
          {/* Close button */}
          <button
            onClick={handleSkip}
            className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>

          {/* Content */}
          <h2 className="text-xl font-bold">迷ったら5秒で記録しよう</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            何に迷ってるか書くだけで、AIが判断パターンを分析します。
          </p>

          {/* Sample dilemmas */}
          <div className="mt-6 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">例:</p>
            {SAMPLE_DILEMMAS.map((dilemma) => (
              <div
                key={dilemma}
                className="rounded-xl bg-muted/50 px-4 py-2 text-sm"
              >
                {dilemma}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 rounded-xl border border-border/50 py-3 text-sm font-medium hover:bg-muted/50"
            >
              スキップ
            </button>
            <button
              onClick={handleTry}
              className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              体験してみる
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
