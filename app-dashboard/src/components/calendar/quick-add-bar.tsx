"use client";

import { useMemo, useState } from "react";
import { Sparkles, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { parseQuickAdd } from "@/lib/calendar/quick-add";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { EVENT_CATEGORY_META } from "@/types/calendar";
import { useCalendarStore } from "@/store/calendar-store";

export function QuickAddBar() {
  const [text, setText] = useState("");
  const addEvent = useCalendarStore((s) => s.addEvent);

  const parsed = useMemo(() => (text.trim() ? parseQuickAdd(text, ANCHOR_DATE) : null), [text]);

  function submit() {
    if (!parsed) return;
    addEvent({
      title: parsed.title,
      start: parsed.start.toISOString(),
      end: parsed.end.toISOString(),
      allDay: parsed.allDay,
      category: parsed.category,
      recurrence: parsed.recurrence,
    });
    setText("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-2">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder='Quick add: "Gym tomorrow at 6pm" or "Study Calculus every Monday"'
          className="border-white/[0.08] bg-white/[0.03]"
        />
        <Button onClick={submit} disabled={!parsed} className="shrink-0 bg-[var(--life-accent)] text-white hover:bg-[var(--life-accent)]/90">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>
      {parsed && (
        <div className="flex items-center gap-1.5 pl-1 text-[11px] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-[var(--life-accent)]" />
          <span>
            &ldquo;{parsed.title}&rdquo; · {EVENT_CATEGORY_META[parsed.category].label} ·{" "}
            {parsed.allDay
              ? parsed.start.toLocaleDateString(undefined, { month: "short", day: "numeric" })
              : `${parsed.start.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}`}
            {parsed.recurrence ? ` · repeats` : ""}
          </span>
        </div>
      )}
    </div>
  );
}
