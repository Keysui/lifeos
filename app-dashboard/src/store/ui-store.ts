import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  theme: "dark" | "light";
  toggleTheme: () => void;

  reducedMotion: boolean;
  setReducedMotion: (v: boolean) => void;

  highContrast: boolean;
  setHighContrast: (v: boolean) => void;

  desktopNotificationsEnabled: boolean;
  setDesktopNotificationsEnabled: (v: boolean) => void;

  currentFocusTaskId: string | null;
  setCurrentFocusTaskId: (id: string | null) => void;

  financeRevealed: boolean;
  toggleFinanceRevealed: () => void;

  focusStatus: string;
  setFocusStatus: (v: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      theme: "dark",
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),

      reducedMotion: false,
      setReducedMotion: (v) => set({ reducedMotion: v }),

      highContrast: false,
      setHighContrast: (v) => set({ highContrast: v }),

      desktopNotificationsEnabled: false,
      setDesktopNotificationsEnabled: (v) => set({ desktopNotificationsEnabled: v }),

      currentFocusTaskId: "t9",
      setCurrentFocusTaskId: (id) => set({ currentFocusTaskId: id }),

      financeRevealed: false,
      toggleFinanceRevealed: () => set({ financeRevealed: !get().financeRevealed }),

      focusStatus: "Building the Life OS command center.",
      setFocusStatus: (v) => set({ focusStatus: v }),
    }),
    {
      name: "life-os-ui",
      partialize: (state) => ({
        theme: state.theme,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        desktopNotificationsEnabled: state.desktopNotificationsEnabled,
        focusStatus: state.focusStatus,
      }),
    }
  )
);
