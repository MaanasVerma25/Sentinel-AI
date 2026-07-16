import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CrisisCluster } from "@/lib/mock-data";
import { SeverityBadge } from "./severity-badge";
import { SourceIcon, SourceBadges } from "./source-icon";
import {
  Sparkles,
  TrendingUp,
  Users,
  Lightbulb,
  AlertOctagon,
  Send,
  CheckCircle2,
  FileDown,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const rawMessages = [
  {
    source: "chat" as const,
    text: "Payment keeps failing at checkout, third try now",
    classification: "Payment / 3DS failure",
    time: "12:48:21",
  },
  {
    source: "social" as const,
    text: "@brand checkout broken, lost the cart twice",
    classification: "Payment / negative",
    time: "12:48:09",
  },
  {
    source: "email" as const,
    text: "Subject: Refund request — payment failed three times",
    classification: "Payment / refund",
    time: "12:47:55",
  },
  {
    source: "chat" as const,
    text: "Visa card declined on 3DS step, please help",
    classification: "Payment / 3DS failure",
    time: "12:47:30",
  },
  {
    source: "social" as const,
    text: "Anyone else seeing checkout errors? It's been an hour",
    classification: "Payment / outage signal",
    time: "12:46:58",
  },
  {
    source: "chat" as const,
    text: "Got charged twice for the same order #4421",
    classification: "Payment / duplicate charge",
    time: "12:46:22",
  },
];

export function IncidentDetailDialog({
  cluster,
  open,
  onOpenChange,
}: {
  cluster: CrisisCluster | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [resolved, setResolved] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const [loadingLlm, setLoadingLlm] = useState(false);
  const [llmData, setLlmData] = useState<{
    summary: string;
    rootCauses: string[];
    fixes: string[];
    affectedUsers: string;
  } | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !cluster || !cluster.id.startsWith("real-") || !cluster.rawMentions) {
      setLlmData(null);
      setLlmError(null);
      return;
    }

    let isMounted = true;

    async function fetchLlmSummary() {
      setLoadingLlm(true);
      setLlmError(null);
      try {
        const apiKey = (import.meta.env.VITE_GROQ_API_KEY as string) || "";
        if (!apiKey) {
          throw new Error("VITE_GROQ_API_KEY is not set in your environment.");
        }

        // Format mentions for LLM context
        const mentionsText = cluster.rawMentions
          ?.slice(0, 10)
          .map((m: any, idx: number) => `[Signal #${idx + 1}] Source: ${m.source} | Title: ${m.title}\nText: ${m.text}`)
          .join("\n\n");

        const systemPrompt = `You are Sentinel AI's incident analyst. Analyze these real-time signals and return a JSON object with:
- "summary": A brief, professional executive summary of the issue (2-3 sentences max).
- "rootCauses": An array of 2-3 likely technical or operational root causes.
- "fixes": An array of 2-3 suggested remediation steps.
- "affectedUsers": A short string describing the scale of impact (e.g. "~25 users based on feedback").

Response MUST be valid JSON only. Do not wrap in markdown or add explanations.`;

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `Category: ${cluster.category}\n\nSignals:\n${mentionsText}` },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          throw new Error(`Groq API responded with status ${response.status}`);
        }

        const resJson = await response.json();
        const contentStr = resJson.choices[0]?.message?.content || "";
        const parsed = JSON.parse(contentStr);

        if (isMounted) {
          setLlmData({
            summary: parsed.summary || "No summary generated.",
            rootCauses: parsed.rootCauses || ["Unknown root cause."],
            fixes: parsed.fixes || ["Investigate logs and telemetry."],
            affectedUsers: parsed.affectedUsers || `~${cluster.rawMentions?.length || 0} user accounts impacted`,
          });
        }
      } catch (err: any) {
        console.error("LLM Summarization failed:", err);
        if (isMounted) {
          setLlmError(err.message || "Failed to generate LLM summary.");
        }
      } finally {
        if (isMounted) {
          setLoadingLlm(false);
        }
      }
    }

    fetchLlmSummary();

    return () => {
      isMounted = false;
    };
  }, [open, cluster?.id]);

  if (!cluster) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) {
          setResolved(false);
          setAlertOpen(false);
          setShowRaw(false);
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-3xl border-border bg-background p-0">
        <DialogHeader className="border-b border-border p-6">
          <div className="flex items-center gap-3">
            <SeverityBadge severity={cluster.severity} />
            <span className="text-xs text-muted-foreground">Detected {cluster.detectedAt}</span>
            <span className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_oklab,var(--critical)_15%,transparent)] px-2 py-0.5 text-xs font-semibold text-[var(--critical)]">
              <TrendingUp className="h-3 w-3" />+{cluster.increasePct}% over baseline
            </span>
            {resolved && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[color-mix(in_oklab,var(--safe)_18%,transparent)] px-2 py-0.5 text-xs font-semibold text-[var(--safe)]">
                <CheckCircle2 className="h-3 w-3" /> Resolved
              </span>
            )}
          </div>
          <DialogTitle className="mt-2 text-xl">{cluster.title}</DialogTitle>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {/* AI Report card */}
          <section className="rounded-lg border border-[var(--cyan)]/30 bg-[color-mix(in_oklab,var(--cyan)_5%,transparent)] p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-[var(--cyan)]">
                AI-Generated Report
              </h3>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background/70 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Sparkles className="h-3 w-3 text-[var(--cyan)]" /> {loadingLlm ? "Analyzing..." : "Generated by Llama 3.3"}
              </span>
            </div>

            {loadingLlm ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs font-mono">
                <Sparkles className="h-5 w-5 text-[var(--cyan)] animate-spin" />
                <span>Generating live LLM summary...</span>
              </div>
            ) : llmError ? (
              <div className="space-y-4">
                <div className="p-3 bg-red-950/20 border border-red-900/50 text-[11px] font-mono text-[var(--critical)]">
                  ⚠️ LLM Summary Error: {llmError}. Showing pre-compiled fallback summary.
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{cluster.summary}</p>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-foreground/90">
                {llmData ? llmData.summary : cluster.summary}
              </p>
            )}

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <AlertOctagon className="h-3.5 w-3.5 text-[var(--warning)]" /> Likely root cause
                </h4>
                {loadingLlm ? (
                  <div className="h-10 animate-pulse bg-white/5 rounded" />
                ) : (
                  <ul className="space-y-1.5 text-sm text-foreground/85">
                    {(llmData ? llmData.rootCauses : cluster.rootCauses).map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--warning)]" />{" "}
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Lightbulb className="h-3.5 w-3.5 text-[var(--cyan)]" /> Suggested fixes
                </h4>
                {loadingLlm ? (
                  <div className="h-10 animate-pulse bg-white/5 rounded" />
                ) : (
                  <ul className="space-y-1.5 text-sm text-foreground/85">
                    {(llmData ? llmData.fixes : cluster.fixes).map((r, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-[var(--cyan)]" /> {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-border pt-4 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Affected users:</span>
              <span className="font-medium text-foreground">
                {loadingLlm ? "..." : (llmData ? llmData.affectedUsers : cluster.affectedUsers)}
              </span>
              <span className="ml-auto">
                <SourceBadges sources={cluster.sources} />
              </span>
            </div>

            {/* Source Links Badge list */}
            {cluster.rawMentions && cluster.rawMentions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Incident Signal Sources
                </h4>
                <div className="flex flex-wrap gap-2">
                  {cluster.rawMentions.map((m: any, idx: number) => (
                    <a
                      key={idx}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-border hover:border-[var(--cyan)]/50 text-xs font-mono text-muted-foreground hover:text-white transition-colors"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
                      {m.source === "reddit" ? `Reddit: r/${m.subreddit || "all"}` : m.author || "News Article"}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Raw messages */}
          {(() => {
            const displayMessages = cluster.rawMentions || rawMessages;
            return (
              <section className="rounded-lg border border-border bg-card">
                <button
                  onClick={() => setShowRaw((s) => !s)}
                  className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-foreground"
                >
                  <span>Raw Messages ({displayMessages.length})</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", showRaw && "rotate-180")}
                  />
                </button>
                {showRaw && (
                  <div className="border-t border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <tr>
                          <th className="px-4 py-2">Source</th>
                          <th className="px-4 py-2">Message</th>
                          <th className="px-4 py-2">Classification</th>
                          <th className="px-4 py-2 text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {displayMessages.map((m: any, i: number) => {
                          const isReal = !!m.created_at;
                          return (
                            <tr key={i}>
                              <td className="px-4 py-2 text-muted-foreground">
                                <span className="inline-flex items-center gap-1.5 capitalize">
                                  <SourceIcon kind={isReal ? (m.source === "reddit" ? "social" : "review") : m.source} />
                                  {m.source}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-foreground/90">
                                {isReal ? (
                                  <div className="space-y-1">
                                    <p className="font-semibold text-xs">{m.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-3">{m.text}</p>
                                    <a 
                                      href={m.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer" 
                                      className="text-[11px] text-[var(--cyan)] hover:underline inline-block mt-1 font-mono"
                                    >
                                      Source Link &rarr;
                                    </a>
                                  </div>
                                ) : (
                                  m.text
                                )}
                              </td>
                              <td className="px-4 py-2">
                                <span className="rounded-md bg-secondary px-2 py-0.5 text-[11px] text-muted-foreground">
                                  {isReal ? `${m.category || "General"} / ${m.sentiment || "neutral"}` : m.classification}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-right font-mono text-[11px] text-muted-foreground">
                                {isReal ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : m.time}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })()}

          {alertOpen && (
            <section className="rounded-lg border border-[var(--cyan)]/40 bg-card p-4">
              <h4 className="mb-3 text-sm font-semibold">Send alert</h4>
              <div className="grid gap-3 md:grid-cols-2">
                <label className="block text-xs">
                  <span className="mb-1 block text-muted-foreground">Slack channel</span>
                  <select className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm">
                    <option>#incidents-critical</option>
                    <option>#oncall-payments</option>
                    <option>#exec-comms</option>
                  </select>
                </label>
                <label className="block text-xs">
                  <span className="mb-1 block text-muted-foreground">Also email</span>
                  <input
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    defaultValue="oncall@sentinel.ai"
                  />
                </label>
              </div>
              <div className="mt-3 flex justify-end gap-2">
                <button
                  onClick={() => setAlertOpen(false)}
                  className="rounded-md border border-border px-3 py-1.5 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setAlertOpen(false)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-[var(--cyan)] px-3 py-1.5 text-sm font-medium text-background"
                >
                  <Send className="h-3.5 w-3.5" /> Send alert
                </button>
              </div>
            </section>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-card/40 p-4">
          <button
            onClick={() => setAlertOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-md bg-[var(--cyan)] px-3 py-2 text-sm font-semibold text-background hover:opacity-90"
          >
            <Send className="h-3.5 w-3.5" /> Alert Team
          </button>
          <button
            onClick={() => setResolved(true)}
            disabled={resolved}
            className="inline-flex items-center gap-2 rounded-md border border-[var(--safe)]/50 bg-[color-mix(in_oklab,var(--safe)_12%,transparent)] px-3 py-2 text-sm font-semibold text-[var(--safe)] hover:bg-[color-mix(in_oklab,var(--safe)_20%,transparent)] disabled:opacity-60"
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> {resolved ? "Resolved" : "Mark Resolved"}
          </button>
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-medium text-foreground hover:bg-secondary">
            <FileDown className="h-3.5 w-3.5" /> Export PDF
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
