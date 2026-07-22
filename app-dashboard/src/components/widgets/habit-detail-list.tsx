"use client";

import { Flame, TrendingUp, Check } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { HabitHeatmap } from "@/components/widgets/habit-heatmap";
import { useHabitsStore } from "@/store/habits-store";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function HabitDetailList() {
  const habits = useHabitsStore((s) => s.habits);
  const toggleDay = useHabitsStore((s) => s.toggleDay);
  const today = ANCHOR_DATE.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-3">
      {habits.map((habit) => {
        const completion = Math.round((habit.history.filter((d) => d.done).length / habit.history.length) * 100);
        const onTrack = habit.streak >= habit.targetPerWeek - 2;
        const doneToday = habit.history.find((d) => d.date === today)?.done ?? false;
        return (
          <GlassCard key={habit.id} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">{habit.name}</h4>
                <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground">
                  {habit.area}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1 text-[var(--life-warning)]">
                  <Flame className="h-3 w-3" /> {habit.streak}-day streak
                </span>
                <span>Best: {habit.bestStreak} days</span>
                <span>{completion}% completion (12wk)</span>
                <span>Target: {habit.targetPerWeek}/week</span>
              </div>
            </div>

            <HabitHeatmap habit={habit} weeks={12} />

            <div className="flex shrink-0 items-center gap-2">
              <div
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px]",
                  onTrack
                    ? "border-[var(--life-success)]/25 bg-[var(--life-success)]/10 text-[var(--life-success)]"
                    : "border-[var(--life-warning)]/25 bg-[var(--life-warning)]/10 text-[var(--life-warning)]"
                )}
              >
                <TrendingUp className="h-3 w-3" />
                {onTrack ? "On track" : "At risk"}
              </div>
              <Button
                size="sm"
                variant={doneToday ? "default" : "outline"}
                className={doneToday ? "bg-[var(--life-primary)] text-[#04141a] hover:bg-[var(--life-primary)]/90" : ""}
                onClick={() => toggleDay(habit.id, today)}
              >
                <Check className="h-3.5 w-3.5" />
                {doneToday ? "Done today" : "Mark done"}
              </Button>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
