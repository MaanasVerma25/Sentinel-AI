import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { clusters, type CrisisCluster } from "@/lib/mock-data";
import { CrisisClusterCard } from "@/components/crisis-cluster-card";
import { IncidentDetailDialog } from "@/components/incident-detail";

export const Route = createFileRoute("/_app/incidents")({
  component: IncidentsPage,
});

function IncidentsPage() {
  const [selected, setSelected] = useState<CrisisCluster | null>(null);
  const [open, setOpen] = useState(false);
  const groups = [
    { sev: "critical" as const, label: "Critical" },
    { sev: "warning" as const, label: "Warning" },
    { sev: "watching" as const, label: "Watching" },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All detected anomalies, grouped by severity.
        </p>
      </div>
      {groups.map((g) => {
        const items = clusters.filter((c) => c.severity === g.sev);
        if (!items.length) return null;
        return (
          <section key={g.sev}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              {g.label} <span className="ml-1 text-foreground">({items.length})</span>
            </h2>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {items.map((c) => (
                <CrisisClusterCard
                  key={c.id}
                  cluster={c}
                  onView={(x) => {
                    setSelected(x);
                    setOpen(true);
                  }}
                />
              ))}
            </div>
          </section>
        );
      })}
      <IncidentDetailDialog cluster={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
