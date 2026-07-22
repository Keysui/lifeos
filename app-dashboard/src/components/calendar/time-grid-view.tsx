"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import type { CalendarEvent } from "@/types/calendar";
import { eventColor } from "./event-chip";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";

const PX_PER_MINUTE = 1.1;
const DAY_MINUTES = 24 * 60;
const SNAP_MINUTES = 15;

function minutesSinceMidnight(d: Date) {
  return d.getHours() * 60 + d.getMinutes();
}

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString();
}

function snap(minutes: number) {
  return Math.round(minutes / SNAP_MINUTES) * SNAP_MINUTES;
}

/** Assigns side-by-side lanes to overlapping same-day events so they don't render stacked illegibly. */
function computeDayLayout(dayEvents: CalendarEvent[]) {
  const layout = new Map<string, { lane: number; totalLanes: number }>();
  const sorted = [...dayEvents].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  let cluster: CalendarEvent[] = [];
  let clusterEnd = -Infinity;

  const flushCluster = () => {
    if (cluster.length === 0) return;
    const laneEnds: number[] = [];
    const laneOf = new Map<string, number>();
    for (const event of cluster) {
      const start = new Date(event.start).getTime();
      let lane = laneEnds.findIndex((end) => end <= start);
      if (lane === -1) {
        lane = laneEnds.length;
        laneEnds.push(0);
      }
      laneEnds[lane] = new Date(event.end).getTime();
      laneOf.set(event.id, lane);
    }
    const totalLanes = laneEnds.length;
    for (const event of cluster) {
      layout.set(event.id, { lane: laneOf.get(event.id)!, totalLanes });
    }
    cluster = [];
    clusterEnd = -Infinity;
  };

  for (const event of sorted) {
    const start = new Date(event.start).getTime();
    const end = new Date(event.end).getTime();
    if (cluster.length > 0 && start >= clusterEnd) flushCluster();
    cluster.push(event);
    clusterEnd = Math.max(clusterEnd === -Infinity ? -Infinity : clusterEnd, end);
  }
  flushCluster();

  return layout;
}

interface DragState {
  id: string;
  kind: "move" | "resize";
  pointerStartY: number;
  pointerStartX: number;
  originStartMinutes: number;
  originEndMinutes: number;
  dayIndex: number;
  deltaMinutes: number;
  deltaDays: number;
}

export function TimeGridView({
  days,
  events,
  onSelectEvent,
  onCreateAt,
  onMoveEvent,
  onResizeEvent,
  onDropTask,
}: {
  days: Date[];
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onCreateAt: (start: Date, end: Date) => void;
  onMoveEvent: (id: string, newStart: Date) => void;
  onResizeEvent: (id: string, newEnd: Date) => void;
  onDropTask?: (taskId: string, start: Date) => void;
}) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const colWidthRef = useRef(0);

  const allDayEvents = events.filter((e) => e.allDay);
  const timedEvents = events.filter((e) => !e.allDay);

  function startDrag(e: React.PointerEvent, event: CalendarEvent, kind: "move" | "resize", dayIndex: number) {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const grid = gridRef.current;
    colWidthRef.current = grid ? grid.clientWidth / days.length : 0;
    setDrag({
      id: event.id,
      kind,
      pointerStartY: e.clientY,
      pointerStartX: e.clientX,
      originStartMinutes: minutesSinceMidnight(new Date(event.start)),
      originEndMinutes: minutesSinceMidnight(new Date(event.start)) + (new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000,
      dayIndex,
      deltaMinutes: 0,
      deltaDays: 0,
    });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const deltaY = e.clientY - drag.pointerStartY;
    const deltaMinutes = snap((deltaY / PX_PER_MINUTE));
    const deltaDays =
      drag.kind === "move" && colWidthRef.current > 0
        ? Math.round((e.clientX - drag.pointerStartX) / colWidthRef.current)
        : 0;
    setDrag((d) => (d ? { ...d, deltaMinutes, deltaDays } : d));
  }

  function endDrag() {
    if (!drag) return;
    const event = events.find((e) => e.id === drag.id);
    if (event) {
      if (drag.kind === "move") {
        const newDayIndex = Math.max(0, Math.min(days.length - 1, drag.dayIndex + drag.deltaDays));
        const newDay = days[newDayIndex];
        const newStartMinutes = Math.max(0, Math.min(DAY_MINUTES - 15, drag.originStartMinutes + drag.deltaMinutes));
        const newStart = new Date(newDay);
        newStart.setHours(0, newStartMinutes, 0, 0);
        onMoveEvent(drag.id, newStart);
      } else {
        const newEndMinutes = Math.max(drag.originStartMinutes + 15, drag.originEndMinutes + drag.deltaMinutes);
        const newEnd = new Date(days[drag.dayIndex]);
        newEnd.setHours(0, newEndMinutes, 0, 0);
        onResizeEvent(drag.id, newEnd);
      }
    }
    setDrag(null);
  }

  function handleColumnClick(e: React.MouseEvent, day: Date) {
    if ((e.target as HTMLElement).closest("[data-event-block]")) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const minutes = snap(offsetY / PX_PER_MINUTE);
    const start = new Date(day);
    start.setHours(0, Math.max(0, minutes), 0, 0);
    const end = new Date(start.getTime() + 60 * 60000);
    onCreateAt(start, end);
  }

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] glass-panel">
      {/* Day headers */}
      <div className="flex border-b border-white/[0.07]">
        <div className="w-14 shrink-0" />
        {days.map((day) => (
          <div key={day.toISOString()} className="flex-1 border-l border-white/[0.06] px-2 py-2 text-center">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {day.toLocaleDateString(undefined, { weekday: "short" })}
            </div>
            <div className="text-sm font-semibold text-foreground">{day.getDate()}</div>
          </div>
        ))}
      </div>

      {/* All-day row */}
      {allDayEvents.length > 0 && (
        <div className="flex border-b border-white/[0.07] bg-white/[0.015]">
          <div className="w-14 shrink-0 py-1.5 pr-2 text-right text-[9px] text-muted-foreground">All day</div>
          {days.map((day) => (
            <div key={day.toISOString()} className="flex-1 flex-col gap-1 border-l border-white/[0.06] p-1">
              {allDayEvents
                .filter((e) => sameDay(new Date(e.start), day))
                .map((e) => (
                  <div key={e.id} className="mb-1">
                    <EventChipInline event={e} onClick={() => onSelectEvent(e)} />
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}

      {/* Scrollable time grid */}
      <div className="max-h-[65vh] overflow-y-auto">
        <div
          ref={gridRef}
          className="relative flex"
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          style={{ height: DAY_MINUTES * PX_PER_MINUTE }}
        >
          <div className="w-14 shrink-0">
            {hours.map((h) => (
              <div key={h} style={{ height: 60 * PX_PER_MINUTE }} className="relative border-t border-white/[0.05] pr-2 text-right">
                <span className="absolute -top-2 right-2 text-[9px] text-muted-foreground">
                  {h === 0 ? "" : `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? "am" : "pm"}`}
                </span>
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div
              key={day.toISOString()}
              className="relative flex-1 cursor-pointer border-l border-white/[0.06]"
              onClick={(e) => handleColumnClick(e, day)}
              onDragOver={(e) => {
                if (onDropTask) e.preventDefault();
              }}
              onDrop={(e) => {
                if (!onDropTask) return;
                e.preventDefault();
                const taskId = e.dataTransfer.getData("text/task-id");
                if (!taskId) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const offsetY = e.clientY - rect.top;
                const minutes = snap(offsetY / PX_PER_MINUTE);
                const start = new Date(day);
                start.setHours(0, Math.max(0, minutes), 0, 0);
                onDropTask(taskId, start);
              }}
            >
              {hours.map((h) => (
                <div key={h} style={{ height: 60 * PX_PER_MINUTE }} className="border-t border-white/[0.05]" />
              ))}

              {sameDay(day, new Date()) && (
                <div
                  className="pointer-events-none absolute inset-x-0 z-10 h-px bg-[var(--life-danger)]"
                  style={{ top: minutesSinceMidnight(new Date()) * PX_PER_MINUTE }}
                >
                  <span className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-[var(--life-danger)]" />
                </div>
              )}

              {(() => {
                const dayEvents = timedEvents.filter((e) => sameDay(new Date(e.start), day));
                const layout = computeDayLayout(dayEvents);
                return dayEvents.map((event) => {
                  const isDragging = drag?.id === event.id;
                  const startM = minutesSinceMidnight(new Date(event.start));
                  const endM = startM + (new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000;
                  const top = (isDragging && drag.kind === "move" ? startM + drag.deltaMinutes : startM) * PX_PER_MINUTE;
                  const height = Math.max(
                    18,
                    ((isDragging && drag.kind === "resize" ? endM + drag.deltaMinutes : endM) - startM) * PX_PER_MINUTE
                  );
                  const color = eventColor(event);
                  const dayOffset = isDragging && drag.kind === "move" ? drag.deltaDays : 0;
                  const { lane, totalLanes } = layout.get(event.id) ?? { lane: 0, totalLanes: 1 };
                  const laneWidth = 100 / totalLanes;

                  return (
                    <motion.div
                      key={event.id}
                      data-event-block
                      onPointerDown={(e) => startDrag(e, event, "move", dayIndex)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isDragging) onSelectEvent(event);
                      }}
                      className={cn(
                        "group absolute z-20 cursor-grab overflow-hidden rounded-lg border px-1.5 py-1 text-[10.5px] leading-tight active:cursor-grabbing",
                        isDragging && "z-30 opacity-90 shadow-xl"
                      )}
                      style={{
                        top,
                        height,
                        left: `calc(${lane * laneWidth}% + 1px)`,
                        width: `calc(${laneWidth}% - 2px)`,
                        background: `color-mix(in oklch, ${color} 22%, #0b0d14)`,
                        borderColor: `color-mix(in oklch, ${color} 45%, transparent)`,
                        transform: dayOffset ? `translateX(${dayOffset * 100}%)` : undefined,
                      }}
                    >
                      <div className="flex items-center gap-1 truncate font-medium" style={{ color }}>
                        {event.status === "completed" && <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />}
                        <span className="truncate text-foreground/90">{event.title}</span>
                      </div>
                      {height > 32 && (
                        <div className="truncate text-[9px] text-muted-foreground">
                          {new Date(event.start).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                        </div>
                      )}
                      <div
                        onPointerDown={(e) => startDrag(e, event, "resize", dayIndex)}
                        className="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize opacity-0 group-hover:opacity-100"
                        style={{ background: color }}
                      />
                    </motion.div>
                  );
                });
              })()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EventChipInline({ event, onClick }: { event: CalendarEvent; onClick: () => void }) {
  const color = eventColor(event);
  return (
    <button
      onClick={onClick}
      className="w-full truncate rounded-md border px-1.5 py-0.5 text-left text-[10px]"
      style={{
        background: `color-mix(in oklch, ${color} 16%, transparent)`,
        borderColor: `color-mix(in oklch, ${color} 35%, transparent)`,
        color,
      }}
    >
      {event.title}
    </button>
  );
}
