"use client";

import { AreaChart, Area, ResponsiveContainer, YAxis } from "recharts";
import { Eye, EyeOff, TrendingUp, TrendingDown } from "lucide-react";
import { Panel } from "@/components/shared/panel";
import { financeSnapshots } from "@/lib/mock/data";
import { useUIStore } from "@/store/ui-store";
import { cn } from "@/lib/utils";

function formatUSD(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function FinancePulse() {
  const revealed = useUIStore((s) => s.financeRevealed);
  const toggle = useUIStore((s) => s.toggleFinanceRevealed);

  const latest = financeSnapshots[financeSnapshots.length - 1];
  const prev = financeSnapshots[financeSnapshots.length - 2];
  const monthlyDelta = latest.netWorth - (prev?.netWorth ?? latest.netWorth);
  const monthlyPct = prev ? Math.round((monthlyDelta / prev.netWorth) * 1000) / 10 : 0;
  const dailyDelta = Math.round(latest.savings / 30);

  return (
    <Panel
      index={5}
      label="Finance Pulse"
      deepHref="/finances"
      status={
        <button
          onClick={toggle}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
          title={revealed ? "Hide balances" : "Reveal balances"}
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      }
    >
      {!revealed ? (
        <button
          onClick={toggle}
          className="flex h-full min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/[0.1] text-muted-foreground transition hover:border-white/[0.2] hover:text-foreground"
        >
          <Eye className="h-5 w-5" />
          <span className="text-xs">Click to reveal balances</span>
        </button>
      ) : (
        <>
          <div className="text-2xl font-semibold tabular-nums text-foreground">{formatUSD(latest.netWorth)}</div>
          <div className={cn("mt-1 flex items-center gap-1 text-[11px]", monthlyDelta >= 0 ? "text-[var(--life-success)]" : "text-[var(--life-danger)]")}>
            {monthlyDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {monthlyPct >= 0 ? "+" : ""}
            {monthlyPct}% this month
          </div>

          <div className="my-3 h-14 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financeSnapshots} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
                <defs>
                  <linearGradient id="netWorthFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--life-success)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--life-success)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis hide domain={["dataMin - 500", "dataMax + 500"]} />
                <Area type="monotone" dataKey="netWorth" stroke="var(--life-success)" strokeWidth={2} fill="url(#netWorthFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="hud-label mb-0.5">Daily</div>
              <div className="text-xs font-medium text-[var(--life-success)]">+{formatUSD(dailyDelta)}</div>
            </div>
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
              <div className="hud-label mb-0.5">Monthly</div>
              <div className="text-xs font-medium text-[var(--life-success)]">+{formatUSD(latest.savings)}</div>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}
