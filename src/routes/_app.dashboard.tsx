import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AlertTriangle, MessageSquare, Timer, Plug, ArrowUpRight, ShieldAlert } from "lucide-react";
import { clusters, type CrisisCluster } from "@/lib/mock-data";
import { CountUp } from "@/components/count-up";
import { AnomalyTimeline } from "@/components/anomaly-timeline";
import { CrisisClusterCard } from "@/components/crisis-cluster-card";
import { LiveSignalFeed } from "@/components/live-feed";
import { IncidentDetailDialog } from "@/components/incident-detail";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/dashboard")({
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
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
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
  const [showSimulationModal, setShowSimulationModal] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem("hasSeenSimulationModal");
    if (!hasSeen) {
      setShowSimulationModal(true);
    }
  }, []);

  const handleCloseSimulationModal = () => {
    setShowSimulationModal(false);
    sessionStorage.setItem("hasSeenSimulationModal", "true");
  };

  const handleView = (c: CrisisCluster) => {
    setSelected(c);
    setOpen(true);
  };

  const activeIncidents = clusters.filter((c) => c.severity === "critical").length;

  return (
    <div className="space-y-6">
      <Dialog open={showSimulationModal} onOpenChange={setShowSimulationModal}>
        <DialogContent className="max-w-md border-[#343940] bg-[#131518] rounded-none p-6 text-white shadow-[0_10px_50px_rgba(0,0,0,0.9)]">
          <DialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-none bg-[#298DFF]/15 border border-[#298DFF]/30 text-[#298DFF]">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-lg font-bold uppercase tracking-wider font-mono">
              Simulation Mode Active
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 text-center">
            <p className="text-sm leading-relaxed text-white">
              This dashboard is running in simulation mode. All charts, status feeds, alerts, and
              anomaly logs are simulated to demonstrate the platform.
            </p>
            <p className="text-[10px] font-mono tracking-wide text-[#6C7584]">
              * Notice: All metrics, incident lists, and timeline entries are generated from static,
              hardcoded data.
            </p>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={handleCloseSimulationModal}
              className="w-full rounded-none bg-[#298DFF] hover:bg-[#298DFF]/90 font-mono text-xs uppercase tracking-wider font-bold py-2 text-white"
            >
              Acknowledge & Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time anomaly detection across all signal sources.
          </p>
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
          footer={
            activeIncidents > 0 ? (
              <span className="text-[var(--critical)] font-medium">
                Immediate response required
              </span>
            ) : (
              "No critical incidents"
            )
          }
        />
        <StatCard
          label="Signal Rate"
          value={142}
          suffix="/m"
          icon={MessageSquare}
          trend="+18%"
          footer="Across 4 configured sources"
        />
        <StatCard
          label="Avg Detection Time"
          value={28}
          suffix="s"
          icon={Timer}
          footer="From ingest to alert trigger"
        />
        <StatCard
          label="Active Integrations"
          value={4}
          suffix="/6"
          tone="ok"
          icon={Plug}
          footer="Slack, Intercom, Email, Twitter"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold tracking-tight">Severity Timeline</h2>
              <p className="text-xs text-muted-foreground">
                Incident clusters and volumes detected over the last 24h.
              </p>
            </div>
            <AnomalyTimeline />
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold tracking-tight">Active Incident Groups</h2>
              <p className="text-xs text-muted-foreground">
                AI-clustered anomalies that require triage.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {clusters.map((c) => (
                <CrisisClusterCard key={c.id} cluster={c} onView={() => handleView(c)} />
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight">Live Signal Ingestion</h2>
            <p className="text-xs text-muted-foreground">
              Streaming real-time feeds matching monitoring rules.
            </p>
          </div>
          <LiveSignalFeed />
        </div>
      </div>

      <IncidentDetailDialog open={open} onOpenChange={setOpen} cluster={selected} />
    </div>
  );
}
