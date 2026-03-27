"use client";

import { useState } from "react";
import { Check, Copy, Loader2 } from "lucide-react";
import { FadeInUp, fadeInUp } from "@/components/motion";
import { Button } from "@/components/ui/button";

interface EsOutputProps {
  text: string | null;
  loading: boolean;
  error: string | null;
}

export function EsOutput({ text, loading, error }: EsOutputProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">AIが文章を生成しています...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
        {error}
      </div>
    );
  }

  if (!text) return null;

  return (
    <FadeInUp {...fadeInUp}>
      <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-medium text-muted-foreground">生成結果</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="shrink-0 gap-1.5 text-muted-foreground"
            aria-label="コピー"
          >
            {copied ? (
              <Check className="size-4" aria-hidden="true" />
            ) : (
              <Copy className="size-4" aria-hidden="true" />
            )}
            {copied ? "コピー済み" : "コピー"}
          </Button>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed">
          {text}
        </p>
        <p className="mt-4 text-right text-xs text-muted-foreground">
          {text.length}文字
        </p>
      </div>
    </FadeInUp>
  );
}
