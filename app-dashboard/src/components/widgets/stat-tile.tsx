"use client";

import { motion } from "framer-motion";
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { cn } from "@/lib/utils";

export function StatTile({
  icon: Icon,
  label,
  value,
  delta,
  deltaDirection = "up",
  accent = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down";
  accent?: "primary" | "accent" | "success" | "warning" | "danger";
}) {
  const accentVar = `var(--life-${accent})`;

  return (
    <GlassCard className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg"
          style={{ background: `color-mix(in oklch, ${accentVar} 18%, transparent)`, color: accentVar }}
        >
          <Icon className="h-4 w-4" />
        </div>
        {delta && (
          <span
            className={cn(
              "flex items-center gap-0.5 text-[11px] font-medium",
              deltaDirection === "up" ? "text-[var(--life-success)]" : "text-[var(--life-danger)]"
            )}
          >
            {deltaDirection === "up" ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
        )}
      </div>
      <div>
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl font-semibold tabular-nums text-foreground"
        >
          {value}
        </motion.div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </GlassCard>
  );
}
