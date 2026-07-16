import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import {
  FileText,
  Download,
  Sparkles,
  Loader2,
  AlertTriangle,
  FileDown,
  Copy,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Cpu,
  Layers
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { seedFeed } from "@/lib/mock-data";
import { toast } from "sonner";

interface Report {
  id: string;
  date: string;
  title: string;
  severity: "Critical" | "Warning" | "Watching";
  duration: string;
  content: string;
  dataSource: "real" | "simulated";
  modelUsed: string;
}

// Initial mock reports list
const initialReports: Report[] = [
  {
    id: "rep-1",
    date: "Today",
    title: "Payment Failure Spike — Stripe 3DS Integration",
    severity: "Critical",
    duration: "ongoing",
    dataSource: "simulated",
    modelUsed: "mixtral-8x7b-32768",
    content: `# EXECUTIVE REPORT: Payment Failure Spike — Stripe 3DS Integration

## 1. Incident Overview
Over the last 15 minutes, we detected a major spike in payment failures concentrated on Visa card checkouts within the EU region. 

- **Primary Source:** Support Chat & customer emails.
- **Latency to Detect:** 28 seconds from incident onset.
- **Sentiment Velocity:** Extremely critical.

## 2. Root Cause Analysis
Our telemetry identifies two parallel triggers:
1. **API Callback 502:** Stripe 3DS callback is returning a Gateway Error (502 Bad Gateway) on \`eu-west-1\` edge locations.
2. **Redirect Handler Failure:** Recent build #4821 modified the redirection logic under \`/checkout/confirm\`, causing sessions to hang when user attempts multi-factor verification.

## 3. Remediation Recommendations
- **Roll back** current release #4821 immediately to restore original redirect paths.
- **Failover** webhook listeners to \`us-east-1\` to check if regional gateway corrects the 3DS handler.
- Update client payment flow to fall back gracefully to a non-3DS secondary route when verification timed out.`
  },
  {
    id: "rep-2",
    date: "Yesterday",
    title: "API us-west-2 Gateway Elevated 5xx Outage",
    severity: "Critical",
    duration: "47 min",
    dataSource: "simulated",
    modelUsed: "llama-3.3-70b-versatile",
    content: `# CO-ORDINATED SRE INCIDENT REPORT: API us-west-2 Elevated 5xx Outage

## 1. Incident Timeline
- **Start Time:** 09:47 UTC
- **End Time:** 10:34 UTC
- **Total Duration:** 47 minutes
- **Impact:** ~14,000 active users degraded. Mobile app sync was completely unavailable.

## 2. Technical Findings
During this time window, 18% of gateway queries returned HTTP 503 Service Unavailable. The underlying database connection pool in RDS Aurora was fully exhausted. CloudWatch alarms failed to trigger because of state caching.

## 3. Rectification Executed
- connection limits bumped from \`200\` to \`600\` via pgbouncer patch.
- RDS database writer manually failed over to secondary node in usw2b.
- Telemetry caching corrected to prevent stale CloudWatch thresholds.`
  }
];

export const Route = createFileRoute("/_app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const { user, loading: authLoading } = useAuth();
  
  // Real database states
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [mentions, setMentions] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Report Generator UI states
  const [dataSource, setDataSource] = useState<"real" | "simulated">("simulated");
  const [selectedModel, setSelectedModel] = useState<string>("llama-3.3-70b-versatile");
  const [generating, setGenerating] = useState(false);
  const [currentStepText, setCurrentStepText] = useState("");
  
  // Custom reports persistence
  const [reportsList, setReportsList] = useState<Report[]>([]);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch onboarding state and mentions
  useEffect(() => {
    if (authLoading) return;
    
    let isMounted = true;
    async function loadData() {
      if (!user) {
        setLoadingDb(false);
        return;
      }
      try {
        setLoadingDb(true);
        // Load onboarding profile
        const { data: profile } = await supabase
          .from("onboarding_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile && isMounted) {
          setIsOnboarded(true);
          setDataSource("real"); // Default to real if onboarded

          // Get company details
          const { data: companyData } = await supabase
            .from("companies")
            .select("*")
            .eq("name", profile.company_name)
            .maybeSingle();

          if (companyData && isMounted) {
            setCompany(companyData);

            // Fetch real mentions
            const { data: mentionsData } = await supabase
              .from("mentions")
              .select("*")
              .eq("company_id", companyData.id)
              .order("created_at", { ascending: false });

            if (mentionsData && isMounted) {
              setMentions(mentionsData);
            }
          }
        }
      } catch (err) {
        console.error("Error loading reports data:", err);
      } finally {
        if (isMounted) setLoadingDb(false);
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Load custom reports from LocalStorage after checking onboarding status
  useEffect(() => {
    if (authLoading || loadingDb) return;

    const cached = localStorage.getItem("sentinel_reports");
    let loadedReports: Report[] = [];
    if (cached) {
      try {
        loadedReports = JSON.parse(cached);
      } catch {
        loadedReports = isOnboarded ? [] : initialReports;
      }
    } else {
      loadedReports = isOnboarded ? [] : initialReports;
    }

    if (isOnboarded) {
      // Filter out any simulated reports for onboarded users
      loadedReports = loadedReports.filter((r) => r.dataSource !== "simulated");
    }

    setReportsList(loadedReports);
    localStorage.setItem("sentinel_reports", JSON.stringify(loadedReports));
  }, [authLoading, loadingDb, isOnboarded]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    
    // Step animations
    const steps = [
      "Gathering signal sources...",
      "Structuring feed payload...",
      "Analyzing sentiment velocity...",
      "Connecting to Groq LLM API...",
      "Generating report structure..."
    ];

    let currentStep = 0;
    setCurrentStepText(steps[0]);
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setCurrentStepText(steps[currentStep]);
      }
    }, 1500);

    try {
      // 1. Prepare feed dataset text
      let feedContent = "";
      let targetCompany = "Sentinel Test Company";
      
      if (dataSource === "real") {
        if (company) {
          targetCompany = company.name;
        }
        if (mentions.length === 0) {
          throw new Error("No brand mentions available. Please trigger a scan in the Command Center first.");
        }
        feedContent = mentions.map((m, i) => 
          `[Signal #${i + 1}] Source: ${m.source} | Author: ${m.author} | Title: ${m.title} | Category: ${m.category || "General"} | Sentiment: ${m.sentiment || "Neutral"}\nText: ${m.text}`
        ).join("\n\n");
      } else {
        feedContent = seedFeed.map((m, i) => 
          `[Signal #${i + 1}] Source: ${m.source} | Title: ${m.text} | Category: ${m.category} | Sentiment: ${m.sentiment}\nText: ${m.text}`
        ).join("\n\n");
      }

      // 2. Call Groq Completion API
      const groqApiKey = (import.meta.env.VITE_GROQ_API_KEY as string) || "";
      if (!groqApiKey) {
        throw new Error("Groq API Key is not set. Please configure VITE_GROQ_API_KEY in your .env file.");
      }
      const systemPrompt = `You are Sentinel AI's executive report engine. Analyze the brand intelligence signals below for company: "${targetCompany}". 
Generate a comprehensive, executive-ready summary report.
The report must look highly professional and contain the following sections:
1. Executive Incident Summary (Brief high level overview of sentiment/issue counts)
2. Channel Breakdown (Analyze Reddit vs News feedback patterns)
3. Threat Vector Assessment (Identify severe categories like Payment issues, Outages, or PR risks)
4. Recommended Remediations (Suggest concrete, SRE-style actions)

Format your output in clean Markdown. Add a clear, professional, short title on the very first line starting with #. Do NOT output anything else before the markdown heading.`;

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here are the ingested feed items for "${targetCompany}":\n\n${feedContent}` }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Groq request failed:", errorText);
        throw new Error("Unable to contact Groq API. Please verify the API key.");
      }

      const resJson = await response.json();
      const content = resJson.choices[0]?.message?.content || "";
      if (!content) {
        throw new Error("Received empty summary from Groq engine.");
      }

      // Extract title from the first heading line
      const firstLine = content.split("\n")[0] || "";
      const parsedTitle = firstLine.startsWith("#") 
        ? firstLine.replace(/^#+\s*/, "").trim()
        : `${targetCompany} Feed Signal Summary`;

      // Create new report object
      const newReport: Report = {
        id: `rep-${Date.now()}`,
        date: new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" }),
        title: parsedTitle.length > 50 ? parsedTitle.slice(0, 50) + "..." : parsedTitle,
        severity: mentions.some(m => m.sentiment === "critical") || seedFeed.some(m => m.sentiment === "neg") ? "Critical" : "Warning",
        duration: dataSource === "real" ? `${mentions.length} signals` : "Feed snapshot",
        content: content,
        dataSource: dataSource,
        modelUsed: selectedModel
      };

      // Add to list and save to localStorage
      const updated = [newReport, ...reportsList];
      setReportsList(updated);
      localStorage.setItem("sentinel_reports", JSON.stringify(updated));
      
      toast.success("AI Signal intelligence report compiled successfully!");
      setActiveReport(newReport); // Auto-open the drawer for feedback
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during generation.");
    } finally {
      clearInterval(stepInterval);
      setGenerating(false);
      setCurrentStepText("");
    }
  };

  const handleCopyContent = (report: Report) => {
    navigator.clipboard.writeText(report.content);
    setCopiedId(report.id);
    toast.success("Report copied to clipboard.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (report: Report) => {
    const blob = new Blob([report.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_report.md`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully.");
  };

  // Simplified custom markdown renderer
  const renderMarkdown = (text: string) => {
    const lines = text.split("\n");
    let inCodeBlock = false;
    let codeContent: string[] = [];

    return lines.map((line, idx) => {
      // Code blocks
      if (line.trim().startsWith("```")) {
        if (inCodeBlock) {
          inCodeBlock = false;
          const contentStr = codeContent.join("\n");
          codeContent = [];
          return (
            <pre key={idx} className="my-3 overflow-x-auto border border-border bg-black/60 p-4 font-mono text-[11px] text-[var(--cyan)]">
              <code>{contentStr}</code>
            </pre>
          );
        } else {
          inCodeBlock = true;
          return null;
        }
      }

      if (inCodeBlock) {
        codeContent.push(line);
        return null;
      }

      // Headings
      if (line.startsWith("# ")) {
        return <h1 key={idx} className="mt-6 mb-3 text-xl font-bold tracking-tight text-white border-b border-border pb-1 uppercase font-mono">{line.replace("# ", "")}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={idx} className="mt-5 mb-2 text-md font-bold tracking-tight text-white/90 uppercase font-mono">{line.replace("## ", "")}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={idx} className="mt-4 mb-2 text-sm font-semibold text-white/80 font-mono">{line.replace("### ", "")}</h3>;
      }

      // Lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const itemText = line.replace(/^[\s*-]+/, "");
        return (
          <li key={idx} className="ml-5 list-disc text-xs text-muted-foreground leading-relaxed my-1">
            {parseInlineStyles(itemText)}
          </li>
        );
      }

      // Plain paragraphs
      if (line.trim() === "") return <div key={idx} className="h-2" />;

      return (
        <p key={idx} className="text-xs text-muted-foreground leading-relaxed my-2">
          {parseInlineStyles(line)}
        </p>
      );
    });
  };

  // Helper to parse bold ** and code ` tags inline
  const parseInlineStyles = (lineStr: string) => {
    const parts = lineStr.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="px-1.5 py-0.5 bg-black/40 border border-border text-[var(--cyan)] font-mono text-[10px]">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Signal Reports Hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate executive incident summaries and signal intelligence reports using Groq LLM.
          </p>
        </div>
      </div>

      {/* Compiler Control Board */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-lg border border-border bg-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white font-mono">
              <Sparkles className="h-4 w-4 text-[var(--cyan)]" />
              <span>AI Summary Compiler</span>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              Synthesize brand feedback from your live streams or feed simulators. Groq translates multi-channel noise into an executive-ready post-mortem mapping incident summaries, root causes, and recommended code-level fixes.
            </p>

            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              {/* Select Source */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  Feed Data Source
                </label>
                <div className="flex bg-black/40 border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => setDataSource("real")}
                    disabled={!isOnboarded}
                    className={`flex-1 text-[10px] font-bold uppercase font-mono tracking-wider py-1.5 text-center transition-colors cursor-pointer ${
                      dataSource === "real"
                        ? "bg-[#298DFF] text-white"
                        : "text-muted-foreground hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                    }`}
                  >
                    Live Mentions ({mentions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDataSource("simulated")}
                    className={`flex-1 text-[10px] font-bold uppercase font-mono tracking-wider py-1.5 text-center transition-colors cursor-pointer ${
                      dataSource === "simulated"
                        ? "bg-[#298DFF] text-white"
                        : "text-muted-foreground hover:text-white"
                    }`}
                  >
                    Simulated Feed
                  </button>
                </div>
                {!isOnboarded && (
                  <span className="text-[9px] font-mono text-[var(--warning)] block mt-1">
                    * Complete profile onboarding to link live mentions database.
                  </span>
                )}
              </div>

              {/* Select Model */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                  LLM Intelligence Engine
                </label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-black/40 border border-border text-xs font-mono py-1.5 px-2 text-white outline-none focus:border-[#298DFF] h-[34px]"
                >
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Complex Insights)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast Inferences)</option>
                  <option value="gemma2-9b-it">Gemma 2 9B (Accurate Summaries)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleGenerateReport}
              disabled={generating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-[#298DFF] hover:bg-[#298DFF]/90 font-mono text-xs uppercase tracking-wider font-bold py-3 text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>{currentStepText || "Generating report..."}</span>
                </>
              ) : (
                <>
                  <Cpu className="h-4 w-4" />
                  <span>Compile Signals Report via Groq</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Informative Stats Card */}
        <div className="rounded-lg border border-border bg-card p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-white font-mono">
              <Layers className="h-4 w-4 text-[var(--cyan)]" />
              <span>Compilation Stats</span>
            </div>
            
            <div className="space-y-3 pt-2 font-mono text-xs">
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Monitored Entity:</span>
                <span className="text-white font-bold">{company ? company.name : "N/A (Simulated)"}</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Ingested Mentions:</span>
                <span className="text-[var(--cyan)] font-bold">{mentions.length} records</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Simulated Feed:</span>
                <span className="text-white font-bold">{seedFeed.length} signals</span>
              </div>
              <div className="flex justify-between border-b border-border/40 pb-2">
                <span className="text-muted-foreground">Total Reports:</span>
                <span className="text-white font-bold">{reportsList.length} compiled</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 border border-[var(--cyan)]/25 bg-[var(--cyan)]/5 text-[10px] font-mono text-[var(--cyan)] mt-4 leading-relaxed">
            <span className="font-bold uppercase block mb-1">PRO-TIP:</span>
            Switch parameters to test Llama-3 versus Mixtral models for varying SRE post-mortem formats.
          </div>
        </div>
      </div>

      {/* Reports Table list */}
      <div className="space-y-2">
        <h2 className="text-md font-bold uppercase tracking-wider text-white font-mono">Compiled Archives</h2>
        
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Report Details</th>
                <th className="px-4 py-3">Engine / Source</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reportsList.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{r.date}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setActiveReport(r)}
                      className="inline-flex items-center gap-2 hover:text-[var(--cyan)] transition-colors font-bold text-left cursor-pointer font-sans"
                    >
                      <FileText className="h-4 w-4 shrink-0 text-[var(--cyan)]" />
                      {r.title}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5 text-[10px] font-mono text-muted-foreground">
                      <span>Model: {r.modelUsed || "unknown"}</span>
                      <span className="uppercase text-[9px] tracking-wide text-white/50">Source: {r.dataSource === "real" ? "Live DB" : "Simulated"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        r.severity === "Critical"
                          ? "inline-block rounded-md bg-[color-mix(in_oklab,var(--critical)_18%,transparent)] px-2 py-0.5 text-xs font-semibold text-[var(--critical)]"
                          : "inline-block rounded-md bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] px-2 py-0.5 text-xs font-semibold text-[var(--warning)]"
                      }
                    >
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopyContent(r)}
                        className="inline-flex h-8 w-8 items-center justify-center border border-border bg-secondary/40 hover:text-[var(--cyan)] transition-colors cursor-pointer"
                        title="Copy to clipboard"
                      >
                        {copiedId === r.id ? <Check className="h-3.5 w-3.5 text-[var(--safe)]" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDownload(r)}
                        className="inline-flex h-8 w-8 items-center justify-center border border-border bg-secondary/40 hover:text-[var(--cyan)] transition-colors cursor-pointer"
                        title="Download Markdown file"
                      >
                        <FileDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveReport(r)}
                        className="inline-flex items-center gap-1.5 border border-[#298DFF]/40 bg-[#298DFF]/10 text-[#298DFF] hover:bg-[#298DFF]/20 px-2.5 py-1.5 text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer"
                      >
                        Read
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {reportsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground font-mono text-xs">
                    No compiled reports in archives. Select options and hit compile above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer Overlay for Report Details */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          {/* Overlay Click-to-dismiss */}
          <div className="flex-1" onClick={() => setActiveReport(null)} />
          
          {/* Main Panel */}
          <div className="w-full max-w-2xl border-l border-border bg-[#131518] p-6 shadow-2xl h-screen flex flex-col justify-between animate-slide-in-right overflow-hidden text-white">
            <div className="space-y-4 flex-1 overflow-y-auto pr-2 pb-6">
              {/* Header inside Panel */}
              <div className="flex justify-between items-start border-b border-border pb-4">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    <ShieldCheck className="h-3.5 w-3.5 text-[var(--safe)]" />
                    <span>Sentinel Security Summary</span>
                    <span>•</span>
                    <span>{activeReport.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mt-1 font-sans">
                    {activeReport.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-1.5 py-0.5 bg-black/50 border border-border rounded-none text-[9px] font-mono text-muted-foreground">
                      Engine: {activeReport.modelUsed}
                    </span>
                    <span className="px-1.5 py-0.5 bg-black/50 border border-border rounded-none text-[9px] font-mono text-muted-foreground uppercase">
                      Source: {activeReport.dataSource === "real" ? "Live" : "Simulated"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveReport(null)}
                  className="inline-flex h-8 w-8 items-center justify-center border border-border bg-secondary/40 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Renders AI Markdown text */}
              <div className="pt-2 text-xs leading-relaxed space-y-2">
                {renderMarkdown(activeReport.content)}
              </div>
            </div>

            {/* Action Bar inside Panel Footer */}
            <div className="border-t border-border pt-4 flex items-center justify-between bg-[#131518] z-10 shrink-0">
              <span className="text-[10px] font-mono text-muted-foreground">
                Compiled & Persisted locally
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleCopyContent(activeReport)}
                  className="inline-flex items-center gap-1.5 border border-border bg-secondary/40 px-3 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-colors hover:text-white cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy Markdown
                </button>
                <button
                  onClick={() => handleDownload(activeReport)}
                  className="inline-flex items-center gap-1.5 bg-[#298DFF] hover:bg-[#298DFF]/90 text-white px-4 py-2 text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
