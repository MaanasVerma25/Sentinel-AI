import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  // Load settings on mount
  useEffect(() => {
    // Load from LocalStorage
    if (typeof window !== "undefined") {
      setCritical(localStorage.getItem("sentinel_settings_critical") ?? "200");
      setWarning(localStorage.getItem("sentinel_settings_warning") ?? "100");
      setMinMentions(localStorage.getItem("sentinel_settings_min_mentions") ?? "25");
      setDetectionWindow(localStorage.getItem("sentinel_settings_detection_window") ?? "5");
      setSlackChannel(localStorage.getItem("sentinel_settings_slack_channel") ?? "#incidents-critical");
      setOnCallEmail(localStorage.getItem("sentinel_settings_on_call_email") ?? "oncall@sentinel.ai");
      setPagerDutyKey(localStorage.getItem("sentinel_settings_pagerduty_key") ?? "••••••••••••");
    }

    // Load from Supabase
    const loadDbPrefs = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("alert_preferences")
          .select("threshold, notify_slack, notify_email")
          .eq("user_id", user.id)
          .single();

        if (error) {
          // If no preferences found, that's fine, we use default values
          console.log("No preferences found, using default calibration settings.");
        } else if (data) {
          setDbThreshold(data.threshold ?? 65);
          setNotifySlack(data.notify_slack ?? true);
          setNotifyEmail(data.notify_email ?? true);
        }
      } catch (err) {
        console.error("Failed to load db alert preferences:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDbPrefs();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 1. Save to LocalStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("sentinel_settings_critical", critical);
        localStorage.setItem("sentinel_settings_warning", warning);
        localStorage.setItem("sentinel_settings_min_mentions", minMentions);
        localStorage.setItem("sentinel_settings_detection_window", detectionWindow);
        localStorage.setItem("sentinel_settings_slack_channel", slackChannel);
        localStorage.setItem("sentinel_settings_on_call_email", onCallEmail);
        localStorage.setItem("sentinel_settings_pagerduty_key", pagerDutyKey);
      }

      // 2. Save to Supabase if authenticated
      if (user) {
        const { error } = await supabase.from("alert_preferences").upsert({
          user_id: user.id,
          threshold: dbThreshold,
          notify_slack: notifySlack,
          notify_email: notifyEmail,
        });

        if (error) {
          throw error;
        }
      }

      toast.success("Settings saved successfully!");
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configure anomaly detection thresholds, active streams, and alerting routes.
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-[var(--cyan)] px-4 py-2 text-xs font-bold font-mono uppercase tracking-wider text-background transition-colors hover:bg-[var(--cyan)]/90 disabled:opacity-50 cursor-pointer"
        >
          {saving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving...
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Save Settings
            </>
          )}
        </button>
      </div>

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
            Sets the global event surge baseline. surgering above this value triggers immediate incident generation.
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
              <span className="text-xs font-medium text-foreground block">Notify via Slack</span>
              <span className="text-[10px] text-muted-foreground block">Push critical updates to integrated Slack workspace</span>
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
              <span className="text-xs font-medium text-foreground block">Notify via Email</span>
              <span className="text-[10px] text-muted-foreground block">Send urgent alerts to configured on-call email</span>
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
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  suffix,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  suffix?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground font-mono uppercase">{label}</span>
      <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 focus-within:border-[var(--cyan)] transition-colors">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent text-sm focus:outline-none text-foreground"
        />
        {suffix && <span className="text-xs text-muted-foreground font-mono">{suffix}</span>}
      </div>
    </label>
  );
}
