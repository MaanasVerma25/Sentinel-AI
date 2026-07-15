import { useState, useEffect } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, AlertTriangle, Eye, ShieldAlert, CheckCircle2 } from "lucide-react";
import { clusters, type CrisisCluster, type Severity } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface NotificationItem {
  id: string;
  cluster: CrisisCluster;
  message: string;
  timestamp: string;
  read: boolean;
}

function generateNotifications(): NotificationItem[] {
  return clusters.map((c) => ({
    id: `notif-${c.id}`,
    cluster: c,
    message:
      c.severity === "critical"
        ? `Critical: ${c.title} — ${c.mentions} mentions (+${c.increasePct}%)`
        : c.severity === "warning"
          ? `Warning: ${c.title} — ${c.mentions} mentions (+${c.increasePct}%)`
          : `Watching: ${c.title} — ${c.mentions} mentions`,
    timestamp: c.detectedAt,
    read: c.severity === "watching",
  }));
}

const severityIcon: Record<Severity, typeof AlertTriangle> = {
  critical: ShieldAlert,
  warning: AlertTriangle,
  watching: Eye,
};

const severityColor: Record<Severity, string> = {
  critical: "text-[var(--critical)]",
  warning: "text-[var(--warning)]",
  watching: "text-[var(--safe)]",
};

const severityBg: Record<Severity, string> = {
  critical:
    "bg-[color-mix(in_oklab,var(--critical)_12%,transparent)] border-[color-mix(in_oklab,var(--critical)_30%,transparent)]",
  warning:
    "bg-[color-mix(in_oklab,var(--warning)_12%,transparent)] border-[color-mix(in_oklab,var(--warning)_30%,transparent)]",
  watching:
    "bg-[color-mix(in_oklab,var(--safe)_10%,transparent)] border-[color-mix(in_oklab,var(--safe)_25%,transparent)]",
};

export function NotificationsPanel({
  activeCount,
  onSelectIncident,
  customClusters,
}: {
  activeCount: number;
  onSelectIncident?: (cluster: CrisisCluster) => void;
  customClusters?: CrisisCluster[];
}) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const list = customClusters || clusters;
    setNotifications(
      list.map((c) => ({
        id: `notif-${c.id}`,
        cluster: c,
        message:
          c.severity === "critical"
            ? `Critical: ${c.title} — ${c.mentions} mentions (+${c.increasePct}%)`
            : c.severity === "warning"
              ? `Warning: ${c.title} — ${c.mentions} mentions (+${c.increasePct}%)`
              : `Watching: ${c.title} — ${c.mentions} mentions`,
        timestamp: c.detectedAt,
        read: c.severity === "watching",
      }))
    );
  }, [customClusters]);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClick = (notif: NotificationItem) => {
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    onSelectIncident?.(notif.cluster);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-secondary/40 text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--critical)] px-1 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-[380px] border-border bg-[#131518] p-0 shadow-[0_10px_50px_rgba(0,0,0,0.6)]"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold tracking-tight text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-md bg-[var(--critical)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1 text-[11px] font-medium text-[var(--cyan)] hover:text-[var(--cyan)]/80 transition-colors"
            >
              <CheckCircle2 className="h-3 w-3" />
              Mark all read
            </button>
          )}
        </div>

        {/* Notification list */}
        <div className="max-h-[360px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = severityIcon[notif.cluster.severity];
              return (
                <button
                  key={notif.id}
                  onClick={() => handleClick(notif)}
                  className={cn(
                    "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/30",
                    !notif.read && "bg-[color-mix(in_oklab,var(--cyan)_4%,transparent)]",
                    "border-b border-border/50 last:border-b-0",
                  )}
                >
                  <span
                    className={cn(
                      "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border",
                      severityBg[notif.cluster.severity],
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5", severityColor[notif.cluster.severity])} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        "text-xs leading-relaxed",
                        notif.read ? "text-muted-foreground" : "text-foreground font-medium",
                      )}
                    >
                      {notif.message}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70 font-mono">
                      {notif.timestamp}
                    </p>
                  </div>
                  {!notif.read && (
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[var(--cyan)]" />
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-4 py-2.5 text-center">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/60">
            {activeCount} active incident{activeCount === 1 ? "" : "s"} · All sources monitored
          </span>
        </div>
      </PopoverContent>
    </Popover>
  );
}
