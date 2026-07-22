import { ANCHOR_DATE, todaySchedule, habits, tasks, projects, goals } from "@/lib/mock/data";
import { mulberry32, seededInt, seededPick } from "@/lib/mock/rng";
import type { CalendarEvent, EventCategory } from "@/types/calendar";

const KIND_TO_CATEGORY: Record<string, EventCategory> = {
  focus: "focus",
  meeting: "meeting",
  habit: "habit",
  break: "personal",
  admin: "work",
};

function atTime(dateISO: string, hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const d = new Date(`${dateISO}T00:00:00`);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function todayISO() {
  return ANCHOR_DATE.toISOString().slice(0, 10);
}

function stamp(): string {
  return new Date().toISOString();
}

function startOfWeek(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const day = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - day);
  return c;
}

const WEEKDAY_FOCUS_TITLES = ["Deep work block", "Project build session", "Writing block", "Planning session"];
const WEEKDAY_MEETING_TITLES = ["Team sync", "1:1 check-in", "Stakeholder call", "Client meeting"];
const WEEKEND_TITLES = ["Long run", "Meal prep", "Errands", "Reading time", "Family time"];

/** Fills out the rest of the current week with plausible, deterministic blocks (today itself is seeded separately from todaySchedule). */
function buildWeekFillerEvents(now: string): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const weekStart = startOfWeek(ANCHOR_DATE);
  const today = todayISO();

  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const dayISO = day.toISOString().slice(0, 10);
    if (dayISO === today) continue; // already covered by todaySchedule

    const rand = mulberry32(900 + i);
    const isWeekend = i >= 5;

    if (!isWeekend) {
      events.push({
        id: `seed-fill-${dayISO}-focus1`,
        title: seededPick(rand, WEEKDAY_FOCUS_TITLES),
        start: atTime(dayISO, "09:00"),
        end: atTime(dayISO, "10:30"),
        allDay: false,
        category: "focus",
        priority: "P2",
        tags: [],
        status: dayISO < today ? "completed" : "scheduled",
        reminders: [],
        checklist: [],
        attachments: [],
        createdAt: now,
        updatedAt: now,
      });
      events.push({
        id: `seed-fill-${dayISO}-meeting`,
        title: seededPick(rand, WEEKDAY_MEETING_TITLES),
        start: atTime(dayISO, `${seededInt(rand, 11, 13)}:00`),
        end: atTime(dayISO, `${seededInt(rand, 11, 13)}:45`),
        allDay: false,
        category: "meeting",
        priority: "P2",
        tags: [],
        status: dayISO < today ? "completed" : "scheduled",
        reminders: [],
        checklist: [],
        attachments: [],
        createdAt: now,
        updatedAt: now,
      });
      events.push({
        id: `seed-fill-${dayISO}-focus2`,
        title: seededPick(rand, WEEKDAY_FOCUS_TITLES),
        start: atTime(dayISO, "14:30"),
        end: atTime(dayISO, "16:00"),
        allDay: false,
        category: "work",
        priority: "P3",
        tags: [],
        status: dayISO < today ? "completed" : "scheduled",
        reminders: [],
        checklist: [],
        attachments: [],
        createdAt: now,
        updatedAt: now,
      });
    } else {
      events.push({
        id: `seed-fill-${dayISO}-personal`,
        title: seededPick(rand, WEEKEND_TITLES),
        start: atTime(dayISO, `${seededInt(rand, 9, 11)}:00`),
        end: atTime(dayISO, `${seededInt(rand, 12, 13)}:00`),
        allDay: false,
        category: "personal",
        priority: "P3",
        tags: [],
        status: dayISO < today ? "completed" : "scheduled",
        reminders: [],
        checklist: [],
        attachments: [],
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  return events;
}

export function buildSeedEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const today = todayISO();
  const now = stamp();

  for (const block of todaySchedule) {
    events.push({
      id: `seed-schedule-${block.id}`,
      title: block.title,
      start: atTime(today, block.start),
      end: atTime(today, block.end),
      allDay: false,
      category: KIND_TO_CATEGORY[block.kind] ?? "work",
      priority: "P2",
      tags: [],
      status: "scheduled",
      taskId: block.linkedTaskId,
      reminders: [],
      checklist: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  habits.forEach((habit, idx) => {
    const startHour = 6 + idx; // stagger habit slots through the day
    const weekdayCount = Math.min(Math.max(habit.targetPerWeek, 1), 7);
    events.push({
      id: `seed-habit-${habit.id}`,
      title: habit.name,
      description: `Recurring habit · ${habit.area}`,
      start: atTime(today, `${String(startHour).padStart(2, "0")}:00`),
      end: atTime(today, `${String(startHour).padStart(2, "0")}:30`),
      allDay: false,
      category: "habit",
      priority: "P3",
      tags: [habit.area.toLowerCase()],
      status: "scheduled",
      habitId: habit.id,
      recurrence: { freq: "weekly", interval: 1, byWeekday: Array.from({ length: weekdayCount }, (_, i) => i) },
      reminders: [{ id: `rem-${habit.id}`, offsetMinutes: 10, method: "desktop" }],
      checklist: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    });
  });

  for (const task of tasks) {
    if (!task.deadline || task.status === "done") continue;
    events.push({
      id: `seed-deadline-task-${task.id}`,
      title: `Due: ${task.title}`,
      start: atTime(task.deadline, "09:00"),
      end: atTime(task.deadline, "09:30"),
      allDay: true,
      category: "deadline",
      priority: task.priority,
      tags: ["deadline"],
      status: "scheduled",
      taskId: task.id,
      projectId: task.projectId,
      reminders: [{ id: `rem-task-${task.id}`, offsetMinutes: 60, method: "desktop" }],
      checklist: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const project of projects) {
    if (!project.deadline || project.status === "done") continue;
    events.push({
      id: `seed-milestone-project-${project.id}`,
      title: `${project.name} — deadline`,
      start: atTime(project.deadline, "09:00"),
      end: atTime(project.deadline, "10:00"),
      allDay: true,
      category: "milestone",
      priority: "P1",
      tags: ["project"],
      status: "scheduled",
      projectId: project.id,
      goalId: project.goalId,
      reminders: [{ id: `rem-project-${project.id}`, offsetMinutes: 1440, method: "desktop" }],
      checklist: project.milestones.map((m) => ({ id: m.id, title: m.title, done: m.done })),
      attachments: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const goal of goals) {
    if (!goal.forecastCompletion) continue;
    events.push({
      id: `seed-milestone-goal-${goal.id}`,
      title: `${goal.title} — forecast checkpoint`,
      start: atTime(goal.forecastCompletion, "09:00"),
      end: atTime(goal.forecastCompletion, "09:30"),
      allDay: true,
      category: "milestone",
      priority: "P2",
      tags: ["goal"],
      status: "scheduled",
      goalId: goal.id,
      reminders: [],
      checklist: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    });
  }

  events.push(...buildWeekFillerEvents(now));

  return events;
}
