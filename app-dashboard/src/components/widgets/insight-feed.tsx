"use client";

import { AlertTriangle, TrendingUp, Link2, Zap, ThumbsUp } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { insights } from "@/lib/mock/data";
import type { Insight } from "@/types";
import { cn } from "@/lib/utils";

const kindMeta: Record<Insight["kind"], { icon: React.ElementType; color: string }> = {
  warning: { icon: AlertTriangle, color: "text-[var(--life-warning)]" },
  pattern: { icon: TrendingUp, color: "text-[var(--life-primary)]" },
  correlation: { icon: Link2, color: "text-[var(--life-accent)]" },
  conflict: { icon: Zap, color: "text-[var(--life-danger)]" },
  encouragement: { icon: ThumbsUp, color: "text-[var(--life-success)]" },
};

export function InsightFeed({ limit }: { limit?: number }) {
  const list = limit ? insights.slice(0, limit) : insights;

  return (
    <GlassCard className="flex h-full flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">AI Recommendations</h3>
        <span className="text-[11px] text-muted-foreground">Updated just now</span>
      </div>
      <div className="flex flex-1 flex-col gap-3">
        {list.map((insight) => {
          const meta = kindMeta[insight.kind];
          const Icon = meta.icon;
          return (
            <div
              key={insight.id}
              className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 transition hover:bg-white/[0.04]"
            >
              <div className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]", meta.color)}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs leading-relaxed text-foreground/90">{insight.message}</p>
                <div className="mt-1.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                  {insight.relatedArea && <span>{insight.relatedArea}</span>}
                  <span>&middot;</span>
                  <span>{Math.round(insight.confidence * 100)}% confidence</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
