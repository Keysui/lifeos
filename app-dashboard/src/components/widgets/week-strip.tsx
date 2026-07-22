"use client";

import { useState } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { ANCHOR_DATE, todaySchedule } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export function WeekStrip() {
  const [selected, setSelected] = useState(ANCHOR_DATE.getDay());
  const start = new Date(ANCHOR_DATE);
  start.setDate(start.getDate() - start.getDay());

  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });

  return (
    <GlassCard interactive={false}>
      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const isToday = d.toDateString() === ANCHOR_DATE.toDateString();
          const isSelected = d.getDay() === selected;
          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelected(d.getDay())}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl border px-2 py-3 transition",
                isSelected
                  ? "border-[var(--life-primary)]/40 bg-[var(--life-primary)]/[0.1]"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
              )}
            >
              <span className="text-[10px] uppercase text-muted-foreground">
                {d.toLocaleDateString(undefined, { weekday: "short" })}
              </span>
              <span
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full text-sm",
                  isToday && "bg-[var(--life-primary)] text-[#04141a] font-semibold"
                )}
              >
                {d.getDate()}
              </span>
              {isToday && <span className="text-[9px] text-[var(--life-primary)]">{todaySchedule.length} events</span>}
            </button>
          );
        })}
      </div>
    </GlassCard>
  );
}
