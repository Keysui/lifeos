"use client";

import { ListTodo, Zap, Lock, AlarmClockOff } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { StatTile } from "@/components/widgets/stat-tile";
import { TaskList } from "@/components/widgets/task-list";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { useTasksStore } from "@/store/tasks-store";

export default function TasksPage() {
  const tasks = useTasksStore((s) => s.tasks);
  const today = ANCHOR_DATE.toISOString().slice(0, 10);
  const overdue = tasks.filter((t) => t.deadline && t.deadline < today && t.status !== "done").length;
  const quickWins = tasks.filter((t) => t.tags?.includes("quick-win") && t.status !== "done").length;
  const blocked = tasks.filter((t) => t.status === "blocked").length;

  return (
    <div>
      <SectionHeader eyebrow="Tasks" title="All Tasks" description="Every task, every project, one list." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={ListTodo} label="Open tasks" value={`${tasks.filter((t) => t.status !== "done").length}`} accent="primary" />
        <StatTile icon={Zap} label="Quick wins" value={`${quickWins}`} accent="success" />
        <StatTile icon={Lock} label="Blocked" value={`${blocked}`} accent="danger" />
        <StatTile icon={AlarmClockOff} label="Overdue" value={`${overdue}`} accent="warning" />
      </div>

      <TaskList title="All Tasks" />
    </div>
  );
}
