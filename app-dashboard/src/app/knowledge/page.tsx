"use client";

import { useMemo, useState } from "react";
import { Search, Link2 } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";
import { Input } from "@/components/ui/input";
import { knowledgeNodes } from "@/lib/mock/data";

export default function KnowledgePage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      knowledgeNodes.filter(
        (n) =>
          n.title.toLowerCase().includes(query.toLowerCase()) ||
          n.area.toLowerCase().includes(query.toLowerCase())
      ),
    [query]
  );

  return (
    <div>
      <SectionHeader eyebrow="Knowledge" title="Second Brain" description="Notes and how they connect." />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes…"
          className="border-white/[0.08] bg-white/[0.03] pl-9"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((node) => (
          <GlassCard key={node.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-sm font-semibold text-foreground">{node.title}</h4>
              <span className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[10px] text-muted-foreground">
                {node.area}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Link2 className="h-3.5 w-3.5 text-[var(--life-accent)]" />
              {node.connections.length} connection{node.connections.length === 1 ? "" : "s"}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {node.connections.map((cid) => {
                const target = knowledgeNodes.find((n) => n.id === cid);
                if (!target) return null;
                return (
                  <span key={cid} className="rounded-full border border-[var(--life-accent)]/20 bg-[var(--life-accent)]/[0.08] px-2 py-0.5 text-[10px] text-[var(--life-accent)]">
                    {target.title}
                  </span>
                );
              })}
            </div>
            <span className="text-[10px] text-muted-foreground">Updated {node.updatedAt}</span>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
