import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Radar,
  ArrowRight,
  MessageSquare,
  Star,
  Twitter,
  Mail,
  Plug,
  Sliders,
  Bell,
  Loader2,
  Eye,
  EyeOff,
  CheckCircle2,
  LogOut,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

function SetupPage() {
  const navigate = useNavigate();
  const { user, signOut, loading: authLoading } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);

  const [connectedSources, setConnectedSources] = useState({
    slack: true,
    email: false,
    twitter: true,
    intercom: false,
  });

  const [threshold, setThreshold] = useState(65);

  // Load from localStorage client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSources = localStorage.getItem("sentinel_setup_sources");
      if (savedSources) {
        try {
          setConnectedSources(JSON.parse(savedSources));
        } catch (e) {}
      }
      const savedThreshold = localStorage.getItem("sentinel_setup_threshold");
      if (savedThreshold) {
        const num = parseInt(savedThreshold, 10);
        if (!isNaN(num)) {
          setThreshold(num);
        }
      }
    }
  }, []);

  const toggleSource = (key: "slack" | "email" | "twitter" | "intercom") => {
    setConnectedSources((prev) => {
      const next = {
        ...prev,
        [key]: !prev[key],
      };
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_setup_sources", JSON.stringify(next));
      }
      return next;
    });
  };

  const handleThresholdChange = (val: number) => {
    setThreshold(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("sentinel_setup_threshold", val.toString());
    }
  };

  const handleSyncPrefs = async () => {
    if (!user) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase.from("alert_preferences").upsert({
        user_id: user.id,
        threshold,
        notify_slack: true,
        notify_email: true,
      });

      if (error) {
        toast.error("Failed to sync preferences: " + error.message);
      } else {
        toast.success("Alert preferences synced successfully!");
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSyncing(false);
    }
  };

  const activeCount = Object.values(connectedSources).filter(Boolean).length;

  // Auth form state
  const [isSignIn, setIsSignIn] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [company, setCompany] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailConfirmRequired, setEmailConfirmRequired] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isSignIn) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data.user) {
          toast.success("Welcome back!");
          navigate({ to: "/dashboard" });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company,
            },
          },
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data.user) {
          if (!data.session) {
            setEmailConfirmRequired(true);
          } else {
            // Session exists — set up default alert preferences
            await supabase.from("alert_preferences").upsert({
              user_id: data.user.id,
              threshold,
              notify_slack: true,
              notify_email: true,
            });
          }

          setShowSuccess(true);
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/home" className="flex items-center gap-2.5">
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-none bg-primary/15 border border-primary/30 text-primary">
              <Radar className="h-4 w-4" />
              <span className="absolute inset-0 border border-primary/60 animate-ping opacity-40" />
            </span>
            <span className="font-bold tracking-tight text-foreground uppercase text-sm font-mono">
              Sentinel <span className="text-primary">AI</span>
            </span>
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 rounded-none border border-border bg-card px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 pt-32 pb-24">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Left Column: 3-step diagram */}
          <div className="lg:col-span-3">
            <div className="mb-8 tech-line pb-4 relative">
              <div className="absolute bottom-0 left-0 w-6 h-0.5 bg-primary" />
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-primary">
                [ SYSTEM DEPLOYMENT ]
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase text-foreground md:text-4xl">
                Interactive Preview
              </h1>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Play with the interactive steps below to see how Sentinel detects anomalies in real
                time.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Step 1: Connect */}
              <div className="flex flex-col border border-border bg-card p-6 relative group transition-all duration-300 hover:border-primary/40">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-primary transition-all duration-300" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-border bg-card text-primary relative">
                  <Plug className="h-5 w-5" />
                  <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center bg-border text-[9px] font-mono font-bold text-foreground border border-border">
                    01
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-foreground">
                  Step 1: Connect
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground mb-6">
                  Link your support chat, email, social media, and review channels in minutes —
                  OAuth or API key, read-only access.
                </p>

                {/* Step 1 Visual Playground */}
                <div className="mt-auto grid grid-cols-2 gap-3 bg-background/40 p-4 border border-border/45">
                  {[
                    {
                      key: "slack",
                      label: "Support Chat",
                      icon: MessageSquare,
                      color: "var(--primary)",
                    },
                    { key: "email", label: "Email", icon: Mail, color: "var(--safe)" },
                    {
                      key: "twitter",
                      label: "Social Media",
                      icon: Twitter,
                      color: "var(--warning)",
                    },
                    { key: "intercom", label: "App Reviews", icon: Star, color: "var(--warning)" },
                  ].map((src) => {
                    const isConnected = connectedSources[src.key as keyof typeof connectedSources];
                    const Icon = src.icon;
                    return (
                      <button
                        key={src.key}
                        onClick={() =>
                          toggleSource(src.key as "slack" | "email" | "twitter" | "intercom")
                        }
                        type="button"
                        className={`flex flex-col items-center justify-center p-3 border transition-all duration-200 cursor-pointer ${
                          isConnected
                            ? "border-primary/60 bg-primary/5 shadow-[0_0_12px_rgba(41,141,255,0.1)]"
                            : "border-border bg-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Icon
                          className="h-5 w-5 mb-1.5"
                          style={{ color: isConnected ? src.color : "var(--muted-foreground)" }}
                        />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-foreground mb-0.5">
                          {src.label}
                        </span>
                        <span
                          className={`text-[8px] font-mono ${isConnected ? "text-safe" : "text-muted-foreground"}`}
                          style={{ color: isConnected ? "var(--safe)" : "var(--muted-foreground)" }}
                        >
                          {isConnected ? "● Connected" : "○ Connect"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Calibrate */}
              <div className="flex flex-col border border-border bg-card p-6 relative group transition-all duration-300 hover:border-primary/40">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-primary transition-all duration-300" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-border bg-card text-primary relative">
                  <Sliders className="h-5 w-5" />
                  <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center bg-border text-[9px] font-mono font-bold text-foreground border border-border">
                    02
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-foreground">
                  Step 2: Calibrate
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground mb-6">
                  Sentinel learns your normal traffic patterns (3–7 days) and sets smart thresholds
                  per crisis category.
                </p>

                {/* Step 2 Visual Playground */}
                <div className="mt-auto bg-background/40 p-4 border border-border/45 flex flex-col gap-4">
                  {activeCount === 0 ? (
                    <div className="h-[120px] flex items-center justify-center text-center p-4">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        [ Connect a source in Step 1 to begin calibration ]
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="h-[100px] border border-border/40 bg-background/60 relative overflow-hidden">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 260 100"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <pattern
                              id="svg-grid-setup"
                              width="20"
                              height="20"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 20 0 L 0 0 0 20"
                                fill="none"
                                stroke="var(--border)"
                                strokeWidth="0.5"
                                opacity="0.3"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#svg-grid-setup)" />

                          {/* Normal traffic shading */}
                          <path
                            d="M 10 90 Q 25 87.5 40 85 T 70 40 T 100 88 T 130 15 T 160 80 T 190 95 T 220 85 T 250 90 L 260 90 L 260 100 L 0 100 Z"
                            fill="var(--primary)"
                            opacity="0.05"
                          />

                          {/* Threshold boundary line */}
                          <line
                            x1="0"
                            y1={100 - threshold}
                            x2="260"
                            y2={100 - threshold}
                            stroke="var(--warning)"
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                          />

                          {/* Main line */}
                          <path
                            d="M 10 90 C 25 87.5 40 85 70 40 C 100 88 130 15 160 80 C 190 95 220 85 250 90"
                            fill="none"
                            stroke="var(--primary)"
                            strokeWidth="2"
                          />

                          {/* Data points */}
                          {[
                            { x: 10, y: 90 },
                            { x: 40, y: 85 },
                            { x: 70, y: 40, vol: 60, src: "slack" }, // Peak 1
                            { x: 100, y: 88 },
                            { x: 130, y: 15, vol: 85, src: "twitter" }, // Peak 2
                            { x: 160, y: 80 },
                            { x: 190, y: 95 },
                            { x: 220, y: 85 },
                            { x: 250, y: 90 },
                          ].map((p, idx) => {
                            const isPeak = p.vol !== undefined;
                            const isSourceActive = p.src
                              ? connectedSources[p.src as keyof typeof connectedSources]
                              : true;
                            const vol = p.vol || 100 - p.y;
                            const isViolated = isSourceActive && vol > threshold;

                            return (
                              <circle
                                key={idx}
                                cx={p.x}
                                cy={p.y}
                                r={isPeak && isViolated ? "5" : "3"}
                                fill={isPeak && isViolated ? "var(--critical)" : "var(--primary)"}
                                className={isPeak && isViolated ? "animate-pulse" : ""}
                              />
                            );
                          })}
                        </svg>

                        {/* Threshold value text floating */}
                        <div
                          className="absolute left-2 text-[8px] font-mono text-warning uppercase pointer-events-none transition-all duration-100"
                          style={{
                            top: `${Math.max(5, Math.min(80, 100 - threshold - 12))}px`,
                            color: "var(--warning)",
                          }}
                        >
                          Alert limit: {threshold} ev/m
                        </div>
                      </div>

                      {/* Threshold Slider control */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-muted-foreground">
                          <span>THRESHOLD SENSITIVITY</span>
                          <span className="text-foreground font-bold">{threshold} events/min</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="90"
                          value={threshold}
                          onChange={(e) => handleThresholdChange(Number(e.target.value))}
                          className="w-full h-1 bg-secondary appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-muted-foreground">
                          <span>LOWER LIMIT (MORE ALERTS)</span>
                          <span>HIGHER LIMIT (FEWER ALERTS)</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Step 3: Get Alerted */}
              <div className="flex flex-col border border-border bg-card p-6 relative group transition-all duration-300 hover:border-primary/40">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-primary transition-all duration-300" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-border bg-card text-primary relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center bg-border text-[9px] font-mono font-bold text-foreground border border-border">
                    03
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-foreground">
                  Step 3: Get Alerted
                </h3>
                <p className="text-xs leading-relaxed text-muted-foreground mb-6">
                  The moment a real anomaly hits, your team gets a Slack/email alert + an
                  AI-generated incident report.
                </p>

                {/* Step 3 Visual Playground */}
                <div className="mt-auto bg-background/40 p-4 border border-border/45 flex flex-col gap-3 min-h-[160px]">
                  {activeCount === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center p-4">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                        [ Offline — No streams connected ]
                      </p>
                    </div>
                  ) : !(connectedSources.slack && 60 > threshold) &&
                    !(connectedSources.twitter && 85 > threshold) ? (
                    <div
                      className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-safe/20 bg-safe/5"
                      style={{
                        borderColor: "var(--safe)",
                        backgroundColor: "color-mix(in oklab, var(--safe) 5%, transparent)",
                      }}
                    >
                      <span className="relative flex h-2 w-2 mb-2">
                        <span
                          className="absolute inline-flex h-full w-full rounded-full bg-safe opacity-75 animate-ping"
                          style={{ backgroundColor: "var(--safe)" }}
                        />
                        <span
                          className="relative inline-flex h-2 w-2 rounded-full bg-safe"
                          style={{ backgroundColor: "var(--safe)" }}
                        />
                      </span>
                      <p
                        className="text-[10px] font-mono uppercase tracking-widest font-bold text-safe"
                        style={{ color: "var(--safe)" }}
                      >
                        SYSTEM SCANNING
                      </p>
                      <p className="text-[8px] font-mono text-muted-foreground mt-1 uppercase">
                        All signals nominal ({activeCount} streams)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div
                        className="text-[8px] font-mono text-critical uppercase tracking-widest flex items-center gap-1.5 animate-pulse font-bold"
                        style={{ color: "var(--critical)" }}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full bg-critical"
                          style={{ backgroundColor: "var(--critical)" }}
                        />
                        CRITICAL ANOMALY DETECTED
                      </div>

                      {/* Render alerts depending on violations */}
                      {connectedSources.slack && 60 > threshold && (
                        <div
                          className="p-2 border border-critical/30 bg-critical/5 flex flex-col gap-1"
                          style={{
                            borderColor: "color-mix(in oklab, var(--critical) 30%, transparent)",
                            backgroundColor: "color-mix(in oklab, var(--critical) 5%, transparent)",
                          }}
                        >
                          <div className="flex justify-between text-[8px] font-mono text-muted-foreground">
                            <span>SOURCE // SUPPORT CHAT</span>
                            <span>JUST NOW</span>
                          </div>
                          <p className="text-[10px] text-foreground font-bold">
                            Volume Spike: +320% ticket surge
                          </p>
                          <p className="text-[9px] text-muted-foreground leading-normal font-mono">
                            AI Report: "Gateway checkout timeout on Stripe integrations."
                          </p>
                        </div>
                      )}

                      {connectedSources.twitter && 85 > threshold && (
                        <div
                          className="p-2 border border-warning/30 bg-warning/5 flex flex-col gap-1"
                          style={{
                            borderColor: "color-mix(in oklab, var(--warning) 30%, transparent)",
                            backgroundColor: "color-mix(in oklab, var(--warning) 5%, transparent)",
                          }}
                        >
                          <div className="flex justify-between text-[8px] font-mono text-muted-foreground">
                            <span>SOURCE // SOCIAL MEDIA</span>
                            <span>1m ago</span>
                          </div>
                          <p className="text-[10px] text-foreground font-bold">
                            Sentiment Crash: -45% velocity
                          </p>
                          <p className="text-[9px] text-muted-foreground leading-normal font-mono">
                            AI Report: "Outage complaints spike regarding login service."
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Auth Form / Active Session */}
          <div className="lg:col-span-2">
            {authLoading ? (
              <div className="sticky top-32 flex flex-col border border-border bg-card p-8 shadow-2xl items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-xs font-mono text-muted-foreground uppercase tracking-wider">
                  Verifying Session...
                </p>
              </div>
            ) : user ? (
              <div className="sticky top-32 flex flex-col border border-border bg-card p-8 shadow-2xl">
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-border bg-card text-primary">
                  <Radar className="h-5 w-5 animate-pulse" />
                </div>
                <h2 className="mb-2 text-2xl font-bold uppercase tracking-wider text-foreground">
                  Active Session
                </h2>
                <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
                  You are currently signed in. You can sync your configuration preferences or
                  continue to your dashboard.
                </p>

                <div className="mb-6 rounded-none border border-border bg-background/60 p-4 font-mono text-xs flex flex-col gap-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">ACCOUNT:</span>
                    <span className="text-foreground font-bold truncate">{user.email}</span>
                  </div>
                  {user.user_metadata?.full_name && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground shrink-0">NAME:</span>
                      <span className="text-foreground font-bold truncate">
                        {user.user_metadata.full_name}
                      </span>
                    </div>
                  )}
                  {user.user_metadata?.company && (
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground shrink-0">COMPANY:</span>
                      <span className="text-foreground font-bold truncate">
                        {user.user_metadata.company}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-2 mt-1">
                    <span className="text-muted-foreground">THRESHOLD:</span>
                    <span className="text-primary font-bold">{threshold} events/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">STREAMS:</span>
                    <span className="text-safe font-bold" style={{ color: "var(--safe)" }}>
                      {activeCount} connected
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate({ to: "/dashboard" })}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-transparent border border-primary text-primary px-6 py-3.5 text-xs font-bold font-mono uppercase tracking-wider transition-colors hover:bg-primary/10 cursor-pointer"
                  >
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    onClick={handleSyncPrefs}
                    disabled={isSyncing}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-primary px-6 py-3.5 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Syncing...
                      </>
                    ) : (
                      <>Sync Alerts & Continue</>
                    )}
                  </button>

                  <button
                    onClick={async () => {
                      await signOut();
                      toast.success("Signed out successfully.");
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-none border border-border bg-transparent text-muted-foreground px-6 py-3 text-xs font-mono uppercase tracking-wider transition-colors hover:text-foreground hover:border-muted-foreground cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="sticky top-32 flex flex-col border border-border bg-card p-8 shadow-2xl">
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-border bg-card text-primary">
                  <Radar className="h-5 w-5" />
                </div>
                <h2 className="mb-2 text-2xl font-bold uppercase tracking-wider text-foreground">
                  Authentication
                </h2>
                <p className="mb-6 text-xs leading-relaxed text-muted-foreground">
                  {isSignIn
                    ? "Access your dashboard to monitor system alerts and sentiment anomalies."
                    : "Start monitoring your channels in minutes. Complete registration to access your dashboard."}
                </p>

                <div className="mb-6 flex w-full border border-border bg-background/60 p-1 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => setIsSignIn(false)}
                    className={`flex-1 py-2 text-center transition-colors font-bold uppercase tracking-wider cursor-pointer ${
                      !isSignIn
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignIn(true)}
                    className={`flex-1 py-2 text-center transition-colors font-bold uppercase tracking-wider cursor-pointer ${
                      isSignIn
                        ? "bg-primary text-white"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-5">
                  {!isSignIn && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required={!isSignIn}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        className="rounded-none border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="rounded-none border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full rounded-none border border-border bg-background px-4 py-3 pr-10 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  {!isSignIn && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                        Company
                      </label>
                      <input
                        type="text"
                        required={!isSignIn}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="rounded-none border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-primary px-6 py-4 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />{" "}
                          {isSignIn ? "Signing In..." : "Creating Account..."}
                        </>
                      ) : (
                        <>
                          {isSignIn ? "Sign In" : "Complete Setup"}{" "}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-center text-[10px] font-mono text-muted-foreground">
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div
            className="relative mx-4 w-full max-w-md border border-border bg-card p-10 shadow-[0_8px_60px_rgba(41,141,255,0.15)]"
            style={{ animation: "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />

            <div className="flex flex-col items-center text-center">
              <div
                className="mb-6 flex h-16 w-16 items-center justify-center border border-safe/40 bg-safe/10"
                style={{
                  borderColor: "var(--safe)",
                  backgroundColor: "color-mix(in oklab, var(--safe) 10%, transparent)",
                }}
              >
                <CheckCircle2 className="h-8 w-8 text-safe" style={{ color: "var(--safe)" }} />
              </div>

              <h2 className="mb-3 text-2xl font-extrabold uppercase tracking-tight text-foreground">
                Setup Complete
              </h2>
              <p className="mb-2 text-sm text-muted-foreground leading-relaxed">
                Your Sentinel AI account is ready.
              </p>
              {emailConfirmRequired ? (
                <p
                  className="mb-8 text-xs font-mono uppercase tracking-widest text-warning"
                  style={{ color: "var(--warning)" }}
                >
                  Check your email to confirm your account first. We will contact you ASAP!
                </p>
              ) : (
                <p className="mb-8 text-xs font-mono uppercase tracking-widest text-primary">
                  We will contact you ASAP to get you onboarded.
                </p>
              )}

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => navigate({ to: "/onboarding" })}
                  className="w-full inline-flex items-center justify-center gap-2 bg-primary px-6 py-4 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-primary/90 cursor-pointer"
                >
                  Continue to Onboarding <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate({ to: "/home" })}
                  className="w-full inline-flex items-center justify-center gap-2 border border-border bg-transparent px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground hover:border-muted-foreground"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
