"use client";

import { useState } from "react";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { calculateNutrition } from "@/ai/services/ModuleAI";
import { getSupabaseClient } from "@/lib/supabase/client";
import type { NutritionBreakdown } from "@/types";

interface Meal {
  text: string;
  breakdown: NutritionBreakdown;
}

export function NutritionTracker() {
  const [value, setValue] = useState("");
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit() {
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    setValue("");
    setLoading(true);
    try {
      const breakdown = await calculateNutrition(trimmed);
      setMeals((prev) => [...prev, { text: trimmed, breakdown }]);

      const supabase = getSupabaseClient();
      if (supabase) {
        void supabase.from("nutrition_logs").insert({
          meal_description: trimmed,
          source: "manual",
          calories: breakdown.calories,
          protein_g: breakdown.proteinG,
          carbs_g: breakdown.carbsG,
          fat_g: breakdown.fatG,
          fiber_g: breakdown.fiberG,
          sugar_g: breakdown.sugarG,
          sodium_mg: breakdown.sodiumMg,
          micronutrients: breakdown.micronutrients,
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const totals = meals.reduce(
    (acc, m) => ({
      kcal: acc.kcal + m.breakdown.calories,
      protein: acc.protein + m.breakdown.proteinG,
      carbs: acc.carbs + m.breakdown.carbsG,
      fat: acc.fat + m.breakdown.fatG,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <Panel index={8} label="Nutrition" deepHref="/health" status={<span className="hud-label">Today</span>}>
      <div className="text-2xl font-semibold tabular-nums text-foreground">
        {Math.round(totals.kcal)} <span className="text-sm font-normal text-muted-foreground">kcal today</span>
      </div>

      <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
        <span>{Math.round(totals.protein)}g protein</span>
        <span>{Math.round(totals.carbs)}g carbs</span>
        <span>{Math.round(totals.fat)}g fat</span>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder='Log a meal — e.g. "chicken, rice, broccoli"'
          disabled={loading}
          className="h-8 flex-1 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-[var(--life-primary)]/40 disabled:opacity-60"
        />
        <button
          onClick={submit}
          disabled={loading}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] text-muted-foreground transition hover:text-foreground disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          {meals.length} meal{meals.length === 1 ? "" : "s"} logged
        </span>
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
