"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bot, Zap, KeyRound, Activity, CheckCircle2, XCircle, Loader2, Trash2, RadioTower, Clock3, Power } from "lucide-react";
import { SectionHeader } from "@/components/shared/section-header";
import { GlassCard } from "@/components/shared/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAISettingsStore } from "@/store/ai-settings-store";
import { cn } from "@/lib/utils";
import type { ProviderId } from "@/types/ai";

interface ProviderStatusEntry {
  id: ProviderId;
  name: string;
  implemented: boolean;
  capabilities: { streaming: boolean; longContext: boolean; contextWindow: number };
  managedConfigured: boolean;
  byokConfigured: boolean;
  model: string | null;
  usage: { requests: number; errors: number; totalTokens: number; lastRequestAt?: string };
}

interface StatusResponse {
  providers: ProviderStatusEntry[];
  defaultProvider: ProviderId;
}

// Providers that take a plain bearer-token API key. Ollama is deliberately excluded -- it's
// configured via OLLAMA_HOST (a local address), not a key, so a "paste your key" form doesn't apply.
const BYOK_PROVIDER_IDS: ProviderId[] = ["kimi", "claude", "openai", "gemini", "deepseek", "grok", "openrouter"];

async function fetchStatus(): Promise<StatusResponse> {
  const res = await fetch("/api/ai/status");
  if (!res.ok) throw new Error("Failed to load AI status.");
  return res.json();
}

async function testConnection(providerId: ProviderId) {
  const res = await fetch("/api/ai/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerId }),
  });
  return res.json() as Promise<{ ok: boolean; latencyMs: number; error?: string }>;
}

async function saveKey(providerId: ProviderId, apiKey: string) {
  const res = await fetch("/api/ai/keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerId, apiKey }),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Failed to save key.");
}

async function removeKey(providerId: ProviderId) {
  const res = await fetch("/api/ai/keys", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerId }),
  });
  if (!res.ok) throw new Error("Failed to remove key.");
}

export default function AISettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["ai-status"], queryFn: fetchStatus, refetchInterval: 15_000 });
  const [activeProvider, setActiveProvider] = useState<ProviderId>("kimi");
  const aiEnabled = useAISettingsStore((s) => s.enabled);
  const setAIEnabled = useAISettingsStore((s) => s.setEnabled);

  const testMutation = useMutation({
    mutationFn: testConnection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai-status"] }),
  });

  const providers = data?.providers ?? [];
  const activeEntry = providers.find((p) => p.id === activeProvider);
  const lastTest = testMutation.data;

  return (
    <div className="max-w-3xl">
      <SectionHeader
        eyebrow="AI Settings"
        title="Control Center"
        description="Kimi is the strategic intelligence layer powering Life OS."
      />

      <GlassCard glow={aiEnabled ? "primary" : "none"} className="mb-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              aiEnabled ? "bg-[var(--life-primary)]/15 text-[var(--life-primary)]" : "bg-white/[0.04] text-muted-foreground"
            )}
          >
            <Power className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">AI Features</h3>
            <p className="text-xs text-muted-foreground">
              {aiEnabled
                ? "On — Kimi powers Brain chat, Inbox extraction, Daily Brief, and every module below."
                : "Off — every module falls back to local estimates. Existing data isn't affected."}
            </p>
          </div>
        </div>
        <Switch checked={aiEnabled} onCheckedChange={setAIEnabled} />
      </GlassCard>

      <GlassCard className="mb-4 flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Bot className="h-4 w-4" /> Providers
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {providers.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProvider(p.id)}
              className={cn(
                "flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition",
                p.id === activeProvider
                  ? "border-[var(--life-accent)]/40 bg-[var(--life-accent)]/[0.08]"
                  : "border-white/[0.07] bg-white/[0.03] hover:border-white/[0.14]"
              )}
            >
              <span className="text-sm font-medium text-foreground">{p.name}</span>
              {!p.implemented ? (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <Clock3 className="h-3 w-3" /> Coming Soon
                </Badge>
              ) : p.managedConfigured || p.byokConfigured ? (
                <Badge variant="secondary" className="gap-1 text-[var(--life-success)]">
                  <CheckCircle2 className="h-3 w-3" /> Active
                </Badge>
              ) : (
                <Badge variant="outline" className="gap-1 text-muted-foreground">
                  <XCircle className="h-3 w-3" /> Not Connected
                </Badge>
              )}
            </button>
          ))}
        </div>
      </GlassCard>

      <GlassCard glow="accent" className="mb-4 flex flex-col gap-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Activity className="h-4 w-4 text-[var(--life-accent)]" /> Connection Status
        </h3>

        {isLoading || !activeEntry ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading provider status…
          </div>
        ) : (
          <ConnectionStatusRow
            entry={activeEntry}
            onTest={() => testMutation.mutate(activeEntry.id)}
            testing={testMutation.isPending}
            lastResult={lastTest && testMutation.variables === activeEntry.id ? lastTest : undefined}
          />
        )}

        <p className="text-[11px] text-muted-foreground">
          Requests never leave the server unrouted: Frontend → AI Service → AI Router → Kimi Provider → Kimi API.
          If the selected provider isn&rsquo;t configured, the router silently falls back to the default provider
          (Kimi) so the app keeps working.
        </p>
      </GlassCard>

      <GlassCard className="mb-4 flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Activity className="h-4 w-4" /> Token Usage
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {providers.map((p) => (
            <div key={p.id} className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-3">
              <div className="mb-1 truncate text-[11px] text-muted-foreground">{p.name}</div>
              <div className="text-lg font-semibold text-foreground">{p.usage.requests}</div>
              <div className="text-[10px] text-muted-foreground">
                {p.usage.totalTokens.toLocaleString()} tokens
                {p.usage.errors > 0 && <span className="text-[var(--life-danger)]"> · {p.usage.errors} errors</span>}
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground">
          Counters are in-memory for this server process and reset on restart -- there&rsquo;s no database in this
          app yet to persist them durably.
        </p>
      </GlassCard>

      <GlassCard className="flex flex-col gap-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <KeyRound className="h-4 w-4" /> Bring Your Own Key
        </h3>
        <p className="text-[11px] text-muted-foreground">
          Life OS Managed AI uses the app&rsquo;s own backend key by default. Add your own key below to override it for
          that provider -- your key is encrypted and stored in an httpOnly cookie the browser can&rsquo;t read, and is
          used automatically instead of the managed key whenever it&rsquo;s present.
        </p>
        <div className="flex flex-col gap-3">
          {providers
            .filter((p) => BYOK_PROVIDER_IDS.includes(p.id))
            .map((p) => (
              <ByokRow key={p.id} entry={p} />
            ))}
        </div>
      </GlassCard>
    </div>
  );
}

function ConnectionStatusRow({
  entry,
  onTest,
  testing,
  lastResult,
}: {
  entry: ProviderStatusEntry;
  onTest: () => void;
  testing: boolean;
  lastResult?: { ok: boolean; latencyMs: number; error?: string };
}) {
  const connected = entry.managedConfigured || entry.byokConfigured;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/[0.07] bg-white/[0.03] p-3">
      <div className="flex items-center gap-3">
        <StatusDot connected={connected} testing={testing} ok={lastResult?.ok} implemented={entry.implemented} />
        <div>
          <div className="text-sm font-medium text-foreground">{entry.name}</div>
          <div className="text-[11px] text-muted-foreground">
            {!entry.implemented
              ? "Not implemented yet"
              : connected
                ? entry.byokConfigured
                  ? "API Key Status: your key (BYOK)"
                  : "API Key Status: managed key"
                : "API Key Status: not configured"}
            {entry.model && <span className="ml-2 text-foreground/70">Model: {entry.model}</span>}
            {lastResult && (
              <span className={cn("ml-2", lastResult.ok ? "text-[var(--life-success)]" : "text-[var(--life-danger)]")}>
                {lastResult.ok ? `${lastResult.latencyMs}ms` : lastResult.error}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {entry.capabilities.streaming && (
          <Badge variant="outline" className="gap-1">
            <RadioTower className="h-3 w-3" /> Streaming
          </Badge>
        )}
        <Badge variant="outline">{Math.round(entry.capabilities.contextWindow / 1000)}k ctx</Badge>
        <Button size="sm" variant="outline" onClick={onTest} disabled={testing || !connected}>
          {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          Test Connection
        </Button>
      </div>
    </div>
  );
}

function StatusDot({
  connected,
  testing,
  ok,
  implemented,
}: {
  connected: boolean;
  testing: boolean;
  ok?: boolean;
  implemented: boolean;
}) {
  if (!implemented) return <Clock3 className="h-4 w-4 text-muted-foreground" />;
  if (testing) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
  if (!connected) return <XCircle className="h-4 w-4 text-muted-foreground" />;
  if (ok === false) return <XCircle className="h-4 w-4 text-[var(--life-danger)]" />;
  return (
    <motion.span
      animate={{ opacity: [1, 0.4, 1] }}
      transition={{ duration: 2, repeat: Infinity }}
      className="relative flex h-4 w-4 items-center justify-center"
    >
      <CheckCircle2 className="h-4 w-4 text-[var(--life-success)]" />
    </motion.span>
  );
}

function ByokRow({ entry }: { entry: ProviderStatusEntry }) {
  const queryClient = useQueryClient();
  const [value, setValue] = useState("");

  const save = useMutation({
    mutationFn: () => saveKey(entry.id, value),
    onSuccess: () => {
      setValue("");
      queryClient.invalidateQueries({ queryKey: ["ai-status"] });
    },
  });

  const remove = useMutation({
    mutationFn: () => removeKey(entry.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["ai-status"] }),
  });

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] p-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-foreground/90">
          {entry.name}
          {!entry.implemented && <span className="ml-1.5 text-[10px] text-muted-foreground">(coming soon)</span>}
        </Label>
        {entry.byokConfigured && (
          <Badge variant="secondary" className="gap-1">
            <KeyRound className="h-3 w-3" /> Your key active
          </Badge>
        )}
      </div>
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder={entry.byokConfigured ? "Replace key…" : "Paste API key…"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="border-white/[0.08] bg-white/[0.03] text-xs"
        />
        <Button size="sm" variant="outline" disabled={value.trim().length < 8 || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
        </Button>
        {entry.byokConfigured && (
          <Button size="sm" variant="ghost" disabled={remove.isPending} onClick={() => remove.mutate()}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
      {save.isError && <p className="text-[11px] text-[var(--life-danger)]">{(save.error as Error).message}</p>}
    </div>
  );
}
