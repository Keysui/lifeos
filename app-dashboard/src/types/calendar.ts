export type EventCategory =
  | "focus"
  | "meeting"
  | "deadline"
  | "milestone"
  | "reminder"
  | "habit"
  | "appointment"
  | "study"
  | "work"
  | "fitness"
  | "personal";

export type EventStatus = "scheduled" | "in-progress" | "completed" | "canceled";

export type ReminderMethod = "desktop" | "email" | "push" | "location";

export interface EventReminder {
  id: string;
  offsetMinutes: number; // minutes before start
  method: ReminderMethod;
  firedAt?: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

export type RecurrenceFreq = "daily" | "weekly" | "monthly" | "yearly";

export interface RecurrenceRule {
  freq: RecurrenceFreq;
  interval: number; // every N freq units
  byWeekday?: number[]; // 0=Mon..6=Sun (rrule convention via helper)
  count?: number;
  until?: string; // ISO date
}

export const EVENT_CATEGORY_META: Record<
  EventCategory,
  { label: string; color: string }
> = {
  focus: { label: "Deep Work", color: "var(--life-primary)" },
  meeting: { label: "Meeting", color: "var(--life-accent)" },
  deadline: { label: "Deadline", color: "var(--life-danger)" },
  milestone: { label: "Milestone", color: "#a78bfa" },
  reminder: { label: "Reminder", color: "var(--life-warning)" },
  habit: { label: "Habit", color: "var(--life-success)" },
  appointment: { label: "Appointment", color: "#38bdf8" },
  study: { label: "Study", color: "#f472b6" },
  work: { label: "Work", color: "#818cf8" },
  fitness: { label: "Fitness", color: "#fb923c" },
  personal: { label: "Personal", color: "#94a3b8" },
};

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;

  start: string; // ISO datetime
  end: string; // ISO datetime
  allDay: boolean;

  category: EventCategory;
  priority: "P1" | "P2" | "P3";
  color?: string; // overrides category color if set
  icon?: string; // lucide icon name, optional override
  tags: string[];

  status: EventStatus;

  projectId?: string;
  goalId?: string;
  taskId?: string;
  habitId?: string;
  journalEntryId?: string;
  knowledgeNoteId?: string;
  financeCategory?: string;
  healthMetric?: string;

  recurrence?: RecurrenceRule;
  recurrenceId?: string; // groups generated instances back to their rule owner
  excludedDates?: string[]; // ISO dates removed from a recurring series

  reminders: EventReminder[];
  checklist: ChecklistItem[];
  attachments: string[];
  notes?: string;

  estimatedMinutes?: number;
  actualMinutes?: number;
  energyRequirement?: 1 | 2 | 3 | 4 | 5;
  focusLevel?: 1 | 2 | 3 | 4 | 5;

  metadata?: Record<string, string>;

  createdAt: string;
  updatedAt: string;
  archived?: boolean;
}

export type CalendarView = "day" | "3day" | "week" | "month" | "year" | "agenda" | "timeline";
