"use client";

import { CheckCircle2, Circle, AlertOctagon, Activity, Sparkles, Loader2 } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { ProgressRing } from "@/components/shared/progress-ring";
import { useProjectsStore } from "@/store/projects-store";
import { useActivityStore } from "@/store/activity-store";
import { useCachedAIResult } from "@/ai/hooks/useCachedAIResult";
import { summarizeProjectStatus } from "@/ai/services/ModuleAI";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

function AIStatusSummary({ project }: { project: Project }) {
  const sourceContent = JSON.stringify({
    status: project.status,
    progress: project.progress,
    blockers: project.blockers,
    nextAction: project.nextAction,
    milestones: project.milestones.map((m) => ({ title: m.title, done: m.done })),
  });

  const { result, state } = useCachedAIResult({
    entityType: "project",
    entityId: project.id,
    kind: "status_summary",
    sourceContent,
    generate: () => summarizeProjectStatus(project),
  });

  if (state === "loading") {
    return (
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" /> Kimi is summarizing…
      </div>
    );
  }
  if (state === "error" || !result) return null;

  return (
    <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-foreground/75">
      <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-[var(--life-accent)]" />
      {result}
    </p>
  );
}

export function ProjectMilestones() {
  const projects = useProjectsStore((s) => s.projects);
  const activity = useActivityStore((s) => s.entries);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {projects
        .filter((p) => p.status !== "done")
        .map((p) => {
          const recent = activity.filter((a) => a.projectId === p.id).slice(0, 3);
          return (
            <GlassCard key={p.id} className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <ProgressRing value={p.progress} size={56} strokeWidth={5} />
                <div className="min-w-0">
                  <h4 className="truncate text-sm font-semibold text-foreground">{p.name}</h4>
                  <p className="text-xs text-muted-foreground">{p.area}{p.deadline ? ` · Due ${p.deadline}` : ""}</p>
                </div>
              </div>

              <AIStatusSummary project={p} />

              {p.blockers && p.blockers.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-[var(--life-danger)]/25 bg-[var(--life-danger)]/[0.08] px-3 py-2 text-xs text-[var(--life-danger)]">
                  <AlertOctagon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {p.blockers[0]}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                {p.milestones.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-xs">
                    {m.done ? (
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[var(--life-success)]" />
                    ) : (
                      <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    )}
                    <span className={cn("truncate", m.done ? "text-muted-foreground line-through" : "text-foreground/85")}>
                      {m.title}
                    </span>
                    {m.date && <span className="ml-auto shrink-0 text-[10px] text-muted-foreground">{m.date}</span>}
                  </div>
                ))}
              </div>

              {p.nextAction && (
                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs">
                  <span className="text-muted-foreground">Next action: </span>
                  <span className="text-foreground/85">{p.nextAction}</span>
                </div>
              )}

              {recent.length > 0 && (
                <div className="flex flex-col gap-1 border-t border-white/[0.06] pt-3">
                  <span className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                    <Activity className="h-3 w-3" /> Recent activity
                  </span>
                  {recent.map((a) => (
                    <p key={a.id} className="text-[11px] text-muted-foreground">
                      {a.message}
                    </p>
                  ))}
                </div>
              )}
            </GlassCard>
          );
        })}
    </div>
  );
}
