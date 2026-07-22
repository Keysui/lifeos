"use client";

import { useEffect, useRef } from "react";
import { useUIStore } from "@/store/ui-store";
import { useCalendarStore } from "@/store/calendar-store";
import { getEventsInRange } from "@/lib/calendar/selectors";

const CHECK_INTERVAL_MS = 20_000;

export function ReminderScheduler() {
  const enabled = useUIStore((s) => s.desktopNotificationsEnabled);
  const firedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("Notification" in window)) return;

    const check = () => {
      if (Notification.permission !== "granted") return;
      const now = new Date();
      const horizon = new Date(now.getTime() + 26 * 3600000);
      const events = getEventsInRange(useCalendarStore.getState().events, now, horizon);

      for (const event of events) {
        if (event.status === "completed" || event.status === "canceled") continue;
        for (const reminder of event.reminders) {
          if (reminder.method !== "desktop") continue;
          const key = `${event.id}:${reminder.id}`;
          if (firedRef.current.has(key)) continue;

          const fireAt = new Date(new Date(event.start).getTime() - reminder.offsetMinutes * 60000);
          const msUntil = fireAt.getTime() - now.getTime();

          if (msUntil <= 0 && msUntil > -CHECK_INTERVAL_MS * 2) {
            firedRef.current.add(key);
            new Notification(event.title, {
              body:
                reminder.offsetMinutes === 0
                  ? "Starting now"
                  : `Starts in ${reminder.offsetMinutes >= 60 ? `${Math.round(reminder.offsetMinutes / 60)}h` : `${reminder.offsetMinutes}m`}`,
              tag: key,
            });
          }
        }
      }
    };

    check();
    const id = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [enabled]);

  return null;
}
