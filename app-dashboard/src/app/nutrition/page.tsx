"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Sparkles, Loader2, Droplet, Minus, Utensils } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useNutritionStore } from "@/store/nutrition-store";
import { calculateNutrition } from "@/ai/services/ModuleAI";
import { getSupabaseClient } from "@/lib/supabase/client";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function NutritionPage() {
  const logs = useNutritionStore((s) => s.logs);
  const addLog = useNutritionStore((s) => s.addLog);
  const waterCupsByDate = useNutritionStore((s) => s.waterCupsByDate);
  const addWater = useNutritionStore((s) => s.addWater);
  const goals = useNutritionStore((s) => s.goals);

  const [meal, setMeal] = useState("");
  const [loading, setLoading] = useState(false);

  const today = todayISO();
  const todaysLogs = logs.filter((l) => l.date === today);
  const water = waterCupsByDate[today] ?? 0;

  const totals = todaysLogs.reduce(
    (acc, l) => ({
      calories: acc.calories + l.breakdown.calories,
      proteinG: acc.proteinG + l.breakdown.proteinG,
      carbsG: acc.carbsG + l.breakdown.carbsG,
      fatG: acc.fatG + l.breakdown.fatG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 }
  );

  async function submit() {
    const trimmed = meal.trim();
    if (!trimmed || loading) return;
    setMeal("");
    setLoading(true);
    try {
      const breakdown = await calculateNutrition(trimmed);
      addLog(trimmed, breakdown);

      const supabase = getSupabaseClient();
      if (supabase) {
        void supabase.from("nutrition_logs").insert({
          date: today,
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

  return (
    <div>
      <SectionHeader eyebrow="Nutrition" title="Fuel Log" description="Log what you eat in plain language — Kimi does the math." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <GlassCard interactive={false} className="flex flex-col items-center gap-2 py-6">
          <ProgressRing
            value={(totals.calories / goals.calories) * 100}
            label={`${Math.round(totals.calories)}`}
            sublabel={`/ ${goals.calories} kcal`}
            color="var(--life-primary)"
          />
        </GlassCard>
        <GlassCard interactive={false} className="flex flex-col items-center gap-2 py-6">
          <ProgressRing
            value={(totals.proteinG / goals.proteinG) * 100}
            label={`${Math.round(totals.proteinG)}g`}
            sublabel={`/ ${goals.proteinG}g protein`}
            color="var(--life-accent)"
          />
        </GlassCard>
        <GlassCard interactive={false} className="flex flex-col items-center gap-2 py-6">
          <ProgressRing
            value={(totals.carbsG / goals.carbsG) * 100}
            label={`${Math.round(totals.carbsG)}g`}
            sublabel={`/ ${goals.carbsG}g carbs`}
            color="var(--life-warning)"
          />
        </GlassCard>
        <GlassCard interactive={false} className="flex flex-col items-center gap-2 py-6">
          <ProgressRing
            value={(totals.fatG / goals.fatG) * 100}
            label={`${Math.round(totals.fatG)}g`}
            sublabel={`/ ${goals.fatG}g fat`}
            color="var(--life-danger)"
          />
        </GlassCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <GlassCard className="flex flex-col gap-3 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Utensils className="h-4 w-4" /> Quick Add
          </h3>
          <Textarea
            value={meal}
            onChange={(e) => setMeal(e.target.value)}
            placeholder='Describe a meal or paste a recipe — e.g. "2 eggs, avocado toast, black coffee"'
            className="min-h-20 resize-none border-white/[0.08] bg-white/[0.03] text-sm"
          />
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground/60">
              <Sparkles className="h-3 w-3" /> Kimi estimates calories, macros, fiber, sugar, and sodium
            </span>
            <Button onClick={submit} disabled={!meal.trim() || loading} className="gap-1.5 bg-[var(--life-primary)] text-[#04140f] hover:bg-[var(--life-primary)]/90">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Log meal
            </Button>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col items-center justify-center gap-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Droplet className="h-4 w-4 text-[var(--life-accent)]" /> Water
          </h3>
          <div className="text-3xl font-semibold tabular-nums text-foreground">
            {water}
            <span className="text-sm font-normal text-muted-foreground"> / {goals.waterCups} cups</span>
          </div>
          <div className="flex gap-2">
            <Button size="icon" variant="outline" onClick={() => addWater(today, -1)} disabled={water === 0}>
              <Minus className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={() => addWater(today, 1)} className="bg-[var(--life-accent)] text-[#04171a] hover:bg-[var(--life-accent)]/90">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </GlassCard>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Today&rsquo;s Meals</h2>
      <div className="flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {todaysLogs.map((log) => (
            <motion.div key={log.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <GlassCard interactive={false} className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground/90">{log.description}</p>
                  {log.breakdown.notes && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{log.breakdown.notes}</p>}
                </div>
                <div className="flex shrink-0 gap-3 text-[11px] text-muted-foreground">
                  <span className="text-foreground/80">{Math.round(log.breakdown.calories)} kcal</span>
                  <span>{Math.round(log.breakdown.proteinG)}g P</span>
                  <span>{Math.round(log.breakdown.carbsG)}g C</span>
                  <span>{Math.round(log.breakdown.fatG)}g F</span>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </AnimatePresence>

        {todaysLogs.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/[0.08] px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing logged today yet.
          </div>
        )}
      </div>
    </div>
  );
}
