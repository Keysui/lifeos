"use client";

import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { PageTransition } from "./page-transition";
import { CommandPalette } from "@/components/command/command-palette";
import { ReminderScheduler } from "@/components/calendar/reminder-scheduler";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="relative flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <CommandPalette />
      <ReminderScheduler />
    </div>
  );
}
