"use client";

import { Flame, Target, TrendingUp, ListChecks } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { StatTile } from "@/components/widgets/stat-tile";
import { HabitDetailList } from "@/components/widgets/habit-detail-list";
import { useHabitsStore } from "@/store/habits-store";

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

      <HabitDetailList />
    </div>
  );
}
