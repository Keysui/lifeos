import { create } from "zustand";
import { persist } from "zustand/middleware";
import { projects as seedProjects } from "@/lib/mock/data";
import type { Project, Status } from "@/types";

interface ProjectsState {
  projects: Project[];
  addProject: (draft: Partial<Project> & Pick<Project, "name">) => Project;
  bumpProgress: (id: string, amount: number) => void;
  setStatus: (id: string, status: Status) => void;
  updateProject: (id: string, patch: Partial<Project>) => void;
  completeMilestone: (id: string, milestoneId: string) => void;
}

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set) => ({
      projects: seedProjects,
      addProject: (draft) => {
        const project: Project = {
          id: crypto.randomUUID(),
          area: "",
          status: "todo",
          progress: 0,
          milestones: [],
          ...draft,
        };
        set((s) => ({ projects: [project, ...s.projects] }));
        return project;
      },
      bumpProgress: (id, amount) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? {
                  ...p,
                  progress: Math.max(0, Math.min(100, Math.round(p.progress + amount))),
                  status: p.progress + amount >= 100 ? "done" : p.status,
                }
              : p
          ),
        })),
      setStatus: (id, status) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, status } : p)) })),
      updateProject: (id, patch) =>
        set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      completeMilestone: (id, milestoneId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id
              ? { ...p, milestones: p.milestones.map((m) => (m.id === milestoneId ? { ...m, done: true } : m)) }
              : p
          ),
        })),
    }),
    { name: "life-os-projects" }
  )
);
