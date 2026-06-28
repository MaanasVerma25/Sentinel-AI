import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AlertTriangle, MessageSquare, Timer, Plug, ArrowUpRight } from "lucide-react";
import { clusters, type CrisisCluster } from "@/lib/mock-data";
import { CountUp } from "@/components/count-up";
import { AnomalyTimeline } from "@/components/anomaly-timeline";
import { CrisisClusterCard } from "@/components/crisis-cluster-card";
import { LiveSignalFeed } from "@/components/live-feed";
import { IncidentDetailDialog } from "@/components/incident-detail";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/")({
  component: Dashboard,
});

function StatCard({
  label,
  value,
  suffix,
  trend,
  tone = "default",
  icon: Icon,
  footer,
}: {
  label: string;
  value: number;
  suffix?: string;
  trend?: string;
  tone?: "default" | "critical" | "ok";
  icon: typeof AlertTriangle;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={cn(
                "text-3xl font-bold tabular-nums",
                tone === "critical" && value > 0 && "text-[var(--critical)]",
                tone === "ok" && "text-[var(--safe)]",
              )}
            >
              <CountUp value={value} />
              {suffix}
            </span>
            {trend && (
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--safe)]">
                <ArrowUpRight className="h-3 w-3" /> {trend}
              </span>
            )}
          </div>
        </div>
        <span
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded-md border",
            tone === "critical" && value > 0
              ? "border-[var(--critical)]/40 bg-[color-mix(in_oklab,var(--critical)_15%,transparent)] text-[var(--critical)]"
              : "border-border bg-secondary/40 text-[var(--cyan)]",
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {footer && <div className="mt-3 text-xs text-muted-foreground">{footer}</div>}
    </div>
  );
}

function Dashboard() {
  const [selected, setSelected] = useState<CrisisCluster | null>(null);
  const [open, setOpen] = useState(false);
  const handleView = (c: CrisisCluster) => {
    setSelected(c);
    setOpen(true);
  };

  const activeIncidents = clusters.filter((c) => c.severity === "critical").length;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time anomaly detection across all signal sources.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex h-2 w-2 rounded-full bg-[var(--safe)] animate-pulse" />
          Live · auto-refresh every 5s
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Active Incidents"
          value={activeIncidents}
          tone="critical"
          icon={AlertTriangle}
          footer={activeIncidents > 0 ? "Requires immediate attention" : "All clear"}
        />
        <StatCard
          label="Messages Analyzed Today"
          value={64812}
          trend="+18%"
          icon={MessageSquare}
          footer="Across 4 sources"
        />
        <StatCard
          label="Avg Detection Time"
          value={4}
          suffix=".2 min"
          icon={Timer}
          footer="Ahead of first human report"
        />
        <StatCard
          label="Sources Monitored"
          value={4}
          suffix="/4"
          tone="ok"
          icon={Plug}
          footer={
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--safe)]" />
              <span className="ml-1">All connected</span>
            </span>
          }
        />
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Anomaly Timeline · 24h</h2>
            <p className="mt-1 text-base font-medium text-foreground">Complaint volume by category</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-md border border-border bg-secondary/40 px-2 py-1">24h</span>
            <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">7d</span>
            <span className="rounded-md border border-border px-2 py-1 text-muted-foreground">30d</span>
          </div>
        </div>
        <AnomalyTimeline />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Active Crisis Clusters</h2>
            <span className="text-xs text-muted-foreground">{clusters.length} active</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {clusters.map((c) => (
              <CrisisClusterCard key={c.id} cluster={c} onView={handleView} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Live Signal Feed</h2>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)] animate-pulse" /> Streaming
            </span>
          </div>
          <LiveSignalFeed />
        </div>
      </section>

      <IncidentDetailDialog cluster={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
