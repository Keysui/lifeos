"use client";

import { GraduationCap } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";

export default function SchoolPage() {
  return (
    <div>
      <SectionHeader eyebrow="School" title="Academic OS" description="Courses, assignments, and exams, in one place." />

      <GlassCard interactive={false} className="flex flex-col items-center gap-3 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--life-primary)]/10 text-[var(--life-primary)]">
          <GraduationCap className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Not built yet</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Courses, assignments, exam tracking, syllabus upload, and a homework assistant are planned here — this
          page is a placeholder, not a finished feature, so it doesn&rsquo;t claim to track anything it can&rsquo;t.
        </p>
      </GlassCard>
    </div>
  );
}
