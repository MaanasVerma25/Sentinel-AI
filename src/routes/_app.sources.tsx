import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { sources } from "@/lib/mock-data";
import { SourceIcon } from "@/components/source-icon";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/sources")({
  component: SourcesPage,
});

function SourcesPage() {
  const [state, setState] = useState(sources);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sources</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage the data streams Sentinel listens to.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {state.map((s) => (
          <div key={s.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--cyan)_12%,transparent)] text-[var(--cyan)]">
                <SourceIcon kind={s.id} className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                  s.enabled
                    ? "border-[var(--safe)]/40 bg-[color-mix(in_oklab,var(--safe)_15%,transparent)] text-[var(--safe)]"
                    : "border-border bg-secondary/40 text-muted-foreground",
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", s.enabled ? "bg-[var(--safe)]" : "bg-muted-foreground")} />
                {s.enabled ? "Connected" : "Paused"}
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold">{s.label}</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Messages today</dt>
                <dd className="font-medium tabular-nums">{s.volume.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last sync</dt>
                <dd className="text-foreground/80">{s.lastSync}</dd>
              </div>
            </dl>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2">
              <span className="text-sm">Enable monitoring</span>
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={() =>
                  setState((prev) => prev.map((p) => (p.id === s.id ? { ...p, enabled: !p.enabled } : p)))
                }
                className="h-4 w-7 appearance-none rounded-full bg-muted relative cursor-pointer transition-colors checked:bg-[var(--cyan)] before:absolute before:top-0.5 before:left-0.5 before:h-3 before:w-3 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-3"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
