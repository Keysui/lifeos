"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { Progress } from "@/components/ui/progress";
import { goals } from "@/lib/mock/data";
import type { Goal } from "@/types";

const horizonLabels: Record<Goal["horizon"], string> = {
  life: "Life Vision",
  "10-year": "10-Year",
  "3-year": "3-Year",
  annual: "Annual",
  quarterly: "Quarterly",
  monthly: "Monthly",
};

const order: Goal["horizon"][] = ["life", "10-year", "3-year", "annual", "quarterly", "monthly"];

export function GoalCascade() {
  return (
    <GlassCard interactive={false} className="overflow-x-auto">
      <h3 className="mb-5 text-sm font-semibold text-foreground">Goal Cascade</h3>
      <div className="flex min-w-[720px] items-stretch gap-3">
        {order.map((horizon, i) => {
          const items = goals.filter((g) => g.horizon === horizon);
          return (
            <div key={horizon} className="flex flex-1 flex-col gap-2">
              <span className="px-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                {horizonLabels[horizon]}
              </span>
              {items.map((g) => (
                <motion.div
                  key={g.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-1 flex-col justify-between gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] p-2.5"
                >
                  <span className="text-[11px] leading-snug text-foreground/85">{g.title}</span>
                  <div className="flex items-center gap-1.5">
                    <Progress value={g.progress} className="h-1" />
                    <span className="text-[10px] tabular-nums text-muted-foreground">{g.progress}%</span>
                  </div>
                </motion.div>
              ))}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}
