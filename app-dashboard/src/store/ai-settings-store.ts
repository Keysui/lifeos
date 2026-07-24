import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AISettingsState {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useAISettingsStore = create<AISettingsState>()(
  persist(
    (set) => ({
      enabled: true,
      setEnabled: (enabled) => set({ enabled }),
    }),
    { name: "life-os-ai-settings" }
  )
);

/** Throws before any AI request goes out when the user has switched AI off in AI Settings.
 *  Called at the top of every Kimi call site (ModuleAI's callAI, the Brain chat page) so
 *  disabling AI stops network calls immediately rather than failing after a round trip. */
export function assertAIEnabled() {
  if (!useAISettingsStore.getState().enabled) {
    throw new Error("ai-disabled");
  }
}
