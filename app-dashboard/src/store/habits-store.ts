import { create } from "zustand";
import { persist } from "zustand/middleware";
import { habits as seedHabits } from "@/lib/mock/data";
import type { Habit } from "@/types";

function recalcStreak(history: Habit["history"]): { streak: number; bestStreak: number } {
  let streak = 0;
  let best = 0;
  let running = 0;
  for (const day of history) {
    if (day.done) {
      running += 1;
      best = Math.max(best, running);
    } else {
      running = 0;
    }
  }
  // Current streak = run of `done` days ending at the most recent entry.
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].done) streak += 1;
    else break;
  }
  return { streak, bestStreak: Math.max(best, streak) };
}

interface HabitsState {
  habits: Habit[];
  addHabit: (draft: Partial<Habit> & Pick<Habit, "name">) => Habit;
  toggleDay: (habitId: string, dateISO: string) => void;
  setDay: (habitId: string, dateISO: string, done: boolean) => void;
  toggleSubtask: (habitId: string, subtaskId: string) => void;
}

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set) => ({
      habits: seedHabits,
      addHabit: (draft) => {
        const habit: Habit = {
          id: crypto.randomUUID(),
          area: "",
          targetPerWeek: 7,
          streak: 0,
          bestStreak: 0,
          history: [],
          ...draft,
        };
        set((s) => ({ habits: [habit, ...s.habits] }));
        return habit;
      },
      toggleDay: (habitId, dateISO) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== habitId) return h;
            const exists = h.history.some((d) => d.date === dateISO);
            const history = exists
              ? h.history.map((d) => (d.date === dateISO ? { ...d, done: !d.done } : d))
              : [...h.history, { date: dateISO, done: true }].sort((a, b) => a.date.localeCompare(b.date));
            return { ...h, history, ...recalcStreak(history) };
          }),
        })),
      setDay: (habitId, dateISO, done) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== habitId) return h;
            const exists = h.history.some((d) => d.date === dateISO);
            const history = exists
              ? h.history.map((d) => (d.date === dateISO ? { ...d, done } : d))
              : [...h.history, { date: dateISO, done }].sort((a, b) => a.date.localeCompare(b.date));
            return { ...h, history, ...recalcStreak(history) };
          }),
        })),
      toggleSubtask: (habitId, subtaskId) =>
        set((s) => ({
          habits: s.habits.map((h) => {
            if (h.id !== habitId || !h.subtasks) return h;
            const subtasks = h.subtasks.map((st) =>
              st.id === subtaskId ? { ...st, done: !st.done } : st
            );
            const allDone = subtasks.every((st) => st.done);
            const todayISO = h.history[h.history.length - 1]?.date;
            const history = todayISO
              ? h.history.map((d) => (d.date === todayISO ? { ...d, done: allDone } : d))
              : h.history;
            return { ...h, subtasks, history, ...recalcStreak(history) };
          }),
        })),
    }),
    { name: "life-os-habits" }
  )
);
