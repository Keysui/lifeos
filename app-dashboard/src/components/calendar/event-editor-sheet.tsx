"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Copy, Archive, CheckCircle2, X } from "lucide-react";
import { useCalendarStore } from "@/store/calendar-store";
import { useProjectsStore } from "@/store/projects-store";
import { useTasksStore } from "@/store/tasks-store";
import { useHabitsStore } from "@/store/habits-store";
import { goals } from "@/lib/mock/data";
import {
  EVENT_CATEGORY_META,
  type CalendarEvent,
  type ChecklistItem,
  type EventCategory,
  type EventReminder,
  type ReminderMethod,
  type RecurrenceFreq,
} from "@/types/calendar";
import { recurrenceLabel } from "@/lib/calendar/recurrence";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const REMINDER_PRESETS: { label: string; minutes: number }[] = [
  { label: "At time of event", minutes: 0 },
  { label: "5 minutes before", minutes: 5 },
  { label: "10 minutes before", minutes: 10 },
  { label: "30 minutes before", minutes: 30 },
  { label: "1 hour before", minutes: 60 },
  { label: "1 day before", minutes: 1440 },
];

function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function toLocalDateValue(iso: string) {
  return toLocalInputValue(iso).slice(0, 10);
}

interface DraftState {
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  allDay: boolean;
  category: EventCategory;
  priority: CalendarEvent["priority"];
  status: CalendarEvent["status"];
  tags: string[];
  projectId?: string;
  goalId?: string;
  taskId?: string;
  habitId?: string;
  recurrenceEnabled: boolean;
  recurrenceFreq: RecurrenceFreq;
  recurrenceInterval: number;
  recurrenceByWeekday: number[];
  reminders: EventReminder[];
  checklist: ChecklistItem[];
  notes: string;
  energyRequirement: number;
  focusLevel: number;
  estimatedMinutes: number;
  actualMinutes: number;
}

function draftFromEvent(event: CalendarEvent): DraftState {
  return {
    title: event.title,
    description: event.description ?? "",
    location: event.location ?? "",
    start: event.start,
    end: event.end,
    allDay: event.allDay,
    category: event.category,
    priority: event.priority,
    status: event.status,
    tags: event.tags,
    projectId: event.projectId,
    goalId: event.goalId,
    taskId: event.taskId,
    habitId: event.habitId,
    recurrenceEnabled: !!event.recurrence,
    recurrenceFreq: event.recurrence?.freq ?? "weekly",
    recurrenceInterval: event.recurrence?.interval ?? 1,
    recurrenceByWeekday: event.recurrence?.byWeekday ?? [],
    reminders: event.reminders,
    checklist: event.checklist,
    notes: event.notes ?? "",
    energyRequirement: event.energyRequirement ?? 3,
    focusLevel: event.focusLevel ?? 3,
    estimatedMinutes:
      event.estimatedMinutes ?? Math.round((new Date(event.end).getTime() - new Date(event.start).getTime()) / 60000),
    actualMinutes: event.actualMinutes ?? 0,
  };
}

export function EventEditorSheet({
  event,
  open,
  onOpenChange,
}: {
  event: CalendarEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-white/[0.08] bg-[#0a0c12] p-0 sm:max-w-lg">
        {event && <EventEditorForm key={event.id} event={event} onOpenChange={onOpenChange} />}
      </SheetContent>
    </Sheet>
  );
}

function EventEditorForm({
  event,
  onOpenChange,
}: {
  event: CalendarEvent;
  onOpenChange: (open: boolean) => void;
}) {
  const addEvent = useCalendarStore((s) => s.addEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const duplicateEvent = useCalendarStore((s) => s.duplicateEvent);
  const archiveEvent = useCalendarStore((s) => s.archiveEvent);
  const completeEvent = useCalendarStore((s) => s.completeEvent);
  const reopenEvent = useCalendarStore((s) => s.reopenEvent);

  const projects = useProjectsStore((s) => s.projects);
  const tasks = useTasksStore((s) => s.tasks);
  const habits = useHabitsStore((s) => s.habits);

  const [draft, setDraft] = useState<DraftState>(() => draftFromEvent(event));
  const [tagInput, setTagInput] = useState("");
  const [checklistInput, setChecklistInput] = useState("");

  function patch(p: Partial<DraftState>) {
    setDraft((d) => ({ ...d, ...p }));
  }

  function save() {
    const payload: Partial<CalendarEvent> = {
      title: draft.title.trim() || "Untitled event",
      description: draft.description || undefined,
      location: draft.location || undefined,
      start: draft.start,
      end: draft.end,
      allDay: draft.allDay,
      category: draft.category,
      priority: draft.priority,
      status: draft.status,
      tags: draft.tags,
      projectId: draft.projectId || undefined,
      goalId: draft.goalId || undefined,
      taskId: draft.taskId || undefined,
      habitId: draft.habitId || undefined,
      recurrence: draft.recurrenceEnabled
        ? {
            freq: draft.recurrenceFreq,
            interval: draft.recurrenceInterval,
            byWeekday: draft.recurrenceFreq === "weekly" && draft.recurrenceByWeekday.length ? draft.recurrenceByWeekday : undefined,
          }
        : undefined,
      reminders: draft.reminders,
      checklist: draft.checklist,
      notes: draft.notes || undefined,
      energyRequirement: draft.energyRequirement as 1 | 2 | 3 | 4 | 5,
      focusLevel: draft.focusLevel as 1 | 2 | 3 | 4 | 5,
      estimatedMinutes: draft.estimatedMinutes,
      actualMinutes: draft.actualMinutes || undefined,
    };

    if (event.id === "__new__") {
      addEvent({ ...payload, title: payload.title!, start: payload.start!, end: payload.end! });
    } else {
      updateEvent(event.id, payload);
    }
    onOpenChange(false);
  }

  const isNew = event.id === "__new__";
  const isCompleted = draft.status === "completed";

  return (
    <>
      <SheetHeader className="border-b border-white/[0.06]">
        <SheetTitle>{isNew ? "New Event" : "Edit Event"}</SheetTitle>
      </SheetHeader>

      <div className="flex flex-col gap-5 p-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-title">Title</Label>
          <Input id="ev-title" value={draft.title} onChange={(e) => patch({ title: e.target.value })} className="border-white/[0.08] bg-white/[0.03] text-base" autoFocus />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-desc">Description</Label>
          <Textarea id="ev-desc" value={draft.description} onChange={(e) => patch({ description: e.target.value })} className="border-white/[0.08] bg-white/[0.03]" rows={2} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-loc">Location</Label>
          <Input id="ev-loc" value={draft.location} onChange={(e) => patch({ location: e.target.value })} className="border-white/[0.08] bg-white/[0.03]" placeholder="Optional" />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="ev-allday">All day</Label>
          <Switch id="ev-allday" checked={draft.allDay} onCheckedChange={(v) => patch({ allDay: v })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Start</Label>
            {draft.allDay ? (
              <Input type="date" value={toLocalDateValue(draft.start)} onChange={(e) => patch({ start: new Date(`${e.target.value}T00:00:00`).toISOString() })} className="border-white/[0.08] bg-white/[0.03]" />
            ) : (
              <Input type="datetime-local" value={toLocalInputValue(draft.start)} onChange={(e) => patch({ start: new Date(e.target.value).toISOString() })} className="border-white/[0.08] bg-white/[0.03]" />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>End</Label>
            {draft.allDay ? (
              <Input type="date" value={toLocalDateValue(draft.end)} onChange={(e) => patch({ end: new Date(`${e.target.value}T00:00:00`).toISOString() })} className="border-white/[0.08] bg-white/[0.03]" />
            ) : (
              <Input type="datetime-local" value={toLocalInputValue(draft.end)} onChange={(e) => patch({ end: new Date(e.target.value).toISOString() })} className="border-white/[0.08] bg-white/[0.03]" />
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <Select value={draft.category} onValueChange={(v) => patch({ category: v as EventCategory })}>
              <SelectTrigger className="border-white/[0.08] bg-white/[0.03]">
                <SelectValue>{(v: EventCategory) => EVENT_CATEGORY_META[v]?.label ?? "Select category"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EVENT_CATEGORY_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key}>
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ background: meta.color }} />
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Priority</Label>
            <Select value={draft.priority} onValueChange={(v) => patch({ priority: v as CalendarEvent["priority"] })}>
              <SelectTrigger className="border-white/[0.08] bg-white/[0.03]">
                <SelectValue>
                  {(v: string) => ({ P1: "P1 · Critical", P2: "P2 · Important", P3: "P3 · Nice to have" })[v] ?? v}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="P1">P1 · Critical</SelectItem>
                <SelectItem value="P2">P2 · Important</SelectItem>
                <SelectItem value="P3">P3 · Nice to have</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label>Status</Label>
          <div className="flex flex-wrap gap-2">
            {(["scheduled", "in-progress", "completed", "canceled"] as const).map((s) => (
              <button
                key={s}
                onClick={() => patch({ status: s })}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs capitalize transition",
                  draft.status === s
                    ? "border-[var(--life-primary)]/40 bg-[var(--life-primary)]/15 text-[var(--life-primary)]"
                    : "border-white/[0.08] text-muted-foreground hover:text-foreground"
                )}
              >
                {s.replace("-", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-tags">Tags</Label>
          <div className="flex flex-wrap gap-1.5">
            {draft.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-[11px] text-muted-foreground">
                {tag}
                <button onClick={() => patch({ tags: draft.tags.filter((t) => t !== tag) })}>
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
          <Input
            id="ev-tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagInput.trim()) {
                patch({ tags: [...draft.tags, tagInput.trim()] });
                setTagInput("");
              }
            }}
            placeholder="Add a tag and press Enter"
            className="border-white/[0.08] bg-white/[0.03]"
          />
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="ev-recur">Repeat</Label>
            <Switch id="ev-recur" checked={draft.recurrenceEnabled} onCheckedChange={(v) => patch({ recurrenceEnabled: v })} />
          </div>
          {draft.recurrenceEnabled && (
            <div className="flex flex-col gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <div className="grid grid-cols-2 gap-2">
                <Select value={draft.recurrenceFreq} onValueChange={(v) => patch({ recurrenceFreq: v as RecurrenceFreq })}>
                  <SelectTrigger className="border-white/[0.08] bg-white/[0.03]">
                    <SelectValue>{(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={1}
                  value={draft.recurrenceInterval}
                  onChange={(e) => patch({ recurrenceInterval: Math.max(1, parseInt(e.target.value) || 1) })}
                  className="border-white/[0.08] bg-white/[0.03]"
                />
              </div>
              {draft.recurrenceFreq === "weekly" && (
                <div className="flex flex-wrap gap-1.5">
                  {WEEKDAY_LABELS.map((label, idx) => {
                    const active = draft.recurrenceByWeekday.includes(idx);
                    return (
                      <button
                        key={label}
                        onClick={() =>
                          patch({
                            recurrenceByWeekday: active
                              ? draft.recurrenceByWeekday.filter((d) => d !== idx)
                              : [...draft.recurrenceByWeekday, idx],
                          })
                        }
                        className={cn(
                          "h-7 w-9 rounded-md border text-[11px] transition",
                          active ? "border-[var(--life-primary)]/40 bg-[var(--life-primary)]/15 text-[var(--life-primary)]" : "border-white/[0.08] text-muted-foreground"
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">
                {recurrenceLabel({ freq: draft.recurrenceFreq, interval: draft.recurrenceInterval, byWeekday: draft.recurrenceByWeekday })}
              </p>
            </div>
          )}
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="flex flex-col gap-2">
          <Label>Reminders</Label>
          {draft.reminders.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <Select
                value={String(r.offsetMinutes)}
                onValueChange={(v) =>
                  patch({ reminders: draft.reminders.map((x) => (x.id === r.id ? { ...x, offsetMinutes: Number(v) } : x)) })
                }
              >
                <SelectTrigger className="border-white/[0.08] bg-white/[0.03] flex-1">
                  <SelectValue>{(v: string) => REMINDER_PRESETS.find((p) => String(p.minutes) === v)?.label ?? v}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {REMINDER_PRESETS.map((p) => (
                    <SelectItem key={p.minutes} value={String(p.minutes)}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={r.method}
                onValueChange={(v) =>
                  patch({ reminders: draft.reminders.map((x) => (x.id === r.id ? { ...x, method: v as ReminderMethod } : x)) })
                }
              >
                <SelectTrigger className="w-28 border-white/[0.08] bg-white/[0.03]">
                  <SelectValue>{(v: string) => v.charAt(0).toUpperCase() + v.slice(1)}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desktop">Desktop</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="location">Location</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon-sm" onClick={() => patch({ reminders: draft.reminders.filter((x) => x.id !== r.id) })}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="self-start border-white/[0.08]"
            onClick={() =>
              patch({ reminders: [...draft.reminders, { id: crypto.randomUUID(), offsetMinutes: 10, method: "desktop" }] })
            }
          >
            <Plus className="h-3.5 w-3.5" /> Add reminder
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Desktop notifications fire live while this tab is open. Email/push/location require a backend and aren&rsquo;t wired yet.
          </p>
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="flex flex-col gap-2">
          <Label>Checklist</Label>
          {draft.checklist.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              <Checkbox
                checked={item.done}
                onCheckedChange={() =>
                  patch({ checklist: draft.checklist.map((c) => (c.id === item.id ? { ...c, done: !c.done } : c)) })
                }
              />
              <span className={cn("flex-1 text-sm", item.done && "text-muted-foreground line-through")}>{item.title}</span>
              <Button variant="ghost" size="icon-sm" onClick={() => patch({ checklist: draft.checklist.filter((c) => c.id !== item.id) })}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={checklistInput}
              onChange={(e) => setChecklistInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && checklistInput.trim()) {
                  patch({ checklist: [...draft.checklist, { id: crypto.randomUUID(), title: checklistInput.trim(), done: false }] });
                  setChecklistInput("");
                }
              }}
              placeholder="Add checklist item"
              className="border-white/[0.08] bg-white/[0.03]"
            />
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="flex flex-col gap-3">
          <Label>Linked to</Label>
          <div className="grid grid-cols-2 gap-3">
            <LinkSelect
              label="Project"
              value={draft.projectId}
              onChange={(v) => patch({ projectId: v })}
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
            />
            <LinkSelect
              label="Goal"
              value={draft.goalId}
              onChange={(v) => patch({ goalId: v })}
              options={goals.map((g) => ({ value: g.id, label: g.title }))}
            />
            <LinkSelect
              label="Task"
              value={draft.taskId}
              onChange={(v) => patch({ taskId: v })}
              options={tasks.map((t) => ({ value: t.id, label: t.title }))}
            />
            <LinkSelect
              label="Habit"
              value={draft.habitId}
              onChange={(v) => patch({ habitId: v })}
              options={habits.map((h) => ({ value: h.id, label: h.name }))}
            />
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Energy required</Label>
            <Slider value={[draft.energyRequirement]} onValueChange={(v) => patch({ energyRequirement: Array.isArray(v) ? v[0] : v })} min={1} max={5} step={1} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Focus level</Label>
            <Slider value={[draft.focusLevel]} onValueChange={(v) => patch({ focusLevel: Array.isArray(v) ? v[0] : v })} min={1} max={5} step={1} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Estimated (min)</Label>
            <Input type="number" value={draft.estimatedMinutes} onChange={(e) => patch({ estimatedMinutes: Number(e.target.value) || 0 })} className="border-white/[0.08] bg-white/[0.03]" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Actual (min)</Label>
            <Input type="number" value={draft.actualMinutes} onChange={(e) => patch({ actualMinutes: Number(e.target.value) || 0 })} className="border-white/[0.08] bg-white/[0.03]" />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ev-notes">Notes</Label>
          <Textarea id="ev-notes" value={draft.notes} onChange={(e) => patch({ notes: e.target.value })} className="border-white/[0.08] bg-white/[0.03]" rows={3} />
        </div>
      </div>

      <SheetFooter className="flex-row flex-wrap gap-2 border-t border-white/[0.06]">
        {!isNew && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="border-white/[0.08]"
              onClick={() => (isCompleted ? reopenEvent(event.id) : completeEvent(event.id))}
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> {isCompleted ? "Reopen" : "Complete"}
            </Button>
            <Button variant="outline" size="sm" className="border-white/[0.08]" onClick={() => duplicateEvent(event.id)}>
              <Copy className="h-3.5 w-3.5" /> Duplicate
            </Button>
            <Button variant="outline" size="sm" className="border-white/[0.08]" onClick={() => { archiveEvent(event.id); onOpenChange(false); }}>
              <Archive className="h-3.5 w-3.5" /> Archive
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-[var(--life-danger)]/30 text-[var(--life-danger)] hover:bg-[var(--life-danger)]/10"
              onClick={() => { deleteEvent(event.id); onOpenChange(false); }}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
          </>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="bg-[var(--life-primary)] text-[#04141a] hover:bg-[var(--life-primary)]/90" onClick={save}>
            Save
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}

function LinkSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value ?? "none"} onValueChange={(v) => onChange(!v || v === "none" ? undefined : v)}>
        <SelectTrigger className="border-white/[0.08] bg-white/[0.03]">
          <SelectValue>{(v: string) => (v === "none" || !v ? "None" : options.find((o) => o.value === v)?.label ?? v)}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
