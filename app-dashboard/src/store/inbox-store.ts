import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { InboxNote } from "@/types/inbox";
import { extractInboxNote } from "@/ai/services/ModuleAI";
import { getSupabaseClient } from "@/lib/supabase/client";

interface InboxState {
  notes: InboxNote[];
  /** Captures a note immediately (always works, local-first), then runs AI extraction in the
   *  background and write-through-persists to Supabase if it's configured. */
  addNote: (content: string, tags?: string[]) => Promise<void>;
  resolveSuggestion: (noteId: string, suggestionIndex: number) => void;
}

export const useInboxStore = create<InboxState>()(
  persist(
    (set) => ({
      notes: [],

      addNote: async (content, tags = []) => {
        const note: InboxNote = {
          id: crypto.randomUUID(),
          content,
          tags,
          createdAt: new Date().toISOString(),
          extractionStatus: "processing",
          resolvedSuggestionIndexes: [],
        };
        set((s) => ({ notes: [note, ...s.notes] }));

        const supabase = getSupabaseClient();
        if (supabase) {
          void supabase
            .from("inbox_notes")
            .insert({ id: note.id, content: note.content, tags: note.tags, created_at: note.createdAt });
        }

        try {
          const extraction = await extractInboxNote(content);
          set((s) => ({
            notes: s.notes.map((n) => (n.id === note.id ? { ...n, extraction, extractionStatus: "done" } : n)),
          }));
          if (supabase) {
            void supabase
              .from("inbox_notes")
              .update({
                ai_summary: extraction.summary,
                ai_key_ideas: extraction.keyIdeas,
                ai_action_items: extraction.actionItems,
                ai_projects_mentioned: extraction.projectsMentioned,
                ai_tasks_mentioned: extraction.tasksMentioned,
                ai_events_mentioned: extraction.eventsMentioned,
                ai_habits_mentioned: extraction.habitsMentioned,
                ai_people_mentioned: extraction.peopleMentioned,
                ai_suggestions: extraction.suggestions,
                ai_processed_at: new Date().toISOString(),
              })
              .eq("id", note.id);
          }
        } catch (err) {
          set((s) => ({
            notes: s.notes.map((n) =>
              n.id === note.id
                ? { ...n, extractionStatus: "error", extractionError: err instanceof Error ? err.message : "Extraction failed" }
                : n
            ),
          }));
        }
      },

      resolveSuggestion: (noteId, suggestionIndex) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === noteId
              ? { ...n, resolvedSuggestionIndexes: [...n.resolvedSuggestionIndexes, suggestionIndex] }
              : n
          ),
        })),
    }),
    { name: "life-os-inbox" }
  )
);
