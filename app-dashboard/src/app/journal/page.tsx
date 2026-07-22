"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { JournalTimeline } from "@/components/widgets/journal-timeline";
import { QuickCapture } from "@/components/widgets/quick-capture";

export default function JournalPage() {
  return (
    <div>
      <SectionHeader eyebrow="Journal" title="Reflections" description="A running record of how things actually went." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <JournalTimeline />
        </div>
        <QuickCapture />
      </div>
    </div>
  );
}
