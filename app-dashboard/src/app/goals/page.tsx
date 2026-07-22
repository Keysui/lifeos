"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { GoalCascade } from "@/components/widgets/goal-cascade";
import { QuarterlyGoalCards } from "@/components/widgets/quarterly-goal-cards";
import { goals } from "@/lib/mock/data";

export default function GoalsPage() {
  const vision = goals.find((g) => g.horizon === "life");

  return (
    <div>
      <SectionHeader eyebrow="Goals" title="Goal Cascade" description="From life vision down to this quarter." />

      {vision && (
        <div className="mb-6 rounded-2xl border border-[var(--life-primary)]/20 bg-[var(--life-primary)]/[0.06] p-5">
          <span className="text-[11px] font-medium uppercase tracking-widest text-[var(--life-primary)]">Life Vision</span>
          <p className="mt-1 text-lg font-medium text-foreground">{vision.title}</p>
        </div>
      )}

      <div className="mb-8">
        <GoalCascade />
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        This Quarter
      </h2>
      <QuarterlyGoalCards />
    </div>
  );
}
