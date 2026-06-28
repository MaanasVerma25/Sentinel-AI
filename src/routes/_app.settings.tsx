import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/settings")({
  component: () => (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Detection thresholds and team alerting.
        </p>
      </div>
      <section className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Detection thresholds
        </h2>
        <Field label="Critical: % increase over baseline" defaultValue="200" suffix="%" />
        <Field label="Warning: % increase over baseline" defaultValue="100" suffix="%" />
        <Field label="Minimum mentions to trigger" defaultValue="25" />
        <Field label="Detection window" defaultValue="5" suffix="minutes" />
      </section>
      <section className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Alerting
        </h2>
        <Field label="Default Slack channel" defaultValue="#incidents-critical" />
        <Field label="On-call email" defaultValue="oncall@sentinel.ai" />
        <Field label="PagerDuty service key" defaultValue="••••••••••••" />
      </section>
    </div>
  ),
});

function Field({
  label,
  defaultValue,
  suffix,
}: {
  label: string;
  defaultValue: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
        <input
          defaultValue={defaultValue}
          className="flex-1 bg-transparent text-sm focus:outline-none"
        />
        {suffix && <span className="text-xs text-muted-foreground">{suffix}</span>}
      </div>
    </label>
  );
}
