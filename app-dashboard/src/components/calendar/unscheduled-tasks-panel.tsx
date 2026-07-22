"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { PriorityBadge } from "@/components/shared/badges";
import { useTasksStore } from "@/store/tasks-store";
import { useCalendarStore } from "@/store/calendar-store";
import { GripVertical } from "lucide-react";

export function UnscheduledTasksPanel() {
  const tasks = useTasksStore((s) => s.tasks);
  const events = useCalendarStore((s) => s.events);

  const scheduledTaskIds = new Set(events.filter((e) => e.taskId).map((e) => e.taskId));
  const unscheduled = tasks.filter((t) => t.status !== "done" && t.status !== "blocked" && !scheduledTaskIds.has(t.id));

  return (
    <GlassCard className="flex h-full flex-col">
      <h3 className="mb-1 text-sm font-semibold text-foreground">Unscheduled Tasks</h3>
      <p className="mb-3 text-[11px] text-muted-foreground">Drag onto the calendar to schedule.</p>
      <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto">
        {unscheduled.map((task) => (
          <div
            key={task.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/task-id", task.id);
              e.dataTransfer.effectAllowed = "move";
            }}
            className="flex cursor-grab items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-2 text-xs active:cursor-grabbing"
          >
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate text-foreground/90">{task.title}</span>
            <PriorityBadge priority={task.priority} />
          </div>
        ))}
        {unscheduled.length === 0 && <p className="text-xs text-muted-foreground">Everything&rsquo;s on the calendar.</p>}
      </div>
    </GlassCard>
  );
}
