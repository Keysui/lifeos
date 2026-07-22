"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { goals } from "@/lib/mock/data";

export function GoalProgressRings({ limit = 3 }: { limit?: number }) {
  const quarterly = goals.filter((g) => g.horizon === "quarterly").slice(0, limit);

  return (
    <GlassCard className="h-full">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Goal Progress</h3>
      <div className="flex items-center justify-around gap-2">
        {quarterly.map((goal) => (
          <div key={goal.id} className="flex flex-col items-center gap-2">
            <ProgressRing value={goal.progress} size={72} strokeWidth={6} color="var(--life-accent)" />
            <span className="max-w-[90px] text-center text-[11px] leading-tight text-muted-foreground">
              {goal.title}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
