"use client";

import { Clock, CheckCircle2, Flame, FolderKanban } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { HeroOverview } from "@/components/widgets/hero-overview";
import { StatTile } from "@/components/widgets/stat-tile";
import { NextBestAction } from "@/components/widgets/next-best-action";
import { InsightFeed } from "@/components/widgets/insight-feed";
import { ScheduleTimeline } from "@/components/widgets/schedule-timeline";
import { GoalProgressRings } from "@/components/widgets/goal-progress-rings";
import { HabitOverviewCard } from "@/components/widgets/habit-heatmap";
import { TimeAllocationChart } from "@/components/widgets/time-allocation-chart";
import { ProjectProgressList } from "@/components/widgets/project-progress-list";
import { DeepWorkTrendChart } from "@/components/widgets/deep-work-trend-chart";
import { QuickCapture } from "@/components/widgets/quick-capture";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { useTasksStore } from "@/store/tasks-store";
import { useHabitsStore } from "@/store/habits-store";
import { useProjectsStore } from "@/store/projects-store";
import { useCalendarStore } from "@/store/calendar-store";
import { getDailyFocusMinutes } from "@/lib/calendar/selectors";

export default function DashboardPage() {
  const tasks = useTasksStore((s) => s.tasks);
  const habits = useHabitsStore((s) => s.habits);
  const projects = useProjectsStore((s) => s.projects);
  const events = useCalendarStore((s) => s.events);

  const doneToday = tasks.filter((t) => t.status === "done").length;
  const habitAvg = Math.round(
    (habits.reduce((sum, h) => sum + h.streak / h.bestStreak, 0) / habits.length) * 100
  );
  const openProjects = projects.filter((p) => p.status !== "done").length;
  const todayDeepWork = Math.round((getDailyFocusMinutes(events, ANCHOR_DATE).deepWorkMinutes / 60) * 10) / 10;

  return (
    <div>
      <SectionHeader
        eyebrow="Executive Overview"
        title="Command Center"
        description="Everything that matters, at a glance."
      />

      <HeroOverview />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Clock} label="Deep work today" value={`${todayDeepWork}h`} delta="12%" accent="primary" />
        <StatTile icon={CheckCircle2} label="Tasks completed" value={`${doneToday}`} delta="4%" accent="success" />
        <StatTile icon={Flame} label="Habit consistency" value={`${habitAvg}%`} delta="3%" accent="warning" />
        <StatTile icon={FolderKanban} label="Open projects" value={`${openProjects}`} delta="1" deltaDirection="down" accent="accent" />
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <NextBestAction />
        <div className="lg:col-span-2">
          <InsightFeed limit={4} />
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <ScheduleTimeline compact />
        <GoalProgressRings />
        <TimeAllocationChart />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <ProjectProgressList limit={4} />
        <DeepWorkTrendChart />
        <div className="flex flex-col gap-4">
          <HabitOverviewCard />
          <QuickCapture />
        </div>
      </div>
    </div>
  );
}
