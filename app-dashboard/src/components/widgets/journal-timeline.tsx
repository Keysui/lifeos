"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/shared/glass-card";
import { journalEntries } from "@/lib/mock/data";

const moodEmoji = ["😞", "😕", "😐", "🙂", "😄"];

export function JournalTimeline() {
  return (
    <div className="flex flex-col gap-3">
      {journalEntries.map((entry, i) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <GlassCard interactive={false} className="flex gap-4">
            <div className="flex w-16 shrink-0 flex-col items-center text-center">
              <span className="text-2xl">{moodEmoji[entry.mood - 1]}</span>
              <span className="mt-1 text-[10px] text-muted-foreground">{entry.date}</span>
            </div>
            <div className="min-w-0 flex-1 border-l border-white/[0.07] pl-4">
              <h4 className="text-sm font-semibold text-foreground">{entry.title}</h4>
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
    </div>
  );
}
