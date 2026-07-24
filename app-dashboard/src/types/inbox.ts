import type { Priority } from "./index";

export type InboxSuggestionType = "task" | "event" | "project" | "habit";

export interface InboxSuggestion {
  type: InboxSuggestionType;
  title: string;
  detail?: string; // e.g. a proposed date/time for an event, or a note for a task
  priority?: Priority;
}

export interface InboxExtraction {
  summary: string;
  keyIdeas: string[];
  actionItems: string[];
  projectsMentioned: string[];
  tasksMentioned: string[];
  eventsMentioned: string[];
  habitsMentioned: string[];
  peopleMentioned: string[];
  suggestions: InboxSuggestion[];
}

export interface InboxNote {
  id: string;
  content: string; // original capture, never modified or deleted
  tags: string[];
  createdAt: string; // ISO

  extraction?: InboxExtraction;
  extractionStatus: "pending" | "processing" | "done" | "error";
  extractionError?: string;

  /** Suggestions the user has already acted on (created or dismissed), by index into extraction.suggestions. */
  resolvedSuggestionIndexes: number[];
}
