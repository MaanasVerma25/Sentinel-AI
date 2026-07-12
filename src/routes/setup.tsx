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
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#298DFF]/30">
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full border-b border-[#343940] bg-black/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/home" className="flex items-center gap-2.5">
            <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-none bg-[#298DFF]/15 border border-[#298DFF]/30 text-[#298DFF]">
              <Radar className="h-4 w-4" />
              <span className="absolute inset-0 border border-[#298DFF]/60 animate-ping opacity-40" />
            </span>
            <span className="font-bold tracking-tight text-white uppercase text-sm font-mono">
              Sentinel <span className="text-[#298DFF]">AI</span>
            </span>
          </Link>
          <Link
            to="/home"
            className="inline-flex items-center gap-2 rounded-none border border-[#343940]/60 bg-[#131518] px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-[#6C7584] hover:text-white transition-colors"
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
              <div className="absolute bottom-0 left-0 w-6 h-0.5 bg-[#298DFF]" />
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#298DFF]">
                [ SYSTEM DEPLOYMENT ]
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight uppercase text-white md:text-4xl">
                Interactive Preview
              </h1>
              <p className="mt-4 text-xs leading-relaxed text-[#6C7584]">
                Play with the interactive steps below to see how Sentinel detects anomalies in real
                time.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {/* Step 1: Connect */}
              <div className="flex flex-col border border-[#343940] bg-[#131518] p-6 relative group transition-all duration-300 hover:border-[#298DFF]/40">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-[#298DFF] transition-all duration-300" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#343940] bg-[#131518] text-[#298DFF] relative">
                  <Plug className="h-5 w-5" />
                  <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center bg-[#343940] text-[9px] font-mono font-bold text-white border border-[#343940]">
                    01
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">
                  Step 1: Connect
                </h3>
                <p className="text-xs leading-relaxed text-[#6C7584] mb-6">
                  Link your support chat, email, social media, and review channels in minutes —
                  OAuth or API key, read-only access.
                </p>

                {/* Step 1 Visual Playground */}
                <div className="mt-auto grid grid-cols-2 gap-3 bg-black/40 p-4 border border-[#343940]/45">
                  {[
                    { key: "slack", label: "Support Chat", icon: MessageSquare, color: "#298DFF" },
                    { key: "email", label: "Email", icon: Mail, color: "#2ED573" },
                    { key: "twitter", label: "Social Media", icon: Twitter, color: "#FF6C3D" },
                    { key: "intercom", label: "App Reviews", icon: Star, color: "#FF6C3D" },
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
                            ? "border-[#298DFF]/60 bg-[#298DFF]/5 shadow-[0_0_12px_rgba(41,141,255,0.1)]"
                            : "border-[#343940]/50 bg-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Icon
                          className="h-5 w-5 mb-1.5"
                          style={{ color: isConnected ? src.color : "#6C7584" }}
                        />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white mb-0.5">
                          {src.label}
                        </span>
                        <span
                          className={`text-[8px] font-mono ${isConnected ? "text-[#2ED573]" : "text-[#6C7584]"}`}
                        >
                          {isConnected ? "● Connected" : "○ Connect"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Calibrate */}
              <div className="flex flex-col border border-[#343940] bg-[#131518] p-6 relative group transition-all duration-300 hover:border-[#298DFF]/40">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-[#298DFF] transition-all duration-300" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#343940] bg-[#131518] text-[#298DFF] relative">
                  <Sliders className="h-5 w-5" />
                  <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center bg-[#343940] text-[9px] font-mono font-bold text-white border border-[#343940]">
                    02
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">
                  Step 2: Calibrate
                </h3>
                <p className="text-xs leading-relaxed text-[#6C7584] mb-6">
                  Sentinel learns your normal traffic patterns (3–7 days) and sets smart thresholds
                  per crisis category.
                </p>

                {/* Step 2 Visual Playground */}
                <div className="mt-auto bg-black/40 p-4 border border-[#343940]/45 flex flex-col gap-4">
                  {activeCount === 0 ? (
                    <div className="h-[120px] flex items-center justify-center text-center p-4">
                      <p className="text-[10px] font-mono text-[#6C7584] uppercase tracking-wider">
                        [ Connect a source in Step 1 to begin calibration ]
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="h-[100px] border border-[#343940]/40 bg-black/60 relative overflow-hidden">
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 260 100"
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <pattern
                              id="svg-grid"
                              width="20"
                              height="20"
                              patternUnits="userSpaceOnUse"
                            >
                              <path
                                d="M 20 0 L 0 0 0 20"
                                fill="none"
                                stroke="#343940"
                                strokeWidth="0.5"
                                opacity="0.3"
                              />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#svg-grid)" />

                          {/* Normal traffic shading */}
                          <path
                            d="M 10 90 Q 25 87.5 40 85 T 70 40 T 100 88 T 130 15 T 160 80 T 190 95 T 220 85 T 250 90 L 260 90 L 260 100 L 0 100 Z"
                            fill="#298DFF"
                            opacity="0.05"
                          />

                          {/* Threshold boundary line */}
                          <line
                            x1="0"
                            y1={100 - threshold}
                            x2="260"
                            y2={100 - threshold}
                            stroke="#FF6C3D"
                            strokeWidth="1.5"
                            strokeDasharray="3,3"
                          />

                          {/* Main line */}
                          <path
                            d="M 10 90 C 25 87.5 40 85 70 40 C 100 88 130 15 160 80 C 190 95 220 85 250 90"
                            fill="none"
                            stroke="#298DFF"
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
                                fill={isPeak && isViolated ? "#FF4757" : "#298DFF"}
                                className={isPeak && isViolated ? "animate-pulse" : ""}
                              />
                            );
                          })}
                        </svg>

                        {/* Threshold value text floating */}
                        <div
                          className="absolute left-2 text-[8px] font-mono text-[#FF6C3D] uppercase pointer-events-none transition-all duration-100"
                          style={{ top: `${Math.max(5, Math.min(80, 100 - threshold - 12))}px` }}
                        >
                          Alert limit: {threshold} ev/m
                        </div>
                      </div>

                      {/* Threshold Slider control */}
                      <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center text-[10px] font-mono text-[#6C7584]">
                          <span>THRESHOLD SENSITIVITY</span>
                          <span className="text-white font-bold">{threshold} events/min</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="90"
                          value={threshold}
                          onChange={(e) => handleThresholdChange(Number(e.target.value))}
                          className="w-full h-1 bg-[#343940] appearance-none cursor-pointer accent-[#298DFF]"
                        />
                        <div className="flex justify-between text-[8px] font-mono text-[#6C7584]">
                          <span>LOWER LIMIT (MORE ALERTS)</span>
                          <span>HIGHER LIMIT (FEWER ALERTS)</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Step 3: Get Alerted */}
              <div className="flex flex-col border border-[#343940] bg-[#131518] p-6 relative group transition-all duration-300 hover:border-[#298DFF]/40">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-[#298DFF] transition-all duration-300" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#343940] bg-[#131518] text-[#298DFF] relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center bg-[#343940] text-[9px] font-mono font-bold text-white border border-[#343940]">
                    03
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">
                  Step 3: Get Alerted
                </h3>
                <p className="text-xs leading-relaxed text-[#6C7584] mb-6">
                  The moment a real anomaly hits, your team gets a Slack/email alert + an
                  AI-generated incident report.
                </p>

                {/* Step 3 Visual Playground */}
                <div className="mt-auto bg-black/40 p-4 border border-[#343940]/45 flex flex-col gap-3 min-h-[160px]">
                  {activeCount === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center p-4">
                      <p className="text-[10px] font-mono text-[#6C7584] uppercase tracking-wider">
                        [ Offline — No streams connected ]
                      </p>
                    </div>
                  ) : !(connectedSources.slack && 60 > threshold) &&
                    !(connectedSources.twitter && 85 > threshold) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-[#2ED573]/20 bg-[#2ED573]/5">
                      <span className="relative flex h-2 w-2 mb-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#2ED573] opacity-75 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2ED573]" />
                      </span>
                      <p className="text-[10px] font-mono text-[#2ED573] uppercase tracking-widest font-bold">
                        SYSTEM SCANNING
                      </p>
                      <p className="text-[8px] font-mono text-[#6C7584] mt-1 uppercase">
                        All signals nominal ({activeCount} streams)
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="text-[8px] font-mono text-[#FF4757] uppercase tracking-widest flex items-center gap-1.5 animate-pulse font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF4757]" />
                        CRITICAL ANOMALY DETECTED
                      </div>

                      {/* Render alerts depending on violations */}
                      {connectedSources.slack && 60 > threshold && (
                        <div className="p-2 border border-[#FF4757]/30 bg-[#FF4757]/5 flex flex-col gap-1">
                          <div className="flex justify-between text-[8px] font-mono text-[#6C7584]">
                            <span>SOURCE // SUPPORT CHAT</span>
                            <span>JUST NOW</span>
                          </div>
                          <p className="text-[10px] text-white font-bold">
                            Volume Spike: +320% ticket surge
                          </p>
                          <p className="text-[9px] text-[#6C7584] leading-normal font-mono">
                            AI Report: "Gateway checkout timeout on Stripe integrations."
                          </p>
                        </div>
                      )}

                      {connectedSources.twitter && 85 > threshold && (
                        <div className="p-2 border border-[#FF6C3D]/30 bg-[#FF6C3D]/5 flex flex-col gap-1">
                          <div className="flex justify-between text-[8px] font-mono text-[#6C7584]">
                            <span>SOURCE // SOCIAL MEDIA</span>
                            <span>1m ago</span>
                          </div>
                          <p className="text-[10px] text-white font-bold">
                            Sentiment Crash: -45% velocity
                          </p>
                          <p className="text-[9px] text-[#6C7584] leading-normal font-mono">
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
              <div className="sticky top-32 flex flex-col border border-[#343940] bg-[#131518] p-8 shadow-2xl items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-[#298DFF]" />
                <p className="mt-4 text-xs font-mono text-[#6C7584] uppercase tracking-wider">
                  Verifying Session...
                </p>
              </div>
            ) : user ? (
              <div className="sticky top-32 flex flex-col border border-[#343940] bg-[#131518] p-8 shadow-2xl">
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#343940] bg-[#131518] text-[#298DFF]">
                  <Radar className="h-5 w-5 animate-pulse" />
                </div>
                <h2 className="mb-2 text-2xl font-bold uppercase tracking-wider text-white">
                  Active Session
                </h2>
                <p className="mb-6 text-xs leading-relaxed text-[#6C7584]">
                  You are currently signed in. You can sync your configuration preferences or continue to your dashboard.
                </p>

                <div className="mb-6 rounded-none border border-[#343940] bg-black/60 p-4 font-mono text-xs flex flex-col gap-2">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#6C7584] shrink-0">ACCOUNT:</span>
                    <span className="text-white font-bold truncate">{user.email}</span>
                  </div>
                  {user.user_metadata?.full_name && (
                    <div className="flex justify-between gap-4">
                      <span className="text-[#6C7584] shrink-0">NAME:</span>
                      <span className="text-white font-bold truncate">{user.user_metadata.full_name}</span>
                    </div>
                  )}
                  {user.user_metadata?.company && (
                    <div className="flex justify-between gap-4">
                      <span className="text-[#6C7584] shrink-0">COMPANY:</span>
                      <span className="text-white font-bold truncate">{user.user_metadata.company}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-[#343940] pt-2 mt-1">
                    <span className="text-[#6C7584]">THRESHOLD:</span>
                    <span className="text-[#298DFF] font-bold">{threshold} events/min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#6C7584]">STREAMS:</span>
                    <span className="text-[#2ED573] font-bold">{activeCount} connected</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate({ to: "/dashboard" })}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-transparent border border-[#298DFF] text-[#298DFF] px-6 py-3.5 text-xs font-bold font-mono uppercase tracking-wider transition-colors hover:bg-[#298DFF]/10 cursor-pointer"
                  >
                    Go to Dashboard <ArrowRight className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={handleSyncPrefs}
                    disabled={isSyncing}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-[#298DFF] px-6 py-3.5 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#298DFF]/90 disabled:opacity-50 cursor-pointer"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Syncing...
                      </>
                    ) : (
                      <>
                        Sync Alerts & Continue
                      </>
                    )}
                  </button>

                  <button
                    onClick={async () => {
                      await signOut();
                      toast.success("Signed out successfully.");
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-none border border-[#343940] bg-transparent text-[#6C7584] px-6 py-3 text-xs font-mono uppercase tracking-wider transition-colors hover:text-white hover:border-[#6C7584] cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="sticky top-32 flex flex-col border border-[#343940] bg-[#131518] p-8 shadow-2xl">
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#343940] bg-[#131518] text-[#298DFF]">
                  <Radar className="h-5 w-5" />
                </div>
                <h2 className="mb-2 text-2xl font-bold uppercase tracking-wider text-white">
                  Authentication
                </h2>
                <p className="mb-6 text-xs leading-relaxed text-[#6C7584]">
                  {isSignIn
                    ? "Access your dashboard to monitor system alerts and sentiment anomalies."
                    : "Start monitoring your channels in minutes. Complete registration to access your dashboard."}
                </p>

                <div className="mb-6 flex w-full border border-[#343940] bg-black/60 p-1 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => setIsSignIn(false)}
                    className={`flex-1 py-2 text-center transition-colors font-bold uppercase tracking-wider cursor-pointer ${
                      !isSignIn ? "bg-[#298DFF] text-white" : "text-[#6C7584] hover:text-white"
                    }`}
                  >
                    Create Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSignIn(true)}
                    className={`flex-1 py-2 text-center transition-colors font-bold uppercase tracking-wider cursor-pointer ${
                      isSignIn ? "bg-[#298DFF] text-white" : "text-[#6C7584] hover:text-white"
                    }`}
                  >
                    Sign In
                  </button>
                </div>

                <form onSubmit={handleAuth} className="flex flex-col gap-5">
                  {!isSignIn && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584]">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required={!isSignIn}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Jane Doe"
                        className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                      />
                    </div>
                  )}
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584]">
                      Work Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584]">
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
                        className="w-full rounded-none border border-[#343940] bg-black px-4 py-3 pr-10 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6C7584] hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  {!isSignIn && (
                    <div className="flex flex-col gap-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584]">
                        Company
                      </label>
                      <input
                        type="text"
                        required={!isSignIn}
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Acme Corp"
                        className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-[#298DFF] px-6 py-4 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#298DFF]/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" /> {isSignIn ? "Signing In..." : "Creating Account..."}
                        </>
                      ) : (
                        <>
                          {isSignIn ? "Sign In" : "Complete Setup"} <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>

                  <p className="mt-4 text-center text-[10px] font-mono text-[#6C7584]">
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
            className="relative mx-4 w-full max-w-md border border-[#343940] bg-[#131518] p-10 shadow-[0_8px_60px_rgba(41,141,255,0.15)]"
            style={{ animation: "fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#298DFF]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#298DFF]" />

            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center border border-[#2ED573]/40 bg-[#2ED573]/10">
                <CheckCircle2 className="h-8 w-8 text-[#2ED573]" />
              </div>

              <h2 className="mb-3 text-2xl font-extrabold uppercase tracking-tight text-white">
                Setup Complete
              </h2>
              <p className="mb-2 text-sm text-[#6C7584] leading-relaxed">
                Your Sentinel AI account is ready.
              </p>
              {emailConfirmRequired ? (
                <p className="mb-8 text-xs font-mono uppercase tracking-widest text-[#FF6C3D]">
                  Check your email to confirm your account first. We will contact you ASAP!
                </p>
              ) : (
                <p className="mb-8 text-xs font-mono uppercase tracking-widest text-[#298DFF]">
                  We will contact you ASAP to get you onboarded.
                </p>
              )}

              <div className="flex flex-col gap-3 w-full">
                <button
                  onClick={() => navigate({ to: "/dashboard" })}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#298DFF] px-6 py-4 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#298DFF]/90"
                >
                  Go to Dashboard <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => navigate({ to: "/home" })}
                  className="w-full inline-flex items-center justify-center gap-2 border border-[#343940] bg-transparent px-6 py-3 text-xs font-mono uppercase tracking-wider text-[#6C7584] transition-colors hover:text-white hover:border-[#6C7584]"
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
