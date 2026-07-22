import {
  Sparkles,
  LayoutDashboard,
  Sun,
  CalendarDays,
  FolderKanban,
  Target,
  BrainCircuit,
  ListChecks,
  Flame,
  BookOpen,
  Wallet,
  HeartPulse,
  BarChart3,
  ClipboardCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  section: "ai" | "core" | "life" | "system";
  /** Shown as a top-level tab in the HUD nav bar (Miles OS style). */
  primary?: boolean;
  /** Short tab label for the top nav bar, e.g. "CRM" instead of "Tasks". */
  tabLabel?: string;
}

export const navItems: NavItem[] = [
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, section: "ai", primary: true, tabLabel: "Brain" },

  { label: "Dashboard", href: "/", icon: LayoutDashboard, section: "core", primary: true, tabLabel: "Home" },
  { label: "Today", href: "/today", icon: Sun, section: "core" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, section: "core" },
  { label: "Projects", href: "/projects", icon: FolderKanban, section: "core" },
  { label: "Goals", href: "/goals", icon: Target, section: "core" },
  { label: "Knowledge", href: "/knowledge", icon: BrainCircuit, section: "core" },
  { label: "Tasks", href: "/tasks", icon: ListChecks, section: "core", primary: true, tabLabel: "CRM" },

  { label: "Habits", href: "/habits", icon: Flame, section: "life" },
  { label: "Journal", href: "/journal", icon: BookOpen, section: "life", primary: true, tabLabel: "Journal" },
  { label: "Finances", href: "/finances", icon: Wallet, section: "life", primary: true, tabLabel: "Finance" },
  { label: "Health", href: "/health", icon: HeartPulse, section: "life", primary: true, tabLabel: "Health" },

  { label: "Analytics", href: "/analytics", icon: BarChart3, section: "system" },
  { label: "Reviews", href: "/reviews", icon: ClipboardCheck, section: "system" },
  { label: "Settings", href: "/settings", icon: Settings, section: "system" },
];

const primaryOrder = ["/", "/tasks", "/ai-assistant", "/finances", "/journal", "/health"];

export const primaryNavItems: NavItem[] = navItems
  .filter((i) => i.primary)
  .sort((a, b) => primaryOrder.indexOf(a.href) - primaryOrder.indexOf(b.href));
