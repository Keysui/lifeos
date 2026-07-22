"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CalendarPlus } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { PriorityBadge } from "@/components/shared/badges";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useTasksStore } from "@/store/tasks-store";
import { useCalendarStore } from "@/store/calendar-store";
import { getEventsOnDay, findFreeSlots } from "@/lib/calendar/selectors";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

export function PrioritiesPanel() {
  const tasks = useTasksStore((s) => s.tasks);
  const toggleDone = useTasksStore((s) => s.toggleDone);
  const events = useCalendarStore((s) => s.events);
  const scheduleTask = useCalendarStore((s) => s.scheduleTask);

  const open = tasks.filter((t) => t.status !== "done" && t.status !== "blocked");
  const sorted = [...open].sort((a, b) => a.priority.localeCompare(b.priority)).slice(0, 5);

  function scheduleNow(taskId: string, title: string, minutes: number) {
    const slots = findFreeSlots(getEventsOnDay(events, ANCHOR_DATE), ANCHOR_DATE, minutes);
    const start = slots[0]?.start ?? new Date(ANCHOR_DATE.getTime() + 60 * 60000);
    const end = new Date(start.getTime() + minutes * 60000);
    scheduleTask(taskId, title, start, end, { priority: "P2" });
  }

  return (
    <Panel
      index={3}
      label="Priorities"
      deepHref="/tasks"
      status={<span className="hud-label">{tasks.filter((t) => t.status === "done").length}/{tasks.length}</span>}
    >
      <div className="flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {sorted.map((task) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn("flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 py-2")}
            >
              <Checkbox checked={false} onCheckedChange={() => toggleDone(task.id)} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-foreground/90">{task.title}</div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">
                  {task.estimateMinutes}m{task.deadline ? ` · Due ${task.deadline}` : ""}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground hover:text-[var(--life-primary)]"
                onClick={() => scheduleNow(task.id, task.title, task.estimateMinutes)}
                title="Schedule on calendar"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
              </Button>
              <PriorityBadge priority={task.priority} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </Panel>
  );
}
