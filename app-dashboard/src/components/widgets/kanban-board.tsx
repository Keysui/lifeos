"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { useProjectsStore } from "@/store/projects-store";
import type { Status } from "@/types";
import { cn } from "@/lib/utils";

const columns: { key: Status; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "text-muted-foreground" },
  { key: "in-progress", label: "In Progress", color: "text-[var(--life-primary)]" },
  { key: "blocked", label: "Blocked", color: "text-[var(--life-danger)]" },
  { key: "done", label: "Done", color: "text-[var(--life-success)]" },
];

export function KanbanBoard() {
  const projects = useProjectsStore((s) => s.projects);
  const setStatus = useProjectsStore((s) => s.setStatus);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<Status | null>(null);

  function drop(status: Status) {
    if (!dragId) return;
    setStatus(dragId, status);
    setDragId(null);
    setOverCol(null);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {columns.map((col) => {
        const items = projects.filter((p) => p.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => {
              e.preventDefault();
              setOverCol(col.key);
            }}
            onDragLeave={() => setOverCol((c) => (c === col.key ? null : c))}
            onDrop={() => drop(col.key)}
            className={cn(
              "flex min-h-[240px] flex-col gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.015] p-3 transition-colors",
              overCol === col.key && "border-[var(--life-primary)]/40 bg-[var(--life-primary)]/[0.04]"
            )}
          >
            <div className="flex items-center justify-between px-1">
              <span className={cn("text-xs font-semibold uppercase tracking-widest", col.color)}>{col.label}</span>
              <span className="text-[11px] text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex flex-col gap-2.5">
              {items.map((p) => (
                <motion.div
                  layout
                  key={p.id}
                  draggable
                  onDragStart={() => setDragId(p.id)}
                  onDragEnd={() => setDragId(null)}
                  whileHover={{ y: -2 }}
                  className={cn(
                    "cursor-grab rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 active:cursor-grabbing",
                    dragId === p.id && "opacity-40"
                  )}
                >
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-foreground/90">{p.name}</span>
                    <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {p.area}
                    </span>
                  </div>
                  <Progress value={p.progress} className="mb-2 h-1" />
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{p.progress}%</span>
                    {p.deadline && <span>Due {p.deadline}</span>}
                  </div>
                </motion.div>
              ))}
              {items.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/[0.08] py-6 text-center text-[11px] text-muted-foreground">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
