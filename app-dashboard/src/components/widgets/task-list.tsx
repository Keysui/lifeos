"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { PriorityBadge, StatusBadge } from "@/components/shared/badges";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTasksStore } from "@/store/tasks-store";
import { useProjectsStore } from "@/store/projects-store";
import { useCalendarStore } from "@/store/calendar-store";
import { getEventsOnDay, findFreeSlots } from "@/lib/calendar/selectors";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { Lock, CalendarPlus } from "lucide-react";

export function TaskList({ title = "Tasks", filterIds }: { title?: string; filterIds?: string[] }) {
  const allTasks = useTasksStore((s) => s.tasks);
  const toggleDone = useTasksStore((s) => s.toggleDone);
  const projects = useProjectsStore((s) => s.projects);
  const events = useCalendarStore((s) => s.events);
  const scheduleTask = useCalendarStore((s) => s.scheduleTask);

  const tasks = filterIds ? allTasks.filter((t) => filterIds.includes(t.id)) : allTasks;

  const sorted = [...tasks].sort((a, b) => {
    if (a.status === "done" && b.status !== "done") return 1;
    if (b.status === "done" && a.status !== "done") return -1;
    return a.priority.localeCompare(b.priority);
  });

  function scheduleNow(taskId: string, title: string, minutes: number) {
    const slots = findFreeSlots(getEventsOnDay(events, ANCHOR_DATE), ANCHOR_DATE, minutes);
    const start = slots[0]?.start ?? new Date(ANCHOR_DATE.getTime() + 60 * 60000);
    const end = new Date(start.getTime() + minutes * 60000);
    scheduleTask(taskId, title, start, end, { priority: "P2" });
  }

  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="text-[11px] text-muted-foreground">
          {tasks.filter((t) => t.status === "done").length}/{tasks.length} done
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {sorted.map((task) => {
            const project = projects.find((p) => p.id === task.projectId);
            const blocked = task.status === "blocked";
            return (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={cn(
                  "flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 transition",
                  task.status === "done" && "opacity-50"
                )}
              >
                {blocked ? (
                  <Lock className="h-4 w-4 shrink-0 text-[var(--life-danger)]" />
                ) : (
                  <Checkbox checked={task.status === "done"} onCheckedChange={() => toggleDone(task.id)} className="shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <div className={cn("truncate text-sm text-foreground/90", task.status === "done" && "line-through")}>
                    {task.title}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
                    {project && <span>{project.name}</span>}
                    <span>{task.estimateMinutes}m</span>
                    {task.deadline && <span>Due {task.deadline}</span>}
                  </div>
                </div>
                {task.status !== "done" && !blocked && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 text-muted-foreground hover:text-[var(--life-primary)]"
                    onClick={() => scheduleNow(task.id, task.title, task.estimateMinutes)}
                    title="Schedule on calendar"
                  >
                    <CalendarPlus className="h-3.5 w-3.5" />
                  </Button>
                )}
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
