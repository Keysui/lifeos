import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CalendarEvent, EventStatus } from "@/types/calendar";
import { buildSeedEvents } from "@/lib/calendar/seed";
import { useTasksStore } from "@/store/tasks-store";
import { useHabitsStore } from "@/store/habits-store";
import { useProjectsStore } from "@/store/projects-store";
import { useActivityStore } from "@/store/activity-store";

function splitInstanceId(id: string): { baseId: string; occurrenceISO: string } | null {
  const idx = id.indexOf("::");
  if (idx === -1) return null;
  return { baseId: id.slice(0, idx), occurrenceISO: id.slice(idx + 2) };
}

function newId() {
  return crypto.randomUUID();
}

function now() {
  return new Date().toISOString();
}

interface CalendarState {
  events: CalendarEvent[];

  addEvent: (draft: Partial<CalendarEvent> & Pick<CalendarEvent, "title" | "start" | "end">) => CalendarEvent;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;
  archiveEvent: (id: string) => void;
  completeEvent: (id: string) => void;
  reopenEvent: (id: string) => void;
  setStatus: (id: string, status: EventStatus) => void;

  moveEvent: (id: string, newStart: Date) => void;
  resizeEvent: (id: string, newEnd: Date) => void;

  scheduleTask: (
    taskId: string,
    title: string,
    start: Date,
    end: Date,
    extra?: Partial<CalendarEvent>
  ) => void;

  shiftEventsAfter: (dayISO: string, afterHour: number, offsetMinutes: number) => number;

  /** Resolves a possibly-synthetic recurring-instance id to a real, independently editable event id. */
  resolveEditableId: (id: string) => string;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: buildSeedEvents(),

      addEvent: (draft) => {
        const event: CalendarEvent = {
          id: newId(),
          allDay: false,
          category: "personal",
          priority: "P2",
          tags: [],
          status: "scheduled",
          reminders: [],
          checklist: [],
          attachments: [],
          createdAt: now(),
          updatedAt: now(),
          ...draft,
        };
        set((s) => ({ events: [...s.events, event] }));
        return event;
      },

      updateEvent: (id, patch) => {
        const realId = get().resolveEditableId(id);
        set((s) => ({
          events: s.events.map((e) => (e.id === realId ? { ...e, ...patch, updatedAt: now() } : e)),
        }));
      },

      deleteEvent: (id) => {
        const instance = splitInstanceId(id);
        if (instance) {
          set((s) => ({
            events: s.events.map((e) =>
              e.id === instance.baseId
                ? {
                    ...e,
                    excludedDates: [...(e.excludedDates ?? []), instance.occurrenceISO.slice(0, 10)],
                    updatedAt: now(),
                  }
                : e
            ),
          }));
          return;
        }
        set((s) => ({ events: s.events.filter((e) => e.id !== id) }));
      },

      duplicateEvent: (id) => {
        const realId = get().resolveEditableId(id);
        const source = get().events.find((e) => e.id === realId);
        if (!source) return;
        const clone: CalendarEvent = {
          ...source,
          id: newId(),
          title: `${source.title} (copy)`,
          recurrence: undefined,
          recurrenceId: undefined,
          createdAt: now(),
          updatedAt: now(),
        };
        set((s) => ({ events: [...s.events, clone] }));
      },

      archiveEvent: (id) => {
        const realId = get().resolveEditableId(id);
        set((s) => ({
          events: s.events.map((e) => (e.id === realId ? { ...e, archived: true, updatedAt: now() } : e)),
        }));
      },

      completeEvent: (id) => {
        const realId = get().resolveEditableId(id);
        const event = get().events.find((e) => e.id === realId);
        if (!event) return;

        set((s) => ({
          events: s.events.map((e) =>
            e.id === realId
              ? {
                  ...e,
                  status: "completed",
                  actualMinutes:
                    e.actualMinutes ??
                    Math.round((new Date(e.end).getTime() - new Date(e.start).getTime()) / 60000),
                  updatedAt: now(),
                }
              : e
          ),
        }));

        if (event.taskId) {
          useTasksStore.getState().setStatus(event.taskId, "done");
        }
        if (event.habitId) {
          useHabitsStore.getState().setDay(event.habitId, event.start.slice(0, 10), true);
        }
        if (event.projectId) {
          useProjectsStore.getState().bumpProgress(event.projectId, 2);
          useActivityStore.getState().log(`Completed "${event.title}"`, { projectId: event.projectId });
        }
        if (event.goalId && !event.projectId) {
          useActivityStore.getState().log(`Completed "${event.title}"`, { goalId: event.goalId });
        }
      },

      reopenEvent: (id) => {
        const realId = get().resolveEditableId(id);
        set((s) => ({
          events: s.events.map((e) => (e.id === realId ? { ...e, status: "scheduled", updatedAt: now() } : e)),
        }));
      },

      setStatus: (id, status) => {
        const realId = get().resolveEditableId(id);
        set((s) => ({ events: s.events.map((e) => (e.id === realId ? { ...e, status, updatedAt: now() } : e)) }));
      },

      moveEvent: (id, newStart) => {
        const realId = get().resolveEditableId(id);
        const event = get().events.find((e) => e.id === realId);
        if (!event) return;
        const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
        const newEnd = new Date(newStart.getTime() + duration);
        set((s) => ({
          events: s.events.map((e) =>
            e.id === realId ? { ...e, start: newStart.toISOString(), end: newEnd.toISOString(), updatedAt: now() } : e
          ),
        }));
      },

      resizeEvent: (id, newEnd) => {
        const realId = get().resolveEditableId(id);
        set((s) => ({
          events: s.events.map((e) => (e.id === realId ? { ...e, end: newEnd.toISOString(), updatedAt: now() } : e)),
        }));
      },

      scheduleTask: (taskId, title, start, end, extra) => {
        get().addEvent({
          title,
          start: start.toISOString(),
          end: end.toISOString(),
          taskId,
          category: "focus",
          ...extra,
        });
        useTasksStore.getState().setStatus(taskId, "in-progress");
      },

      shiftEventsAfter: (dayISO, afterHour, offsetMinutes) => {
        let count = 0;
        set((s) => ({
          events: s.events.map((e) => {
            if (e.recurrence) return e; // don't bulk-shift recurring series
            const start = new Date(e.start);
            if (start.toISOString().slice(0, 10) !== dayISO) return e;
            if (start.getHours() < afterHour) return e;
            count += 1;
            return {
              ...e,
              start: new Date(start.getTime() + offsetMinutes * 60000).toISOString(),
              end: new Date(new Date(e.end).getTime() + offsetMinutes * 60000).toISOString(),
              updatedAt: now(),
            };
          }),
        }));
        return count;
      },

      resolveEditableId: (id) => {
        const instance = splitInstanceId(id);
        if (!instance) return id;

        const base = get().events.find((e) => e.id === instance.baseId);
        if (!base) return id;

        const occStart = new Date(instance.occurrenceISO);
        const duration = new Date(base.end).getTime() - new Date(base.start).getTime();
        const occEnd = new Date(occStart.getTime() + duration);

        const materialized: CalendarEvent = {
          ...base,
          id: newId(),
          start: occStart.toISOString(),
          end: occEnd.toISOString(),
          recurrence: undefined,
          recurrenceId: base.id,
          createdAt: now(),
          updatedAt: now(),
        };

        set((s) => ({
          events: [
            ...s.events.map((e) =>
              e.id === base.id
                ? { ...e, excludedDates: [...(e.excludedDates ?? []), occStart.toISOString().slice(0, 10)] }
                : e
            ),
            materialized,
          ],
        }));

        return materialized.id;
      },
    }),
    { name: "life-os-calendar" }
  )
);
