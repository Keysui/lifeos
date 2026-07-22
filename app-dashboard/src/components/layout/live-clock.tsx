"use client";

import { useClock } from "@/lib/use-clock";

export function LiveClock() {
  const now = useClock();

  const time = now
    ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "--:--";
  const date = now
    ? now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    : "";

  return (
    <div className="flex flex-col items-end leading-tight">
      <span className="text-sm font-medium tabular-nums text-foreground">{time}</span>
      <span className="text-[11px] text-muted-foreground">{date}</span>
    </div>
  );
}
