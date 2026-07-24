import type { AITaskType, ChatMessage, LifeOSContextPayload } from "@/types/ai";
import type { Habit, NutritionBreakdown, Priority, Project } from "@/types";
import type { InboxExtraction } from "@/types/inbox";
import { assertAIEnabled } from "@/store/ai-settings-store";

// The one place every module's AI-powered feature goes through: Module -> ModuleAI -> the
// existing /api/ai/chat endpoint -> AIService -> AIRouter -> KimiProvider -> Kimi API. No page
// or widget calls Kimi (or even /api/ai/chat) directly -- they call a typed function here.
// Adding a new module capability means adding one function to this file, not a new API surface.

async function callAI(
  messages: ChatMessage[],
  taskType: AITaskType,
  options?: { context?: LifeOSContextPayload; maxTokens?: number }
): Promise<string> {
  assertAIEnabled();
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      taskType,
      context: options?.context,
      maxTokens: options?.maxTokens,
      stream: false,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `AI request failed (${res.status})`);
  }

  const data = await res.json();
  return data.content as string;
}

/** Kimi doesn't always return clean JSON (markdown fences, stray prose) -- strip fences and
 *  fall back to a safe default rather than letting a parse failure crash the calling UI. */
function parseJsonLoose<T>(text: string, fallback: T): T {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "");
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------
// Inbox
// ---------------------------------------------------------------------

const INBOX_EXTRACTION_SCHEMA = `{
  "summary": string,
  "keyIdeas": string[],
  "actionItems": string[],
  "projectsMentioned": string[],
  "tasksMentioned": string[],
  "eventsMentioned": string[],
  "habitsMentioned": string[],
  "peopleMentioned": string[],
  "suggestions": [{ "type": "task" | "event" | "project" | "habit", "title": string, "detail"?: string, "priority"?: "P1" | "P2" | "P3" }]
}`;

export async function extractInboxNote(content: string): Promise<InboxExtraction> {
  const text = await callAI(
    [
      {
        role: "system",
        content:
          `Extract structured information from a raw inbox note (a captured thought, task, idea, or reminder). ` +
          `Return ONLY valid JSON matching this exact shape, no prose, no markdown fences:\n${INBOX_EXTRACTION_SCHEMA}\n\n` +
          `Only include a suggestion when the note clearly implies a concrete, actionable record should be created ` +
          `(e.g. "need dentist Tuesday" -> an event suggestion; "finish biology assignment" -> a project and/or task ` +
          `suggestion; "start eating more protein" -> a habit suggestion). Leave arrays empty rather than inventing ` +
          `content the note doesn't imply.`,
      },
      { role: "user", content },
    ],
    "extractInformation"
  );

  return parseJsonLoose<InboxExtraction>(text, {
    summary: text.slice(0, 280),
    keyIdeas: [],
    actionItems: [],
    projectsMentioned: [],
    tasksMentioned: [],
    eventsMentioned: [],
    habitsMentioned: [],
    peopleMentioned: [],
    suggestions: [],
  });
}

// ---------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------

export async function summarizeProjectStatus(project: Project): Promise<string> {
  return callAI(
    [
      {
        role: "system",
        content:
          "Write a concise 2-3 sentence status summary for this project: progress, momentum, and the single " +
          "biggest risk or blocker if any. No preamble, no restating the project name.",
      },
      {
        role: "user",
        content: JSON.stringify({
          name: project.name,
          status: project.status,
          progress: project.progress,
          deadline: project.deadline,
          nextAction: project.nextAction,
          blockers: project.blockers,
          milestones: project.milestones.map((m) => ({ title: m.title, done: m.done })),
        }),
      },
    ],
    "summarize"
  );
}

// ---------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------

export interface TaskEstimate {
  estimateMinutes: number;
  priority: Priority;
  reasoning?: string;
}

export async function estimateTask(title: string, notes?: string): Promise<TaskEstimate> {
  const text = await callAI(
    [
      {
        role: "system",
        content:
          'Estimate a task. Return ONLY JSON: { "estimateMinutes": number, "priority": "P1"|"P2"|"P3", "reasoning": string }. ' +
          "Base the time estimate on typical effort for a task like this; base priority on urgency/impact implied by the title.",
      },
      { role: "user", content: notes ? `${title}\n\nContext: ${notes}` : title },
    ],
    "analyze"
  );

  return parseJsonLoose<TaskEstimate>(text, { estimateMinutes: 30, priority: "P2" });
}

// ---------------------------------------------------------------------
// Habits
// ---------------------------------------------------------------------

export async function analyzeHabits(habits: Habit[]): Promise<string> {
  return callAI(
    [
      {
        role: "system",
        content:
          "Analyze consistency, completion rate, streaks, and patterns across these habits. Recommend one or two " +
          "concrete improvements. Keep it to a short paragraph, no headers or bullet lists.",
      },
      {
        role: "user",
        content: JSON.stringify(
          habits.map((h) => ({
            name: h.name,
            streak: h.streak,
            bestStreak: h.bestStreak,
            targetPerWeek: h.targetPerWeek,
            completionRate: Math.round((h.history.filter((d) => d.done).length / h.history.length) * 100),
          }))
        ),
      },
    ],
    "analyze"
  );
}

// ---------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------

export async function generateDailyBrief(context: LifeOSContextPayload): Promise<string> {
  return callAI(
    [{ role: "user", content: "Generate today's daily brief from the Life OS context provided." }],
    "plan",
    { context }
  );
}

// ---------------------------------------------------------------------
// Nutrition
// ---------------------------------------------------------------------

export async function calculateNutrition(mealDescription: string): Promise<NutritionBreakdown> {
  const text = await callAI(
    [
      {
        role: "system",
        content:
          'Estimate the nutritional content of this meal or food description. Return ONLY JSON: ' +
          '{ "calories": number, "proteinG": number, "carbsG": number, "fatG": number, "fiberG"?: number, ' +
          '"sugarG"?: number, "sodiumMg"?: number, "micronutrients"?: {"name": "amount"}, "notes"?: string }. ' +
          'Use reasonable typical values for the portion described; note assumptions briefly in "notes" if the ' +
          "portion size is ambiguous.",
      },
      { role: "user", content: mealDescription },
    ],
    "extractInformation"
  );

  return parseJsonLoose<NutritionBreakdown>(text, {
    calories: 0,
    proteinG: 0,
    carbsG: 0,
    fatG: 0,
    notes: "Could not parse a nutrition estimate for this entry.",
  });
}
