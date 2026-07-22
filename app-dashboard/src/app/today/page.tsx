"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { ScheduleTimeline } from "@/components/widgets/schedule-timeline";
import { TaskList } from "@/components/widgets/task-list";
import { MorningBriefing } from "@/components/widgets/morning-briefing";
import { EnergyMoodLog } from "@/components/widgets/energy-mood-log";
import { QuickCapture } from "@/components/widgets/quick-capture";
import { ANCHOR_DATE } from "@/lib/mock/data";

export default function TodayPage() {
  const dateLabel = ANCHOR_DATE.toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div>
      <SectionHeader eyebrow="Today" title={dateLabel} description="Your day, planned and prioritized." />

      <div className="mb-6">
        <MorningBriefing />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ScheduleTimeline />
        </div>
        <div className="flex flex-col gap-4">
          <EnergyMoodLog />
          <QuickCapture />
        </div>
      </div>

      <div className="mt-4">
        <TaskList title="Today's Tasks" />
      </div>
    </div>
  );
}
