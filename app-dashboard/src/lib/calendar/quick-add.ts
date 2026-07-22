import * as chrono from "chrono-node";
import type { EventCategory, RecurrenceRule } from "@/types/calendar";

const WEEKDAY_INDEX: Record<string, number> = {
  monday: 0,
  mon: 0,
  tuesday: 1,
  tue: 1,
  tues: 1,
  wednesday: 2,
  wed: 2,
  thursday: 3,
  thu: 3,
  thur: 3,
  thurs: 3,
  friday: 4,
  fri: 4,
  saturday: 5,
  sat: 5,
  sunday: 6,
  sun: 6,
};

const CATEGORY_KEYWORDS: [RegExp, EventCategory][] = [
  [/\b(gym|workout|run|running|yoga|fitness|training|lift)\b/i, "fitness"],
  [/\b(study|studying|homework|class|lecture|exam|course)\b/i, "study"],
  [/\b(doctor|dentist|appointment|checkup|clinic)\b/i, "appointment"],
  [/\b(meeting|sync|call|standup|1:1|one on one)\b/i, "meeting"],
  [/\b(deadline|due)\b/i, "deadline"],
  [/\b(deep work|focus|build|wire|code|coding|write)\b/i, "focus"],
  [/\b(work on|work session)\b/i, "work"],
  [/\b(lunch|dinner|coffee|birthday|movie|date night)\b/i, "personal"],
];

export interface ParsedQuickAdd {
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  category: EventCategory;
  recurrence?: RecurrenceRule;
}

function detectRecurrence(text: string): RecurrenceRule | undefined {
  const everyDay = /\bevery ?day\b|\bdaily\b/i.test(text);
  if (everyDay) return { freq: "daily", interval: 1 };

  const weekdayMatches = [...text.matchAll(/\bevery\s+([a-z]+)(?:\s+and\s+([a-z]+))?\b/gi)];
  for (const match of weekdayMatches) {
    const days = [match[1], match[2]].filter(Boolean).map((d) => d!.toLowerCase());
    const indices = days.map((d) => WEEKDAY_INDEX[d]).filter((n) => n !== undefined);
    if (indices.length > 0) {
      return { freq: "weekly", interval: 1, byWeekday: indices };
    }
  }

  if (/\bevery week\b|\bweekly\b/i.test(text)) return { freq: "weekly", interval: 1 };
  if (/\bevery month\b|\bmonthly\b/i.test(text)) return { freq: "monthly", interval: 1 };

  return undefined;
}

function detectCategory(text: string): EventCategory {
  for (const [re, category] of CATEGORY_KEYWORDS) {
    if (re.test(text)) return category;
  }
  return "personal";
}

/** Strips the parsed date/time phrase and recurrence keywords out of the text, leaving the title. */
function extractTitle(rawText: string, chronoText: string) {
  let title = rawText.replace(chronoText, "");
  title = title.replace(/\bevery\s+[a-z]+(?:\s+and\s+[a-z]+)?\b/gi, "");
  title = title.replace(/\b(daily|weekly|monthly)\b/gi, "");
  title = title.replace(/\s{2,}/g, " ").trim();
  title = title.replace(/^[-–,:\s]+|[-–,:\s]+$/g, "");
  return title || "Untitled event";
}

export function parseQuickAdd(text: string, referenceDate = new Date()): ParsedQuickAdd | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const results = chrono.parse(trimmed, referenceDate, { forwardDate: true });
  const recurrence = detectRecurrence(trimmed);
  const category = detectCategory(trimmed);

  if (results.length === 0) {
    // No explicit time found -- default to next free-ish hour today, 1h duration.
    const start = new Date(referenceDate);
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return { title: trimmed, start, end, allDay: false, category, recurrence };
  }

  const result = results[0];
  const start = result.start.date();
  const allDay = !result.start.isCertain("hour");
  let end: Date;
  if (result.end) {
    end = result.end.date();
  } else if (allDay) {
    end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  } else {
    end = new Date(start.getTime() + 60 * 60 * 1000);
  }

  const title = extractTitle(trimmed, result.text);

  return { title, start, end, allDay, category, recurrence };
}
