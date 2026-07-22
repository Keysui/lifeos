import type { CalendarEvent } from "@/types/calendar";
import { EVENT_CATEGORY_META } from "@/types/calendar";
import { expandEvents } from "./recurrence";

export function getEventsInRange(events: CalendarEvent[], start: Date, end: Date) {
  return expandEvents(events, start, end);
}

export function getEventsOnDay(events: CalendarEvent[], day: Date) {
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return getEventsInRange(events, start, end);
}

export interface Conflict {
  a: CalendarEvent;
  b: CalendarEvent;
}

export function findConflicts(dayEvents: CalendarEvent[]): Conflict[] {
  const timed = dayEvents.filter((e) => !e.allDay).sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  const conflicts: Conflict[] = [];
  for (let i = 0; i < timed.length; i++) {
    for (let j = i + 1; j < timed.length; j++) {
      const a = timed[i];
      const b = timed[j];
      if (new Date(a.end) > new Date(b.start) && new Date(a.start) < new Date(b.end)) {
        conflicts.push({ a, b });
      }
    }
  }
  return conflicts;
}

export interface FreeSlot {
  start: Date;
  end: Date;
  minutes: number;
}

/** Finds free gaps of at least `minMinutes` within a day's waking hours (default 07:00-22:00). */
export function findFreeSlots(
  dayEvents: CalendarEvent[],
  day: Date,
  minMinutes = 30,
  dayStartHour = 7,
  dayEndHour = 22
): FreeSlot[] {
  const timed = dayEvents
    .filter((e) => !e.allDay)
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  const dayStart = new Date(day);
  dayStart.setHours(dayStartHour, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(dayEndHour, 0, 0, 0);

  const slots: FreeSlot[] = [];
  let cursor = dayStart;

  for (const event of timed) {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);
    if (eventStart > cursor) {
      const minutes = (eventStart.getTime() - cursor.getTime()) / 60000;
      if (minutes >= minMinutes) slots.push({ start: cursor, end: eventStart, minutes });
    }
    if (eventEnd > cursor) cursor = eventEnd;
  }

  if (dayEnd > cursor) {
    const minutes = (dayEnd.getTime() - cursor.getTime()) / 60000;
    if (minutes >= minMinutes) slots.push({ start: cursor, end: dayEnd, minutes });
  }

  return slots;
}

export function getBusiestDay(events: CalendarEvent[], weekStart: Date) {
  let best: { day: Date; minutes: number } | null = null;
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const dayEvents = getEventsOnDay(events, day).filter((e) => !e.allDay);
    const minutes = dayEvents.reduce(
      (sum, e) => sum + (new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000,
      0
    );
    if (!best || minutes > best.minutes) best = { day, minutes };
  }
  return best;
}

export function getWeeklyTimeAllocation(events: CalendarEvent[], weekStart: Date) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEvents = getEventsInRange(events, weekStart, weekEnd).filter((e) => !e.allDay);

  const totals = new Map<string, number>();
  for (const e of weekEvents) {
    const hours = (new Date(e.end).getTime() - new Date(e.start).getTime()) / 3600000;
    totals.set(e.category, (totals.get(e.category) ?? 0) + hours);
  }

  return Array.from(totals.entries())
    .map(([category, hours]) => ({
      category: EVENT_CATEGORY_META[category as keyof typeof EVENT_CATEGORY_META]?.label ?? category,
      hours: Math.round(hours * 10) / 10,
      color: EVENT_CATEGORY_META[category as keyof typeof EVENT_CATEGORY_META]?.color ?? "#8B93A7",
    }))
    .sort((a, b) => b.hours - a.hours);
}

export function getDailyFocusMinutes(events: CalendarEvent[], day: Date) {
  const dayEvents = getEventsOnDay(events, day).filter((e) => !e.allDay);
  const focus = dayEvents.filter((e) => e.category === "focus" || e.category === "study" || e.category === "work");
  const shallow = dayEvents.filter((e) => e.category === "meeting" || e.category === "personal");
  const sumMinutes = (list: CalendarEvent[]) =>
    list.reduce((sum, e) => sum + (new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000, 0);
  return { deepWorkMinutes: sumMinutes(focus), shallowWorkMinutes: sumMinutes(shallow) };
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getWeeklyDeepWorkTrend(events: CalendarEvent[], weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const { deepWorkMinutes, shallowWorkMinutes } = getDailyFocusMinutes(events, day);
    return {
      day: DAY_LABELS[i],
      deepWorkHours: Math.round((deepWorkMinutes / 60) * 10) / 10,
      shallowWorkHours: Math.round((shallowWorkMinutes / 60) * 10) / 10,
    };
  });
}
