"use client";

import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/shared/section-header";
import { JournalTimeline, type JournalItem } from "@/components/widgets/journal-timeline";
import { QuickCapture } from "@/components/widgets/quick-capture";
import { Button } from "@/components/ui/button";
import { journalEntries } from "@/lib/mock/data";
import { useInboxStore } from "@/store/inbox-store";
import { useProjectsStore } from "@/store/projects-store";
import { cn } from "@/lib/utils";

type Period = "all" | "today" | "week" | "month";

const PERIODS: { id: Period; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
];

function withinPeriod(dateISO: string, period: Period): boolean {
  if (period === "all") return true;
  const date = new Date(dateISO);
  const now = new Date();
  const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
  if (period === "today") return date.toDateString() === now.toDateString();
  if (period === "week") return diffDays >= 0 && diffDays <= 7;
  if (period === "month") return diffDays >= 0 && diffDays <= 31;
  return true;
}

export default function JournalPage() {
  const inboxNotes = useInboxStore((s) => s.notes);
  const projects = useProjectsStore((s) => s.projects);
  const [period, setPeriod] = useState<Period>("all");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const items = useMemo<JournalItem[]>(() => {
    const fromJournal: JournalItem[] = journalEntries.map((e) => ({
      id: e.id,
      date: e.date,
      title: e.title,
      excerpt: e.excerpt,
      tags: e.tags,
      mood: e.mood,
      source: "journal",
    }));

    const fromInbox: JournalItem[] = inboxNotes.map((n) => ({
      id: n.id,
      date: n.createdAt.slice(0, 10),
      title: n.extraction?.summary?.split(".")[0] || n.content.slice(0, 60),
      excerpt: n.extraction?.summary ?? n.content,
      tags: n.tags,
      source: "inbox",
    }));

    return [...fromJournal, ...fromInbox].sort((a, b) => b.date.localeCompare(a.date));
  }, [inboxNotes]);

  const allTags = useMemo(() => Array.from(new Set(items.flatMap((i) => i.tags))).sort(), [items]);

  const mentionedProjectNames = useMemo(() => {
    if (!activeProjectId) return null;
    const project = projects.find((p) => p.id === activeProjectId);
    return project?.name ?? null;
  }, [activeProjectId, projects]);

  const filtered = items.filter((item) => {
    if (!withinPeriod(item.date, period)) return false;
    if (activeTag && !item.tags.includes(activeTag)) return false;
    if (mentionedProjectNames && !`${item.title} ${item.excerpt}`.toLowerCase().includes(mentionedProjectNames.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <SectionHeader eyebrow="Journal" title="Reflections" description="A running record of how things actually went — including everything captured to Inbox." />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] p-1">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs transition",
                period === p.id ? "bg-[var(--life-primary)] text-[#04141a]" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {projects.length > 0 && (
          <select
            value={activeProjectId ?? ""}
            onChange={(e) => setActiveProjectId(e.target.value || null)}
            className="h-7 rounded-md border border-white/[0.08] bg-white/[0.03] px-2 text-xs text-foreground outline-none"
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        )}

        {allTags.map((tag) => (
          <Button
            key={tag}
            size="sm"
            variant={activeTag === tag ? "default" : "outline"}
            className={cn("h-7 text-[11px]", activeTag === tag && "bg-[var(--life-primary)] text-[#04141a] hover:bg-[var(--life-primary)]/90")}
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          >
            #{tag}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <JournalTimeline items={filtered} />
        </div>
        <QuickCapture />
      </div>
    </div>
  );
}
