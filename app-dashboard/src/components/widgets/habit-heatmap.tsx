"use client";

import { Flame } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { useHabitsStore } from "@/store/habits-store";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types";

export function HabitHeatmap({ habit, weeks = 12 }: { habit: Habit; weeks?: number }) {
  const days = habit.history.slice(-weeks * 7);
  const cols: Habit["history"][] = [];
  for (let i = 0; i < days.length; i += 7) cols.push(days.slice(i, i + 7));

  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-[3px]">
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px]">
            {col.map((d, di) => (
              <div
                key={di}
                title={d.date}
                className={cn(
                  "h-2.5 w-2.5 rounded-[3px]",
                  d.done ? "bg-[var(--life-primary)]" : "bg-white/[0.06]"
                )}
                style={d.done ? { boxShadow: "0 0 5px rgba(92,225,230,0.5)" } : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HabitOverviewCard() {
  const habits = useHabitsStore((s) => s.habits);
  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Habit Completion</h3>
        <div className="flex items-center gap-1 text-[11px] text-[var(--life-warning)]">
          <Flame className="h-3.5 w-3.5" />
          {Math.max(...habits.map((h) => h.streak))} day best
        </div>
      </div>
      <div className="flex flex-col gap-3.5">
        {habits.map((habit) => (
          <div key={habit.id} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-foreground/90">{habit.name}</div>
              <div className="text-[10px] text-muted-foreground">{habit.streak}-day streak</div>
            </div>
            <HabitHeatmap habit={habit} weeks={8} />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
