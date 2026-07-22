"use client";

import { Search, Bell, Sparkles, CloudSun, Moon, SunMedium } from "lucide-react";
import { LiveClock } from "./live-clock";
import { useUIStore } from "@/store/ui-store";
import { notifications } from "@/lib/mock/data";
import { useTasksStore } from "@/store/tasks-store";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { getInitials, useProfileStore } from "@/store/profile-store";
import Link from "next/link";
import { MobileNav } from "./mobile-nav";

export function Topbar() {
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const focusTaskId = useUIStore((s) => s.currentFocusTaskId);
  const tasks = useTasksStore((s) => s.tasks);
  const focusTask = tasks.find((t) => t.id === focusTaskId);
  const unread = notifications.filter((n) => !n.read).length;
  const name = useProfileStore((s) => s.name);
  const role = useProfileStore((s) => s.role);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.06] px-4 glass-panel md:px-6">
      <MobileNav />
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="flex h-9 w-full max-w-sm items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 text-sm text-muted-foreground transition hover:border-white/[0.14] hover:bg-white/[0.05]"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Ask Life OS anything…</span>
        <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {focusTask && (
        <Link
          href="/today"
          className="hidden items-center gap-2 rounded-full border border-[var(--life-primary)]/25 bg-[var(--life-primary)]/10 px-3 py-1.5 text-xs text-[var(--life-primary)] transition hover:bg-[var(--life-primary)]/15 lg:flex"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--life-primary)] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--life-primary)]" />
          </span>
          Focus: {focusTask.title}
        </Link>
      )}

      <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
        <div className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground sm:flex">
          <Sparkles className="h-3.5 w-3.5 text-[var(--life-accent)]" />
          <span className="text-foreground/80">AI active</span>
        </div>

        <div className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-muted-foreground md:flex">
          <CloudSun className="h-3.5 w-3.5 text-[var(--life-warning)]" />
          72°F
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground transition hover:text-foreground">
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[var(--life-danger)]" />
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              Notifications
              {unread > 0 && <Badge variant="secondary">{unread} new</Badge>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
                <div className="flex w-full items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">{n.title}</span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{n.time}</span>
                </div>
                <span className="text-xs text-muted-foreground">{n.detail}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="hidden h-9 items-center border-l border-white/[0.08] pl-3 sm:flex">
          <LiveClock />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="h-9 w-9 border border-white/[0.1]">
              <AvatarFallback className="bg-gradient-to-br from-[var(--life-primary)] to-[var(--life-accent)] text-xs font-semibold text-[#04141a]">
                {getInitials(name) || "?"}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-xs font-normal text-muted-foreground">{role}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between px-2 py-1.5 text-sm">
              <span className="flex items-center gap-2 text-foreground/90">
                {theme === "dark" ? <Moon className="h-3.5 w-3.5" /> : <SunMedium className="h-3.5 w-3.5" />}
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </span>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/settings" />}>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
