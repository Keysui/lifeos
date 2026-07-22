"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Bell, Orbit } from "lucide-react";
import { primaryNavItems } from "./nav-config";
import { LiveClock } from "./live-clock";
import { MobileNav } from "./mobile-nav";
import { useUIStore } from "@/store/ui-store";
import { notifications } from "@/lib/mock/data";
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
import { getInitials, useProfileStore } from "@/store/profile-store";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();
  const setCommandPaletteOpen = useUIStore((s) => s.setCommandPaletteOpen);
  const unread = notifications.filter((n) => !n.read).length;
  const name = useProfileStore((s) => s.name);
  const role = useProfileStore((s) => s.role);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-white/[0.07] bg-[#050505]/85 px-4 backdrop-blur-xl sm:px-6">
      <MobileNav />

      <Link href="/" className="flex shrink-0 items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--life-primary)] to-[var(--life-accent)] glow-primary">
          <Orbit className="h-3.5 w-3.5 text-[#041a17]" strokeWidth={2.5} />
        </div>
        <span className="hud-label hidden text-foreground/80 sm:inline">Life&nbsp;OS&nbsp;// v1</span>
      </Link>

      <nav className="hidden items-center gap-1 md:flex">
        {primaryNavItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase transition-colors",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active && (
                <motion.span
                  layoutId="top-nav-active"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  className="absolute inset-0 rounded-md border border-[var(--life-primary)]/25 bg-[var(--life-primary)]/[0.08]"
                />
              )}
              <span className="relative">{item.tabLabel ?? item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="ml-auto hidden h-8 max-w-xs flex-1 items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-3 text-xs text-muted-foreground transition hover:border-white/[0.14] hover:bg-white/[0.05] lg:flex"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">Ask Life OS…</span>
        <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px]">⌘K</kbd>
      </button>

      <div className={cn("flex items-center gap-1.5 sm:gap-3", "lg:ml-3", "ml-auto")}>
        <DropdownMenu>
          <DropdownMenuTrigger className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-muted-foreground transition hover:text-foreground">
            <Bell className="h-3.5 w-3.5" />
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

        <div className="hidden h-8 items-center border-l border-white/[0.08] pl-3 sm:flex">
          <LiveClock />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar className="h-8 w-8 border border-white/[0.1]">
              <AvatarFallback className="bg-gradient-to-br from-[var(--life-primary)] to-[var(--life-accent)] text-xs font-semibold text-[#041a17]">
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
            <DropdownMenuItem render={<Link href="/settings" />}>Settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
