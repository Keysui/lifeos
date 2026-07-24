export type Priority = "P1" | "P2" | "P3";
export type Status = "todo" | "in-progress" | "blocked" | "done";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  estimateMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  deadline?: string; // ISO date
  dependsOn?: string[];
  projectId?: string;
  goalId?: string;
  tags?: string[];
}

export interface ScheduleBlock {
  id: string;
  title: string;
  start: string; // "09:00"
  end: string; // "10:00"
  kind: "focus" | "meeting" | "habit" | "break" | "admin";
  linkedTaskId?: string;
}

export interface Project {
  id: string;
  name: string;
  area: string;
  status: Status;
  progress: number; // 0-100
  goalId?: string;
  deadline?: string;
  milestones: { id: string; title: string; done: boolean; date?: string }[];
  nextAction?: string;
  blockers?: string[];
}

export interface Goal {
  id: string;
  title: string;
  horizon: "life" | "10-year" | "3-year" | "annual" | "quarterly" | "monthly";
  progress: number;
  forecastCompletion?: string;
  parentId?: string;
  area: string;
}

export interface HabitSubtask {
  id: string;
  label: string;
  done: boolean;
}

export interface Habit {
  id: string;
  name: string;
  area: string;
  targetPerWeek: number;
  streak: number;
  bestStreak: number;
  history: { date: string; done: boolean }[]; // last 84 days
  /** When present, today's completion is derived: all subtasks done -> habit done. */
  subtasks?: HabitSubtask[];
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  excerpt: string;
  mood: number; // 1-5
  tags: string[];
}

export interface Insight {
  id: string;
  kind: "pattern" | "warning" | "correlation" | "conflict" | "encouragement";
  message: string;
  confidence: number; // 0-1
  relatedArea?: string;
}

export interface HealthMetric {
  date: string;
  sleepHours: number;
  energy: number; // 1-10
  mood: number; // 1-10
  steps: number;
  workoutMinutes: number;
}

export interface NutritionBreakdown {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
  sugarG?: number;
  sodiumMg?: number;
  micronutrients?: Record<string, string>; // e.g. { "Vitamin C": "40mg", "Iron": "2mg" }
  notes?: string; // e.g. a brief recommendation
}

export interface FinanceSnapshot {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  netWorth: number;
}

export interface KnowledgeNode {
  id: string;
  title: string;
  area: string;
  connections: string[];
  updatedAt: string;
}

export interface TimeAllocationSlice {
  category: string;
  hours: number;
  color: string;
}

export interface DeepWorkPoint {
  day: string;
  deepWorkHours: number;
  shallowWorkHours: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  kind: "ai" | "system" | "reminder";
}

export interface Decision {
  id: string;
  title: string;
  date: string;
  status: "decided" | "reconsidering";
  rationale: string;
}
