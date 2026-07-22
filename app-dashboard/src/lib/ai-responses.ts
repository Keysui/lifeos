import { goals, insights, journalEntries } from "@/lib/mock/data";
import { useTasksStore } from "@/store/tasks-store";
import { useProjectsStore } from "@/store/projects-store";
import { useHabitsStore } from "@/store/habits-store";
import { runCalendarCommand } from "@/lib/calendar/ai";

function topPriorityTask() {
  return useTasksStore
    .getState()
    .tasks.filter((t) => t.status !== "done" && t.status !== "blocked")
    .sort((a, b) => a.priority.localeCompare(b.priority))[0];
}

function overdue() {
  return useTasksStore.getState().tasks.filter((t) => t.tags?.includes("overdue"));
}

export interface AIExchange {
  prompt: string;
  response: string;
}

const canned: { match: RegExp; respond: () => string }[] = [
  {
    match: /plan.*(week|day)/i,
    respond: () => {
      const top = topPriorityTask();
      return `Here's a plan: front-load "${top?.title}" before noon — that's when your deep work completion rate is highest. Keep the investor sync and beta invite review as-is, and move "Weekly review" to tonight at 20:00 since it's already on your calendar.`;
    },
  },
  {
    match: /summar.*goal/i,
    respond: () =>
      `You have ${goals.length} active goals across the cascade. Quarterly focus is "${goals.find((g) => g.horizon === "quarterly")?.title}" at ${goals.find((g) => g.horizon === "quarterly")?.progress}% — on pace. One goal ("Second Brain Rebuild" work) hasn't moved in 15 days and is worth revisiting.`,
  },
  {
    match: /what should i work on|next best action|^focus$/i,
    respond: () => {
      const top = topPriorityTask();
      return `Highest-leverage move right now: "${top?.title}" (${top?.priority}, ~${top?.estimateMinutes}m). It's blocking your Life OS milestone and matches your peak focus window.`;
    },
  },
  {
    match: /forget|missing|blind spot/i,
    respond: () => {
      const stuck = useProjectsStore.getState().projects.find((p) => p.status === "blocked");
      const od = overdue();
      return `Two things: "${stuck?.name}" has been blocked on ${stuck?.blockers?.[0]?.toLowerCase()}, and you have ${od.length} overdue item${od.length === 1 ? "" : "s"} (${od.map((t) => t.title).join(", ") || "none"}).`;
    },
  },
  {
    match: /unfinished project|open project/i,
    respond: () => {
      const projects = useProjectsStore.getState().projects;
      return `In progress: ${projects
        .filter((p) => p.status === "in-progress")
        .map((p) => `${p.name} (${p.progress}%)`)
        .join(", ")}. Blocked: ${projects.filter((p) => p.status === "blocked").map((p) => p.name).join(", ") || "none"}.`;
    },
  },
  {
    match: /review.*(month|week)/i,
    respond: () => {
      const bestHabit = [...useHabitsStore.getState().habits].sort((a, b) => b.streak - a.streak)[0];
      const latestEntry = journalEntries[0];
      return `Momentum is trending up. Longest active streak: "${bestHabit.name}" at ${bestHabit.streak} days. Most recent reflection: "${latestEntry.title}" — mood ${latestEntry.mood}/5. Two projects moved forward, one is stuck.`;
    },
  },
  {
    match: /optimi[sz]e.*schedule/i,
    respond: () =>
      `Your afternoons have the most fragmentation. Consider batching the investor sync and beta invite review back-to-back, and protect 15:00–17:00 as a second deep work block instead of scattering admin tasks through it.`,
  },
  {
    match: /morning briefing|briefing/i,
    respond: () => {
      const top = topPriorityTask();
      const insight = insights[0];
      return `Good morning. Today's mission: "${top?.title}". Heads up — ${insight.message} You have ${overdue().length} overdue item${overdue().length === 1 ? "" : "s"} to clear early if possible.`;
    },
  },
];

export function getAIResponse(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return "Ask me anything about your goals, projects, schedule, or habits.";

  const calendarResult = runCalendarCommand(trimmed);
  if (calendarResult.handled) return calendarResult.message;

  const hit = canned.find((c) => c.match.test(trimmed));
  if (hit) return hit.respond();

  const projects = useProjectsStore.getState().projects;
  const tasks = useTasksStore.getState().tasks;
  return `Here's what I can see: ${goals.length} active goals, ${projects.filter((p) => p.status !== "done").length} open projects, and ${tasks.filter((t) => t.status !== "done").length} open tasks. Try "plan my week" or "what should I work on?" for something more specific.`;
}

export const suggestedPrompts = [
  "Plan my week",
  "What should I work on?",
  "Schedule a workout tomorrow",
  "Find time to study",
  "What deadlines are approaching?",
  "What is my busiest day?",
  "Move everything after 3 PM",
  "Optimize my week",
];
