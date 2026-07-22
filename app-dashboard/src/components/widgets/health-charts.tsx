"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { healthMetrics } from "@/lib/mock/data";

const tooltipStyle = {
  contentStyle: {
    background: "rgba(10,12,18,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    fontSize: 12,
  },
  labelStyle: { color: "#f2f5fa" },
};

export function SleepEnergyChart() {
  const data = healthMetrics.slice(-14).map((d) => ({ ...d, day: d.date.slice(5) }));

  return (
    <GlassCard className="h-full">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Sleep &amp; Energy</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 4, right: 8 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 11 }} width={28} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="sleepHours" name="Sleep (h)" stroke="var(--life-accent)" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="energy" name="Energy (/10)" stroke="var(--life-primary)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export function StepsChart() {
  const data = healthMetrics.slice(-14).map((d) => ({ ...d, day: d.date.slice(5) }));

  return (
    <GlassCard className="h-full">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Steps</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 4, right: 8 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 10 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 11 }} width={40} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="steps" name="Steps" stroke="var(--life-success)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
