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
  Inbox,
  GraduationCap,
  Salad,
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
  { label: "AI Assistant", href: "/ai-assistant", icon: Sparkles, section: "ai" },

  { label: "Dashboard", href: "/", icon: LayoutDashboard, section: "core", primary: true, tabLabel: "Home" },
  { label: "Inbox", href: "/inbox", icon: Inbox, section: "core" },
  { label: "Today", href: "/today", icon: Sun, section: "core" },
  { label: "Calendar", href: "/calendar", icon: CalendarDays, section: "core" },
  { label: "Projects", href: "/projects", icon: FolderKanban, section: "core" },
  { label: "Goals", href: "/goals", icon: Target, section: "core" },
  { label: "Knowledge", href: "/knowledge", icon: BrainCircuit, section: "core" },
  { label: "Tasks & Goals", href: "/tasks", icon: ListChecks, section: "core", primary: true, tabLabel: "Tasks" },
  { label: "School", href: "/school", icon: GraduationCap, section: "core", primary: true, tabLabel: "School" },

  { label: "Skills & Habits", href: "/habits", icon: Flame, section: "life", primary: true, tabLabel: "Habits" },
  { label: "Reflection", href: "/journal", icon: BookOpen, section: "life", primary: true, tabLabel: "Reflection" },
  { label: "Finance", href: "/finances", icon: Wallet, section: "life", primary: true, tabLabel: "Finance" },
  { label: "Health", href: "/health", icon: HeartPulse, section: "life", primary: true, tabLabel: "Health" },
  { label: "Nutrition", href: "/nutrition", icon: Salad, section: "life", primary: true, tabLabel: "Nutrition" },

  { label: "Analytics", href: "/analytics", icon: BarChart3, section: "system" },
  { label: "Reviews", href: "/reviews", icon: ClipboardCheck, section: "system" },
  { label: "Settings", href: "/settings", icon: Settings, section: "system" },
];

const primaryOrder = ["/", "/finances", "/school", "/tasks", "/habits", "/journal", "/health", "/nutrition"];

export const primaryNavItems: NavItem[] = navItems
  .filter((i) => i.primary)
  .sort((a, b) => primaryOrder.indexOf(a.href) - primaryOrder.indexOf(b.href));
