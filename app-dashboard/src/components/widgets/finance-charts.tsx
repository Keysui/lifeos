"use client";

import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { financeSnapshots } from "@/lib/mock/data";

const tooltipStyle = {
  contentStyle: {
    background: "rgba(10,12,18,0.9)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    fontSize: 12,
  },
  labelStyle: { color: "#f2f5fa" },
};

export function IncomeExpenseChart() {
  return (
    <GlassCard className="h-full">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Income vs. Expenses</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={financeSnapshots} margin={{ left: 4, right: 8 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 11 }} width={36} />
            <Tooltip {...tooltipStyle} />
            <Bar dataKey="income" name="Income" fill="var(--life-primary)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" name="Expenses" fill="var(--life-danger)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}

export function NetWorthChart() {
  return (
    <GlassCard className="h-full">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Net Worth</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={financeSnapshots} margin={{ left: 4, right: 8 }}>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: "#8B93A7", fontSize: 11 }} width={48} />
            <Tooltip {...tooltipStyle} />
            <Line type="monotone" dataKey="netWorth" name="Net worth" stroke="var(--life-accent)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
