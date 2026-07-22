"use client";

import { EVENT_CATEGORY_META, type CalendarEvent, type EventCategory } from "@/types/calendar";
import { eventColor } from "./event-chip";
import { cn } from "@/lib/utils";

const DAY_WIDTH = 44;

function daysBetween(a: Date, b: Date) {
  const ms = new Date(b.toDateString()).getTime() - new Date(a.toDateString()).getTime();
  return Math.round(ms / 86400000);
}

export function TimelineView({
  rangeStart,
  rangeDays,
  events,
  onSelectEvent,
}: {
  rangeStart: Date;
  rangeDays: number;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const columns = Array.from({ length: rangeDays }, (_, i) => {
    const d = new Date(rangeStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const categories = Array.from(new Set(events.map((e) => e.category))) as EventCategory[];
  const today = new Date();

  return (
    <div className="overflow-x-auto rounded-2xl border border-white/[0.07] glass-panel">
      <div style={{ minWidth: 160 + columns.length * DAY_WIDTH }}>
        <div className="flex border-b border-white/[0.07]">
          <div className="w-40 shrink-0 px-3 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Category
          </div>
          {columns.map((day) => (
            <div
              key={day.toISOString()}
              style={{ width: DAY_WIDTH }}
              className={cn(
                "shrink-0 border-l border-white/[0.06] py-2 text-center text-[9px] text-muted-foreground",
                day.toDateString() === today.toDateString() && "bg-[var(--life-primary)]/10 text-[var(--life-primary)]"
              )}
            >
              <div>{day.toLocaleDateString(undefined, { weekday: "narrow" })}</div>
              <div>{day.getDate()}</div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground">No events in this range.</div>
        )}

        {categories.map((cat) => (
          <div key={cat} className="relative flex border-b border-white/[0.05]">
            <div className="w-40 shrink-0 px-3 py-2 text-xs text-foreground/80">{EVENT_CATEGORY_META[cat].label}</div>
            <div className="relative flex-1" style={{ height: 40, width: columns.length * DAY_WIDTH }}>
              {columns.map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-white/[0.05]"
                  style={{ left: i * DAY_WIDTH }}
                />
              ))}
              {events
                .filter((e) => e.category === cat)
                .map((e) => {
                  const start = new Date(e.start);
                  const end = new Date(e.end);
                  const offset = daysBetween(rangeStart, start);
                  const span = Math.max(1, daysBetween(start, end) + (e.allDay ? 1 : 0) || 1);
                  const color = eventColor(e);
                  return (
                    <button
                      key={e.id}
                      onClick={() => onSelectEvent(e)}
                      className="absolute top-1.5 flex h-7 items-center truncate rounded-md border px-1.5 text-[10px] hover:brightness-125"
                      style={{
                        left: offset * DAY_WIDTH + 2,
                        width: Math.max(DAY_WIDTH - 4, span * DAY_WIDTH - 4),
                        background: `color-mix(in oklch, ${color} 20%, transparent)`,
                        borderColor: `color-mix(in oklch, ${color} 45%, transparent)`,
                        color,
                      }}
                      title={e.title}
                    >
                      {e.title}
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
