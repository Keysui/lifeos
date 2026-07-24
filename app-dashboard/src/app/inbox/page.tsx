"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Inbox as InboxIcon,
  Sparkles,
  Loader2,
  AlertTriangle,
  Check,
  X,
  ListTodo,
  CalendarPlus,
  FolderKanban,
  Flame,
  Users,
  Lightbulb,
} from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/shared/badges";
import { useInboxStore } from "@/store/inbox-store";
import { useTasksStore } from "@/store/tasks-store";
import { useCalendarStore } from "@/store/calendar-store";
import { useProjectsStore } from "@/store/projects-store";
import { useHabitsStore } from "@/store/habits-store";
import { parseQuickAdd } from "@/lib/calendar/quick-add";
import type { InboxNote, InboxSuggestion } from "@/types/inbox";

const SUGGESTION_META: Record<InboxSuggestion["type"], { icon: React.ElementType; label: string }> = {
  task: { icon: ListTodo, label: "Create task" },
  event: { icon: CalendarPlus, label: "Create event" },
  project: { icon: FolderKanban, label: "Create project" },
  habit: { icon: Flame, label: "Create habit" },
};

export default function InboxPage() {
  const notes = useInboxStore((s) => s.notes);
  const addNote = useInboxStore((s) => s.addNote);
  const resolveSuggestion = useInboxStore((s) => s.resolveSuggestion);
  const addTask = useTasksStore((s) => s.addTask);
  const addEvent = useCalendarStore((s) => s.addEvent);
  const addProject = useProjectsStore((s) => s.addProject);
  const addHabit = useHabitsStore((s) => s.addHabit);

  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setSubmitting(true);
    setContent("");
    setTagsInput("");
    await addNote(trimmed, tags);
    setSubmitting(false);
  }

  function createFromSuggestion(note: InboxNote, suggestion: InboxSuggestion, index: number) {
    switch (suggestion.type) {
      case "task":
        addTask({
          id: crypto.randomUUID(),
          title: suggestion.title,
          priority: suggestion.priority ?? "P2",
          status: "todo",
          estimateMinutes: 30,
          difficulty: 3,
          tags: ["inbox"],
        });
        break;
      case "event": {
        const parsed = parseQuickAdd(`${suggestion.title} ${suggestion.detail ?? ""}`.trim());
        if (parsed) {
          addEvent({
            title: parsed.title || suggestion.title,
            start: parsed.start.toISOString(),
            end: parsed.end.toISOString(),
            allDay: parsed.allDay,
            category: parsed.category,
            priority: suggestion.priority ?? "P2",
            recurrence: parsed.recurrence,
          });
        }
        break;
      }
      case "project":
        addProject({ name: suggestion.title, nextAction: suggestion.detail });
        break;
      case "habit":
        addHabit({ name: suggestion.title });
        break;
    }
    resolveSuggestion(note.id, index);
  }

  return (
    <div className="max-w-3xl">
      <SectionHeader
        eyebrow="Inbox"
        title="Capture"
        description="Everything starts here — Kimi reads it, summarizes it, and suggests what to do with it."
      />

      <GlassCard glow="primary" className="mb-6 flex flex-col gap-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Capture anything — a thought, a task, an idea, a reminder…"
          className="min-h-24 resize-none border-white/[0.08] bg-white/[0.03] text-sm"
        />
        <div className="flex items-center gap-2">
          <Input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (comma separated, optional)"
            className="border-white/[0.08] bg-white/[0.03] text-xs"
          />
          <Button
            onClick={submit}
            disabled={!content.trim() || submitting}
            className="shrink-0 bg-[var(--life-primary)] px-4 text-[#04141a] hover:bg-[var(--life-primary)]/90"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <InboxIcon className="h-4 w-4" />}
            Capture
          </Button>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-4">
        <AnimatePresence initial={false}>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <NoteCard note={note} onResolveSuggestion={(i, s) => createFromSuggestion(note, s, i)} onDismiss={(i) => resolveSuggestion(note.id, i)} />
            </motion.div>
          ))}
        </AnimatePresence>

        {notes.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/[0.08] px-4 py-8 text-center text-sm text-muted-foreground">
            Nothing captured yet. Whatever you type above is never deleted or edited — only the AI analysis below it can change.
          </div>
        )}
      </div>
    </div>
  );
}

function NoteCard({
  note,
  onResolveSuggestion,
  onDismiss,
}: {
  note: InboxNote;
  onResolveSuggestion: (index: number, suggestion: InboxSuggestion) => void;
  onDismiss: (index: number) => void;
}) {
  const pendingSuggestions = (note.extraction?.suggestions ?? [])
    .map((s, i) => ({ s, i }))
    .filter(({ i }) => !note.resolvedSuggestionIndexes.includes(i));

  return (
    <GlassCard interactive={false} className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm text-foreground/90">{note.content}</p>
        <span className="shrink-0 text-[10px] text-muted-foreground">
          {new Date(note.createdAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span key={tag} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted-foreground">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {note.extractionStatus === "processing" && (
        <div className="flex items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Kimi is analyzing this note…
        </div>
      )}

      {note.extractionStatus === "error" && (
        <div className="flex items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-[var(--life-danger)]">
          <AlertTriangle className="h-3.5 w-3.5" /> Couldn&rsquo;t analyze this note: {note.extractionError}
        </div>
      )}

      {note.extractionStatus === "done" && note.extraction && (
        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-3">
          <p className="flex items-start gap-1.5 text-xs text-foreground/80">
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[var(--life-accent)]" />
            {note.extraction.summary}
          </p>

          <ExtractionRow icon={Lightbulb} label="Key ideas" items={note.extraction.keyIdeas} />
          <ExtractionRow icon={Check} label="Action items" items={note.extraction.actionItems} />
          <ExtractionRow icon={Users} label="People" items={note.extraction.peopleMentioned} />

          {pendingSuggestions.length > 0 && (
            <div className="flex flex-col gap-2">
              {pendingSuggestions.map(({ s, i }) => {
                const meta = SUGGESTION_META[s.type];
                const Icon = meta.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 rounded-lg border border-[var(--life-accent)]/20 bg-[var(--life-accent)]/[0.06] px-3 py-2"
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0 text-[var(--life-accent)]" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs text-foreground/90">{s.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {meta.label}
                        {s.detail ? ` · ${s.detail}` : ""}
                      </div>
                    </div>
                    {s.priority && <PriorityBadge priority={s.priority} />}
                    <Button size="icon-sm" variant="ghost" className="shrink-0 text-[var(--life-success)]" onClick={() => onResolveSuggestion(i, s)} title="Confirm">
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon-sm" variant="ghost" className="shrink-0 text-muted-foreground" onClick={() => onDismiss(i)} title="Dismiss">
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}

function ExtractionRow({ icon: Icon, label, items }: { icon: React.ElementType; label: string; items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
      <Icon className="mt-0.5 h-3 w-3 shrink-0" />
      <span>
        <span className="text-foreground/70">{label}: </span>
        {items.join(" · ")}
      </span>
    </div>
  );
}
