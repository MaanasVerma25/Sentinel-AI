import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Radar,
  Shield,
  Zap,
  Globe,
  Eye,
  Bell,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  MessageSquare,
  Star,
  Twitter,
  Mail,
  Cpu,
  Plug,
  Sliders,
} from "lucide-react";

export const Route = createFileRoute("/home")({
  component: HomePage,
});

// ─── animated number counter ────────────────────────────────────────────────
function Counter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) {
            setVal(target);
            clearInterval(timer);
          } else {
            setVal(Math.floor(start));
          }
        }, 16);
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return (
    <span ref={ref}>
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// ─── Technical Crosshair & Grid Radar ────────────────────────────────────────
function TechnicalRadar() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      {/* Grid crosshairs */}
      <div className="absolute h-full w-px bg-[#343940]/50" />
      <div className="absolute w-full h-px bg-[#343940]/50" />
      
      {/* Concentric technical boxes (engineered vibe instead of round rings) */}
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute border border-[#343940]"
          style={{
            width: `${i * 22}%`,
            height: `${i * 22}%`,
          }}
        />
      ))}
      
      {/* Rotating sweep */}
      <div
        className="absolute"
        style={{
          width: "88%",
          height: "88%",
          background:
            "conic-gradient(from 0deg, transparent 80%, rgba(41, 141, 255, 0.15) 100%)",
          animation: "spin 5s linear infinite",
        }}
      />
    </div>
  );
}

// ─── floating badge ──────────────────────────────────────────────────────────
function FloatingBadge({
  icon: Icon,
  label,
  sub,
  className,
}: {
  icon: typeof Shield;
  label: string;
  sub: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute flex items-center gap-3 rounded-none border border-[#343940] bg-[#131518] px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.8)] backdrop-blur-md ${className}`}
      style={{ animation: "float 6s ease-in-out infinite" }}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-none bg-[#298DFF]/10 border border-[#298DFF]/30">
        <Icon className="h-4 w-4 text-[#298DFF]" />
      </span>
      <div>
        <p className="text-xs font-bold text-white uppercase tracking-wider">{label}</p>
        <p className="text-[10px] text-[#6C7584] font-mono">{sub}</p>
      </div>
    </div>
  );
}

// ─── feature card ────────────────────────────────────────────────────────────
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group relative rounded-none border border-[#343940] bg-[#131518] p-6 transition-all duration-200 hover:border-[#298DFF]/50 hover:bg-[#131518]/80">
      {/* Top corner tech indicator */}
      <div className="absolute top-0 right-0 h-2 w-2 bg-transparent border-t border-r border-[#343940] group-hover:border-[#298DFF]" />
      <div
        className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-none border"
        style={{
          borderColor: `${color}40`,
          background: `${color}10`,
        }}
      >
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <h3 className="mb-2 text-md font-bold text-white tracking-tight">{title}</h3>
      <p className="text-xs leading-relaxed text-[#6C7584]">{description}</p>
    </div>
  );
}

// ─── stat card ───────────────────────────────────────────────────────────────
function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  return (
    <div className="rounded-none border border-[#343940] bg-[#131518] p-6 text-center relative group">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent group-hover:bg-[#298DFF] transition-all duration-300" />
      <p className="text-3xl font-bold tracking-tight text-[#298DFF] font-mono">
        <Counter target={value} suffix={suffix} />
      </p>
      <p className="mt-2 text-xs uppercase tracking-wider text-[#6C7584]">{label}</p>
    </div>
  );
}

// ─── source pill ─────────────────────────────────────────────────────────────
function SourcePill({
  icon: Icon,
  label,
  color,
}: {
  icon: typeof Twitter;
  label: string;
  color: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-none border px-4 py-2 text-xs font-mono tracking-wider uppercase"
      style={{
        borderColor: `color-mix(in oklab, ${color} 30%, transparent)`,
        background: `color-mix(in oklab, ${color} 6%, transparent)`,
        color,
      }}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </div>
  );
}

// ─── testimonial card ────────────────────────────────────────────────────────
function TestimonialCard({
  name,
  role,
  quote,
  initials,
}: {
  name: string;
  role: string;
  quote: string;
  initials: string;
}) {
  return (
    <div className="rounded-none border border-[#343940] bg-[#131518] p-6 flex flex-col justify-between h-full relative">
      <div>
        <div className="mb-4 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-[#FF6C3D] text-[#FF6C3D]" />
          ))}
        </div>
        <p className="mb-6 text-xs italic leading-relaxed text-[#6C7584]">"{quote}"</p>
      </div>
      <div className="flex items-center gap-3 border-t border-[#343940]/60 pt-4 mt-auto">
        <div className="flex h-8 w-8 items-center justify-center rounded-none bg-[#298DFF] text-xs font-bold text-white font-mono">
          {initials}
        </div>
        <div>
          <p className="text-xs font-bold text-white">{name}</p>
          <p className="text-[10px] text-[#6C7584] uppercase tracking-wider">{role}</p>
        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────
function HomePage() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);
  void tick;

  const [connectedSources, setConnectedSources] = useState({
    slack: true,
    email: false,
    twitter: true,
    intercom: false,
  });

  const [threshold, setThreshold] = useState(65);

  const toggleSource = (key: "slack" | "email" | "twitter" | "intercom") => {
    setConnectedSources((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const liveAlerts = [
    { id: 1, text: "CRITICAL SPIKE DETECTED · SUPPORT CHAT", color: "#FF4757" },
    { id: 2, text: "SENTIMENT ANOMALY DETECTED · TWITTER/X", color: "#FF6C3D" },
    { id: 3, text: "PAYMENT FAILURE CLUSTER · EMAIL", color: "#FF4757" },
    { id: 4, text: "ALL SIGNAL SOURCES NOMINAL", color: "#2ED573" },
  ];
  const [alertIdx, setAlertIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setAlertIdx((i) => (i + 1) % liveAlerts.length), 3000);
    return () => clearInterval(id);
  }, []);
  const alert = liveAlerts[alertIdx];

  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ticker {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-fade-up-1 { animation: fade-up 0.5s 0.08s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-fade-up-2 { animation: fade-up 0.5s 0.16s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-fade-up-3 { animation: fade-up 0.5s 0.24s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .animate-ticker { animation: ticker 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
        
        .hero-glow {
          background: radial-gradient(ellipse 60% 40% at 50% 0%, rgba(41, 141, 255, 0.06), transparent 75%);
        }
        .grid-bg {
          background-image:
            linear-gradient(rgba(52, 57, 64, 0.25) 1px, transparent 1px),
            linear-gradient(90deg, rgba(52, 57, 64, 0.25) 1px, transparent 1px);
          background-size: 50px 50px;
        }
        .tech-line {
          position: relative;
        }
        .tech-line::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 24px;
          height: 2px;
          background-color: #298DFF;
        }
      `}</style>

      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#298DFF]/30">
        {/* ── Navbar ── */}
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
            <div className="hidden items-center gap-8 text-xs font-mono uppercase tracking-wider text-[#6C7584] md:flex">
              <a href="#features" className="transition-colors hover:text-white">Features</a>
              <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
              <a href="#stats" className="transition-colors hover:text-white">Impact</a>
              <a href="#testimonials" className="transition-colors hover:text-white">Testimonials</a>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/sources"
                className="inline-flex items-center gap-1.5 rounded-none border border-[#343940]/60 bg-[#131518] px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-[#6C7584] hover:text-white transition-colors"
              >
                Set Up Now
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-none bg-[#298DFF] px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#298DFF]/90"
              >
                Dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-28 pb-16 grid-bg hero-glow">
          {/* Tech dot element for engineering vibe */}
          <div className="absolute top-24 left-10 text-[9px] font-mono text-[#6C7584]/60 hidden lg:block">
            SYS.LOC: //US-WEST.SENTINEL
          </div>
          <div className="absolute top-24 right-10 text-[9px] font-mono text-[#6C7584]/60 hidden lg:block">
            STATUS: ACTIVE // SCANNING
          </div>

          {/* live alert ticker */}
          <div className="animate-fade-up mb-8 flex items-center gap-3 rounded-none border border-[#343940] bg-[#131518] px-4 py-2">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ backgroundColor: alert.color }} />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ backgroundColor: alert.color }} />
            </span>
            <span key={alertIdx} className="animate-ticker text-[10px] font-mono tracking-wider">
              <span className="font-bold mr-1.5" style={{ color: alert.color }}>SYSTEM_ALERT //</span> {alert.text}
            </span>
          </div>

          {/* headline */}
          <div className="animate-fade-up-1 px-6 text-center max-w-5xl">
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl uppercase">
              Detect crises<br />
              <span className="text-[#298DFF]">before they ignite</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#6C7584] md:text-base">
              Sentinel AI monitors your support channels, social media, reviews, and email in real time —
              surfacing critical signals and clustering incidents so your team responds in minutes, not hours.
            </p>
          </div>

          {/* CTAs */}
          <div className="animate-fade-up-2 mt-10 flex flex-wrap items-center justify-center gap-4 px-6 w-full">
            <Link
              to="/sources"
              className="inline-flex items-center gap-2 rounded-none bg-[#298DFF] px-8 py-3.5 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#298DFF]/90 w-full sm:w-auto justify-center"
            >
              <Plug className="h-4 w-4" /> Set Up Now
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-none border border-[#343940] bg-[#131518] px-8 py-3.5 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#131518]/70 w-full sm:w-auto justify-center"
            >
              <Radar className="h-4 w-4" /> Open Command Center
            </Link>
          </div>

          {/* social proof row */}
          <div className="animate-fade-up-3 mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-mono uppercase tracking-wider text-[#6C7584]">
            {["No credit card required", "SOC 2 Type II certified", "< 30 s detection latency"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#298DFF]" />
                {t}
              </span>
            ))}
          </div>

          {/* floating visual – radar + badges */}
          <div className="relative mt-16 h-[320px] w-[320px] md:h-[380px] md:w-[380px]">
            <TechnicalRadar />
            {/* center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-none bg-[#298DFF]/10 border border-[#298DFF]/40 shadow-[0_0_40px_rgba(41,141,255,0.15)]">
                <Radar className="h-8 w-8 text-[#298DFF]" />
              </div>
            </div>
            {/* floating badges */}
            <FloatingBadge icon={Shield} label="Threat Neutralized" sub="2s ago // Severity: Critical" className="-top-2 -right-6" />
            <FloatingBadge
              icon={Bell}
              label="3 Incidents Clustered"
              sub="Payment failures // Email Source"
              className="-bottom-2 -left-6"
            />
          </div>
        </section>

        {/* ── Source logos ── */}
        <section className="border-y border-[#343940] bg-[#131518]/20 py-12">
          <div className="mx-auto max-w-7xl px-6">
            <p className="mb-8 text-center text-[10px] font-mono uppercase tracking-widest text-[#6C7584]">
              // Monitors signals across every channel
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <SourcePill icon={MessageSquare} label="Support Chat" color="#298DFF" />
              <SourcePill icon={Twitter} label="Social Media" color="#FF6C3D" />
              <SourcePill icon={Star} label="App Reviews" color="#FF6C3D" />
              <SourcePill icon={Mail} label="Email" color="#2ED573" />
              <SourcePill icon={Globe} label="Forums" color="#298DFF" />
              <SourcePill icon={Cpu} label="Internal Logs" color="#FF4757" />
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-24 border-b border-[#343940]">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-20 text-center tech-line pb-8 max-w-xl mx-auto">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#298DFF]">
                [ SYSTEM CAPABILITIES ]
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight uppercase text-white md:text-4xl">
                Everything you need to stay ahead
              </h2>
              <p className="mt-4 text-xs leading-relaxed text-[#6C7584]">
                From real-time ingestion to intelligent clustering, Sentinel AI gives your operations team superpowers.
              </p>
            </div>
            <div className="grid gap-px bg-[#343940] sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={Zap}
                title="Real-Time Detection"
                description="Ingests thousands of messages per second across all sources. AI models flag anomalies within seconds, not minutes."
                color="#298DFF"
              />
              <FeatureCard
                icon={Shield}
                title="Intelligent Clustering"
                description="Groups related signals into coherent incidents automatically, eliminating alert fatigue and giving context at a glance."
                color="#2ED573"
              />
              <FeatureCard
                icon={TrendingUp}
                title="Severity Scoring"
                description="Each incident is scored across volume, sentiment velocity, and spread rate — so your team always knows what needs attention first."
                color="#FF6C3D"
              />
              <FeatureCard
                icon={Eye}
                title="Live Feed"
                description="A streaming ticker of every incoming signal, filterable by source, severity, and time window — your crisis radar in real time."
                color="#298DFF"
              />
              <FeatureCard
                icon={Bell}
                title="Smart Alerting"
                description="Threshold-based and ML-driven alerts delivered via Slack, PagerDuty, email, or webhooks — zero noise, only signal."
                color="#FF4757"
              />
              <FeatureCard
                icon={Globe}
                title="Multi-Source Correlation"
                description="Connects dots across channels — a spike on Twitter correlated with support tickets and reviews tells a richer story."
                color="#298DFF"
              />
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="border-b border-[#343940] bg-[#131518]/10 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center tech-line pb-8 max-w-xl mx-auto">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#298DFF]">
                [ LOGICAL WORKFLOW ]
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight uppercase text-white md:text-4xl">
                How Sentinel AI Works — Setup in 3 Steps
              </h2>
              <p className="mt-4 text-xs leading-relaxed text-[#6C7584]">
                Get set up and alert-ready in under 10 minutes. Click the steps to interact and preview the flow.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3 relative">
              {/* Connector lines between cards on desktop */}
              <div className="hidden lg:block absolute top-1/2 left-[30%] right-[30%] h-0.5 border-t-2 border-dashed border-[#343940] -z-10" />

              {/* Step 1: Connect */}
              <div className="flex flex-col border border-[#343940] bg-[#131518] p-6 relative group transition-all duration-300 hover:border-[#298DFF]/40">
                <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-[#298DFF] transition-all duration-300" />
                <div className="mb-6 flex h-12 w-12 items-center justify-center border border-[#343940] bg-[#131518] text-[#298DFF] relative">
                  <Plug className="h-5 w-5" />
                  <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center bg-[#343940] text-[9px] font-mono font-bold text-white border border-[#343940]">
                    01
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">Step 1: Connect</h3>
                <p className="text-xs leading-relaxed text-[#6C7584] mb-6">
                  Link your support chat, email, social media, and review channels in minutes — OAuth or API key, read-only access.
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
                        onClick={() => toggleSource(src.key as any)}
                        className={`flex flex-col items-center justify-center p-3 border transition-all duration-200 cursor-pointer ${
                          isConnected
                            ? "border-[#298DFF]/60 bg-[#298DFF]/5 shadow-[0_0_12px_rgba(41,141,255,0.1)]"
                            : "border-[#343940]/50 bg-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <Icon className="h-5 w-5 mb-1.5" style={{ color: isConnected ? src.color : "#6C7584" }} />
                        <span className="text-[9px] font-mono uppercase tracking-wider text-white mb-0.5">{src.label}</span>
                        <span className={`text-[8px] font-mono ${isConnected ? "text-[#2ED573]" : "text-[#6C7584]"}`}>
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
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">Step 2: Calibrate</h3>
                <p className="text-xs leading-relaxed text-[#6C7584] mb-6">
                  Sentinel learns your normal traffic patterns (3–7 days) and sets smart thresholds per crisis category — payment failures, fraud, outages, PR.
                </p>

                {/* Step 2 Visual Playground */}
                <div className="mt-auto bg-black/40 p-4 border border-[#343940]/45 flex flex-col gap-4">
                  {Object.values(connectedSources).filter(Boolean).length === 0 ? (
                    <div className="h-[120px] flex items-center justify-center text-center p-4">
                      <p className="text-[10px] font-mono text-[#6C7584] uppercase tracking-wider">
                        [ Connect a source in Step 1 to begin calibration ]
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="h-[100px] border border-[#343940]/40 bg-black/60 relative overflow-hidden">
                        <svg className="w-full h-full" viewBox="0 0 260 100" preserveAspectRatio="none">
                          <defs>
                            <pattern id="svg-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#343940" strokeWidth="0.5" opacity="0.3" />
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
                            const isSourceActive = p.src ? connectedSources[p.src as keyof typeof connectedSources] : true;
                            const vol = p.vol || (100 - p.y);
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
                          onChange={(e) => setThreshold(Number(e.target.value))}
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
                <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">Step 3: Get Alerted</h3>
                <p className="text-xs leading-relaxed text-[#6C7584] mb-6">
                  The moment a real anomaly hits, your team gets a Slack/email alert + an AI-generated incident report with root cause and suggested fixes — before customers even trend on Twitter.
                </p>

                {/* Step 3 Visual Playground */}
                <div className="mt-auto bg-black/40 p-4 border border-[#343940]/45 flex flex-col gap-3 min-h-[160px]">
                  {Object.values(connectedSources).filter(Boolean).length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-center p-4">
                      <p className="text-[10px] font-mono text-[#6C7584] uppercase tracking-wider">
                        [ Offline — No streams connected ]
                      </p>
                    </div>
                  ) : !(connectedSources.slack && 60 > threshold) && !(connectedSources.twitter && 85 > threshold) ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-[#2ED573]/20 bg-[#2ED573]/5">
                      <span className="relative flex h-2 w-2 mb-2">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-[#2ED573] opacity-75 animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2ED573]" />
                      </span>
                      <p className="text-[10px] font-mono text-[#2ED573] uppercase tracking-widest font-bold">
                        SYSTEM SCANNING
                      </p>
                      <p className="text-[8px] font-mono text-[#6C7584] mt-1 uppercase">
                        All signals nominal ({Object.values(connectedSources).filter(Boolean).length} streams)
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
                          <p className="text-[10px] text-white font-bold">Volume Spike: +320% ticket surge</p>
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
                          <p className="text-[10px] text-white font-bold">Sentiment Crash: -45% velocity</p>
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

            {/* Optional Footer Line */}
            <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-6 border-t border-[#343940] pt-8">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#6C7584]">
                ⚡ Setup to first alert: <span className="text-white font-bold">under 10 minutes.</span>
              </span>
              <Link
                to="/sources"
                className="inline-flex items-center gap-2 rounded-none bg-[#298DFF] px-6 py-2.5 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#298DFF]/90"
              >
                Set Up Now <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section id="stats" className="py-24 border-b border-[#343940]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#298DFF]">// SYSTEM PERFORMANCE METRICS</p>
              <h2 className="text-3xl font-extrabold uppercase text-white">Numbers that speak</h2>
            </div>
            <div className="grid gap-px bg-[#343940] sm:grid-cols-2 lg:grid-cols-4">
              <StatCard value={99} suffix="%" label="Detection accuracy" />
              <StatCard value={28} suffix="s" label="Avg. time to alert" />
              <StatCard value={12000} suffix="+" label="Signals processed / min" />
              <StatCard value={73} suffix="%" label="Reduction in MTTR" />
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section id="testimonials" className="border-b border-[#343940] bg-[#131518]/10 py-24">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#298DFF]">// STAKEHOLDER FEEDBACK</p>
              <h2 className="text-3xl font-extrabold uppercase text-white">Trusted by ops teams</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              <TestimonialCard
                name="Priya Nair"
                role="Head of CX · FinTech Scale-up"
                quote="We caught a payment gateway meltdown 11 minutes before it hit our status page. Sentinel AI is now non-negotiable for our ops team."
                initials="PN"
              />
              <TestimonialCard
                name="James Osei"
                role="VP Engineering · SaaS Platform"
                quote="The clustering is eerily accurate. What used to be 400 individual tickets now shows up as 1 incident with a root-cause summary."
                initials="JO"
              />
              <TestimonialCard
                name="Sofia Martínez"
                role="Customer Ops Lead · eCommerce"
                quote="Our MTTR dropped by 68% in the first month. The live feed alone is worth the subscription — it's like having a dedicated crisis analyst 24/7."
                initials="SM"
              />
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <div className="rounded-none border border-[#343940] bg-[#131518] p-12 relative overflow-hidden">
              {/* Corner industrial notches */}
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#298DFF]" />
              <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#298DFF]" />
              
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-none bg-[#298DFF]/10 border border-[#298DFF]/30">
                <Radar className="h-6 w-6 text-[#298DFF]" />
              </div>
              <h2 className="mb-4 text-3xl font-extrabold uppercase tracking-tight text-white">
                Ready to stay ahead of every crisis?
              </h2>
              <p className="mb-8 text-xs text-[#6C7584] max-w-lg mx-auto">
                Open the live dashboard now and see Sentinel AI in action — real incidents, real data, real time.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/sources"
                  className="inline-flex items-center gap-2 rounded-none bg-[#298DFF] px-8 py-4 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#298DFF]/90 shadow-[0_4px_20px_rgba(41,141,255,0.2)]"
                >
                  <Plug className="h-4 w-4" />
                  Set Up Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 rounded-none border border-[#343940] bg-black/45 px-8 py-4 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-black/60"
                >
                  <Radar className="h-4 w-4" />
                  Launch Dashboard
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-[#343940] py-10 bg-black">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-[10px] font-mono uppercase tracking-wider text-[#6C7584] md:flex-row">
            <div className="flex items-center gap-2.5">
              <Radar className="h-4 w-4 text-[#298DFF]" />
              <span className="font-bold text-white">Sentinel AI</span>
              <span>· Real-time crisis detection</span>
            </div>
            <span>© {new Date().getFullYear()} Sentinel AI. All rights reserved.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
