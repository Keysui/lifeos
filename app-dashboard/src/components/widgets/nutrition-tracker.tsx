"use client";

import { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { Panel } from "@/components/shared/panel";

interface Meal {
  text: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Placeholder estimate until Kimi's macro-estimation endpoint is wired (see ai_service). */
function estimateMacros(text: string): Omit<Meal, "text"> {
  const kcal = 250 + (text.length % 5) * 60;
  return { kcal, protein: Math.round(kcal * 0.3 / 4), carbs: Math.round(kcal * 0.45 / 4), fat: Math.round(kcal * 0.25 / 9) };
}

export function NutritionTracker() {
  const [value, setValue] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setMeals((prev) => [...prev, { text: trimmed, ...estimateMacros(trimmed) }]);
    setValue("");
  }

  const totals = meals.reduce(
    (acc, m) => ({ kcal: acc.kcal + m.kcal, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <Panel index={8} label="Nutrition" deepHref="/health" status={<span className="hud-label">Today</span>}>
      <div className="text-2xl font-semibold tabular-nums text-foreground">
        {totals.kcal} <span className="text-sm font-normal text-muted-foreground">kcal today</span>
      </div>

      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
        <span>{totals.protein}g protein</span>
        <span>{totals.carbs}g carbs</span>
        <span>{totals.fat}g fat</span>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder='Log a meal — e.g. "chicken, rice, broccoli"'
          className="h-8 flex-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-[var(--life-primary)]/40"
        />
        <button
          onClick={submit}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] text-muted-foreground transition hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{meals.length} meal{meals.length === 1 ? "" : "s"} logged</span>
        <span className="flex items-center gap-1 text-muted-foreground/60">
          <Sparkles className="h-2.5 w-2.5" /> Kimi estimate
        </span>
      </div>

      {meals.length === 0 && (
        <div className="mt-2 rounded-md border border-dashed border-white/[0.08] px-3 py-2 text-[11px] text-muted-foreground">
          No meals logged yet.
        </div>
      )}
    </Panel>
  );
}
