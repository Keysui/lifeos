"use client";

import { cn } from "@/lib/utils";
import type { CalendarEvent } from "@/types/calendar";

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

function densityColor(count: number) {
  if (count === 0) return "transparent";
  if (count <= 1) return "rgba(92,225,230,0.25)";
  if (count <= 3) return "rgba(92,225,230,0.5)";
  return "rgba(92,225,230,0.85)";
}

export function YearView({
  year,
  events,
  onSelectDay,
  onSelectMonth,
}: {
  year: number;
  events: CalendarEvent[];
  onSelectDay: (day: Date) => void;
  onSelectMonth: (month: Date) => void;
}) {
  const today = new Date();
  const eventsByDay = new Map<string, number>();
  for (const e of events) {
    const key = new Date(e.start).toDateString();
    eventsByDay.set(key, (eventsByDay.get(key) ?? 0) + 1);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 12 }, (_, m) => new Date(year, m, 1)).map((month) => {
        const days = buildMonthGrid(month);
        return (
          <div key={month.toISOString()} className="rounded-2xl border border-white/[0.07] glass-panel p-3">
            <button
              onClick={() => onSelectMonth(month)}
              className="mb-2 text-sm font-semibold text-foreground hover:text-[var(--life-primary)]"
            >
              {month.toLocaleDateString(undefined, { month: "long" })}
            </button>
            <div className="grid grid-cols-7 gap-[2px]">
              {days.map((day, i) => {
                const count = eventsByDay.get(day.toDateString()) ?? 0;
                const inMonth = day.getMonth() === month.getMonth();
                return (
                  <button
                    key={i}
                    onClick={() => onSelectDay(day)}
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded text-[8px]",
                      !inMonth && "opacity-25",
                      sameDay(day, today) && "ring-1 ring-[var(--life-primary)]"
                    )}
                    style={{ background: densityColor(count) }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
