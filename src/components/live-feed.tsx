import { useEffect, useRef, useState } from "react";
import { generateFeedItem, seedFeed } from "@/lib/mock-data";
import { SourceIcon } from "./source-icon";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

interface FeedItem {
  id: string;
  source: "chat" | "social" | "review" | "email";
  text: string;
  category: string;
  sentiment: "neg" | "neu" | "pos";
  timestamp: Date;
}

const categoryColor: Record<string, string> = {
  Payment: "bg-[color-mix(in_oklab,var(--cyan)_18%,transparent)] text-[var(--cyan)]",
  Bug: "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[var(--warning)]",
  Outage: "bg-[color-mix(in_oklab,var(--critical)_18%,transparent)] text-[var(--critical)]",
  Fraud: "bg-purple-500/15 text-purple-300",
  PR: "bg-pink-500/15 text-pink-300",
  General: "bg-secondary text-muted-foreground",
};

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function LiveSignalFeed({ maxItems = 16, isDemo = false }: { maxItems?: number; isDemo?: boolean }) {
  const { user, loading: authLoading } = useAuth();

  // Real database states
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const idxRef = useRef(seedFeed.length);

  // Load database structures
  useEffect(() => {
    if (authLoading || !user || isDemo) return;
    let isMounted = true;

    async function loadFeedData() {
      try {
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
            
            // Get initial mentions matching company
            const { data: mentionsData } = await supabase
              .from("mentions")
              .select("*")
              .eq("company_id", companyData.id)
              .order("created_at", { ascending: false })
              .limit(maxItems);

            if (mentionsData && isMounted) {
              setItems(
                mentionsData.map((m: any) => ({
                  id: m.id,
                  source: m.source === "reddit" ? "social" : "review",
                  text: m.title || m.text,
                  category: m.category || "General",
                  sentiment: m.sentiment === "critical" || m.sentiment === "negative" ? "neg" : m.sentiment === "positive" ? "pos" : "neu",
                  timestamp: new Date(m.created_at),
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error("Error loading live feed database:", err);
      }
    }

    loadFeedData();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading, isDemo, maxItems]);

  // Subscribe to realtime database updates
  useEffect(() => {
    if (!company || isDemo) return;

    const channel = supabase
      .channel("realtime-mentions-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "mentions",
          filter: `company_id=eq.${company.id}`,
        },
        (payload) => {
          const m = payload.new;
          const mappedItem: FeedItem = {
            id: m.id,
            source: m.source === "reddit" ? "social" : "review",
            text: m.title || m.text,
            category: m.category || "General",
            sentiment: m.sentiment === "critical" || m.sentiment === "negative" ? "neg" : m.sentiment === "positive" ? "pos" : "neu",
            timestamp: new Date(m.created_at),
          };
          setItems((prev) => [mappedItem, ...prev].slice(0, maxItems));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [company, isDemo, maxItems]);

  // Fallback simulated interval feed for guests / demo mode
  useEffect(() => {
    if (!isDemo && isOnboarded) return; // Disable simulation for onboarded users

    // Initialize mock feed
    setItems(
      seedFeed
        .slice(0, maxItems)
        .map((_, i) => {
          const mock = generateFeedItem(i);
          return {
            id: mock.id,
            source: mock.source as any,
            text: mock.text,
            category: mock.category,
            sentiment: mock.sentiment as any,
            timestamp: new Date(Date.now() - i * 7000),
          };
        })
    );

    const i = setInterval(() => {
      idxRef.current += 1;
      const mock = generateFeedItem(idxRef.current);
      const newItem: FeedItem = {
        id: mock.id,
        source: mock.source as any,
        text: mock.text,
        category: mock.category,
        sentiment: mock.sentiment as any,
        timestamp: new Date(),
      };
      setItems((prev) => [newItem, ...prev].slice(0, maxItems));
    }, 2200);

    return () => clearInterval(i);
  }, [maxItems, isDemo, isOnboarded]);

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
      {items.map((item, i) => (
        <li
          key={item.id}
          className={cn(
            "flex items-start gap-3 px-4 py-2.5 text-sm",
            i === 0 && "ticker-in bg-[color-mix(in_oklab,var(--cyan)_5%,transparent)]",
          )}
        >
          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground">
            <SourceIcon kind={item.source} />
          </span>
          <p className="flex-1 truncate text-foreground/90">{item.text}</p>
          <span
            className={cn(
              "hidden md:inline rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              categoryColor[item.category] || categoryColor.General,
            )}
          >
            {item.category}
          </span>
          <span
            title={item.sentiment}
            className={cn(
              "mt-1.5 h-2 w-2 shrink-0 rounded-full",
              item.sentiment === "neg" && "bg-[var(--critical)]",
              item.sentiment === "neu" && "bg-[var(--warning)]",
              item.sentiment === "pos" && "bg-[var(--safe)]",
            )}
          />
          <span className="w-16 shrink-0 text-right font-mono text-[11px] text-muted-foreground">
            {fmtTime(item.timestamp)}
          </span>
        </li>
      ))}
      {items.length === 0 && (
        <li className="px-4 py-8 text-center text-muted-foreground font-mono text-xs">
          No live signals streaming. Scan signals in the Command Center to ingest brand mentions.
        </li>
      )}
    </ul>
  );
}
