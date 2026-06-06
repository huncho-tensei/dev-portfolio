import { STATUS_LABEL, type ProjectStatus } from "@/lib/projects";

const COLOR: Record<ProjectStatus, string> = {
  shipped: "oklch(50% 0.17 27)",   // red-soft
  live: "oklch(52% 0.13 145)",     // green-soft
  "open-source": "oklch(55% 0.1 145)",
  active: "oklch(65% 0 0)",        // dim grey
};

export function StatusBadge({
  status,
  className = "",
}: {
  status: ProjectStatus;
  className?: string;
}) {
  const color = COLOR[status];
  return (
    <span
      className={`inline-flex items-center gap-2 font-display text-sm font-medium ${className}`}
      style={{ color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {STATUS_LABEL[status]}
    </span>
  );
}
