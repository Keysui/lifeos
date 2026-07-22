import { ANCHOR_DATE } from "@/lib/mock/data";
import { useCalendarStore } from "@/store/calendar-store";
import {
  findConflicts,
  findFreeSlots,
  getBusiestDay,
  getEventsOnDay,
  getEventsInRange,
} from "./selectors";
import { parseQuickAdd } from "./quick-add";

function startOfDay(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}
function startOfWeek(d: Date) {
  const c = startOfDay(d);
  const day = (c.getDay() + 6) % 7; // Monday = 0
  c.setDate(c.getDate() - day);
  return c;
}
function fmtTime(d: Date) {
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
function fmtDay(d: Date) {
  return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

export interface CalendarAIResult {
  message: string;
  handled: boolean;
}

export function runCalendarCommand(prompt: string): CalendarAIResult {
  const text = prompt.trim();
  const store = useCalendarStore.getState();
  const today = ANCHOR_DATE;
  const tomorrow = new Date(today.getTime() + 86400000);

  // "Move everything after 3 PM" / "move everything after 3pm by an hour"
  const moveMatch = text.match(/move everything after\s+(\d{1,2})\s*(am|pm)?/i);
  if (moveMatch) {
    let hour = parseInt(moveMatch[1], 10);
    const meridiem = moveMatch[2]?.toLowerCase();
    if (meridiem === "pm" && hour < 12) hour += 12;
    const count = store.shiftEventsAfter(today.toISOString().slice(0, 10), hour, 60);
    return {
      handled: true,
      message:
        count > 0
          ? `Moved ${count} event${count === 1 ? "" : "s"} after ${moveMatch[1]}${meridiem ?? ""} back by 1 hour today.`
          : `Nothing scheduled after ${moveMatch[1]}${meridiem ?? ""} today — nothing to move.`,
    };
  }

  // "Schedule a workout tomorrow" / "schedule a workout tomorrow at 6pm"
  if (/schedule.*(workout|gym|fitness)/i.test(text)) {
    const parsed = parseQuickAdd(text, today);
    let start: Date;
    let end: Date;
    if (parsed && parsed.start.toDateString() !== today.toDateString()) {
      start = parsed.start;
      end = parsed.end;
    } else {
      const slots = findFreeSlots(getEventsOnDay(store.events, tomorrow), tomorrow, 45, 17, 21);
      if (slots.length > 0) {
        start = slots[0].start;
        end = new Date(start.getTime() + 45 * 60000);
      } else {
        start = new Date(tomorrow);
        start.setHours(18, 0, 0, 0);
        end = new Date(start.getTime() + 45 * 60000);
      }
    }
    store.addEvent({ title: "Workout", start: start.toISOString(), end: end.toISOString(), category: "fitness", priority: "P2" });
    return { handled: true, message: `Scheduled "Workout" for ${fmtDay(start)} at ${fmtTime(start)}.` };
  }

  // "Find time to study"
  if (/find time to (study|work|focus)/i.test(text)) {
    const slots = findFreeSlots(getEventsOnDay(store.events, today), today, 60);
    if (slots.length > 0) {
      const best = slots.sort((a, b) => b.minutes - a.minutes)[0];
      return {
        handled: true,
        message: `Your best open block today is ${fmtTime(best.start)}–${fmtTime(best.end)} (${Math.round(best.minutes)} min free).`,
      };
    }
    const tomorrowSlots = findFreeSlots(getEventsOnDay(store.events, tomorrow), tomorrow, 60);
    if (tomorrowSlots.length > 0) {
      const best = tomorrowSlots[0];
      return { handled: true, message: `Today's packed. Tomorrow you have ${fmtTime(best.start)}–${fmtTime(best.end)} free.` };
    }
    return { handled: true, message: "No open blocks of an hour or more in the next two days — consider rescheduling something." };
  }

  // "Where can I fit another meeting?"
  if (/fit (another|a) meeting|room for a meeting/i.test(text)) {
    const slots = findFreeSlots(getEventsOnDay(store.events, today), today, 30);
    if (slots.length > 0) {
      return {
        handled: true,
        message: `You could fit a meeting at ${fmtTime(slots[0].start)}–${fmtTime(slots[0].end)} today.`,
      };
    }
    return { handled: true, message: "Today's fully booked in 30-minute-or-larger blocks — try tomorrow." };
  }

  // "What is my busiest day?"
  if (/busiest day/i.test(text)) {
    const busiest = getBusiestDay(store.events, startOfWeek(today));
    if (!busiest || busiest.minutes === 0) return { handled: true, message: "This week looks light so far — no standout busiest day yet." };
    return {
      handled: true,
      message: `${fmtDay(busiest.day)} is your busiest day this week at ${Math.round((busiest.minutes / 60) * 10) / 10}h scheduled.`,
    };
  }

  // "What deadlines are approaching?"
  if (/deadlines? (approaching|coming|upcoming)|upcoming deadlines/i.test(text)) {
    const horizon = new Date(today.getTime() + 14 * 86400000);
    const deadlines = getEventsInRange(store.events, today, horizon).filter(
      (e) => e.category === "deadline" || e.category === "milestone"
    );
    if (deadlines.length === 0) return { handled: true, message: "Nothing due in the next two weeks." };
    const list = deadlines
      .slice(0, 5)
      .map((e) => `${e.title.replace(/^Due: /, "")} (${new Date(e.start).toLocaleDateString(undefined, { month: "short", day: "numeric" })})`)
      .join(", ");
    return { handled: true, message: `Coming up: ${list}.` };
  }

  // "Optimize my week"
  if (/optimi[sz]e my week/i.test(text)) {
    const weekStart = startOfWeek(today);
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
    const weekEvents = getEventsInRange(store.events, weekStart, weekEnd).filter((e) => !e.allDay);
    const conflictDays = new Set<string>();
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      if (findConflicts(getEventsOnDay(store.events, day)).length > 0) conflictDays.add(fmtDay(day));
    }
    const focusHours = weekEvents.filter((e) => e.category === "focus").reduce((s, e) => s + (new Date(e.end).getTime() - new Date(e.start).getTime()) / 3600000, 0);
    const parts: string[] = [];
    if (conflictDays.size > 0) parts.push(`you have overlapping events on ${[...conflictDays].join(", ")}`);
    parts.push(`${Math.round(focusHours * 10) / 10}h of deep work booked this week`);
    return {
      handled: true,
      message: `Looking at your week: ${parts.join("; ")}. ${
        conflictDays.size > 0 ? "Resolve the overlaps first, then " : ""
      }consider batching similar-category events back to back to protect longer focus blocks.`,
    };
  }

  return { handled: false, message: "" };
}

export function detectTodayConflicts(): string | null {
  const store = useCalendarStore.getState();
  const conflicts = findConflicts(getEventsOnDay(store.events, ANCHOR_DATE));
  if (conflicts.length === 0) return null;
  const { a, b } = conflicts[0];
  return `Scheduling conflict today: "${a.title}" overlaps with "${b.title}".`;
}
