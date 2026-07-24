"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Inbox, Plus } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useInboxStore } from "@/store/inbox-store";

export function QuickCapture() {
  const notes = useInboxStore((s) => s.notes);
  const addNote = useInboxStore((s) => s.addNote);
  const [value, setValue] = useState("");

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    setValue("");
    void addNote(trimmed);
  }

  return (
    <GlassCard className="h-full">
      <div className="mb-4 flex items-center gap-2">
        <Inbox className="h-4 w-4 text-[var(--life-primary)]" />
        <h3 className="text-sm font-semibold text-foreground">Quick Capture</h3>
      </div>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          placeholder="Capture a thought into your inbox…"
          className="border-white/[0.08] bg-white/[0.03]"
        />
        <Button size="icon" onClick={submit} className="shrink-0 bg-[var(--life-primary)] text-[#04141a] hover:bg-[var(--life-primary)]/90">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-3 flex flex-col gap-1.5">
        <AnimatePresence initial={false}>
          {notes.slice(0, 6).map((note) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="truncate rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-muted-foreground"
            >
              {note.content}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </GlassCard>
  );
}
