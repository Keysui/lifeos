"use client";

import { useState } from "react";
import Link from "next/link";
import { Maximize2, ArrowUpRight } from "lucide-react";
import { GlassCard } from "./glass-card";
import { PanelHeader } from "./panel-header";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface PanelProps {
  index: number;
  label: string;
  status?: React.ReactNode;
  deepHref?: string;
  deepLabel?: string;
  glow?: "none" | "primary" | "accent" | "success";
  className?: string;
  expandable?: boolean;
  children: React.ReactNode;
  /** Richer content shown in the expanded overlay; defaults to `children`. */
  expandedContent?: React.ReactNode;
}

/**
 * Tier 1/2 of the nav model: a compact grid tile that expands in-place into
 * a full-screen overlay (tier 2). `deepHref` links from the overlay to the
 * existing dedicated route for that module (tier 3), when one exists.
 */
export function Panel({
  index,
  label,
  status,
  deepHref,
  deepLabel = "Open full workspace",
  glow = "none",
  className,
  expandable = true,
  children,
  expandedContent,
}: PanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <GlassCard glow={glow} className={cn("flex h-full flex-col", className)}>
        <PanelHeader
          index={index}
          label={label}
          status={status}
          actions={
            expandable ? (
              <button
                onClick={() => setOpen(true)}
                className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
                title={`Expand ${label}`}
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            ) : null
          }
        />
        <div className="min-h-0 flex-1">{children}</div>
      </GlassCard>

      {expandable && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-h-[85vh] w-full max-w-3xl overflow-y-auto sm:max-w-3xl">
            <DialogTitle className="hud-label mb-4">
              <span className="hud-index">{String(index).padStart(2, "0")}</span> // {label}
            </DialogTitle>
            <div>{expandedContent ?? children}</div>
            {deepHref && (
              <Link
                href={deepHref}
                onClick={() => setOpen(false)}
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--life-primary)] hover:underline"
              >
                {deepLabel} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
