"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { KanbanBoard } from "@/components/widgets/kanban-board";
import { ProjectMilestones } from "@/components/widgets/project-milestones";

export default function ProjectsPage() {
  return (
    <div>
      <SectionHeader
        eyebrow="Projects"
        title="Project Board"
        description="Drag cards between columns to update status."
      />

      <div className="mb-8">
        <KanbanBoard />
      </div>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
        Milestones &amp; Next Actions
      </h2>
      <ProjectMilestones />
    </div>
  );
}
