"use client";

import { CalendarClock } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { goals } from "@/lib/mock/data";

export function QuarterlyGoalCards() {
  const quarterly = goals.filter((g) => g.horizon === "quarterly");

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {quarterly.map((g) => (
        <GlassCard key={g.id} glow={g.progress >= 70 ? "primary" : "none"} className="flex flex-col items-center gap-4 text-center">
          <span className="self-start rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground">
            {g.area}
          </span>
          <ProgressRing value={g.progress} size={104} strokeWidth={8} />
          <p className="text-sm leading-snug text-foreground/90">{g.title}</p>
          {g.forecastCompletion && (
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" />
              Forecast: {g.forecastCompletion}
            </div>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
