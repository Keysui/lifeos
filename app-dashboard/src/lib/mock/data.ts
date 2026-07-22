import { mulberry32, seededInt } from "./rng";
import type {
  Task,
  ScheduleBlock,
  Project,
  Goal,
  Habit,
  JournalEntry,
  Insight,
  HealthMetric,
  FinanceSnapshot,
  KnowledgeNode,
  TimeAllocationSlice,
  DeepWorkPoint,
  NotificationItem,
  Decision,
} from "@/types";

/** Fixed anchor so server + client render identical relative dates. */
export const ANCHOR_DATE = new Date("2026-07-21T08:00:00");

function isoDaysAgo(days: number) {
  const d = new Date(ANCHOR_DATE);
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}
function isoDaysFromNow(days: number) {
  return isoDaysAgo(-days);
}

export const user = {
  name: "Keyon",
  role: "Founder & Builder",
  avatarInitials: "KS",
  focusStatement: "Ship the Life OS dashboard and keep momentum on Q3 goals.",
};

/* ------------------------------------------------------------------ */
/* Goals                                                              */
/* ------------------------------------------------------------------ */

export const goals: Goal[] = [
  { id: "g-vision", title: "Build a fully self-directed, high-leverage life system", horizon: "life", progress: 62, area: "Systems" },
  { id: "g-10y", title: "Financially independent, running ventures I own", horizon: "10-year", progress: 34, area: "Career" },
  { id: "g-3y", title: "Ship and scale two profitable products", horizon: "3-year", progress: 41, area: "Career", parentId: "g-10y" },
  { id: "g-annual", title: "Grow deep work capacity to 5h/day average", horizon: "annual", progress: 58, area: "Productivity" },
  { id: "g-q1", title: "Launch Life OS v1 to daily-use quality", horizon: "quarterly", progress: 73, forecastCompletion: isoDaysFromNow(18), area: "Systems", parentId: "g-3y" },
  { id: "g-q2", title: "Rebuild strength baseline (5x/week training)", horizon: "quarterly", progress: 47, forecastCompletion: isoDaysFromNow(40), area: "Health" },
  { id: "g-q3", title: "Read 12 books this quarter", horizon: "quarterly", progress: 66, forecastCompletion: isoDaysFromNow(25), area: "Personal Growth" },
  { id: "g-m1", title: "Finish dashboard flagship pages", horizon: "monthly", progress: 80, area: "Systems", parentId: "g-q1" },
  { id: "g-m2", title: "Hit 4 gym sessions this week, every week", horizon: "monthly", progress: 55, area: "Health", parentId: "g-q2" },
];

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const projects: Project[] = [
  {
    id: "p-lifeos",
    name: "Life OS Dashboard",
    area: "Systems",
    status: "in-progress",
    progress: 78,
    goalId: "g-m1",
    deadline: isoDaysFromNow(12),
    milestones: [
      { id: "m1", title: "Design system + shell", done: true, date: isoDaysAgo(2) },
      { id: "m2", title: "Flagship pages (Today, Projects, Goals, Habits)", done: true, date: isoDaysAgo(0) },
      { id: "m3", title: "Real data layer (markdown sync)", done: false, date: isoDaysFromNow(7) },
      { id: "m4", title: "AI command bar wired to real actions", done: false, date: isoDaysFromNow(14) },
    ],
    nextAction: "Wire markdown parser for daily/ and projects/ folders",
  },
  {
    id: "p-launch",
    name: "Product Launch: Northwind",
    area: "Career",
    status: "in-progress",
    progress: 52,
    goalId: "g-3y",
    deadline: isoDaysFromNow(30),
    milestones: [
      { id: "m1", title: "Landing page live", done: true, date: isoDaysAgo(20) },
      { id: "m2", title: "Waitlist to 500", done: true, date: isoDaysAgo(5) },
      { id: "m3", title: "Beta cohort onboarded", done: false, date: isoDaysFromNow(10) },
      { id: "m4", title: "Public launch", done: false, date: isoDaysFromNow(30) },
    ],
    nextAction: "Send beta invites to first 50 waitlist signups",
    blockers: ["Waiting on payment integration review"],
  },
  {
    id: "p-finance",
    name: "Personal Finance Overhaul",
    area: "Finances",
    status: "in-progress",
    progress: 35,
    deadline: isoDaysFromNow(45),
    milestones: [
      { id: "m1", title: "Audit subscriptions", done: true, date: isoDaysAgo(10) },
      { id: "m2", title: "Automate savings transfer", done: true, date: isoDaysAgo(3) },
      { id: "m3", title: "Set up investment ladder", done: false, date: isoDaysFromNow(20) },
    ],
    nextAction: "Compare 3 brokerage options for the investment ladder",
  },
  {
    id: "p-strength",
    name: "Strength Rebuild",
    area: "Health",
    status: "in-progress",
    progress: 47,
    goalId: "g-m2",
    milestones: [
      { id: "m1", title: "Baseline lifts tested", done: true, date: isoDaysAgo(14) },
      { id: "m2", title: "4-week block 1 complete", done: false, date: isoDaysFromNow(3) },
    ],
    nextAction: "Log today's lower body session",
  },
  {
    id: "p-knowledge",
    name: "Second Brain Rebuild",
    area: "Knowledge",
    status: "blocked",
    progress: 22,
    milestones: [
      { id: "m1", title: "Migrate notes to new structure", done: false, date: isoDaysFromNow(15) },
    ],
    nextAction: "Decide on final tagging taxonomy",
    blockers: ["Undecided on taxonomy — blocking migration"],
  },
  {
    id: "p-archive-website",
    name: "Portfolio Site Refresh",
    area: "Career",
    status: "done",
    progress: 100,
    milestones: [{ id: "m1", title: "Ship v2", done: true, date: isoDaysAgo(40) }],
  },
];

/* ------------------------------------------------------------------ */
/* Tasks + today's schedule                                            */
/* ------------------------------------------------------------------ */

export const tasks: Task[] = [
  { id: "t1", title: "Wire markdown parser for daily notes", priority: "P1", status: "in-progress", estimateMinutes: 90, difficulty: 4, deadline: isoDaysFromNow(2), projectId: "p-lifeos", goalId: "g-m1", tags: ["deep-work"] },
  { id: "t2", title: "Review beta invite copy", priority: "P2", status: "todo", estimateMinutes: 20, difficulty: 2, deadline: isoDaysFromNow(1), projectId: "p-launch", tags: ["quick-win"] },
  { id: "t3", title: "Send 50 beta invites", priority: "P1", status: "blocked", estimateMinutes: 30, difficulty: 2, deadline: isoDaysFromNow(3), projectId: "p-launch", dependsOn: ["t2"] },
  { id: "t4", title: "Compare brokerage fee structures", priority: "P3", status: "todo", estimateMinutes: 45, difficulty: 3, projectId: "p-finance" },
  { id: "t5", title: "Lower body strength session", priority: "P2", status: "todo", estimateMinutes: 60, difficulty: 3, projectId: "p-strength", tags: ["health"] },
  { id: "t6", title: "Decide tagging taxonomy for notes", priority: "P3", status: "blocked", estimateMinutes: 30, difficulty: 3, projectId: "p-knowledge" },
  { id: "t7", title: "Reply to overdue emails", priority: "P3", status: "todo", estimateMinutes: 15, difficulty: 1, deadline: isoDaysAgo(1), tags: ["quick-win", "overdue"] },
  { id: "t8", title: "Weekly review + reflection", priority: "P1", status: "todo", estimateMinutes: 30, difficulty: 2, deadline: isoDaysFromNow(0) },
  { id: "t9", title: "Command palette AI action wiring", priority: "P1", status: "in-progress", estimateMinutes: 120, difficulty: 5, projectId: "p-lifeos", goalId: "g-m1", tags: ["deep-work"] },
  { id: "t10", title: "Read 30 pages — Antifragile", priority: "P3", status: "done", estimateMinutes: 30, difficulty: 1, goalId: "g-q3" },
];

export const todaySchedule: ScheduleBlock[] = [
  { id: "s1", title: "Morning review + priorities", start: "07:30", end: "08:00", kind: "admin" },
  { id: "s2", title: "Deep work: markdown data layer", start: "08:00", end: "10:00", kind: "focus", linkedTaskId: "t1" },
  { id: "s3", title: "Command palette AI wiring", start: "10:15", end: "12:15", kind: "focus", linkedTaskId: "t9" },
  { id: "s4", title: "Lunch + walk", start: "12:15", end: "13:00", kind: "break" },
  { id: "s5", title: "Beta invite copy review", start: "13:00", end: "13:30", kind: "admin", linkedTaskId: "t2" },
  { id: "s6", title: "Investor sync", start: "13:30", end: "14:00", kind: "meeting" },
  { id: "s7", title: "Lower body strength session", start: "17:30", end: "18:30", kind: "habit", linkedTaskId: "t5" },
  { id: "s8", title: "Weekly review", start: "20:00", end: "20:30", kind: "admin", linkedTaskId: "t8" },
];

/* ------------------------------------------------------------------ */
/* Habits                                                              */
/* ------------------------------------------------------------------ */

function buildHistory(seed: number, hitRate: number) {
  const rand = mulberry32(seed);
  const history: Habit["history"] = [];
  for (let i = 83; i >= 0; i--) {
    history.push({ date: isoDaysAgo(i), done: rand() < hitRate });
  }
  return history;
}

export const habits: Habit[] = [
  { id: "h1", name: "Morning deep work block", area: "Productivity", targetPerWeek: 5, streak: 12, bestStreak: 21, history: buildHistory(1, 0.78) },
  { id: "h2", name: "Strength training", area: "Health", targetPerWeek: 4, streak: 4, bestStreak: 9, history: buildHistory(2, 0.6) },
  { id: "h3", name: "Read 20+ pages", area: "Personal Growth", targetPerWeek: 6, streak: 6, bestStreak: 30, history: buildHistory(3, 0.72) },
  { id: "h4", name: "No phone first 30 min", area: "Productivity", targetPerWeek: 7, streak: 2, bestStreak: 14, history: buildHistory(4, 0.55) },
  { id: "h5", name: "Evening reflection", area: "Personal Growth", targetPerWeek: 7, streak: 9, bestStreak: 19, history: buildHistory(5, 0.68) },
  { id: "h6", name: "8h sleep window", area: "Health", targetPerWeek: 7, streak: 1, bestStreak: 11, history: buildHistory(6, 0.5) },
];

/* ------------------------------------------------------------------ */
/* Journal                                                             */
/* ------------------------------------------------------------------ */

export const journalEntries: JournalEntry[] = [
  { id: "j1", date: isoDaysAgo(0), title: "Momentum is back", excerpt: "Finally got a clean deep work block in before the noise of the day started. Dashboard shell is coming together faster than expected.", mood: 4, tags: ["work", "momentum"] },
  { id: "j2", date: isoDaysAgo(1), title: "Frustrated with taxonomy decision", excerpt: "Spent too long circling on the notes tagging structure instead of just picking one and iterating.", mood: 2, tags: ["knowledge", "friction"] },
  { id: "j3", date: isoDaysAgo(3), title: "Good training session", excerpt: "First real lower-body session in two weeks. Weight is down slightly from baseline but form felt solid.", mood: 4, tags: ["health"] },
  { id: "j4", date: isoDaysAgo(5), title: "Investor conversation went well", excerpt: "Got useful, specific feedback on the beta cohort plan. Feeling more confident about the launch sequencing.", mood: 5, tags: ["work", "launch"] },
  { id: "j5", date: isoDaysAgo(8), title: "Low energy day", excerpt: "Slept poorly, pushed through admin work only. Skipped the workout — need to protect the sleep window better.", mood: 2, tags: ["health", "energy"] },
];

/* ------------------------------------------------------------------ */
/* AI insights                                                         */
/* ------------------------------------------------------------------ */

export const insights: Insight[] = [
  { id: "i1", kind: "warning", message: "You've made no progress on \"Second Brain Rebuild\" for 15 days — it's stuck behind an undecided taxonomy.", confidence: 0.92, relatedArea: "Knowledge" },
  { id: "i2", kind: "pattern", message: "You complete 68% more deep work before noon than after. Your last 3 afternoon focus blocks were skipped or cut short.", confidence: 0.87, relatedArea: "Productivity" },
  { id: "i3", kind: "correlation", message: "Nights with 7+ hours of sleep are followed by workout completion 3x more often than short-sleep nights.", confidence: 0.81, relatedArea: "Health" },
  { id: "i4", kind: "conflict", message: "Beta invite send, investor sync prep, and the strength session are all contending for tomorrow afternoon.", confidence: 0.95, relatedArea: "Schedule" },
  { id: "i5", kind: "encouragement", message: "Reading streak is your longest of the year — 6 days and counting toward the 12-book quarterly goal.", confidence: 0.99, relatedArea: "Personal Growth" },
];

/* ------------------------------------------------------------------ */
/* Health                                                              */
/* ------------------------------------------------------------------ */

export const healthMetrics: HealthMetric[] = Array.from({ length: 30 }).map((_, idx) => {
  const rand = mulberry32(100 + idx);
  const day = 29 - idx;
  return {
    date: isoDaysAgo(day),
    sleepHours: Math.round((5.5 + rand() * 3) * 10) / 10,
    energy: seededInt(rand, 3, 9),
    mood: seededInt(rand, 3, 9),
    steps: seededInt(rand, 3000, 12000),
    workoutMinutes: rand() < 0.55 ? seededInt(rand, 20, 75) : 0,
  };
});

/* ------------------------------------------------------------------ */
/* Finances                                                            */
/* ------------------------------------------------------------------ */

const monthLabels = ["Feb", "Mar", "Apr", "May", "Jun", "Jul"];
let runningNetWorth = 48000;
export const financeSnapshots: FinanceSnapshot[] = monthLabels.map((month, idx) => {
  const rand = mulberry32(300 + idx);
  const income = 8200 + seededInt(rand, -400, 900);
  const expenses = 5100 + seededInt(rand, -300, 700);
  const savings = income - expenses;
  runningNetWorth += savings + seededInt(rand, -200, 600);
  return { month, income, expenses, savings, netWorth: Math.round(runningNetWorth) };
});

/* ------------------------------------------------------------------ */
/* Knowledge graph                                                     */
/* ------------------------------------------------------------------ */

export const knowledgeNodes: KnowledgeNode[] = [
  { id: "k1", title: "Deep Work Principles", area: "Productivity", connections: ["k2", "k4"], updatedAt: isoDaysAgo(2) },
  { id: "k2", title: "Time Blocking", area: "Productivity", connections: ["k1", "k3"], updatedAt: isoDaysAgo(6) },
  { id: "k3", title: "Weekly Review System", area: "Systems", connections: ["k2", "k5"], updatedAt: isoDaysAgo(1) },
  { id: "k4", title: "Antifragile — Notes", area: "Personal Growth", connections: ["k1", "k6"], updatedAt: isoDaysAgo(0) },
  { id: "k5", title: "Goal Cascade Method", area: "Systems", connections: ["k3", "k7"], updatedAt: isoDaysAgo(4) },
  { id: "k6", title: "Stoicism & Decision Making", area: "Personal Growth", connections: ["k4"], updatedAt: isoDaysAgo(9) },
  { id: "k7", title: "Product Launch Playbook", area: "Career", connections: ["k5", "k8"], updatedAt: isoDaysAgo(3) },
  { id: "k8", title: "Northwind Positioning", area: "Career", connections: ["k7"], updatedAt: isoDaysAgo(1) },
];

/* ------------------------------------------------------------------ */
/* Time allocation + deep work trend                                   */
/* ------------------------------------------------------------------ */

export const timeAllocation: TimeAllocationSlice[] = [
  { category: "Deep Work", hours: 24, color: "var(--life-primary)" },
  { category: "Meetings", hours: 8, color: "var(--life-accent)" },
  { category: "Admin", hours: 10, color: "#8B93A7" },
  { category: "Health", hours: 6, color: "var(--life-success)" },
  { category: "Learning", hours: 5, color: "var(--life-warning)" },
  { category: "Rest", hours: 15, color: "var(--life-danger)" },
];

export const deepWorkTrend: DeepWorkPoint[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, idx) => {
  const rand = mulberry32(500 + idx);
  return {
    day,
    deepWorkHours: Math.round((2 + rand() * 3.5) * 10) / 10,
    shallowWorkHours: Math.round((1 + rand() * 2.5) * 10) / 10,
  };
});

/* ------------------------------------------------------------------ */
/* Notifications + decisions                                           */
/* ------------------------------------------------------------------ */

export const notifications: NotificationItem[] = [
  { id: "n1", title: "AI insight ready", detail: "New pattern detected in your afternoon focus blocks.", time: "8m ago", read: false, kind: "ai" },
  { id: "n2", title: "Deadline approaching", detail: "\"Send 50 beta invites\" is due in 3 days.", time: "1h ago", read: false, kind: "reminder" },
  { id: "n3", title: "Habit streak milestone", detail: "Evening reflection streak hit 9 days.", time: "3h ago", read: true, kind: "system" },
  { id: "n4", title: "Weekly review due", detail: "Your weekly review is scheduled for tonight at 20:00.", time: "5h ago", read: true, kind: "reminder" },
];

export const decisions: Decision[] = [
  { id: "d1", title: "Ship dashboard with mock data first, wire real data second", date: isoDaysAgo(0), status: "decided", rationale: "Faster path to a polished, testable UI; markdown parsing is a well-scoped follow-up." },
  { id: "d2", title: "Use quarterly OKRs instead of monthly for goal tracking", date: isoDaysAgo(12), status: "decided", rationale: "Monthly cadence created too much re-planning overhead relative to value." },
  { id: "d3", title: "Reconsider taxonomy for knowledge base", date: isoDaysAgo(15), status: "reconsidering", rationale: "Original tag structure doesn't scale past ~200 notes." },
];

/* ------------------------------------------------------------------ */
/* Derived: life score                                                 */
/* ------------------------------------------------------------------ */

export const lifeScoreBreakdown = [
  { label: "Career", score: 74, color: "var(--life-primary)" },
  { label: "Health", score: 61, color: "var(--life-success)" },
  { label: "Finances", score: 68, color: "var(--life-warning)" },
  { label: "Relationships", score: 71, color: "var(--life-accent)" },
  { label: "Growth", score: 82, color: "var(--life-primary)" },
];

export const lifeScore = Math.round(
  lifeScoreBreakdown.reduce((sum, c) => sum + c.score, 0) / lifeScoreBreakdown.length
);
