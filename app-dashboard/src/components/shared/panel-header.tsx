import { cn } from "@/lib/utils";

export function PanelHeader({
  index,
  label,
  status,
  actions,
  className,
}: {
  index: number;
  label: string;
  status?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-2", className)}>
      <div className="hud-label flex items-center gap-1.5 whitespace-nowrap">
        <span className="hud-index">{String(index).padStart(2, "0")}</span>
        <span>// {label}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {status}
        {actions}
      </div>
    </div>
  );
}
