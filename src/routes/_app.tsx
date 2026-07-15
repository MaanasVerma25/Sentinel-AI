import { Link, Outlet, useRouterState, useNavigate, createFileRoute, useSearch } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Radio,
  AlertTriangle,
  Plug,
  FileText,
  Settings as SettingsIcon,
  Radar,
  ChevronLeft,
  ArrowLeft,
  Menu,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { clusters, type CrisisCluster } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { NotificationsPanel } from "@/components/notifications-panel";
import { IncidentDetailDialog } from "@/components/incident-detail";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
  validateSearch: (search: Record<string, unknown>) => ({
    demo: search.demo === "true" || search.demo === true,
  }),
});

const nav: { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/live-feed", label: "Live Feed", icon: Radio },
  { to: "/incidents", label: "Incidents", icon: AlertTriangle },
  { to: "/sources", label: "Sources", icon: Plug },
  { to: "/reports", label: "Reports", icon: FileText },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { demo: isDemo } = useSearch({ from: "/_app" });
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(false);
  const activeIncidents = clusters.filter((c) => c.severity === "critical").length;
  const status = activeIncidents > 0 ? "critical" : "ok";

  // Incident detail dialog state (opened from notifications)
  const [selectedCluster, setSelectedCluster] = useState<CrisisCluster | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleNotificationSelect = (cluster: CrisisCluster) => {
    setSelectedCluster(cluster);
    setDetailOpen(true);
  };

  // Auth guard: redirect to /setup if not authenticated AND not in demo mode
  useEffect(() => {
    if (!loading && !user && !isDemo) {
      navigate({ to: "/setup" });
    }
  }, [loading, user, isDemo, navigate]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--cyan)]" />
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">
            Authenticating...
          </p>
        </div>
      </div>
    );
  }

  // Don't render the app until authenticated (unless demo mode)
  if (!user && !isDemo) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Demo Mode Banner */}
      {isDemo && !demoBannerDismissed && (
        <div className="sticky top-0 z-50 flex items-center justify-between gap-3 border-b border-[var(--warning)]/40 bg-[color-mix(in_oklab,var(--warning)_8%,var(--background))] px-4 py-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--warning)] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--warning)]" />
            </span>
            <span className="text-[var(--warning)] font-bold uppercase tracking-wider">SIMULATION MODE</span>
            <span className="text-muted-foreground">— You're viewing a live demo with mock data. No real data is connected.</span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/setup"
              className="rounded-none border border-[var(--warning)]/50 bg-[var(--warning)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--warning)] hover:bg-[var(--warning)]/20 transition-colors"
            >
              Sign Up Free →
            </Link>
            <button
              onClick={() => setDemoBannerDismissed(true)}
              className="text-muted-foreground hover:text-foreground transition-colors text-base leading-none"
              title="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <TopBar
        status={status}
        activeCount={activeIncidents}
        user={user}
        onSelectIncident={handleNotificationSelect}
      />
      <div className="flex">
        <aside
          className={cn(
            "sticky top-14 hidden h-[calc(100vh-3.5rem)] shrink-0 border-r border-border bg-sidebar transition-all duration-200 md:block",
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

          {/* Theme toggle in sidebar */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "mx-2 flex items-center gap-3 rounded-md border border-border bg-secondary/40 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground",
              collapsed && "justify-center px-0",
            )}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 shrink-0 text-[var(--warning)]" />
            ) : (
              <Moon className="h-4 w-4 shrink-0 text-[var(--cyan)]" />
            )}
            {!collapsed && (
              <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
            )}
          </button>

          <button
            onClick={() => setCollapsed((v) => !v)}
            className="absolute bottom-4 left-2 right-2 flex items-center justify-center gap-2 rounded-md border border-border bg-secondary/40 py-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft
              className={cn("h-3.5 w-3.5 transition-transform", collapsed && "rotate-180")}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-6">
          <Outlet />
        </main>
      </div>
      <IncidentDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        cluster={selectedCluster}
      />
    </div>
  );
}

function getInitials(
  user: { user_metadata?: { full_name?: string }; email?: string } | null,
): string {
  if (!user) return "?";
  const name = user.user_metadata?.full_name;
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (user.email?.slice(0, 2) ?? "?").toUpperCase();
}

function TopBar({
  status,
  activeCount,
  user,
  onSelectIncident,
}: {
  status: "ok" | "critical";
  activeCount: number;
  user: { user_metadata?: { full_name?: string }; email?: string } | null;
  onSelectIncident?: (cluster: CrisisCluster) => void;
}) {
  const { theme, setTheme } = useTheme();
  const [tick, setTick] = useState(0);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

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
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground hover:text-foreground">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 bg-sidebar p-0">
            <SheetHeader className="border-b border-border p-6 text-left">
              <SheetTitle className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-[var(--cyan)]" />
                <span>Sentinel AI</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-4">
              {nav.map((item) => {
                const isActive = item.exact ? pathname === item.to : pathname.startsWith(item.to);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium transition-colors",
                      isActive
                        ? "bg-[color-mix(in_oklab,var(--cyan)_14%,transparent)] text-[var(--cyan)]"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.label}</span>
                    {item.label === "Incidents" && activeCount > 0 && (
                      <span className="ml-auto rounded-md bg-[var(--critical)] px-2 py-0.5 text-xs font-bold text-white">
                        {activeCount}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Theme toggle in mobile sheet nav */}
              <button
                type="button"
                onClick={() => {
                  setTheme(theme === "dark" ? "light" : "dark");
                  setOpen(false);
                }}
                className="group flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground w-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5 shrink-0 text-[var(--warning)]" />
                ) : (
                  <Moon className="h-5 w-5 shrink-0 text-[var(--cyan)]" />
                )}
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      <Link to="/home" className="flex items-center gap-2">
        <span className="relative inline-flex h-7 w-7 items-center justify-center rounded-md bg-[color-mix(in_oklab,var(--cyan)_18%,transparent)] text-[var(--cyan)]">
          <Radar className="h-4 w-4" />
          <span className="absolute inset-0 rounded-md ring-1 ring-[var(--cyan)]/40 animate-ping opacity-60" />
        </span>
        <span className="hidden font-bold tracking-tight text-foreground sm:inline-block">
          Sentinel <span className="text-[var(--cyan)]">AI</span>
        </span>
      </Link>

      <div className="mx-auto flex-1 md:flex-initial">
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full border px-2 py-1 text-[10px] font-medium sm:px-3 sm:text-xs",
            status === "ok"
              ? "border-[color-mix(in_oklab,var(--safe)_45%,transparent)] bg-[color-mix(in_oklab,var(--safe)_12%,transparent)] text-[var(--safe)]"
              : "border-[color-mix(in_oklab,var(--critical)_45%,transparent)] bg-[color-mix(in_oklab,var(--critical)_12%,transparent)] text-[var(--critical)]",
          )}
        >
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2",
              status === "ok" ? "bg-[var(--safe)]" : "bg-[var(--critical)] animate-pulse",
            )}
          />
          <span className="max-w-[120px] truncate sm:max-w-none">{pillText}</span>
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Link
          to="/home"
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-secondary/40 px-3 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4 text-[var(--warning)]" />
          ) : (
            <Moon className="h-4 w-4 text-[var(--cyan)]" />
          )}
        </button>
        <NotificationsPanel activeCount={activeCount} onSelectIncident={onSelectIncident} />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--cyan)] to-blue-700 text-[10px] font-bold text-background sm:h-9 sm:w-9 sm:text-xs">
          {getInitials(user)}
        </div>
      </div>
    </header>
  );
}
