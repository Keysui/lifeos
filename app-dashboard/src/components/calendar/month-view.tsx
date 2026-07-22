"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";
import { EventChip } from "./event-chip";

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function buildMonthGrid(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(start.getDate() - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function MonthView({
  month,
  events,
  onSelectDay,
  onSelectEvent,
}: {
  month: Date;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const days = buildMonthGrid(month);
  const today = new Date();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] glass-panel">
      <div className="grid grid-cols-7 border-b border-white/[0.07]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="px-2 py-2 text-center text-[10px] uppercase tracking-wide text-muted-foreground">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const inMonth = day.getMonth() === month.getMonth();
          const dayEvents = events.filter((e) => sameDay(new Date(e.start), day));
          const visible = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - visible.length;

          return (
            <div
              key={i}
              onClick={() => onSelectDay(day)}
              className={cn(
                "flex min-h-[104px] cursor-pointer flex-col gap-1 border-b border-l border-white/[0.06] p-1.5 transition hover:bg-white/[0.03]",
                i % 7 === 0 && "border-l-0",
                !inMonth && "opacity-35"
              )}
            >
              <span
                className={cn(
                  "self-start rounded-full px-1.5 text-[11px]",
                  sameDay(day, today) && "bg-[var(--life-primary)] font-semibold text-[#04141a]"
                )}
              >
                {day.getDate()}
              </span>
              <div className="flex flex-col gap-0.5">
                {visible.map((e) => (
                  <EventChip
                    key={e.id}
                    event={e}
                    dense
                    showTime={false}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onSelectEvent(e);
                    }}
                  />
                ))}
                {overflow > 0 && <span className="px-1 text-[10px] text-muted-foreground">+{overflow} more</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
