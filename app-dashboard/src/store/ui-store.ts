import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

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
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

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
    }),
    {
      name: "life-os-ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        reducedMotion: state.reducedMotion,
        highContrast: state.highContrast,
        desktopNotificationsEnabled: state.desktopNotificationsEnabled,
      }),
    }
  )
);
