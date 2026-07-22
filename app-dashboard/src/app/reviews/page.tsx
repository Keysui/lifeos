"use client";

import { Sparkles, Scale } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";
import { decisions } from "@/lib/mock/data";
import { getAIResponse } from "@/lib/ai-responses";
import { cn } from "@/lib/utils";

export default function ReviewsPage() {
  const summary = getAIResponse("Review this month");

  return (
    <div>
      <SectionHeader eyebrow="Reviews" title="Reviews &amp; Decisions" description="Look back to move forward." />

      <GlassCard glow="accent" className="mb-8">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--life-accent)]/15 text-[var(--life-accent)]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-semibold text-foreground">Monthly Review Summary</h3>
            <p className="text-sm leading-relaxed text-foreground/80">{summary}</p>
          </div>
        </div>
      </GlassCard>

      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        <Scale className="h-4 w-4" /> Decision Log
      </h2>
      <div className="flex flex-col gap-3">
        {decisions.map((d) => (
          <GlassCard key={d.id} interactive={false} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-medium text-foreground">{d.title}</h4>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium",
                  d.status === "decided"
                    ? "border-[var(--life-success)]/25 bg-[var(--life-success)]/10 text-[var(--life-success)]"
                    : "border-[var(--life-warning)]/25 bg-[var(--life-warning)]/10 text-[var(--life-warning)]"
                )}
              >
                {d.status === "decided" ? "Decided" : "Reconsidering"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{d.rationale}</p>
            <span className="text-[10px] text-muted-foreground">{d.date}</span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
