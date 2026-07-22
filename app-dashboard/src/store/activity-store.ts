import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ActivityEntry {
  id: string;
  message: string;
  projectId?: string;
  goalId?: string;
  at: string; // ISO
}

interface ActivityState {
  entries: ActivityEntry[];
  log: (message: string, opts?: { projectId?: string; goalId?: string }) => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set) => ({
      entries: [],
      log: (message, opts) =>
        set((s) => ({
          entries: [
            { id: crypto.randomUUID(), message, at: new Date().toISOString(), ...opts },
            ...s.entries,
          ].slice(0, 50),
        })),
    }),
    { name: "life-os-activity" }
  )
);
