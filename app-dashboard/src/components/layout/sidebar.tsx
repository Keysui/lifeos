"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronsLeft, Orbit } from "lucide-react";
import { navItems } from "./nav-config";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const sections: { key: "core" | "life" | "system"; label: string }[] = [
  { key: "core", label: "Command" },
  { key: "life", label: "Life" },
  { key: "system", label: "System" },
];

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const pathname = usePathname();

  const aiItem = navItems.find((i) => i.section === "ai")!;

  return (
    <motion.aside
      animate={{ width: collapsed ? 76 : 248 }}
      transition={{ type: "spring", stiffness: 280, damping: 32 }}
      className="relative z-20 hidden shrink-0 flex-col border-r border-white/[0.06] px-3 py-4 md:flex"
      style={{ background: "var(--sidebar)", backdropFilter: "blur(24px)" }}
    >
      <div className={cn("mb-5 flex items-center gap-2 px-2", collapsed && "justify-center px-0")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--life-primary)] to-[var(--life-accent)] glow-primary">
          <Orbit className="h-4.5 w-4.5 text-[#04141a]" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-wide text-foreground">Life OS</span>
        )}
      </div>

      <NavLink item={aiItem} active={pathname === aiItem.href} collapsed={collapsed} highlight />

      <div className="my-3 h-px bg-white/[0.06]" />

      <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.key} className="flex flex-col gap-0.5">
            {!collapsed && (
              <span className="px-2.5 pb-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground/70">
                {section.label}
              </span>
            )}
            {navItems
              .filter((i) => i.section === section.key)
              .map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={pathname === item.href}
                  collapsed={collapsed}
                />
              ))}
          </div>
        ))}
      </nav>

      <button
        onClick={toggleSidebar}
        className="mt-2 flex items-center justify-center gap-2 rounded-lg py-2 text-muted-foreground transition hover:bg-white/[0.05] hover:text-foreground"
      >
        <motion.span animate={{ rotate: collapsed ? 180 : 0 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
          <ChevronsLeft className="h-4 w-4" />
        </motion.span>
        {!collapsed && <span className="text-xs">Collapse</span>}
      </button>
    </motion.aside>
  );
}

function NavLink({
  item,
  active,
  collapsed,
  highlight,
}: {
  item: (typeof navItems)[number];
  active: boolean;
  collapsed: boolean;
  highlight?: boolean;
}) {
  const Icon = item.icon;

  const linkClassName = cn(
    "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
    collapsed && "justify-center px-0",
    active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
    highlight && !active && "text-[var(--life-primary)]"
  );

  const content = (
    <>
      {active && (
        <motion.span
          layoutId="sidebar-active"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
          className={cn(
            "absolute inset-0 rounded-lg",
            highlight
              ? "bg-gradient-to-r from-[var(--life-primary)]/20 to-[var(--life-accent)]/20 glow-primary"
              : "bg-white/[0.06]"
          )}
        />
      )}
      <Icon className={cn("relative h-4 w-4 shrink-0", highlight && "text-[var(--life-primary)]")} strokeWidth={2} />
      {!collapsed && <span className="relative truncate">{item.label}</span>}
    </>
  );

  if (!collapsed) {
    return (
      <Link href={item.href} className={linkClassName}>
        {content}
      </Link>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<Link href={item.href} className={linkClassName} />}>{content}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}
