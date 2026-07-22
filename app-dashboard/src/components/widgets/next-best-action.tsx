"use client";

import { ArrowRight, Zap } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { PriorityBadge } from "@/components/shared/badges";
import { useTasksStore } from "@/store/tasks-store";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui-store";

export function NextBestAction() {
  const setFocus = useUIStore((s) => s.setCurrentFocusTaskId);
  const tasks = useTasksStore((s) => s.tasks);
  const candidate = tasks
    .filter((t) => t.status === "todo" || t.status === "in-progress")
    .sort((a, b) => (a.priority > b.priority ? 1 : -1) || b.difficulty - a.difficulty)[0];

  if (!candidate) return null;

  return (
    <GlassCard glow="primary" className="flex flex-col justify-between">
      <div>
        <div className="mb-3 flex items-center gap-2 text-[var(--life-primary)]">
          <Zap className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-widest">Next Best Action</span>
        </div>
        <div className="mb-1 flex items-center gap-2">
          <PriorityBadge priority={candidate.priority} />
          <span className="text-[11px] text-muted-foreground">{candidate.estimateMinutes}m &middot; difficulty {candidate.difficulty}/5</span>
        </div>
        <p className="text-base font-medium leading-snug text-foreground">{candidate.title}</p>
      </div>
      <Button
        onClick={() => setFocus(candidate.id)}
        className="mt-4 w-full justify-between bg-[var(--life-primary)] text-[#04141a] hover:bg-[var(--life-primary)]/90"
      >
        Set as current focus
        <ArrowRight className="h-4 w-4" />
      </Button>
    </GlassCard>
  );
}
