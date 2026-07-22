"use client";

import { CalendarClock } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { useCalendarStore } from "@/store/calendar-store";
import { getEventsInRange } from "@/lib/calendar/selectors";
import { EVENT_CATEGORY_META } from "@/types/calendar";

export function UpcomingDeadlines() {
  const events = useCalendarStore((s) => s.events);
  const horizon = new Date(ANCHOR_DATE.getTime() + 30 * 86400000);

  const items = getEventsInRange(events, ANCHOR_DATE, horizon)
    .filter((e) => (e.category === "deadline" || e.category === "milestone") && e.status !== "completed")
    .slice(0, 8);

  return (
    <GlassCard className="h-full">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Upcoming Deadlines</h3>
      <div className="flex flex-col gap-2.5">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
            <CalendarClock className="h-3.5 w-3.5 shrink-0" style={{ color: EVENT_CATEGORY_META[item.category].color }} />
            <span className="min-w-0 flex-1 truncate text-xs text-foreground/85">{item.title}</span>
            <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {EVENT_CATEGORY_META[item.category].label}
            </span>
            <span className="w-20 shrink-0 text-right text-[10px] text-muted-foreground">
              {item.start.slice(0, 10)}
            </span>
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-muted-foreground">Nothing on the horizon.</p>}
      </div>
    </GlassCard>
  );
}
