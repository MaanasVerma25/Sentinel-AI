import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Radar,
  Building2,
  Globe,
  Users,
  Info,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("11-50");
  const [description, setDescription] = useState("");

  // Social handles
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Authentication required to access onboarding.");
      navigate({ to: "/setup" });
    } else if (user) {
      setCompanyName(user.user_metadata?.company || "");
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);

    try {
      // 1. Save to Supabase User Metadata (arbitrary JSON payload)
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          company: companyName,
          company_details: {
            website,
            industry,
            size: companySize,
            description,
          },
          social_handles: {
            twitter,
            linkedin,
            facebook,
            instagram,
          },
        },
      });

      if (metaError) throw metaError;

      // 2. Sync Company name back to the profiles table
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ company: companyName })
        .eq("id", user.id);

      if (profileError) {
        console.error("Failed to sync profile company name:", profileError);
      }

      // 3. Cache onboarding status locally
      if (typeof window !== "undefined") {
        localStorage.setItem(`sentinel_onboarding_${user.id}`, "completed");
      }

      toast.success("Welcome aboard! Onboarding details saved.");
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "An error occurred during onboarding.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#298DFF]" />
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
            Loading Onboarding...
          </p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#298DFF]/30 relative overflow-hidden">
      {/* Background visual grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[500px] hero-glow pointer-events-none" />

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
          <div className="text-[10px] font-mono text-[#6C7584]">
            SECURE.SSL // ONBOARDING_STAGE
          </div>
        </div>
      </nav>

      {/* Main Content Form */}
      <div className="mx-auto max-w-4xl px-6 pt-32 pb-24 relative z-10">
        <div className="mb-10 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center border border-[#343940] bg-[#131518] text-[#298DFF] mb-4">
            <Building2 className="h-5 w-5 animate-pulse" />
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#298DFF] mb-2">
            [ SYSTEM CONFIGURATION ]
          </p>
          <h1 className="text-3xl font-extrabold tracking-tight uppercase text-white sm:text-4xl">
            Company & Signal Sources
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-xs leading-relaxed text-[#6C7584]">
            Tell us about your organization and links. This calibrates the crisis detection algorithms to identify sentiment anomalies in your specific industry.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
          {/* Left Column: Company Profile */}
          <div className="flex flex-col border border-[#343940] bg-[#131518] p-8 shadow-2xl relative">
            {/* Corner Accent */}
            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t border-l border-[#298DFF]" />
            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-white border-b border-[#343940]/60 pb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#298DFF]" /> 01 // Company Profile
            </h2>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584]">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Acme Corporation"
                  className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584] flex items-center gap-1.5">
                  <Globe className="h-3 w-3" /> Website URL
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://acme.com"
                  className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584]">
                    Industry
                  </label>
                  <input
                    type="text"
                    required
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="SaaS / FinTech"
                    className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584] flex items-center gap-1">
                    <Users className="h-3 w-3" /> Company Size
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="1-10">1 - 10</option>
                    <option value="11-50">11 - 50</option>
                    <option value="51-200">51 - 200</option>
                    <option value="201+">201+</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584] flex items-center gap-1">
                  <Info className="h-3 w-3" /> What your company does
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your primary product or service..."
                  className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors resize-none leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Social Media Handles */}
          <div className="flex flex-col border border-[#343940] bg-[#131518] p-8 shadow-2xl relative">
            {/* Corner Accent */}
            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t border-r border-[#298DFF]" />
            <h2 className="mb-6 text-sm font-bold uppercase tracking-wider text-white border-b border-[#343940]/60 pb-3 flex items-center gap-2">
              <Twitter className="h-4 w-4 text-[#298DFF]" /> 02 // Social Channels
            </h2>

            <div className="flex flex-col gap-5 flex-1">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584] flex items-center gap-1.5">
                  <Twitter className="h-3.5 w-3.5 text-[#FF6C3D]" /> Twitter / X Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#6C7584]">@</span>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="acme_corp"
                    className="w-full rounded-none border border-[#343940] bg-black pl-8 pr-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584] flex items-center gap-1.5">
                  <Linkedin className="h-3.5 w-3.5 text-[#298DFF]" /> LinkedIn Page
                </label>
                <input
                  type="url"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/company/acme"
                  className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584] flex items-center gap-1.5">
                  <Facebook className="h-3.5 w-3.5 text-[#298DFF]" /> Facebook Page
                </label>
                <input
                  type="url"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/acme"
                  className="rounded-none border border-[#343940] bg-black px-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#6C7584] flex items-center gap-1.5">
                  <Instagram className="h-3.5 w-3.5 text-[#FF6C3D]" /> Instagram Handle
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-mono text-[#6C7584]">@</span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="acme.brand"
                    className="w-full rounded-none border border-[#343940] bg-black pl-8 pr-4 py-3 text-sm text-white focus:border-[#298DFF] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-auto pt-6 border-t border-[#343940]/40">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-none bg-[#298DFF] px-6 py-4 text-xs font-bold font-mono uppercase tracking-wider text-white transition-colors hover:bg-[#298DFF]/90 disabled:opacity-50 cursor-pointer shadow-[0_4px_20px_rgba(41,141,255,0.15)]"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Calibrating System...
                    </>
                  ) : (
                    <>
                      Complete Setup & Monitor <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
