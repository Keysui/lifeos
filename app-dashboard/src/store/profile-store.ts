import { create } from "zustand";
import { persist } from "zustand/middleware";
import { user as defaultUser } from "@/lib/mock/data";

export function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface ProfileState {
  name: string;
  role: string;
  setName: (name: string) => void;
  setRole: (role: string) => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      name: defaultUser.name,
      role: defaultUser.role,
      setName: (name) => set({ name }),
      setRole: (role) => set({ role }),
    }),
    { name: "life-os-profile" }
  )
);
