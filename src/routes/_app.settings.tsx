import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useTheme } from "@/hooks/useTheme";
import {
  Loader2,
  Save,
  Building2,
  Globe,
  Users,
  Info,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  BellRing,
  Sun,
  Moon,
} from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"alerting" | "company">("alerting");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ── Tab 1: Alerting settings states ──
  // Device-level settings state (stored in localStorage)
  const [critical, setCritical] = useState("200");
  const [warning, setWarning] = useState("100");
  const [minMentions, setMinMentions] = useState("25");
  const [detectionWindow, setDetectionWindow] = useState("5");
  const [slackChannel, setSlackChannel] = useState("#incidents-critical");
  const [onCallEmail, setOnCallEmail] = useState("oncall@sentinel.ai");
  const [pagerDutyKey, setPagerDutyKey] = useState("••••••••••••");

  // Database-backed settings (stored in Supabase alert_preferences)
  const [dbThreshold, setDbThreshold] = useState(65);
  const [notifySlack, setNotifySlack] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(true);

  // ── Tab 2: Company profile states ──
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

  // Load settings on mount
  useEffect(() => {
    // 1. Load alerting options from LocalStorage
    if (typeof window !== "undefined") {
      setCritical(localStorage.getItem("sentinel_settings_critical") ?? "200");
      setWarning(localStorage.getItem("sentinel_settings_warning") ?? "100");
      setMinMentions(localStorage.getItem("sentinel_settings_min_mentions") ?? "25");
      setDetectionWindow(localStorage.getItem("sentinel_settings_detection_window") ?? "5");
      setSlackChannel(
        localStorage.getItem("sentinel_settings_slack_channel") ?? "#incidents-critical",
      );
      setOnCallEmail(
        localStorage.getItem("sentinel_settings_on_call_email") ?? "oncall@sentinel.ai",
      );
      setPagerDutyKey(localStorage.getItem("sentinel_settings_pagerduty_key") ?? "••••••••••••");
    }

    const loadAllDatabaseData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        // 2. Load alert prefs from Supabase
        const { data: alertData, error: alertError } = await supabase
          .from("alert_preferences")
          .select("threshold, notify_slack, notify_email")
          .eq("user_id", user.id)
          .maybeSingle();

        if (alertError) {
          console.error("Failed to load db alert preferences:", alertError);
        } else if (alertData) {
          setDbThreshold(alertData.threshold ?? 65);
          setNotifySlack(alertData.notify_slack ?? true);
          setNotifyEmail(alertData.notify_email ?? true);
        }

        // 3. Load onboarding details from Supabase onboarding_profiles table
        const { data: onboardingData, error: onboardingError } = await supabase
          .from("onboarding_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (onboardingError) {
          console.error("Failed to load onboarding profiles:", onboardingError);
        } else if (onboardingData) {
          setCompanyName(onboardingData.company_name || user.user_metadata?.company || "");
          setWebsite(onboardingData.website || "");
          setIndustry(onboardingData.industry || "");
          setCompanySize(onboardingData.company_size || "11-50");
          setDescription(onboardingData.description || "");
          setTwitter(onboardingData.twitter_handle || "");
          setLinkedin(onboardingData.linkedin_url || "");
          setFacebook(onboardingData.facebook_url || "");
          setInstagram(onboardingData.instagram_handle || "");
        } else {
          // Prefill company name from auth user metadata if table row doesn't exist yet
          setCompanyName(user.user_metadata?.company || "");
        }
      } catch (err) {
        console.error("Failed to load database settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllDatabaseData();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      if (activeTab === "alerting") {
        // Save alerting configurations
        if (typeof window !== "undefined") {
          localStorage.setItem("sentinel_settings_critical", critical);
          localStorage.setItem("sentinel_settings_warning", warning);
          localStorage.setItem("sentinel_settings_min_mentions", minMentions);
          localStorage.setItem("sentinel_settings_detection_window", detectionWindow);
          localStorage.setItem("sentinel_settings_slack_channel", slackChannel);
          localStorage.setItem("sentinel_settings_on_call_email", onCallEmail);
          localStorage.setItem("sentinel_settings_pagerduty_key", pagerDutyKey);
        }

        const { error } = await supabase.from("alert_preferences").upsert({
          user_id: user.id,
          threshold: dbThreshold,
          notify_slack: notifySlack,
          notify_email: notifyEmail,
        });

        if (error) throw error;
        toast.success("Alert settings saved successfully!");
      } else {
        // Save company onboarding details
        const { error: onboardingError } = await supabase.from("onboarding_profiles").upsert({
          user_id: user.id,
          company_name: companyName,
          website,
          industry,
          company_size: companySize,
          description,
          twitter_handle: twitter,
          linkedin_url: linkedin,
          facebook_url: facebook,
          instagram_handle: instagram,
        });

        if (onboardingError) throw onboardingError;

        // Sync company name back to profiles table
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ company: companyName })
          .eq("id", user.id);

        if (profileError) {
          console.error("Failed to sync profile company name:", profileError);
        }

        // Sync metadata
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
        toast.success("Company profile and social channels updated!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--cyan)]" />
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
            Loading settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure anomaly thresholds, active streams, company details, and social channels.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--cyan)] px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-background transition-colors hover:bg-[var(--cyan)]/90 disabled:opacity-50 cursor-pointer w-fit"
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Save Changes
            </>
          )}
        </button>
      </div>

      {/* ── Tabs bar ── */}
      <div className="flex border-b border-border font-mono text-xs uppercase tracking-wider">
        <button
          type="button"
          onClick={() => setActiveTab("alerting")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold cursor-pointer transition-colors ${
            activeTab === "alerting"
              ? "border-[var(--cyan)] text-[var(--cyan)]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BellRing className="h-3.5 w-3.5" /> Alert Settings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2.5 border-b-2 font-bold cursor-pointer transition-colors ${
            activeTab === "company"
              ? "border-[var(--cyan)] text-[var(--cyan)]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="h-3.5 w-3.5" /> Company & Socials
        </button>
      </div>

      {activeTab === "alerting" ? (
        <div className="space-y-6">
          {/* ── Appearance (Device Stored) ── */}
          <section className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--cyan)] flex items-center gap-2">
              Appearance (Device Stored)
            </h2>
            <div className="space-y-3">
              <span className="block text-xs text-muted-foreground font-mono uppercase">
                Interface Theme
              </span>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    theme === "dark"
                      ? "border-[var(--cyan)] bg-[color-mix(in_oklab,var(--cyan)_14%,transparent)] text-[var(--cyan)]"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Moon className="h-4 w-4" /> Dark Mode
                </button>
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-mono uppercase tracking-wider transition-colors cursor-pointer ${
                    theme === "light"
                      ? "border-[var(--cyan)] bg-[color-mix(in_oklab,var(--cyan)_14%,transparent)] text-[var(--cyan)]"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Sun className="h-4 w-4" /> Light Mode
                </button>
              </div>
              <span className="text-[10px] text-muted-foreground leading-normal block">
                Choose between dark and light appearance for the entire command center.
              </span>
            </div>
          </section>

          {/* ── Calibration preferences (Supabase) ── */}
          <section className="rounded-lg border border-border bg-card p-5 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--cyan)]">
              System Calibration (Database Sync)
            </h2>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground font-mono">
                <span>ALERT LIMIT SENSITIVITY</span>
                <span className="text-foreground font-bold">{dbThreshold} events/min</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={dbThreshold}
                onChange={(e) => setDbThreshold(Number(e.target.value))}
                className="w-full h-1 bg-secondary appearance-none cursor-pointer accent-[var(--cyan)]"
              />
              <span className="text-[10px] text-muted-foreground leading-normal block">
                Sets the global event surge baseline. surging above this value triggers immediate
                incident generation.
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border pt-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifySlack}
                  onChange={(e) => setNotifySlack(e.target.checked)}
                  className="mt-0.5 rounded border-border bg-background text-[var(--cyan)] focus:ring-[var(--cyan)] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-medium text-foreground block">
                    Notify via Slack
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Push critical updates to integrated Slack workspace
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="mt-0.5 rounded border-border bg-background text-[var(--cyan)] focus:ring-[var(--cyan)] cursor-pointer"
                />
                <div>
                  <span className="text-xs font-medium text-foreground block">
                    Notify via Email
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    Send urgent alerts to configured on-call email
                  </span>
                </div>
              </label>
            </div>
          </section>

          {/* ── Detection thresholds (LocalStorage) ── */}
          <section className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Detection Thresholds (Device Stored)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field
                label="Critical: % increase over baseline"
                value={critical}
                onChange={setCritical}
                suffix="%"
              />
              <Field
                label="Warning: % increase over baseline"
                value={warning}
                onChange={setWarning}
                suffix="%"
              />
              <Field
                label="Minimum mentions to trigger"
                value={minMentions}
                onChange={setMinMentions}
              />
              <Field
                label="Detection window"
                value={detectionWindow}
                onChange={setDetectionWindow}
                suffix="minutes"
              />
            </div>
          </section>

          {/* ── Alerting destinations (LocalStorage) ── */}
          <section className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Alerting Targets (Device Stored)
            </h2>
            <div className="space-y-4">
              <Field
                label="Default Slack channel"
                value={slackChannel}
                onChange={setSlackChannel}
              />
              <Field
                label="On-call email"
                type="email"
                value={onCallEmail}
                onChange={setOnCallEmail}
              />
              <Field
                label="PagerDuty service key"
                type="password"
                value={pagerDutyKey}
                onChange={setPagerDutyKey}
              />
            </div>
          </section>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── Company profile settings ── */}
          <section className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--cyan)] flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--cyan)]" /> Company Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company Name" value={companyName} onChange={setCompanyName} required />
              <Field
                label="Website URL"
                type="url"
                value={website}
                onChange={setWebsite}
                placeholder="https://acme.com"
              />
              <Field
                label="Industry"
                value={industry}
                onChange={setIndustry}
                placeholder="SaaS / FinTech / E-commerce"
                required
              />
              <div className="block">
                <span className="mb-1 block text-xs text-muted-foreground font-mono uppercase">
                  Company Size
                </span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-[var(--cyan)] transition-colors">
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="flex-1 bg-transparent text-sm focus:outline-none text-foreground appearance-none cursor-pointer font-sans"
                  >
                    <option value="1-10" className="bg-card text-foreground">
                      1 - 10
                    </option>
                    <option value="11-50" className="bg-card text-foreground">
                      11 - 50
                    </option>
                    <option value="51-200" className="bg-card text-foreground">
                      51 - 200
                    </option>
                    <option value="201+" className="bg-card text-foreground">
                      201+
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <label className="block mt-4">
              <span className="mb-1 block text-xs text-muted-foreground font-mono uppercase flex items-center gap-1">
                <Info className="h-3 w-3" /> Description (What you do)
              </span>
              <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-[var(--cyan)] transition-colors">
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your primary product or service..."
                  className="flex-1 bg-transparent text-sm focus:outline-none text-foreground resize-none leading-relaxed"
                  required
                />
              </div>
            </label>
          </section>

          {/* ── Social channels settings ── */}
          <section className="rounded-lg border border-border bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Twitter className="h-4 w-4 text-muted-foreground" /> Social Channels
            </h2>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground font-mono uppercase flex items-center gap-1">
                  <Twitter className="h-3.5 w-3.5 text-[#FF6C3D]" /> Twitter / X Handle
                </span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-[var(--cyan)] transition-colors">
                  <span className="text-xs font-mono text-muted-foreground">@</span>
                  <input
                    type="text"
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="acme_corp"
                    className="flex-1 bg-transparent text-sm focus:outline-none text-foreground"
                  />
                </div>
              </label>

              <Field
                label="LinkedIn Page URL"
                type="url"
                value={linkedin}
                onChange={setLinkedin}
                placeholder="https://linkedin.com/company/acme"
              />

              <Field
                label="Facebook Page URL"
                type="url"
                value={facebook}
                onChange={setFacebook}
                placeholder="https://facebook.com/acme"
              />

              <label className="block">
                <span className="mb-1 block text-xs text-muted-foreground font-mono uppercase flex items-center gap-1">
                  <Instagram className="h-3.5 w-3.5 text-[#FF6C3D]" /> Instagram Handle
                </span>
                <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-[var(--cyan)] transition-colors">
                  <span className="text-xs font-mono text-muted-foreground">@</span>
                  <input
                    type="text"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="acme.brand"
                    className="flex-1 bg-transparent text-sm focus:outline-none text-foreground"
                  />
                </div>
              </label>
            </div>
          </section>
        </div>
      )}
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  suffix,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  suffix?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground font-mono uppercase">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-[var(--cyan)] transition-colors">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="flex-1 bg-transparent text-sm focus:outline-none text-foreground"
        />
        {suffix && <span className="text-xs text-muted-foreground font-mono">{suffix}</span>}
      </div>
    </label>
  );
}
