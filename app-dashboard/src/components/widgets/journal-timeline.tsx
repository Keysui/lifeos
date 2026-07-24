"use client";

import { motion } from "framer-motion";
import { Inbox as InboxIcon } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";

const moodEmoji = ["😞", "😕", "😐", "🙂", "😄"];

export interface JournalItem {
  id: string;
  date: string; // ISO date, YYYY-MM-DD
  title: string;
  excerpt: string;
  tags: string[];
  mood?: number; // 1-5, journal entries only
  source: "journal" | "inbox";
}

export function JournalTimeline({ items }: { items: JournalItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      {items.map((entry, i) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <GlassCard interactive={false} className="flex gap-4">
            <div className="flex w-16 shrink-0 flex-col items-center text-center">
              {entry.mood ? (
                <span className="text-2xl">{moodEmoji[entry.mood - 1]}</span>
              ) : (
                <InboxIcon className="h-5 w-5 text-[var(--life-primary)]" />
              )}
              <span className="mt-1 text-[10px] text-muted-foreground">{entry.date}</span>
            </div>
            <div className="min-w-0 flex-1 border-l border-white/[0.07] pl-4">
              <div className="flex items-center gap-2">
                <h4 className="truncate text-sm font-semibold text-foreground">{entry.title}</h4>
                {entry.source === "inbox" && (
                  <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                    Inbox
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{entry.excerpt}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted-foreground">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-white/[0.08] px-4 py-8 text-center text-sm text-muted-foreground">
          Nothing matches this filter.
        </div>
      )}
    </div>
  );
}
