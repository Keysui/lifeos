"use client";

import { OperatorProfile } from "@/components/widgets/operator-profile";
import { SessionBanner } from "@/components/widgets/session-banner";
import { PrioritiesPanel } from "@/components/widgets/priorities-panel";
import { HabitGrid } from "@/components/widgets/habit-grid";
import { CalendarPanel } from "@/components/widgets/calendar-panel";
import { FinancePulse } from "@/components/widgets/finance-pulse";
import { GoalsQuickPanel } from "@/components/widgets/goals-quick-panel";
import { NutritionTracker } from "@/components/widgets/nutrition-tracker";
import { AiJournalPanel } from "@/components/widgets/ai-journal-panel";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-3">
        <OperatorProfile />
        <FinancePulse />
        <PrioritiesPanel />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-6">
        <SessionBanner />
        <HabitGrid />
        <CalendarPanel />
      </div>

      <div className="flex flex-col gap-4 lg:col-span-3">
        <GoalsQuickPanel />
        <NutritionTracker />
        <AiJournalPanel />
      </div>
    </div>
  );
}
