import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { NutritionBreakdown } from "@/types";

export interface NutritionLog {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  breakdown: NutritionBreakdown;
  createdAt: string;
}

interface NutritionGoals {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  waterCups: number;
}

interface NutritionState {
  logs: NutritionLog[];
  waterCupsByDate: Record<string, number>;
  goals: NutritionGoals;
  addLog: (description: string, breakdown: NutritionBreakdown) => void;
  addWater: (date: string, delta: number) => void;
  setGoals: (goals: Partial<NutritionGoals>) => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set) => ({
      logs: [],
      waterCupsByDate: {},
      goals: { calories: 2200, proteinG: 150, carbsG: 220, fatG: 70, waterCups: 8 },

      addLog: (description, breakdown) =>
        set((s) => ({
          logs: [
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString().slice(0, 10),
              description,
              breakdown,
              createdAt: new Date().toISOString(),
            },
            ...s.logs,
          ],
        })),

      addWater: (date, delta) =>
        set((s) => ({
          waterCupsByDate: { ...s.waterCupsByDate, [date]: Math.max(0, (s.waterCupsByDate[date] ?? 0) + delta) },
        })),

      setGoals: (goals) => set((s) => ({ goals: { ...s.goals, ...goals } })),
    }),
    { name: "life-os-nutrition" }
  )
);
