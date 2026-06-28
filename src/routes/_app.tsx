import { Link, Outlet, useRouterState, createFileRoute } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  Plug,
  FileText,
  Settings as SettingsIcon,
  Bell,
  Radar,
  ChevronLeft,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { clusters } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/live-feed", label: "Live Feed", icon: Radio },
  { to: "/incidents", label: "Incidents", icon: AlertTriangle },
  { to: "/sources", label: "Sources", icon: Plug },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const activeIncidents = clusters.filter((c) => c.severity === "critical").length;
  const status = activeIncidents > 0 ? "critical" : "ok";

  // shift body padding for sidebar
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar status={status} activeCount={activeIncidents} />
      <div className="flex">
        <aside
          className={cn(
            "sticky top-14 h-[calc(100vh-3.5rem)] shrink-0 border-r border-border bg-sidebar transition-all duration-200",
            collapsed ? "w-16" : "w-56",
          )}
        >
          <nav className="flex flex-col gap-1 p-2">
            {nav.map((item) => {
              const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[color-mix(in_oklab,var(--cyan)_14%,transparent)] text-[var(--cyan)]"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && item.label === "Incidents" && activeIncidents > 0 && (
                    <span className="ml-auto rounded-md bg-[var(--critical)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {activeIncidents}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => setCollapsed((v) => !v)}
            className="absolute bottom-4 left-2 right-2 flex items-center justify-center gap-2 rounded-md border border-border bg-secondary/40 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </aside>
        <main className="min-w-0 flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function TopBar({ status, activeCount }: { status: "ok" | "critical"; activeCount: number }) {
  // simulate a "live" pulse on the radar
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 2000);
    return () => clearInterval(i);
  }, []);
  void tick;
  const pillText = useMemo(
    () =>
      status === "ok"
        ? "Monitoring 4 sources · All systems normal"
        : `Monitoring 4 sources · ${activeCount} active incident${activeCount === 1 ? "" : "s"}`,
    [status, activeCount],
  );
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur">
      <Link to="/" className="flex items-center gap-2">
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--cyan)_18%,transparent)] text-[var(--cyan)]">
          <Radar className="h-4 w-4" />
          <span className="absolute inset-0 rounded-md ring-1 ring-[var(--cyan)]/40 animate-ping opacity-60" />
        </span>
        <span className="font-bold tracking-tight text-foreground">
          Sentinel <span className="text-[var(--cyan)]">AI</span>
        </span>
      </Link>
      <div className="mx-auto">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
            status === "ok"
              ? "border-[color-mix(in_oklab,var(--safe)_45%,transparent)] bg-[color-mix(in_oklab,var(--safe)_12%,transparent)] text-[var(--safe)]"
              : "border-[color-mix(in_oklab,var(--critical)_45%,transparent)] bg-[color-mix(in_oklab,var(--critical)_12%,transparent)] text-[var(--critical)]",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              status === "ok" ? "bg-[var(--safe)]" : "bg-[var(--critical)] animate-pulse",
            )}
          />
          {pillText}
        </span>
      </div>
      <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground hover:text-foreground">
        <Bell className="h-4 w-4" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--critical)] px-1 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--cyan)] to-blue-700 text-xs font-bold text-background">
        AK
      </div>
    </header>
  );
}
