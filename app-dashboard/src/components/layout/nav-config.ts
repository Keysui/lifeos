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
}

export const navItems: NavItem[] = [
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, section: "ai" },

  { label: "Dashboard", href: "/", icon: LayoutDashboard, section: "core" },
  { label: "Today", href: "/today", icon: Sun, section: "core" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, section: "core" },
  { label: "Projects", href: "/projects", icon: FolderKanban, section: "core" },
  { label: "Goals", href: "/goals", icon: Target, section: "core" },
  { label: "Knowledge", href: "/knowledge", icon: BrainCircuit, section: "core" },
  { label: "Tasks", href: "/tasks", icon: ListChecks, section: "core" },

  { label: "Habits", href: "/habits", icon: Flame, section: "life" },
  { label: "Journal", href: "/journal", icon: BookOpen, section: "life" },
  { label: "Finances", href: "/finances", icon: Wallet, section: "life" },
  { label: "Health", href: "/health", icon: HeartPulse, section: "life" },

  { label: "Analytics", href: "/analytics", icon: BarChart3, section: "system" },
  { label: "Reviews", href: "/reviews", icon: ClipboardCheck, section: "system" },
  { label: "Settings", href: "/settings", icon: Settings, section: "system" },
];
