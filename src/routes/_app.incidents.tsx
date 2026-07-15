import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { clusters, type CrisisCluster, type Severity, type Category } from "@/lib/mock-data";
import { CrisisClusterCard } from "@/components/crisis-cluster-card";
import { IncidentDetailDialog } from "@/components/incident-detail";
import { Search, X, ArrowUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { generateRealClusters } from "@/lib/clustering";
import { useSearch } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/incidents")({
  component: IncidentsPage,
});

const severities: { value: Severity; label: string; color: string }[] = [
  { value: "critical", label: "Critical", color: "var(--critical)" },
  { value: "warning", label: "Warning", color: "var(--warning)" },
  { value: "watching", label: "Watching", color: "var(--safe)" },
];

const categories: { value: Category; label: string }[] = [
  { value: "Payment", label: "Payment" },
  { value: "Bug", label: "Bug" },
  { value: "Fraud", label: "Fraud" },
  { value: "Outage", label: "Outage" },
  { value: "PR", label: "PR" },
];

type SortKey = "time" | "mentions" | "increase";
const sortOptions: { value: SortKey; label: string }[] = [
  { value: "time", label: "Most Recent" },
  { value: "mentions", label: "Most Mentions" },
  { value: "increase", label: "Highest Spike %" },
];

function IncidentsPage() {
  const { user, loading: authLoading } = useAuth();
  const { demo: isDemo } = useSearch({ from: "/_app" });
  
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
    async function loadIncidentsData() {
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
        console.error("Error loading incidents:", err);
      } finally {
        if (isMounted) setLoadingDb(false);
      }
    }
    loadIncidentsData();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading, isDemo]);

  // Realtime subscription for live mentions
  useEffect(() => {
    if (!company) return;

    const channel = supabase
      .channel("realtime-mentions-incidents")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mentions",
          filter: `company_id=eq.${company.id}`,
        },
        (payload) => {
          setMentions((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [company]);

  // Get source dataset based on auth / demo state
  const dataset = useMemo(() => {
    if (!isDemo && isOnboarded && company) {
      return generateRealClusters(mentions, company.name);
    }
    return clusters;
  }, [isDemo, isOnboarded, company, mentions]);

  const [selected, setSelected] = useState<CrisisCluster | null>(null);
  const [open, setOpen] = useState(false);

  // Search, filter & sort state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeverities, setActiveSeverities] = useState<Set<Severity>>(new Set());
  const [activeCategories, setActiveCategories] = useState<Set<Category>>(new Set());
  const [sortBy, setSortBy] = useState<SortKey>("time");

  const toggleSeverity = (sev: Severity) => {
    setActiveSeverities((prev) => {
      const next = new Set(prev);
      next.has(sev) ? next.delete(sev) : next.add(sev);
      return next;
    });
  };

  const toggleCategory = (cat: Category) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setActiveSeverities(new Set());
    setActiveCategories(new Set());
    setSortBy("time");
  };

  const hasActiveFilters =
    searchQuery.length > 0 || activeSeverities.size > 0 || activeCategories.size > 0;

  // Filtered & sorted clusters
  const filteredClusters = useMemo(() => {
    let result = [...dataset];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q),
      );
    }

    // Severity filter
    if (activeSeverities.size > 0) {
      result = result.filter((c) => activeSeverities.has(c.severity));
    }

    // Category filter
    if (activeCategories.size > 0) {
      result = result.filter((c) => activeCategories.has(c.category));
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "mentions":
          return b.mentions - a.mentions;
        case "increase":
          return b.increasePct - a.increasePct;
        case "time":
        default:
          return 0; // Already in time order from mock data
      }
    });

    return result;
  }, [searchQuery, activeSeverities, activeCategories, sortBy]);

  const groups = [
    { sev: "critical" as const, label: "Critical" },
    { sev: "warning" as const, label: "Warning" },
    { sev: "watching" as const, label: "Watching" },
  ];

  if (!isDemo && isOnboarded && (loadingDb || authLoading)) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-black">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#298DFF]" />
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Synchronizing crisis incidents...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All detected anomalies, grouped by severity.
        </p>
      </div>

      {/* Search bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search incidents by title, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-card py-2 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[var(--cyan)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--cyan)]/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-md border border-border bg-card px-3 py-2 text-xs font-medium text-foreground focus:border-[var(--cyan)]/50 focus:outline-none cursor-pointer"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mr-1">
          Severity:
        </span>
        {severities.map((s) => (
          <button
            key={s.value}
            onClick={() => toggleSeverity(s.value)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-all",
              activeSeverities.has(s.value)
                ? "border-current bg-[color-mix(in_oklab,currentColor_15%,transparent)]"
                : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-foreground/30",
            )}
            style={activeSeverities.has(s.value) ? { color: s.color } : undefined}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                activeSeverities.has(s.value) ? "bg-current" : "bg-muted-foreground",
              )}
            />
            {s.label}
          </button>
        ))}

        <span className="mx-1.5 h-4 w-px bg-border" />

        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mr-1">
          Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => toggleCategory(cat.value)}
            className={cn(
              "inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold transition-all",
              activeCategories.has(cat.value)
                ? "border-[var(--cyan)]/50 bg-[color-mix(in_oklab,var(--cyan)_12%,transparent)] text-[var(--cyan)]"
                : "border-border bg-secondary/30 text-muted-foreground hover:text-foreground hover:border-foreground/30",
            )}
          >
            {cat.label}
          </button>
        ))}

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="ml-2 inline-flex items-center gap-1 rounded-md border border-border bg-secondary/30 px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-[var(--critical)] hover:border-[var(--critical)]/40 transition-colors"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Result count */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="tabular-nums font-medium text-foreground">{filteredClusters.length}</span>
        <span>incident{filteredClusters.length === 1 ? "" : "s"} found</span>
        {hasActiveFilters && (
          <span className="text-muted-foreground/60">(filtered from {clusters.length} total)</span>
        )}
      </div>

      {/* Grouped results */}
      {filteredClusters.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card py-16 text-center">
          <Search className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            No incidents match your filters
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Try adjusting your search or clearing filters
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 rounded-md border border-border bg-secondary/40 px-4 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        groups.map((g) => {
          const items = filteredClusters.filter((c) => c.severity === g.sev);
          if (!items.length) return null;
          return (
            <section key={g.sev}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label} <span className="ml-1 text-foreground">({items.length})</span>
              </h2>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map((c) => (
                  <CrisisClusterCard
                    key={c.id}
                    cluster={c}
                    onView={(x) => {
                      setSelected(x);
                      setOpen(true);
                    }}
                  />
                ))}
              </div>
            </section>
          );
        })
      )}
      <IncidentDetailDialog cluster={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
