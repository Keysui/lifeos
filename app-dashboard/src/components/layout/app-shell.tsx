"use client";

import { TopNav } from "./top-nav";
import { PageTransition } from "./page-transition";
import { CommandPalette } from "@/components/command/command-palette";
import { ReminderScheduler } from "@/components/calendar/reminder-scheduler";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <TopNav />
      <main className="relative flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-6">
        <PageTransition>{children}</PageTransition>
      </main>
      <CommandPalette />
      <ReminderScheduler />
    </div>
  );
}
