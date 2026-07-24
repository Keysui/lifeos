"use client";

import Link from "next/link";
import { Moon, SunMedium, Eye, Waves, Keyboard, User, Bell, Bot, ChevronRight } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useUIStore } from "@/store/ui-store";
import { getInitials, useProfileStore } from "@/store/profile-store";

const shortcuts = [
  { keys: "⌘ K", desc: "Open command palette" },
  { keys: "Esc", desc: "Close command palette / dialogs" },
  { keys: "⌘ B", desc: "Toggle sidebar (coming soon)" },
];

export default function SettingsPage() {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const reducedMotion = useUIStore((s) => s.reducedMotion);
  const setReducedMotion = useUIStore((s) => s.setReducedMotion);
  const highContrast = useUIStore((s) => s.highContrast);
  const setHighContrast = useUIStore((s) => s.setHighContrast);
  const desktopNotificationsEnabled = useUIStore((s) => s.desktopNotificationsEnabled);
  const setDesktopNotificationsEnabled = useUIStore((s) => s.setDesktopNotificationsEnabled);

  async function toggleNotifications(v: boolean) {
    if (v && typeof window !== "undefined" && "Notification" in window) {
      const permission = await Notification.requestPermission();
      setDesktopNotificationsEnabled(permission === "granted");
    } else {
      setDesktopNotificationsEnabled(false);
    }
  }

  const name = useProfileStore((s) => s.name);
  const role = useProfileStore((s) => s.role);
  const setName = useProfileStore((s) => s.setName);
  const setRole = useProfileStore((s) => s.setRole);

  return (
    <div className="max-w-2xl">
      <SectionHeader eyebrow="Settings" title="Preferences" description="Tune Life OS to how you work." />

      <GlassCard className="mb-4 flex flex-col gap-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="h-4 w-4" /> Profile
        </h3>
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-gradient-to-br from-[var(--life-primary)] to-[var(--life-accent)] text-sm font-semibold text-[#04141a]">
              {getInitials(name) || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name" className="text-xs text-muted-foreground">
                Name
              </Label>
              <Input
                id="profile-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="border-white/[0.08] bg-white/[0.03]"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-role" className="text-xs text-muted-foreground">
                Role
              </Label>
              <Input
                id="profile-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Your role"
                className="border-white/[0.08] bg-white/[0.03]"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <Link href="/settings/ai">
        <GlassCard glow="accent" className="mb-4 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--life-accent)]/15 text-[var(--life-accent)]">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">AI Settings</h3>
              <p className="text-xs text-muted-foreground">Kimi (Moonshot AI) · provider status, usage, and API keys</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </GlassCard>
      </Link>

      <GlassCard className="mb-4 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
        <Row icon={theme === "dark" ? Moon : SunMedium} label="Dark mode" checked={theme === "dark"} onCheckedChange={toggleTheme} />
        <Row icon={Waves} label="Reduced motion" checked={reducedMotion} onCheckedChange={setReducedMotion} />
        <Row icon={Eye} label="High contrast" checked={highContrast} onCheckedChange={setHighContrast} />
      </GlassCard>

      <GlassCard className="mb-4 flex flex-col gap-4">
        <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
        <Row icon={Bell} label="Desktop reminders" checked={desktopNotificationsEnabled} onCheckedChange={toggleNotifications} />
        <p className="text-[11px] text-muted-foreground">
          Fires live while this tab is open, using event reminders set on the calendar. Email, push, and location reminders need a backend and aren&rsquo;t wired yet.
        </p>
      </GlassCard>

      <GlassCard>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Keyboard className="h-4 w-4" /> Keyboard Shortcuts
        </h3>
        <div className="flex flex-col gap-2">
          {shortcuts.map((s) => (
            <div key={s.desc} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{s.desc}</span>
              <kbd className="rounded border border-white/10 bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-foreground/80">{s.keys}</kbd>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType;
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-2 text-sm text-foreground/90">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
