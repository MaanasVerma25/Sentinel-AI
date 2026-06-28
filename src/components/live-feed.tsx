import { useEffect, useRef, useState } from "react";
import { generateFeedItem, seedFeed } from "@/lib/mock-data";
import { SourceIcon } from "./source-icon";
import { cn } from "@/lib/utils";

type Item = ReturnType<typeof generateFeedItem>;

const categoryColor: Record<string, string> = {
  Payment: "bg-[color-mix(in_oklab,var(--cyan)_18%,transparent)] text-[var(--cyan)]",
  Bug: "bg-[color-mix(in_oklab,var(--warning)_18%,transparent)] text-[var(--warning)]",
  Outage: "bg-[color-mix(in_oklab,var(--critical)_18%,transparent)] text-[var(--critical)]",
  Fraud: "bg-purple-500/15 text-purple-300",
  PR: "bg-pink-500/15 text-pink-300",
};

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export function LiveSignalFeed({ maxItems = 16 }: { maxItems?: number }) {
  const [items, setItems] = useState<Item[]>(() =>
    seedFeed
      .slice(0, maxItems)
      .map((_, i) => ({ ...generateFeedItem(i), timestamp: new Date(Date.now() - i * 7000) })),
  );
  const idxRef = useRef(seedFeed.length);

  useEffect(() => {
    const i = setInterval(() => {
      idxRef.current += 1;
      setItems((prev) => [generateFeedItem(idxRef.current), ...prev].slice(0, maxItems));
    }, 2200);
    return () => clearInterval(i);
  }, [maxItems]);

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
              categoryColor[item.category],
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
    </ul>
  );
}
