"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { goals } from "@/lib/mock/data";

function GoalGroup({
  title,
  seed,
  storageKey,
}: {
  title: string;
  seed: string[];
  storageKey: string;
}) {
  const [items, setItems] = useState(seed);
  const [value, setValue] = useState("");

  function add() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setItems((prev) => [...prev, trimmed]);
    setValue("");
  }

  return (
    <div>
      <div className="hud-label mb-2">{title}</div>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={`${storageKey}-${i}`} className="truncate rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-xs text-foreground/85">
            {item}
          </div>
        ))}
        <div className="flex gap-1.5">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder={`Add a ${title.toLowerCase()}…`}
            className="h-7 flex-1 rounded-md border border-white/[0.07] bg-transparent px-2 text-xs text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-[var(--life-primary)]/40"
          />
          <button
            onClick={add}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/[0.08] text-muted-foreground transition hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function GoalsQuickPanel() {
  const quarterly = goals.filter((g) => g.horizon === "quarterly");
  const monthly = goals.filter((g) => g.horizon === "monthly");
  const avgProgress = Math.round(
    [...quarterly, ...monthly].reduce((s, g) => s + g.progress, 0) / (quarterly.length + monthly.length || 1)
  );

  return (
    <Panel
      index={6}
      label="Goals"
      deepHref="/goals"
      status={<span className="hud-label">{avgProgress}% avg</span>}
    >
      <div className="flex flex-col gap-4">
        <GoalGroup title="This Quarter" seed={quarterly.map((g) => g.title)} storageKey="q" />
        <GoalGroup title="This Month" seed={monthly.map((g) => g.title)} storageKey="m" />
      </div>
    </Panel>
  );
}
