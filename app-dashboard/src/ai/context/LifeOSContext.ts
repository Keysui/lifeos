import { useTasksStore } from "@/store/tasks-store";
import { useProjectsStore } from "@/store/projects-store";
import { useHabitsStore } from "@/store/habits-store";
import { useCalendarStore } from "@/store/calendar-store";
import { useActivityStore } from "@/store/activity-store";
import { goals, journalEntries } from "@/lib/mock/data";
import type { LifeOSContextPayload } from "@/types/ai";

// Client-side context assembly. There is no backend database in this app, so the AI Router
// can't fetch this itself server-side -- instead the Client Component calling /api/ai/chat
// builds this snapshot from the Zustand stores (and, for goals/journal which don't have a
// store yet, the mock data module) and sends it as part of the request body.

const UPCOMING_WINDOW_DAYS = 7;
const MAX_EVENTS = 20;
const MAX_TASKS = 25;
const MAX_ACTIVITY = 10;
const MAX_JOURNAL = 5;

export function buildLifeOSContext(): LifeOSContextPayload {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + UPCOMING_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const events = useCalendarStore
    .getState()
    .events.filter((e) => !e.archived && new Date(e.start) >= now && new Date(e.start) <= windowEnd)
    .sort((a, b) => a.start.localeCompare(b.start))
    .slice(0, MAX_EVENTS)
    .map((e) => ({ title: e.title, start: e.start, end: e.end, category: e.category, priority: e.priority }));

  const openTasks = useTasksStore
    .getState()
    .tasks.filter((t) => t.status !== "done")
    .sort((a, b) => a.priority.localeCompare(b.priority))
    .slice(0, MAX_TASKS)
    .map((t) => ({
      title: t.title,
      priority: t.priority,
      status: t.status,
      deadline: t.deadline,
      estimateMinutes: t.estimateMinutes,
    }));

  const activeProjects = useProjectsStore
    .getState()
    .projects.filter((p) => p.status !== "done")
    .map((p) => ({
      name: p.name,
      status: p.status,
      progress: p.progress,
      nextAction: p.nextAction,
      blockers: p.blockers,
    }));

  const habits = useHabitsStore.getState().habits.map((h) => ({
    name: h.name,
    streak: h.streak,
    targetPerWeek: h.targetPerWeek,
  }));

  const recentActivity = useActivityStore
    .getState()
    .entries.slice(0, MAX_ACTIVITY)
    .map((e) => e.message);

  return {
    generatedAt: now.toISOString(),
    today: now.toISOString().slice(0, 10),
    upcomingEvents: events,
    openTasks,
    activeProjects,
    goals: goals.map((g) => ({ title: g.title, horizon: g.horizon, progress: g.progress })),
    habits,
    recentActivity,
    recentJournal: journalEntries.slice(0, MAX_JOURNAL).map((j) => ({ date: j.date, title: j.title, mood: j.mood })),
  };
}
