import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SourceIcon } from "@/components/source-icon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/sources")({
  component: SourcesPage,
});

interface SourceItem {
  id: "chat" | "social" | "review" | "email";
  label: string;
  volume: number;
  lastSync: string;
  enabled: boolean;
  isReal: boolean;
}

const mockSources: SourceItem[] = [
  { id: "chat", label: "Support Chat", volume: 12842, lastSync: "12 sec ago", enabled: true, isReal: false },
  { id: "social", label: "Social Media Feed", volume: 48211, lastSync: "8 sec ago", enabled: true, isReal: false },
  { id: "review", label: "App & Web Reviews", volume: 1421, lastSync: "1 min ago", enabled: true, isReal: false },
  { id: "email", label: "Email Inbox", volume: 3287, lastSync: "22 sec ago", enabled: true, isReal: false },
];

function SourcesPage() {
  const { user, loading: authLoading } = useAuth();
  const { demo: isDemoRaw } = useSearch({ from: "/_app" });
  const isDemo = !!isDemoRaw;

  // Real database states
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [mentions, setMentions] = useState<any[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  // Load onboarding profile, company, and initial mentions
  useEffect(() => {
    if (authLoading || !user || isDemo) {
      setLoadingDb(false);
      return;
    }
    let isMounted = true;
    async function loadSourcesData() {
      try {
        setLoadingDb(true);
        const { data: profile } = await supabase
          .from("onboarding_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile && isMounted) {
          setIsOnboarded(true);
          const { data: companyData } = await supabase
            .from("companies")
            .select("*")
            .eq("name", profile.company_name)
            .maybeSingle();

          if (companyData && isMounted) {
            setCompany(companyData);
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
        console.error("Error loading sources:", err);
      } finally {
        if (isMounted) setLoadingDb(false);
      }
    }
    loadSourcesData();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading, isDemo]);

  // Compute active crawler items dynamically
  const activeSourcesList = useMemo(() => {
    if (!isDemo && isOnboarded && company) {
      const redditCount = mentions.filter((m) => m.source === "reddit").length;
      const newsCount = mentions.filter((m) => m.source === "news").length;
      
      const latestReddit = mentions.find((m) => m.source === "reddit");
      const latestNews = mentions.find((m) => m.source === "news");

      const redditSync = latestReddit 
        ? `${new Date(latestReddit.ingested_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` 
        : "Never synced";
      const newsSync = latestNews 
        ? `${new Date(latestNews.ingested_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` 
        : "Never synced";

      return [
        {
          id: "social" as const,
          label: "Reddit API Crawler",
          volume: redditCount,
          lastSync: redditSync,
          enabled: true,
          isReal: true
        },
        {
          id: "review" as const,
          label: "Google News RSS Parser",
          volume: newsCount,
          lastSync: newsSync,
          enabled: true,
          isReal: true
        },
        {
          id: "chat" as const,
          label: "Customer Support Chat",
          volume: 0,
          lastSync: "Not connected",
          enabled: false,
          isReal: true
        },
        {
          id: "email" as const,
          label: "Email Inbox Listener",
          volume: 0,
          lastSync: "Not connected",
          enabled: false,
          isReal: true
        }
      ];
    }
    return mockSources;
  }, [isDemo, isOnboarded, company, mentions]);

  const [state, setState] = useState<SourceItem[]>([]);

  useEffect(() => {
    setState(activeSourcesList);
  }, [activeSourcesList]);

  if (!isDemo && isOnboarded && (loadingDb || authLoading)) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#298DFF]" />
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Synchronizing data integrations...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sources</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage the data streams Sentinel listens to.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {state.map((s) => (
          <div key={s.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--cyan)_12%,transparent)] text-[var(--cyan)]">
                <SourceIcon kind={s.id} className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-semibold",
                  s.enabled
                    ? "border-[var(--safe)]/40 bg-[color-mix(in_oklab,var(--safe)_15%,transparent)] text-[var(--safe)]"
                    : "border-border bg-secondary/40 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    s.enabled ? "bg-[var(--safe)]" : "bg-muted-foreground",
                  )}
                />
                {s.enabled ? "Connected" : "Inactive"}
              </span>
            </div>
            <h3 className="mt-3 text-base font-semibold">{s.label}</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Messages ingested</dt>
                <dd className="font-medium tabular-nums">{s.volume.toLocaleString()}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Last sync</dt>
                <dd className="text-foreground/80">{s.lastSync}</dd>
              </div>
            </dl>
            <label className="mt-4 flex cursor-pointer items-center justify-between rounded-md border border-border bg-secondary/30 px-3 py-2">
              <span className="text-sm">Enable monitoring</span>
              <input
                type="checkbox"
                checked={s.enabled}
                onChange={() =>
                  setState((prev) =>
                    prev.map((p) => (p.id === s.id ? { ...p, enabled: !p.enabled } : p)),
                  )
                }
                className="h-4 w-7 appearance-none rounded-full bg-muted relative cursor-pointer transition-colors checked:bg-[var(--cyan)] before:absolute before:top-0.5 before:left-0.5 before:h-3 before:w-3 before:rounded-full before:bg-white before:transition-transform checked:before:translate-x-3"
              />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
