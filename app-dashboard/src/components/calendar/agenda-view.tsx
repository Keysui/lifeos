"use client";

import { GlassCard } from "@/components/shared/glass-card";
import type { CalendarEvent } from "@/types/calendar";
import { EventChip } from "./event-chip";

export function AgendaView({
  days,
  events,
  onSelectEvent,
}: {
  days: Date[];
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
}) {
  const grouped = days.map((day) => ({
    day,
    items: events
      .filter((e) => new Date(e.start).toDateString() === day.toDateString())
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
  }));

  return (
    <GlassCard interactive={false} className="flex flex-col gap-4">
      {grouped.map(({ day, items }) => (
        <div key={day.toISOString()}>
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
            </span>
            {items.length > 0 && <span className="text-[11px] text-muted-foreground">{items.length} events</span>}
          </div>
          {items.length === 0 ? (
            <p className="pl-1 text-xs text-muted-foreground">Nothing scheduled</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {items.map((e) => (
                <EventChip key={e.id} event={e} onClick={() => onSelectEvent(e)} />
              ))}
            </div>
          )}
        </div>
      ))}
    </GlassCard>
  );
}
