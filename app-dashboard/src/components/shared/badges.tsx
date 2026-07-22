import { cn } from "@/lib/utils";
import type { Priority, Status } from "@/types";

const priorityStyles: Record<Priority, string> = {
  P1: "bg-[var(--life-danger)]/15 text-[var(--life-danger)] border-[var(--life-danger)]/25",
  P2: "bg-[var(--life-warning)]/15 text-[var(--life-warning)] border-[var(--life-warning)]/25",
  P3: "bg-white/[0.06] text-muted-foreground border-white/[0.1]",
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", priorityStyles[priority])}>
      {priority}
    </span>
  );
}

const statusStyles: Record<Status, { label: string; className: string }> = {
  todo: { label: "To do", className: "bg-white/[0.06] text-muted-foreground border-white/[0.1]" },
  "in-progress": { label: "In progress", className: "bg-[var(--life-primary)]/15 text-[var(--life-primary)] border-[var(--life-primary)]/25" },
  blocked: { label: "Blocked", className: "bg-[var(--life-danger)]/15 text-[var(--life-danger)] border-[var(--life-danger)]/25" },
  done: { label: "Done", className: "bg-[var(--life-success)]/15 text-[var(--life-success)] border-[var(--life-success)]/25" },
};

export function StatusBadge({ status }: { status: Status }) {
  const s = statusStyles[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium", s.className)}>
      {s.label}
    </span>
  );
}
