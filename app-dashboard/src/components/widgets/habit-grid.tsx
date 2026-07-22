"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { Checkbox } from "@/components/ui/checkbox";
import { useHabitsStore } from "@/store/habits-store";
import { cn } from "@/lib/utils";
import type { Habit } from "@/types";

function todayDone(habit: Habit) {
  return habit.history[habit.history.length - 1]?.done ?? false;
}

function progress(habit: Habit) {
  if (habit.subtasks?.length) {
    const done = habit.subtasks.filter((s) => s.done).length;
    return { done, total: habit.subtasks.length };
  }
  return { done: todayDone(habit) ? 1 : 0, total: 1 };
}

function HabitCard({ habit }: { habit: Habit }) {
  const [open, setOpen] = useState(false);
  const toggleSubtask = useHabitsStore((s) => s.toggleSubtask);
  const setDay = useHabitsStore((s) => s.setDay);
  const { done, total } = progress(habit);
  const complete = done === total;
  const todayISO = habit.history[habit.history.length - 1]?.date;

  return (
    <div
      className={cn(
        "rounded-lg border px-3 py-2.5 transition-colors",
        complete
          ? "border-[var(--life-success)]/30 bg-[var(--life-success)]/[0.06]"
          : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]"
      )}
    >
      <button
        onClick={() => (habit.subtasks?.length ? setOpen((o) => !o) : todayISO && setDay(habit.id, todayISO, !complete))}
        className="flex w-full items-center justify-between gap-2 text-left"
      >
        <div className="min-w-0">
          <div className="truncate text-xs font-medium text-foreground/90">{habit.name}</div>
          <div className="text-[10px] text-muted-foreground">{habit.area}</div>
        </div>
        <div
          className={cn(
            "flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full border px-1.5 text-[10px] font-medium tabular-nums",
            complete
              ? "border-[var(--life-success)]/40 bg-[var(--life-success)]/15 text-[var(--life-success)]"
              : "border-white/[0.1] text-muted-foreground"
          )}
        >
          {complete ? <Check className="h-3 w-3" /> : `${done}/${total}`}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && habit.subtasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 flex flex-col gap-1.5 border-t border-white/[0.06] pt-2.5">
              {habit.subtasks.map((st) => (
                <label key={st.id} className="flex items-center gap-2 text-xs text-foreground/80">
                  <Checkbox checked={st.done} onCheckedChange={() => toggleSubtask(habit.id, st.id)} />
                  <span className={cn(st.done && "text-muted-foreground line-through")}>{st.label}</span>
                </label>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HabitGrid() {
  const habits = useHabitsStore((s) => s.habits);
  const totals = habits.reduce(
    (acc, h) => {
      const { done, total } = progress(h);
      return { done: acc.done + (done === total ? 1 : 0), total: acc.total + 1 };
    },
    { done: 0, total: 0 }
  );
  const pct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;

  return (
    <Panel
      index={4}
      label="Habits"
      deepHref="/habits"
      status={
        <span className="hud-label">
          {totals.done}/{totals.total} · {pct}%
        </span>
      }
    >
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className="h-full rounded-full bg-[var(--life-success)]"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
          style={{ boxShadow: "0 0 8px var(--life-success)" }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {habits.map((h) => (
          <HabitCard key={h.id} habit={h} />
        ))}
      </div>
    </Panel>
  );
}
