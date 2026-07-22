"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/shared/badges";
import { useProjectsStore } from "@/store/projects-store";

export function ProjectProgressList({ limit }: { limit?: number }) {
  const projects = useProjectsStore((s) => s.projects);
  const list = (limit ? projects.slice(0, limit) : projects).filter((p) => p.status !== "done");

  return (
    <GlassCard className="h-full">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Project Progress</h3>
      <div className="flex flex-col gap-4">
        {list.map((p) => (
          <div key={p.id}>
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="truncate text-sm text-foreground/90">{p.name}</span>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge status={p.status} />
                <span className="w-9 text-right text-xs tabular-nums text-muted-foreground">{p.progress}%</span>
              </div>
            </div>
            <Progress value={p.progress} className="h-1.5" />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
