"use client";

import { Moon, Footprints, Dumbbell, Smile } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { StatTile } from "@/components/widgets/stat-tile";
import { SleepEnergyChart, StepsChart } from "@/components/widgets/health-charts";
import { healthMetrics } from "@/lib/mock/data";

export default function HealthPage() {
  const recent = healthMetrics.slice(-7);
  const avgSleep = Math.round((recent.reduce((s, d) => s + d.sleepHours, 0) / recent.length) * 10) / 10;
  const avgSteps = Math.round(recent.reduce((s, d) => s + d.steps, 0) / recent.length);
  const workouts = recent.filter((d) => d.workoutMinutes > 0).length;
  const avgMood = Math.round((recent.reduce((s, d) => s + d.mood, 0) / recent.length) * 10) / 10;

  return (
    <div>
      <SectionHeader eyebrow="Health" title="Health &amp; Recovery" description="Last 7 days." />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={Moon} label="Avg. sleep" value={`${avgSleep}h`} accent="accent" />
        <StatTile icon={Footprints} label="Avg. steps" value={avgSteps.toLocaleString()} accent="success" />
        <StatTile icon={Dumbbell} label="Workouts" value={`${workouts}/7`} accent="primary" />
        <StatTile icon={Smile} label="Avg. mood" value={`${avgMood}/10`} accent="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SleepEnergyChart />
        <StepsChart />
      </div>
    </div>
  );
}
