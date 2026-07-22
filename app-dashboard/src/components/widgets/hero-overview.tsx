"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Target } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { lifeScore, lifeScoreBreakdown, ANCHOR_DATE } from "@/lib/mock/data";
import { useProfileStore } from "@/store/profile-store";
import { useTasksStore } from "@/store/tasks-store";
import { useCalendarStore } from "@/store/calendar-store";
import { getWeeklyDeepWorkTrend } from "@/lib/calendar/selectors";

function startOfWeek(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const day = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - day);
  return c;
}

export function HeroOverview() {
  const name = useProfileStore((s) => s.name);
  const tasks = useTasksStore((s) => s.tasks);
  const events = useCalendarStore((s) => s.events);
  const focusTask = tasks.find((t) => t.status === "in-progress" && t.priority === "P1") ?? tasks[0];
  const trend = getWeeklyDeepWorkTrend(events, startOfWeek(ANCHOR_DATE));
  const avgDeepWork = Math.round((trend.reduce((s, d) => s + d.deepWorkHours, 0) / trend.length) * 10) / 10;

  return (
    <GlassCard glow="accent" interactive={false} className="mb-6 overflow-hidden p-0">
      <div className="ambient-orb -right-24 -top-24 h-72 w-72 bg-[var(--life-accent)]" />
      <div className="ambient-orb -left-16 bottom-0 h-56 w-56 bg-[var(--life-primary)]" />

      <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col justify-between gap-6">
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--life-accent)]/25 bg-[var(--life-accent)]/10 px-2.5 py-1 text-[11px] font-medium text-[var(--life-accent)]">
              <Sparkles className="h-3 w-3" /> AI Executive Summary
            </span>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Good to see you, {name.split(" ")[0] || "there"}.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
              You&rsquo;re at <span className="text-foreground">{lifeScore}/100</span> life score, trending up.
              Deep work is averaging <span className="text-foreground">{avgDeepWork}h/day</span> this week — ahead of
              your annual target. One project is stalled and worth a look today.
            </p>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--life-primary)]/15 text-[var(--life-primary)]">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Today&rsquo;s mission</div>
                <div className="text-sm font-medium text-foreground">{focusTask.title}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[var(--life-success)]">
              <TrendingUp className="h-3.5 w-3.5" />
              On track
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-6 lg:justify-end">
          <ProgressRing value={lifeScore} size={140} strokeWidth={10} label={`${lifeScore}`} sublabel="Life Score" />
          <div className="hidden flex-col gap-2.5 sm:flex">
            {lifeScoreBreakdown.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-xs"
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} />
                <span className="w-24 text-muted-foreground">{c.label}</span>
                <span className="font-medium text-foreground">{c.score}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
