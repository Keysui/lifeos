"use client";

import { useState } from "react";
import { BatteryMedium, Smile } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Slider } from "@/components/ui/slider";

export function EnergyMoodLog() {
  const [energy, setEnergy] = useState([7]);
  const [mood, setMood] = useState([8]);

  return (
    <GlassCard className="h-full">
      <h3 className="mb-4 text-sm font-semibold text-foreground">Energy &amp; Mood</h3>
      <div className="flex flex-col gap-5">
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <BatteryMedium className="h-3.5 w-3.5 text-[var(--life-primary)]" /> Energy
            </span>
            <span className="text-foreground">{energy[0]}/10</span>
          </div>
          <Slider value={energy} onValueChange={(v) => setEnergy(Array.isArray(v) ? v : [v])} max={10} step={1} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Smile className="h-3.5 w-3.5 text-[var(--life-warning)]" /> Mood
            </span>
            <span className="text-foreground">{mood[0]}/10</span>
          </div>
          <Slider value={mood} onValueChange={(v) => setMood(Array.isArray(v) ? v : [v])} max={10} step={1} />
        </div>
      </div>
    </GlassCard>
  );
}
