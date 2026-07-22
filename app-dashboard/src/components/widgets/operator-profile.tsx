"use client";

import { useState } from "react";
import { Flame, Pencil } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { getInitials, useProfileStore } from "@/store/profile-store";
import { useHabitsStore } from "@/store/habits-store";
import { useUIStore } from "@/store/ui-store";

export function OperatorProfile() {
  const name = useProfileStore((s) => s.name);
  const role = useProfileStore((s) => s.role);
  const focusStatus = useUIStore((s) => s.focusStatus);
  const setFocusStatus = useUIStore((s) => s.setFocusStatus);
  const habits = useHabitsStore((s) => s.habits);
  const bestStreak = Math.max(...habits.map((h) => h.streak));

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(focusStatus);

  function commit() {
    setEditing(false);
    const trimmed = draft.trim();
    setFocusStatus(trimmed || focusStatus);
  }

  return (
    <Panel
      index={1}
      label="Operator"
      expandable={false}
      status={
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-[var(--life-success)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--life-success)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--life-success)]" />
          </span>
          Online
        </span>
      }
    >
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10 border border-white/[0.1] glow-primary">
          <AvatarFallback className="bg-gradient-to-br from-[var(--life-primary)] to-[var(--life-accent)] text-xs font-semibold text-[#041a17]">
            {getInitials(name) || "?"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-foreground">{name}</div>
          <div className="truncate text-[11px] text-muted-foreground">{role}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="hud-label mb-1">Focus</div>
          {editing ? (
            <Input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => e.key === "Enter" && commit()}
              className="h-7 border-white/[0.08] bg-white/[0.03] text-xs"
            />
          ) : (
            <button
              onClick={() => {
                setDraft(focusStatus);
                setEditing(true);
              }}
              className="group flex items-center gap-1.5 text-left"
            >
              <span className="truncate text-xs text-foreground/90">{focusStatus}</span>
              <Pencil className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </button>
          )}
        </div>
        <div className="shrink-0 text-right">
          <div className="hud-label mb-1">Streak</div>
          <div className="flex items-center gap-1 text-xs font-medium text-[var(--life-warning)]">
            <Flame className="h-3 w-3" />
            {bestStreak}d
          </div>
        </div>
      </div>
    </Panel>
  );
}
