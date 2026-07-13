import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/footer";
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
  User,
  LogOut,
  Settings as SettingsIcon,
  LayoutDashboard,
  Building2,
} from "lucide-react";
import { SplineSceneBasic } from "@/components/ui/spline-scene-basic";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

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
      { threshold: 0.3 },
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
          background: "conic-gradient(from 0deg, transparent 80%, rgba(41, 141, 255, 0.15) 100%)",
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
  tip,
}: {
  name: string;
  role: string;
  quote: string;
  initials: string;
  tip?: string;
}) {
  return (
    <div className="rounded-none border border-[#343940] bg-[#131518] p-6 flex flex-col justify-between h-full relative">
      <div>
        <div className="mb-4 flex gap-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="h-3 w-3 fill-[#FF6C3D] text-[#FF6C3D]" />
          ))}
        </div>
        <p className="mb-4 text-xs italic leading-relaxed text-[#A9B2C3]">"{quote}"</p>
        {tip && (
          <div className="mb-6 border-l-2 border-[#298DFF] bg-[#298DFF]/5 px-3 py-2 text-[10px] font-mono text-[#298DFF]">
            <span className="font-bold uppercase tracking-wider block text-[9px] mb-1 text-[#298DFF]">PRO TIP:</span>
            {tip}
          </div>
        )}
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
  const { user, signOut, loading: authLoading } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (user: any) => {
    if (!user) return "?";
    const name = user.user_metadata?.full_name;
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (user.email?.slice(0, 2) ?? "?").toUpperCase();
  };

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2500);
    return () => clearInterval(id);
  }, []);
  void tick;

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
              <a href="#features" className="transition-colors hover:text-white">
                Features
              </a>
              <a href="#how-it-works" className="transition-colors hover:text-white">
                How it works
              </a>
              <a href="#stats" className="transition-colors hover:text-white">
                Impact
              </a>
              <a href="#testimonials" className="transition-colors hover:text-white">
                Testimonials
              </a>
            </div>
            <div className="flex items-center gap-3">
              {authLoading ? (
                <>
                  <Link
                    to="/setup"
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
                </>
              ) : user ? (
                <div className="flex items-center gap-8">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 rounded-none bg-[#298DFF] px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#298DFF]/90"
                  >
                    Dashboard <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  
                  {/* Account Dropdown */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#298DFF] to-blue-700 text-xs font-bold text-black border border-transparent hover:border-[#298DFF]/60 cursor-pointer shadow-[0_0_12px_rgba(41,141,255,0.2)] focus:outline-none transition-colors"
                    >
                      {getInitials(user)}
                    </button>
                    
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 rounded-none border border-[#343940] bg-[#131518] p-4 shadow-[0_8px_30px_rgb(0,0,0,0.8)] backdrop-blur-md z-[100] animate-fade-up">
                        {/* Header details */}
                        <div className="mb-3 border-b border-[#343940]/60 pb-3">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-[#298DFF] mb-0.5">
                            [ Active Session ]
                          </p>
                          <p className="text-xs font-bold text-white truncate max-w-full">
                            {user.user_metadata?.full_name || "Sentinel Operator"}
                          </p>
                          <p className="text-[9px] font-mono text-[#6C7584] truncate max-w-full">
                            {user.email}
                          </p>
                          {user.user_metadata?.company && (
                            <p className="text-[9px] font-mono text-[#6C7584] truncate max-w-full mt-0.5">
                              Org: {user.user_metadata.company}
                            </p>
                          )}
                        </div>
                        
                        {/* Links/Actions */}
                        <div className="flex flex-col gap-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-none px-2 py-1.5 text-xs text-[#A9B2C3] hover:text-white hover:bg-[#298DFF]/10 font-mono transition-colors"
                          >
                            <LayoutDashboard className="h-3.5 w-3.5" /> DASHBOARD
                          </Link>
                          <Link
                            to="/settings"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-none px-2 py-1.5 text-xs text-[#A9B2C3] hover:text-white hover:bg-[#298DFF]/10 font-mono transition-colors"
                          >
                            <SettingsIcon className="h-3.5 w-3.5" /> SETTINGS
                          </Link>
                          <Link
                            to="/onboarding"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-none px-2 py-1.5 text-xs text-[#A9B2C3] hover:text-white hover:bg-[#298DFF]/10 font-mono transition-colors"
                          >
                            <Building2 className="h-3.5 w-3.5" /> COMPANY DETAILS
                          </Link>
                          <Link
                            to="/setup"
                            onClick={() => setDropdownOpen(false)}
                            className="flex items-center gap-2 rounded-none px-2 py-1.5 text-xs text-[#A9B2C3] hover:text-white hover:bg-[#298DFF]/10 font-mono transition-colors"
                          >
                            <User className="h-3.5 w-3.5" /> SETUP FLOW
                          </Link>
                          <div className="my-1 border-t border-[#343940]/40" />
                          <button
                            onClick={async () => {
                              setDropdownOpen(false);
                              await signOut();
                              toast.success("Signed out successfully.");
                            }}
                            className="flex w-full items-center gap-2 rounded-none px-2 py-1.5 text-left text-xs text-[#FF4757] hover:text-white hover:bg-[#FF4757]/10 font-mono transition-colors cursor-pointer"
                          >
                            <LogOut className="h-3.5 w-3.5" /> SIGN OUT
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    to="/setup"
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
                </>
              )}
            </div>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden pt-24 pb-16 grid-bg hero-glow">
          {/* ── Interactive 3D Banner ── */}
          <div className="w-full max-w-7xl px-6 mb-8">
            <SplineSceneBasic />
          </div>
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
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: alert.color }}
              />
              <span
                className="relative inline-flex h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: alert.color }}
              />
            </span>
            <span key={alertIdx} className="animate-ticker text-[10px] font-mono tracking-wider">
              <span className="font-bold mr-1.5" style={{ color: alert.color }}>
                SYSTEM_ALERT //
              </span>{" "}
              {alert.text}
            </span>
          </div>

          {/* headline */}
          <div className="animate-fade-up-1 px-6 text-center max-w-5xl">
            <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl uppercase">
              Detect crises
              <br />
              <span className="text-[#298DFF]">before they ignite</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-[#6C7584] md:text-base">
              Sentinel AI monitors your support channels, social media, reviews, and email in real
              time — surfacing critical signals and clustering incidents so your team responds in
              minutes, not hours.
            </p>
          </div>

          {/* CTAs */}
          <div className="animate-fade-up-2 mt-10 flex flex-wrap items-center justify-center gap-4 px-6 w-full">
            <Link
              to="/setup"
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
            {["No credit card required", "SOC 2 Type II certified", "< 30 s detection latency"].map(
              (t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#298DFF]" />
                  {t}
                </span>
              ),
            )}
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
            <FloatingBadge
              icon={Shield}
              label="Threat Neutralized"
              sub="2s ago // Severity: Critical"
              className="-top-2 -right-6"
            />
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
                From real-time ingestion to intelligent clustering, Sentinel AI gives your
                operations team superpowers.
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
            <div className="mb-20 text-center tech-line pb-8 max-w-xl mx-auto">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#298DFF]">
                [ LOGICAL WORKFLOW ]
              </p>
              <h2 className="text-3xl font-extrabold tracking-tight uppercase text-white md:text-4xl">
                From signal to resolution
              </h2>
            </div>
            <div className="relative grid gap-8 md:grid-cols-4">
              {[
                {
                  step: "01",
                  title: "Ingest",
                  desc: "Connect your chat, social, review, and email sources via our no-code integrations.",
                  icon: Plug,
                },
                {
                  step: "02",
                  title: "Detect",
                  desc: "Our ML models process every message, flagging sentiment drops, volume spikes, and keyword clusters.",
                  icon: Eye,
                },
                {
                  step: "03",
                  title: "Cluster",
                  desc: "Related signals are grouped into incidents with severity scores, root-cause hints, and timeline views.",
                  icon: Shield,
                },
                {
                  step: "04",
                  title: "Respond",
                  desc: "Your team gets alerted, investigates in the dashboard, and resolves before users feel the impact.",
                  icon: CheckCircle2,
                },
              ].map(({ step, title, desc, icon: Icon }) => (
                <div
                  key={step}
                  className="relative flex flex-col items-start text-left border border-[#343940] bg-[#131518] p-6 group"
                >
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-transparent group-hover:bg-[#298DFF] transition-all duration-300" />
                  <div className="relative mb-6 flex h-12 w-12 items-center justify-center rounded-none border border-[#343940] bg-[#131518] text-[#298DFF]">
                    <Icon className="h-5 w-5" />
                    <span className="absolute -top-2.5 -right-2.5 flex h-5 w-5 items-center justify-center rounded-none bg-[#343940] text-[9px] font-mono font-bold text-white border border-[#343940]">
                      {step}
                    </span>
                  </div>
                  <h3 className="mb-2 text-sm font-bold uppercase tracking-wider text-white">
                    {title}
                  </h3>
                  <p className="text-xs leading-relaxed text-[#6C7584]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section id="stats" className="py-24 border-b border-[#343940]">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mb-16 text-center">
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#298DFF]">
                // SYSTEM PERFORMANCE METRICS
              </p>
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
              <p className="mb-2 text-[10px] font-mono uppercase tracking-widest text-[#298DFF]">
                // STAKEHOLDER FEEDBACK
              </p>
              <h2 className="text-3xl font-extrabold uppercase text-white">Trusted by ops teams</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <TestimonialCard
                name="Maanas"
                role="Lead DevOps Engineer"
                quote="Configuring Sentinel AI to monitor our Kubernetes clusters was a breeze. We now get early warnings about resource anomalies before they impact our users."
                initials="M"
                tip="Enable the K8s integrations and use adaptive alerting thresholds to filter out transient spikes during peak hours."
              />
              <TestimonialCard
                name="Ayaan"
                role="VP of Product"
                quote="Our customer success team is alert to issues even before clients report them. Sentiment clustering helps us coordinate hotfixes in real-time."
                initials="A"
                tip="Connect your customer support chat feeds and Twitter/X sentiment signals to detect customer-facing issues immediately."
              />
              <TestimonialCard
                name="Arya"
                role="Principal Security Analyst"
                quote="The automated root-cause summaries are incredibly detailed. What used to take hours of log hunting now takes minutes."
                initials="AR"
                tip="Use the live feed with security filters on to spot suspicious request bursts and coordinate with your firewall configs."
              />
              <TestimonialCard
                name="Bhavya"
                role="Site Reliability Engineer"
                quote="Our Mean Time to Resolution (MTTR) dropped by more than 70% in the first month. Sentinel AI has completely changed how we handle incident post-mortems."
                initials="B"
                tip="Integrate your PagerDuty and Slack workflows to automatically create post-mortem channels and share root-cause clusters."
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
                Open the live dashboard now and see Sentinel AI in action — real incidents, real
                data, real time.
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

        <Footer />
      </div>
    </>
  );
}
