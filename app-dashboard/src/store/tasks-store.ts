import { create } from "zustand";
import { persist } from "zustand/middleware";
import { tasks as seedTasks } from "@/lib/mock/data";
import type { Status, Task } from "@/types";

interface TasksState {
  tasks: Task[];
  toggleDone: (id: string) => void;
  setStatus: (id: string, status: Status) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  addTask: (task: Task) => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set) => ({
      tasks: seedTasks,
      toggleDone: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, status: t.status === "done" ? "todo" : "done" } : t
          ),
        })),
      setStatus: (id, status) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, status } : t)) })),
      updateTask: (id, patch) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),
    }),
    { name: "life-os-tasks" }
  )
);
