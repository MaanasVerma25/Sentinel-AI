import { cn } from "@/lib/utils";
import type { Severity } from "@/lib/mock-data";

const styles: Record<Severity, string> = {
  critical: "bg-[color-mix(in_oklab,var(--critical)_18%,transparent)] text-[var(--critical)] border-[color-mix(in_oklab,var(--critical)_45%,transparent)]",
  warning: "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[var(--warning)] border-[color-mix(in_oklab,var(--warning)_45%,transparent)]",
  watching: "bg-[color-mix(in_oklab,var(--safe)_15%,transparent)] text-[var(--safe)] border-[color-mix(in_oklab,var(--safe)_40%,transparent)]",
};

const labels: Record<Severity, string> = {
  critical: "Critical",
  warning: "Warning",
  watching: "Watching",
};

export function SeverityBadge({ severity, className }: { severity: Severity; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        styles[severity],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          severity === "critical" && "bg-[var(--critical)] animate-pulse",
          severity === "warning" && "bg-[var(--warning)]",
          severity === "watching" && "bg-[var(--safe)]",
        )}
      />
      {labels[severity]}
    </span>
  );
}
