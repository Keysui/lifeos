"use client";

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { useCalendarStore } from "@/store/calendar-store";
import { getWeeklyDeepWorkTrend } from "@/lib/calendar/selectors";

function startOfWeek(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const day = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - day);
  return c;
}

export function DeepWorkTrendChart() {
  const events = useCalendarStore((s) => s.events);
  const deepWorkTrend = getWeeklyDeepWorkTrend(events, startOfWeek(ANCHOR_DATE));

  return (
    <GlassCard className="h-full">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Weekly Focus</h3>
          <p className="text-[11px] text-muted-foreground">Deep vs. shallow work hours</p>
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={deepWorkTrend} margin={{ left: 4, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="deepWork" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--life-primary)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--life-primary)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="shallowWork" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--life-accent)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--life-accent)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 11 }} width={28} />
            <Tooltip
              contentStyle={{
                background: "rgba(10,12,18,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                fontSize: 12,
              }}
              labelStyle={{ color: "#f2f5fa" }}
            />
            <Area type="monotone" dataKey="deepWorkHours" name="Deep work" stroke="var(--life-primary)" strokeWidth={2} fill="url(#deepWork)" />
            <Area type="monotone" dataKey="shallowWorkHours" name="Shallow work" stroke="var(--life-accent)" strokeWidth={2} fill="url(#shallowWork)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
