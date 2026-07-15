import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  MessageSquare,
  Timer,
  Plug,
  ArrowUpRight,
  ShieldAlert,
  RefreshCw,
  Search,
  Newspaper,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
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
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { ingestForCompanyFn } from "@/lib/ingest/server-fn";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

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

  // Real-time Brand Ingestion State
  const { user, loading: authLoading } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [onboardingProfile, setOnboardingProfile] = useState<any>(null);
  const [mentions, setMentions] = useState<any[]>([]);
  const [loadingRealData, setLoadingRealData] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanStats, setScanStats] = useState<any>(null);

  useEffect(() => {
    // If user is not onboarded, we check if they've acknowledged the simulation modal
    const hasSeen = sessionStorage.getItem("hasSeenSimulationModal");
    if (!hasSeen && !isOnboarded && !authLoading) {
      setShowSimulationModal(true);
    }
  }, [isOnboarded, authLoading]);

  useEffect(() => {
    if (authLoading || !user) return;

    const currentUser = user;
    let isMounted = true;

    async function checkOnboardingAndFetch() {
      try {
        setLoadingRealData(true);
        // 1. Fetch onboarding profile
        const { data: profile, error: profileErr } = await supabase
          .from("onboarding_profiles")
          .select("*")
          .eq("user_id", currentUser.id)
          .maybeSingle();

        if (profileErr) {
          console.error("Error loading onboarding profile:", profileErr);
          return;
        }

        if (profile) {
          if (!isMounted) return;
          setIsOnboarded(true);
          setOnboardingProfile(profile);
          setShowSimulationModal(false); // Do not show simulation modal for onboarded users

          // 2. Fetch company entry
          const { data: companyData, error: compErr } = await supabase
            .from("companies")
            .select("*")
            .eq("name", profile.company_name)
            .maybeSingle();

          if (compErr) {
            console.error("Error fetching company details:", compErr);
            return;
          }

          if (companyData) {
            if (!isMounted) return;
            setCompany(companyData);

            // 3. Fetch mentions
            const { data: mentionsData, error: mentionsErr } = await supabase
              .from("mentions")
              .select("*")
              .eq("company_id", companyData.id)
              .order("created_at", { ascending: false });

            if (mentionsErr) {
              console.error("Error fetching mentions:", mentionsErr);
            } else if (mentionsData) {
              setMentions(mentionsData);

              // 4. Trigger auto-scan if they have no mentions yet
              if (mentionsData.length === 0) {
                setScanning(true);
                try {
                  const summary = await ingestForCompanyFn({
                    data: { companyId: companyData.id },
                  });
                  setScanStats(summary);
                  toast.success(
                    `Initial scan complete! Ingested ${summary.newInserted} brand mentions.`,
                  );

                  // Re-fetch mentions
                  const { data: freshMentions } = await supabase
                    .from("mentions")
                    .select("*")
                    .eq("company_id", companyData.id)
                    .order("created_at", { ascending: false });
                  if (freshMentions && isMounted) {
                    setMentions(freshMentions);
                  }
                } catch (scanErr: any) {
                  console.error("Auto scan failed:", scanErr);
                  toast.error("Failed to fetch initial mentions. Check connections.");
                } finally {
                  if (isMounted) setScanning(false);
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Unexpected error in checkOnboardingAndFetch:", err);
      } finally {
        if (isMounted) setLoadingRealData(false);
      }
    }

    checkOnboardingAndFetch();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  const handleManualScan = async () => {
    if (!company) return;
    setScanning(true);
    toast.info("Scanning Reddit & Google News signals...");
    try {
      const summary = await ingestForCompanyFn({
        data: { companyId: company.id },
      });
      setScanStats(summary);
      toast.success(`Scan complete! Ingested ${summary.newInserted} new mentions.`);

      const { data: freshMentions } = await supabase
        .from("mentions")
        .select("*")
        .eq("company_id", company.id)
        .order("created_at", { ascending: false });
      if (freshMentions) {
        setMentions(freshMentions);
      }
    } catch (err: any) {
      console.error("Manual scan failed:", err);
      toast.error(err.message || "Failed to trigger scan.");
    } finally {
      setScanning(false);
    }
  };

  const handleCloseSimulationModal = () => {
    setShowSimulationModal(false);
    sessionStorage.setItem("hasSeenSimulationModal", "true");
  };

  const handleView = (c: CrisisCluster) => {
    setSelected(c);
    setOpen(true);
  };

  const activeIncidents = clusters.filter((c) => c.severity === "critical").length;

  // Real-time Chart Data (mentions by source over the last 7 days)
  const chartData = useMemo(() => {
    if (mentions.length === 0) return [];

    const days: Record<string, { time: string; Reddit: number; News: number }> = {};
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toLocaleDateString([], { month: "short", day: "numeric" });
      days[dateStr] = { time: dateStr, Reddit: 0, News: 0 };
    }

    for (const m of mentions) {
      const dateStr = new Date(m.created_at).toLocaleDateString([], {
        month: "short",
        day: "numeric",
      });
      if (days[dateStr]) {
        if (m.source === "reddit") {
          days[dateStr].Reddit += 1;
        } else {
          days[dateStr].News += 1;
        }
      }
    }

    return Object.values(days);
  }, [mentions]);

  if (isOnboarded && (loadingRealData || authLoading)) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#298DFF]" />
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Synchronizing command center signals...
          </p>
        </div>
      </div>
    );
  }

  // --- Real-time Onboarded UI Layout ---
  if (isOnboarded && company) {
    const realActiveIncidents = mentions.filter(
      (m) => m.sentiment === "critical" || m.sentiment === "negative",
    ).length;

    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Real-time monitoring for{" "}
              <span className="font-semibold text-white">{company.name}</span>.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span
                className={cn(
                  "inline-flex h-2 w-2 rounded-full",
                  scanning ? "bg-[#298DFF] animate-pulse" : "bg-[var(--safe)] animate-pulse",
                )}
              />
              {scanning ? "SCANNING API FEEDS..." : "LISTENING LIVE"}
            </div>
            <Button
              onClick={handleManualScan}
              disabled={scanning}
              className="rounded-none bg-[#298DFF] hover:bg-[#298DFF]/90 font-mono text-xs uppercase tracking-wider font-bold px-4 py-2 text-white flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className={cn("h-3.5 w-3.5", scanning && "animate-spin")} />
              {scanning ? "Scanning..." : "Scan Signals"}
            </Button>
          </div>
        </div>

        {/* Stats Panel */}
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Alerts"
            value={realActiveIncidents}
            tone="critical"
            icon={AlertTriangle}
            footer={
              realActiveIncidents > 0 ? (
                <span className="text-[var(--critical)] font-medium">
                  Immediate triage required
                </span>
              ) : (
                "No critical anomalies"
              )
            }
          />
          <StatCard
            label="Signals Found"
            value={mentions.length}
            suffix=" items"
            icon={MessageSquare}
            footer={
              <span>
                Reddit: {mentions.filter((m) => m.source === "reddit").length} · News:{" "}
                {mentions.filter((m) => m.source === "news").length}
              </span>
            }
          />
          <StatCard
            label="Monitored Keywords"
            value={[company.name, ...(company.aliases || [])].length}
            suffix=" keys"
            icon={Timer}
            footer={`Company and associated aliases`}
          />
          <StatCard
            label="Integrations"
            value={2}
            suffix="/2 Active"
            tone="ok"
            icon={Plug}
            footer="Reddit crawler, Google News RSS"
          />
        </section>

        {/* Details & Ingest Feed */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Real Chart */}
            <div className="rounded-lg border border-border bg-card p-6">
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight">Signal History</h2>
                <p className="text-xs text-muted-foreground">
                  Crawler ingestion volume by source over the last 7 days.
                </p>
              </div>

              {chartData.length > 0 ? (
                <div className="h-72 w-full font-mono">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="grad-Reddit" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF4500" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#FF4500" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="grad-News" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#298DFF" stopOpacity={0.35} />
                          <stop offset="100%" stopColor="#298DFF" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2530" vertical={false} />
                      <XAxis dataKey="time" stroke="#5b6473" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#5b6473" tick={{ fontSize: 11 }} width={32} />
                      <Tooltip
                        contentStyle={{
                          background: "#12161F",
                          border: "1px solid #1F2530",
                          borderRadius: 0,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: "#9aa3b2" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="Reddit"
                        stroke="#FF4500"
                        strokeWidth={1.8}
                        fill="url(#grad-Reddit)"
                      />
                      <Area
                        type="monotone"
                        dataKey="News"
                        stroke="#298DFF"
                        strokeWidth={1.8}
                        fill="url(#grad-News)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground uppercase">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#FF4500]" />
                      Reddit
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#298DFF]" />
                      Google News
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-72 w-full flex items-center justify-center border border-dashed border-[#343940] bg-black/20 text-xs text-muted-foreground font-mono">
                  No scan history data. Run a scan to fetch signals.
                </div>
              )}
            </div>

            {/* Ingested signals lists */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight">Signal Intelligence Feed</h2>
                <p className="text-xs text-muted-foreground font-mono uppercase">
                  Real-time crawls matching: {company.name}{" "}
                  {company.aliases?.length > 0 && `(aliases: ${company.aliases.join(", ")})`}
                </p>
              </div>

              {mentions.length > 0 ? (
                <div className="grid gap-4">
                  {mentions.slice(0, 10).map((m) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-border bg-card p-5 space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider",
                              m.source === "reddit"
                                ? "bg-[#FF4500]/15 text-[#FF4500]"
                                : "bg-[#298DFF]/15 text-[#298DFF]",
                            )}
                          >
                            {m.source === "reddit" ? (
                              <>
                                <MessageSquare className="h-3 w-3" />
                                Reddit · r/{m.subreddit || "all"}
                              </>
                            ) : (
                              <>
                                <Newspaper className="h-3 w-3" />
                                Google News
                              </>
                            )}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            By: {m.author}
                          </span>
                          {m.score !== null && (
                            <span className="text-[10px] text-[#6C7584] font-mono">
                              Score: {m.score}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {new Date(m.created_at).toLocaleDateString([], {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm font-bold hover:text-[#298DFF] transition-colors leading-snug"
                      >
                        {m.title}
                      </a>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words">
                        {m.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[#343940] bg-card p-12 text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 text-[#6C7584] mx-auto mb-3" />
                  <p className="text-sm font-semibold">No brand signals ingested yet</p>
                  <p className="text-xs mt-1">Click the "Scan Signals" button to scan now.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Company Info & Crawl Status */}
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-md font-bold uppercase tracking-wider font-mono text-[#298DFF]">
                Monitored Identity
              </h3>
              <div className="space-y-3 text-xs leading-relaxed">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-[#6C7584] block mb-1">
                    Company Name
                  </span>
                  <span className="font-bold text-white text-sm">{company.name}</span>
                </div>
                {company.aliases?.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-[#6C7584] block mb-1">
                      Aliases Tracked
                    </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {company.aliases.map((a: string) => (
                        <span
                          key={a}
                          className="px-2 py-0.5 bg-[#1e2227] border border-[#343940] font-mono text-[9px]"
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {onboardingProfile && (
                  <>
                    {onboardingProfile.website && (
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#6C7584] block mb-1">
                          Website URL
                        </span>
                        <a
                          href={onboardingProfile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#298DFF] hover:underline"
                        >
                          {onboardingProfile.website}
                        </a>
                      </div>
                    )}
                    {onboardingProfile.industry && (
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#6C7584] block mb-1">
                          Industry Sector
                        </span>
                        <span className="text-white">{onboardingProfile.industry}</span>
                      </div>
                    )}
                    {onboardingProfile.description && (
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#6C7584] block mb-1">
                          Profile Description
                        </span>
                        <p className="text-muted-foreground text-[11px] mt-1">
                          {onboardingProfile.description}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <h3 className="text-md font-bold uppercase tracking-wider font-mono text-[#298DFF]">
                Scanning Status
              </h3>
              <div className="space-y-4 text-xs font-mono">
                <div className="p-3 border border-[#343940] bg-black/40 space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[#6C7584]">
                    <span>Reddit Crawler</span>
                    <span className="text-[#2ed573]">Active</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Hits search.json API using User-Agent. Crawls posts and comments.
                  </p>
                </div>

                <div className="p-3 border border-[#343940] bg-black/40 space-y-2">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider text-[#6C7584]">
                    <span>Google News RSS</span>
                    <span className="text-[#2ed573]">Active</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Parses RSS feed via rss-parser. Crawls global news headlines.
                  </p>
                </div>

                {scanStats && (
                  <div className="border border-border p-3 space-y-2">
                    <span className="text-[10px] uppercase tracking-wider text-[#298DFF] block">
                      Last Scan Results
                    </span>
                    <ul className="text-[10px] space-y-1 text-muted-foreground">
                      <li>• Total Found: {scanStats.totalFound} mentions</li>
                      <li>• New Ingested: {scanStats.newInserted} entries</li>
                      <li>• Reddit Inserts: {scanStats.bySource?.reddit}</li>
                      <li>• News Inserts: {scanStats.bySource?.news}</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  // --- End of Real-time UI Layout ---

  // --- Fallback Simulated UI Layout (Original) ---
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
              className="w-full rounded-none bg-[#298DFF] hover:bg-[#298DFF]/90 font-mono text-xs uppercase tracking-wider font-bold py-2 text-white cursor-pointer"
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
