import { createFileRoute } from "@tanstack/react-router";
import { FileText, Download } from "lucide-react";

const reports = [
  { date: "Today", title: "Payment Failure Spike — Stripe 3DS", severity: "Critical", duration: "ongoing" },
  { date: "Today", title: "API us-west-2 elevated 5xx", severity: "Critical", duration: "ongoing" },
  { date: "Yesterday", title: "Checkout regression after build #4799", severity: "Critical", duration: "47 min" },
  { date: "Yesterday", title: "Login throttling false-positive", severity: "Warning", duration: "1h 12m" },
  { date: "3 days ago", title: "Reviews dip after iOS 18.2 update", severity: "Warning", duration: "2 days" },
  { date: "Last week", title: "Coordinated fraud attempt — BIN 414720", severity: "Warning", duration: "3h 40m" },
];

export const Route = createFileRoute("/_app/reports")({
  component: () => (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">AI-generated post-mortems and incident summaries.</p>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Report</th>
              <th className="px-4 py-3">Severity</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {reports.map((r, i) => (
              <tr key={i} className="hover:bg-secondary/30">
                <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[var(--cyan)]" />
                    {r.title}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      r.severity === "Critical"
                        ? "rounded-md bg-[color-mix(in_oklab,var(--critical)_18%,transparent)] px-2 py-0.5 text-xs font-semibold text-[var(--critical)]"
                        : "rounded-md bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] px-2 py-0.5 text-xs font-semibold text-[var(--warning)]"
                    }
                  >
                    {r.severity}
                  </span>
                </td>
                <td className="px-4 py-3 text-foreground/80">{r.duration}</td>
                <td className="px-4 py-3 text-right">
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/40 px-2.5 py-1 text-xs hover:text-[var(--cyan)]">
                    <Download className="h-3 w-3" /> PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ),
});
