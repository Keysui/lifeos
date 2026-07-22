"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { todaySchedule } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import type { ScheduleBlock } from "@/types";

const kindStyles: Record<ScheduleBlock["kind"], string> = {
  focus: "border-[var(--life-primary)]/30 bg-[var(--life-primary)]/[0.08]",
  meeting: "border-[var(--life-accent)]/30 bg-[var(--life-accent)]/[0.08]",
  habit: "border-[var(--life-success)]/30 bg-[var(--life-success)]/[0.08]",
  break: "border-white/[0.08] bg-white/[0.02]",
  admin: "border-[var(--life-warning)]/25 bg-[var(--life-warning)]/[0.06]",
};

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

const NOW_MINUTES = toMinutes("11:20");

export function ScheduleTimeline({ compact = false }: { compact?: boolean }) {
  const items = compact ? todaySchedule.slice(0, 5) : todaySchedule;

  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Today&rsquo;s Schedule</h3>
        <span className="text-[11px] text-muted-foreground">{todaySchedule.length} blocks</span>
      </div>
      <div className="flex flex-col gap-2">
        {items.map((block, i) => {
          const isNow = NOW_MINUTES >= toMinutes(block.start) && NOW_MINUTES < toMinutes(block.end);
          const isPast = NOW_MINUTES >= toMinutes(block.end);
          return (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                kindStyles[block.kind],
                isPast && "opacity-45",
                isNow && "ring-1 ring-[var(--life-primary)]/50"
              )}
            >
              <div className="w-14 shrink-0 text-[11px] tabular-nums text-muted-foreground">{block.start}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-foreground/90">{block.title}</div>
              </div>
              {isNow && (
                <span className="shrink-0 rounded-full bg-[var(--life-primary)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--life-primary)]">
                  Now
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}
