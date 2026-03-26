"use client";

import { cn } from "@/lib/utils";

export function AppShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-lg px-5", className)}>
      {children}
    </div>
  );
}

export function StickyHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-5">
        {children}
      </div>
    </header>
  );
}
