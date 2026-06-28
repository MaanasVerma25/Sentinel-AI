import { cn } from "@/lib/utils";
import type { CrisisCluster } from "@/lib/mock-data";
import { SeverityBadge } from "./severity-badge";
import { SourceBadges } from "./source-icon";
import { Sparkline } from "./sparkline";
import { ArrowRight, TrendingUp } from "lucide-react";

export function CrisisClusterCard({
  cluster,
  onView,
}: {
  cluster: CrisisCluster;
  onView: (c: CrisisCluster) => void;
}) {
  const isCrit = cluster.severity === "critical";
  return (
    <div
      className={cn(
        "group rounded-lg border bg-card p-4 transition-all",
        isCrit ? "border-[var(--critical)]/50 pulse-critical" : "border-border hover:border-[var(--cyan)]/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SeverityBadge severity={cluster.severity} />
            <span className="text-[11px] text-muted-foreground">· detected {cluster.detectedAt}</span>
          </div>
          <h3 className="mt-2 truncate text-base font-semibold text-foreground">{cluster.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{cluster.mentions}</span> mentions in last 1h vs avg{" "}
            {cluster.baseline}/h
            <span className="ml-2 inline-flex items-center gap-1 text-[var(--critical)]">
              <TrendingUp className="h-3 w-3" />+{cluster.increasePct}%
            </span>
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <SourceBadges sources={cluster.sources} />
            <div className="h-7 w-28">
              <Sparkline data={cluster.spark} color={isCrit ? "#FF4757" : "#00D9FF"} className="h-full w-full" />
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => onView(cluster)}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-1.5 text-sm font-medium text-foreground hover:bg-secondary hover:text-[var(--cyan)]"
      >
        View report <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
