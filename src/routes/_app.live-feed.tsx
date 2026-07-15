import { createFileRoute, useSearch } from "@tanstack/react-router";
import { LiveSignalFeed } from "@/components/live-feed";

function LiveFeedPage() {
  const { demo: isDemo } = useSearch({ from: "/_app" });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live Feed</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every message being classified in real time across all sources.
        </p>
      </div>
      <LiveSignalFeed maxItems={28} isDemo={!!isDemo} />
    </div>
  );
}

export const Route = createFileRoute("/_app/live-feed")({
  component: LiveFeedPage,
});
