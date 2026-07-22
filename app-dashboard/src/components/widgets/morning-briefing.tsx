"use client";

import { Sparkles } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { getAIResponse } from "@/lib/ai-responses";

export function MorningBriefing() {
  const briefing = getAIResponse("Generate my morning briefing");

  return (
    <GlassCard glow="accent" className="relative overflow-hidden">
      <div className="ambient-orb -right-10 -top-10 h-40 w-40 bg-[var(--life-accent)]" />
      <div className="relative flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--life-accent)]/15 text-[var(--life-accent)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div>
          <h3 className="mb-1 text-sm font-semibold text-foreground">Morning Briefing</h3>
          <p className="text-sm leading-relaxed text-foreground/80">{briefing}</p>
        </div>
      </div>
    </GlassCard>
  );
}
