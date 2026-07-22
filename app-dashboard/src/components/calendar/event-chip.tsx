"use client";

import { cn } from "@/lib/utils";
import { EVENT_CATEGORY_META, type CalendarEvent } from "@/types/calendar";
import { CheckCircle2 } from "lucide-react";

export function eventColor(event: CalendarEvent) {
  return event.color || EVENT_CATEGORY_META[event.category].color;
}

export function EventChip({
  event,
  onClick,
  dense = false,
  showTime = true,
}: {
  event: CalendarEvent;
  onClick?: (e: React.MouseEvent) => void;
  dense?: boolean;
  showTime?: boolean;
}) {
  const color = eventColor(event);
  const time = event.allDay
    ? "All day"
    : new Date(event.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

  return (
    <button
      onClick={onClick}
      draggable={!!onClick}
      className={cn(
        "flex w-full items-center gap-1.5 truncate rounded-md border px-1.5 text-left transition hover:brightness-125",
        dense ? "py-0.5 text-[10px]" : "py-1 text-[11px]"
      )}
      style={{
        background: `color-mix(in oklch, ${color} 16%, transparent)`,
        borderColor: `color-mix(in oklch, ${color} 35%, transparent)`,
        color,
      }}
      title={event.title}
    >
      {event.status === "completed" && <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />}
      {showTime && !dense && <span className="shrink-0 tabular-nums opacity-80">{time}</span>}
      <span className={cn("truncate text-foreground/90", event.status === "completed" && "line-through opacity-60")}>
        {event.title}
      </span>
    </button>
  );
}
