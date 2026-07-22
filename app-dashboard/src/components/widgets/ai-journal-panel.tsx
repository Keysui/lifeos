"use client";

import { useState } from "react";
import { Sparkles, Moon } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { journalEntries } from "@/lib/mock/data";

export function AiJournalPanel() {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const latest = journalEntries[0];

  function save() {
    if (!value.trim()) return;
    setSaved(true);
    setValue("");
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <Panel index={7} label="Brain" deepHref="/journal" status={<Moon className="h-3.5 w-3.5 text-muted-foreground" />}>
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Wind down — how did today go?"
        className="min-h-20 resize-none border-white/[0.08] bg-white/[0.03] text-xs"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground/60">
          <Sparkles className="h-2.5 w-2.5" /> Kimi will summarize on save
        </span>
        <Button
          size="sm"
          onClick={save}
          className="h-7 bg-[var(--life-primary)] px-3 text-xs text-[#041a17] hover:bg-[var(--life-primary)]/90"
        >
          {saved ? "Saved" : "Save entry"}
        </Button>
      </div>

      {latest && (
        <div className="mt-3 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-2">
          <div className="hud-label mb-1">Last entry — {latest.date}</div>
          <div className="truncate text-xs text-foreground/80">{latest.title}</div>
        </div>
      )}
    </Panel>
  );
}
