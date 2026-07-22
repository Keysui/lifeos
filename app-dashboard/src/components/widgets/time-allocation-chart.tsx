"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { GlassCard } from "@/components/shared/glass-card";
import { ANCHOR_DATE } from "@/lib/mock/data";
import { useCalendarStore } from "@/store/calendar-store";
import { getWeeklyTimeAllocation } from "@/lib/calendar/selectors";

function startOfWeek(d: Date) {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  const day = (c.getDay() + 6) % 7;
  c.setDate(c.getDate() - day);
  return c;
}

export function TimeAllocationChart() {
  const events = useCalendarStore((s) => s.events);
  const timeAllocation = getWeeklyTimeAllocation(events, startOfWeek(ANCHOR_DATE));
  const total = Math.round(timeAllocation.reduce((s, d) => s + d.hours, 0));

  return (
    <GlassCard className="h-full">
      <h3 className="mb-1 text-sm font-semibold text-foreground">Time Allocation</h3>
      <p className="mb-2 text-[11px] text-muted-foreground">This week &middot; {total}h tracked</p>
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={timeAllocation}
              dataKey="hours"
              nameKey="category"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={3}
              stroke="none"
            >
              {timeAllocation.map((slice) => (
                <Cell key={slice.category} fill={slice.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "rgba(10,12,18,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                fontSize: 12,
                backdropFilter: "blur(8px)",
              }}
              labelStyle={{ color: "#f2f5fa" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-foreground">{total}h</span>
          <span className="text-[10px] text-muted-foreground">total</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {timeAllocation.map((slice) => (
          <div key={slice.category} className="flex items-center gap-1.5 text-[11px]">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: slice.color }} />
            <span className="truncate text-muted-foreground">{slice.category}</span>
            <span className="ml-auto text-foreground/80">{slice.hours}h</span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
