"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Inbox, Sparkles, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { PanelHeader } from "@/components/shared/panel-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useClock } from "@/lib/use-clock";
import { useProfileStore } from "@/store/profile-store";
import { useInboxStore } from "@/store/inbox-store";
import { buildLifeOSContext } from "@/ai/context/LifeOSContext";
import { generateDailyBrief } from "@/ai/services/ModuleAI";
import { useCachedAIResult } from "@/ai/hooks/useCachedAIResult";

function greeting(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function SessionBanner() {
  const now = useClock();
  const name = useProfileStore((s) => s.name);
  const notes = useInboxStore((s) => s.notes);
  const addNote = useInboxStore((s) => s.addNote);
  const [value, setValue] = useState("");

  const hour = now?.getHours() ?? 12;
  const time = now
    ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false })
    : "--:--";
  const date = now
    ? now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" }).toUpperCase()
    : "";
  const todayISO = now ? now.toISOString().slice(0, 10) : "";
  const { result: brief, state: briefState } = useCachedAIResult({
    entityType: "daily_brief",
    entityId: todayISO,
    kind: "brief",
    sourceContent: JSON.stringify(buildLifeOSContext()),
    generate: () => generateDailyBrief(buildLifeOSContext()),
    enabled: Boolean(todayISO),
  });

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue("");
    void addNote(trimmed);
  }

  return (
    <GlassCard interactive={false} className="flex h-full flex-col">
      <PanelHeader index={2} label="Session" status={<span className="hud-label">{date}</span>} />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          {greeting(hour)}, <span className="text-glow-primary text-[var(--life-primary)]">{name.split(" ")[0] || "there"}</span>.
        </h1>
        <div className="font-mono text-2xl font-medium tabular-nums text-foreground/90 sm:text-3xl">{time}</div>
      </div>

      {briefState === "loading" && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" /> Kimi is preparing your daily brief…
        </div>
      )}
      {briefState === "done" && brief && (
        <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-foreground/80">
          <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[var(--life-accent)]" />
          {brief}
        </p>
      )}

      <div className="mt-4 flex gap-2">
        <div className="relative flex-1">
          <Inbox className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Capture a thought…"
            className="h-9 border-white/[0.08] bg-white/[0.03] pl-9 text-sm"
          />
        </div>
        <Button onClick={submit} className="h-9 gap-1.5 bg-[var(--life-primary)] px-3 text-[#041a17] hover:bg-[var(--life-primary)]/90">
          Capture <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-2 flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {notes.slice(0, 3).map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="truncate rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-muted-foreground"
            >
              {note.content} <span className="text-[10px] text-muted-foreground/60">→ inbox</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
