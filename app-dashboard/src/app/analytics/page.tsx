"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { DeepWorkTrendChart } from "@/components/widgets/deep-work-trend-chart";
import { TimeAllocationChart } from "@/components/widgets/time-allocation-chart";
import { HabitOverviewCard } from "@/components/widgets/habit-heatmap";
import { GoalProgressRings } from "@/components/widgets/goal-progress-rings";
import { ProjectProgressList } from "@/components/widgets/project-progress-list";

export default function AnalyticsPage() {
  return (
    <div>
      <SectionHeader eyebrow="Analytics" title="Trends &amp; Patterns" description="How your time and energy actually move." />

      <div className="mb-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DeepWorkTrendChart />
        </div>
        <TimeAllocationChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <HabitOverviewCard />
        <GoalProgressRings limit={2} />
        <ProjectProgressList limit={4} />
      </div>
    </div>
  );
}
