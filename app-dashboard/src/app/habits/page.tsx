"use client";

import { Flame, Target, TrendingUp, ListChecks, Sparkles, Loader2 } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { StatTile } from "@/components/widgets/stat-tile";
import { HabitDetailList } from "@/components/widgets/habit-detail-list";
import { GlassCard } from "@/components/shared/glass-card";
import { useHabitsStore } from "@/store/habits-store";
import { useCachedAIResult } from "@/ai/hooks/useCachedAIResult";
import { analyzeHabits } from "@/ai/services/ModuleAI";

function AIHabitInsights() {
  const habits = useHabitsStore((s) => s.habits);
  const sourceContent = JSON.stringify(
    habits.map((h) => ({ name: h.name, streak: h.streak, bestStreak: h.bestStreak, target: h.targetPerWeek, history: h.history }))
  );

  const { result, state } = useCachedAIResult({
    entityType: "habit_set",
    entityId: "all",
    kind: "insights",
    sourceContent,
    generate: () => analyzeHabits(habits),
    enabled: habits.length > 0,
  });

  if (habits.length === 0) return null;

  return (
    <GlassCard glow="accent" className="mb-6 flex items-start gap-2.5">
      <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--life-accent)]" />
      <div className="min-w-0">
        <h3 className="mb-1 text-sm font-semibold text-foreground">Kimi&rsquo;s Insights</h3>
        {state === "loading" && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" /> Analyzing your habits…
          </div>
        )}
        {state === "done" && result && <p className="text-xs leading-relaxed text-foreground/80">{result}</p>}
        {state === "error" && <p className="text-xs text-muted-foreground">Insights unavailable right now.</p>}
      </div>
    </GlassCard>
  );
}

export default function HabitsPage() {
  const habits = useHabitsStore((s) => s.habits);
  const bestStreak = Math.max(...habits.map((h) => h.streak));
  const avgCompletion = Math.round(
    (habits.reduce((sum, h) => sum + h.history.filter((d) => d.done).length / h.history.length, 0) /
      habits.length) *
      100
  );
  const atRisk = habits.filter((h) => h.streak < h.targetPerWeek - 2).length;

  return (
    <div>
      <SectionHeader eyebrow="Habits" title="Habit Tracker" description="Consistency over intensity." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={ListChecks} label="Active habits" value={`${habits.length}`} accent="primary" />
        <StatTile icon={Flame} label="Best current streak" value={`${bestStreak}d`} accent="warning" />
        <StatTile icon={TrendingUp} label="Avg. completion (12wk)" value={`${avgCompletion}%`} accent="success" />
        <StatTile icon={Target} label="At risk" value={`${atRisk}`} accent="danger" />
      </div>

      <AIHabitInsights />

      <HabitDetailList />
    </div>
  );
}
