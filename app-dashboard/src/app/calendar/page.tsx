"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, AlertTriangle } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { useCalendarStore } from "@/store/calendar-store";
import { useTasksStore } from "@/store/tasks-store";
import { getEventsInRange } from "@/lib/calendar/selectors";
import { detectTodayConflicts } from "@/lib/calendar/ai";
import type { CalendarEvent, CalendarView } from "@/types/calendar";

import { TimeGridView } from "@/components/calendar/time-grid-view";
import { MonthView } from "@/components/calendar/month-view";
import { YearView } from "@/components/calendar/year-view";
import { AgendaView } from "@/components/calendar/agenda-view";
import { TimelineView } from "@/components/calendar/timeline-view";
import { QuickAddBar } from "@/components/calendar/quick-add-bar";
import { UnscheduledTasksPanel } from "@/components/calendar/unscheduled-tasks-panel";
import { EventEditorSheet } from "@/components/calendar/event-editor-sheet";

const VIEWS: { key: CalendarView; label: string }[] = [
  { key: "day", label: "Day" },
  { key: "3day", label: "3-Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "year", label: "Year" },
  { key: "agenda", label: "Agenda" },
  { key: "timeline", label: "Timeline" },
];

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function startOfWeek(d: Date) {
  const c = startOfDay(d);
  const day = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - day);
  return c;
}
function addDays(d: Date, n: number) {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}
function addMonths(d: Date, n: number) {
  const c = new Date(d);
  c.setMonth(c.getMonth() + n);
  return c;
}
function monthGridBounds(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(start.getDate() - ((first.getDay() + 6) % 7));
  const end = addDays(start, 41);
  return { start, end };
}

function makeDraftEvent(start: Date, end: Date, allDay = false): CalendarEvent {
  const now = new Date().toISOString();
  return {
    id: "__new__",
    title: "",
    start: start.toISOString(),
    end: end.toISOString(),
    allDay,
    category: "personal",
    priority: "P2",
    tags: [],
    status: "scheduled",
    reminders: [{ id: crypto.randomUUID(), offsetMinutes: 10, method: "desktop" }],
    checklist: [],
    attachments: [],
    createdAt: now,
    updatedAt: now,
  };
}

export default function CalendarPage() {
  const [view, setView] = useState<CalendarView>("week");
  const [cursor, setCursor] = useState<Date>(startOfDay(ANCHOR_DATE));
  const [selected, setSelected] = useState<CalendarEvent | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const events = useCalendarStore((s) => s.events);
  const moveEvent = useCalendarStore((s) => s.moveEvent);
  const resizeEvent = useCalendarStore((s) => s.resizeEvent);
  const scheduleTask = useCalendarStore((s) => s.scheduleTask);

  const conflictMessage = detectTodayConflicts();

  const { days, rangeStart, rangeEnd, label } = useMemo(() => {
    switch (view) {
      case "day":
        return { days: [cursor], rangeStart: cursor, rangeEnd: addDays(cursor, 1), label: cursor.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }) };
      case "3day": {
        const d = [cursor, addDays(cursor, 1), addDays(cursor, 2)];
        return { days: d, rangeStart: cursor, rangeEnd: addDays(cursor, 3), label: `${cursor.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${addDays(cursor, 2).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` };
      }
      case "week": {
        const start = startOfWeek(cursor);
        const d = Array.from({ length: 7 }, (_, i) => addDays(start, i));
        return { days: d, rangeStart: start, rangeEnd: addDays(start, 7), label: `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${addDays(start, 6).toLocaleDateString(undefined, { month: "short", day: "numeric" })}` };
      }
      case "month": {
        const { start, end } = monthGridBounds(cursor);
        return { days: [], rangeStart: start, rangeEnd: end, label: cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" }) };
      }
      case "year":
        return { days: [], rangeStart: new Date(cursor.getFullYear(), 0, 1), rangeEnd: new Date(cursor.getFullYear() + 1, 0, 1), label: `${cursor.getFullYear()}` };
      case "agenda": {
        const d = Array.from({ length: 14 }, (_, i) => addDays(cursor, i));
        return { days: d, rangeStart: cursor, rangeEnd: addDays(cursor, 14), label: "Next 14 days" };
      }
      case "timeline": {
        const d = Array.from({ length: 14 }, (_, i) => addDays(cursor, i));
        return { days: d, rangeStart: cursor, rangeEnd: addDays(cursor, 14), label: "Next 14 days" };
      }
    }
  }, [view, cursor]);

  const rangeEvents = useMemo(() => getEventsInRange(events, rangeStart, rangeEnd), [events, rangeStart, rangeEnd]);

  function navigate(dir: -1 | 1) {
    switch (view) {
      case "day":
        setCursor((c) => addDays(c, dir));
        break;
      case "3day":
        setCursor((c) => addDays(c, dir * 3));
        break;
      case "week":
        setCursor((c) => addDays(c, dir * 7));
        break;
      case "month":
        setCursor((c) => addMonths(c, dir));
        break;
      case "year":
        setCursor((c) => new Date(c.getFullYear() + dir, c.getMonth(), 1));
        break;
      case "agenda":
      case "timeline":
        setCursor((c) => addDays(c, dir * 7));
        break;
    }
  }

  function openNew(start: Date, end: Date, allDay = false) {
    setSelected(makeDraftEvent(start, end, allDay));
    setEditorOpen(true);
  }

  function openExisting(event: CalendarEvent) {
    setSelected(event);
    setEditorOpen(true);
  }

  function handleDropTask(taskId: string, start: Date) {
    const task = useTasksStore.getState().tasks.find((t) => t.id === taskId);
    const end = new Date(start.getTime() + (task?.estimateMinutes ?? 60) * 60000);
    scheduleTask(taskId, task?.title ?? "Scheduled task", start, end);
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Calendar"
        title="The Heartbeat of Life OS"
        description="Every project, goal, task, and habit flows through here."
        actions={
          <Button onClick={() => openNew(new Date(cursor.getTime() + 3600000), new Date(cursor.getTime() + 2 * 3600000))} className="bg-[var(--life-primary)] text-[#04141a] hover:bg-[var(--life-primary)]/90">
            <Plus className="h-4 w-4" /> New Event
          </Button>
        }
      />

      <div className="mb-4">
        <QuickAddBar />
      </div>

      {conflictMessage && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-[var(--life-danger)]/25 bg-[var(--life-danger)]/[0.08] px-3 py-2 text-xs text-[var(--life-danger)]">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          {conflictMessage}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm" className="border-white/[0.08]" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-white/[0.08]" onClick={() => setCursor(startOfDay(ANCHOR_DATE))}>
            Today
          </Button>
          <Button variant="outline" size="icon-sm" className="border-white/[0.08]" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-1 text-sm font-medium text-foreground">{label}</span>
        </div>

        <div className="flex flex-wrap gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1">
          {VIEWS.map((v) => (
            <button
              key={v.key}
              onClick={() => setView(v.key)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition",
                view === v.key ? "bg-[var(--life-primary)] text-[#04141a]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div>
          {(view === "day" || view === "3day" || view === "week") && (
            <TimeGridView
              days={days}
              events={rangeEvents}
              onSelectEvent={openExisting}
              onCreateAt={(start, end) => openNew(start, end)}
              onMoveEvent={moveEvent}
              onResizeEvent={resizeEvent}
              onDropTask={handleDropTask}
            />
          )}
          {view === "month" && (
            <MonthView
              month={cursor}
              events={rangeEvents}
              onSelectDay={(day) => {
                setCursor(startOfDay(day));
                setView("day");
              }}
              onSelectEvent={openExisting}
            />
          )}
          {view === "year" && (
            <YearView
              year={cursor.getFullYear()}
              events={rangeEvents}
              onSelectDay={(day) => {
                setCursor(startOfDay(day));
                setView("day");
              }}
              onSelectMonth={(month) => {
                setCursor(startOfDay(month));
                setView("month");
              }}
            />
          )}
          {view === "agenda" && <AgendaView days={days} events={rangeEvents} onSelectEvent={openExisting} />}
          {view === "timeline" && <TimelineView rangeStart={rangeStart} rangeDays={14} events={rangeEvents} onSelectEvent={openExisting} />}
        </div>

        <UnscheduledTasksPanel />
      </div>

      <EventEditorSheet event={selected} open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  );
}
