import { RRule } from "rrule";
import type { CalendarEvent, RecurrenceRule } from "@/types/calendar";

const FREQ_MAP: Record<RecurrenceRule["freq"], number> = {
  daily: RRule.DAILY,
  weekly: RRule.WEEKLY,
  monthly: RRule.MONTHLY,
  yearly: RRule.YEARLY,
};

export function buildRRule(rule: RecurrenceRule, dtstart: Date) {
  return new RRule({
    freq: FREQ_MAP[rule.freq],
    interval: rule.interval || 1,
    byweekday: rule.byWeekday,
    count: rule.count,
    until: rule.until ? new Date(rule.until) : undefined,
    dtstart,
  });
}

/** Expands a (possibly recurring) event into concrete instances overlapping [rangeStart, rangeEnd]. */
export function expandEvent(event: CalendarEvent, rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const durationMs = end.getTime() - start.getTime();

  if (!event.recurrence) {
    if (end < rangeStart || start > rangeEnd) return [];
    return [event];
  }

  const rule = buildRRule(event.recurrence, start);
  const occurrences = rule.between(
    new Date(rangeStart.getTime() - durationMs - 1),
    rangeEnd,
    true
  );

  const excluded = new Set(event.excludedDates ?? []);

  return occurrences
    .filter((occStart) => !excluded.has(occStart.toISOString().slice(0, 10)))
    .map((occStart) => {
      const occEnd = new Date(occStart.getTime() + durationMs);
      return {
        ...event,
        id: `${event.id}::${occStart.toISOString()}`,
        recurrenceId: event.id,
        start: occStart.toISOString(),
        end: occEnd.toISOString(),
      };
    })
    .filter((e) => new Date(e.end) >= rangeStart && new Date(e.start) <= rangeEnd);
}

export function expandEvents(events: CalendarEvent[], rangeStart: Date, rangeEnd: Date): CalendarEvent[] {
  return events
    .filter((e) => !e.archived)
    .flatMap((e) => expandEvent(e, rangeStart, rangeEnd))
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
}

export function recurrenceLabel(rule?: RecurrenceRule): string {
  if (!rule) return "Does not repeat";
  const unit = rule.freq === "daily" ? "day" : rule.freq === "weekly" ? "week" : rule.freq === "monthly" ? "month" : "year";
  const every = rule.interval > 1 ? `Every ${rule.interval} ${unit}s` : `Every ${unit}`;
  if (rule.byWeekday?.length) {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return `${every} on ${rule.byWeekday.map((d) => days[d]).join(", ")}`;
  }
  return every;
}
