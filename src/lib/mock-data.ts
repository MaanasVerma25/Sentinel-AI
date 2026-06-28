export type Severity = "critical" | "warning" | "watching";
export type SourceKind = "chat" | "social" | "review" | "email";
export type Category = "Payment" | "Bug" | "Fraud" | "Outage" | "PR";

export interface CrisisCluster {
  id: string;
  title: string;
  severity: Severity;
  category: Category;
  mentions: number;
  baseline: number;
  increasePct: number;
  sources: SourceKind[];
  detectedAt: string;
  spark: number[];
  summary: string;
  rootCauses: string[];
  affectedUsers: string;
  fixes: string[];
}

export const clusters: CrisisCluster[] = [
  {
    id: "c1",
    title: "Payment Failure Spike — Stripe 3DS",
    severity: "critical",
    category: "Payment",
    mentions: 142,
    baseline: 38,
    increasePct: 274,
    sources: ["chat", "social", "email"],
    detectedAt: "2 min ago",
    spark: [12, 14, 11, 18, 22, 30, 48, 76, 112, 142],
    summary:
      "Users across web checkout are reporting failed payments after 3D Secure verification. The spike began 11 minutes ago, concentrated on Visa cards in EU regions. Volume is 3.7× the 7-day baseline and accelerating.",
    rootCauses: [
      "Stripe 3DS callback returning 502 on eu-west-1 edge nodes",
      "Recent deploy (build #4821) changed redirect handler for /checkout/confirm",
      "No fallback to non-3DS flow when verification times out",
    ],
    affectedUsers: "~2,400 checkout sessions in the last hour",
    fixes: [
      "Roll back deploy #4821 to restore previous redirect handler",
      "Failover Stripe webhook traffic to us-east-1 edge",
      "Enable graceful degradation to legacy payment flow",
      "Post status page incident and email affected customers",
    ],
  },
  {
    id: "c2",
    title: "App Crash on Android 14 — Photo Upload",
    severity: "critical",
    category: "Bug",
    mentions: 89,
    baseline: 22,
    increasePct: 305,
    sources: ["chat", "review"],
    detectedAt: "8 min ago",
    spark: [8, 9, 11, 14, 18, 27, 41, 60, 78, 89],
    summary:
      "Android 14 users experience hard crashes when attaching photos larger than 8MB. Pattern matches Google Play crash cluster ANR-2451. Reviews on Play Store dropping from 4.6 to 4.1 star daily avg.",
    rootCauses: [
      "Native bitmap decoding OOM on Android 14 strict mode",
      "Image compression worker not bounded by memory limits",
      "Missing try/catch in new Camera2 capture pipeline",
    ],
    affectedUsers: "~6,100 Android sessions today",
    fixes: [
      "Ship hotfix v3.12.1 with bounded bitmap allocator",
      "Reduce default capture resolution from 4K to 1080p on Android 14",
      "Add Sentry breadcrumb for upload pipeline",
    ],
  },
  {
    id: "c3",
    title: "Outage — API us-west-2 elevated 5xx",
    severity: "critical",
    category: "Outage",
    mentions: 211,
    baseline: 12,
    increasePct: 1658,
    sources: ["chat", "social", "email", "review"],
    detectedAt: "just now",
    spark: [4, 5, 6, 8, 12, 22, 55, 110, 178, 211],
    summary:
      "API gateway in us-west-2 returning 503 for 18% of requests since 09:47 UTC. Customer-facing dashboards and mobile sync are degraded. Twitter chatter rising sharply.",
    rootCauses: [
      "RDS Aurora writer node failover stuck in 'pending'",
      "Connection pool exhaustion in ingest service",
      "Auto-scaling event masked by stale CloudWatch alarm",
    ],
    affectedUsers: "~14,000 active users in us-west-2",
    fixes: [
      "Manual failover to standby writer in usw2b",
      "Bump pgbouncer pool from 200 → 600 connections",
      "Page on-call SRE and post status update",
    ],
  },
  {
    id: "c4",
    title: "Fraud Spike — Card Testing Pattern",
    severity: "warning",
    category: "Fraud",
    mentions: 47,
    baseline: 9,
    increasePct: 422,
    sources: ["email", "chat"],
    detectedAt: "23 min ago",
    spark: [3, 4, 5, 7, 12, 18, 24, 31, 40, 47],
    summary:
      "Pattern detected: 47 sub-$1 declines from 12 IPs in /24 subnet, all using burner emails. Classic card-testing signature ahead of larger fraud attempt.",
    rootCauses: [
      "Velocity rule not triggered (threshold set at 100)",
      "BIN range 414720-414729 not on internal watchlist",
      "Headless browser fingerprints bypassing reCAPTCHA",
    ],
    affectedUsers: "12 IPs, ~47 attempted transactions",
    fixes: [
      "Lower velocity threshold from 100 → 25 per IP/hr",
      "Block subnet at WAF and add BIN range to deny list",
      "Enable Stripe Radar 'block elevated risk' for 24h",
    ],
  },
  {
    id: "c5",
    title: "Negative PR — Influencer Twitter Thread",
    severity: "warning",
    category: "PR",
    mentions: 318,
    baseline: 14,
    increasePct: 2171,
    sources: ["social"],
    detectedAt: "41 min ago",
    spark: [6, 8, 12, 24, 58, 102, 180, 240, 290, 318],
    summary:
      "Tech reviewer @devexplorer (412k followers) posted a thread criticizing onboarding friction. Quote-tweets and replies trending; sentiment is 71% negative.",
    rootCauses: [
      "Email verification step added in last release adds 3 extra steps",
      "Onboarding completion dropped 14% week-over-week",
      "No proactive comms or response from official account",
    ],
    affectedUsers: "Brand reach: ~1.2M impressions in 40 min",
    fixes: [
      "Draft public response acknowledging friction and shipping fix",
      "Hot-patch: defer email verification to first login",
      "Brief CEO and head of community before EOD",
    ],
  },
  {
    id: "c6",
    title: "Webhook Delivery Lag — Enterprise tier",
    severity: "watching",
    category: "Outage",
    mentions: 18,
    baseline: 6,
    increasePct: 200,
    sources: ["chat", "email"],
    detectedAt: "1 h ago",
    spark: [4, 5, 6, 6, 8, 10, 12, 14, 16, 18],
    summary:
      "Three enterprise customers reporting webhook delivery delays of 4–9 minutes. Within SLO but trending toward breach if growth continues.",
    rootCauses: [
      "Queue depth on webhook-dispatch growing linearly",
      "Worker autoscale max set to 8, currently saturated",
    ],
    affectedUsers: "3 enterprise accounts, ~2,800 webhooks delayed",
    fixes: [
      "Raise worker autoscale ceiling to 24",
      "Investigate slow consumer in account_id=ent_4421",
    ],
  },
];

const sampleMessages: { source: SourceKind; text: string; category: Category; sentiment: "neg" | "neu" | "pos" }[] = [
  { source: "chat", text: "Payment keeps failing at checkout, third try now 😡", category: "Payment", sentiment: "neg" },
  { source: "social", text: "@brand your site is down again, can't even log in", category: "Outage", sentiment: "neg" },
  { source: "review", text: "App crashes every time I try to upload a photo on my Pixel 8", category: "Bug", sentiment: "neg" },
  { source: "email", text: "Subject: Unauthorized charge on my card $0.50 — please investigate", category: "Fraud", sentiment: "neg" },
  { source: "social", text: "Onboarding for this app is way too long, gave up halfway", category: "PR", sentiment: "neg" },
  { source: "chat", text: "Hi, can't complete payment with Visa, says 3DS failed", category: "Payment", sentiment: "neg" },
  { source: "chat", text: "Webhook arriving 6 minutes late — is this expected?", category: "Outage", sentiment: "neu" },
  { source: "social", text: "Love the new dashboard update, super clean", category: "PR", sentiment: "pos" },
  { source: "review", text: "Five stars, customer support was incredibly fast", category: "PR", sentiment: "pos" },
  { source: "email", text: "Subject: API 503 in us-west-2, our integration is down", category: "Outage", sentiment: "neg" },
  { source: "chat", text: "Multiple small charges I didn't make appearing on statement", category: "Fraud", sentiment: "neg" },
  { source: "social", text: "Anyone else seeing checkout errors? It's been an hour", category: "Payment", sentiment: "neg" },
  { source: "review", text: "Crashes on Android 14, lost all my unsaved work", category: "Bug", sentiment: "neg" },
  { source: "chat", text: "Quick question — does the API support batch updates?", category: "Bug", sentiment: "neu" },
  { source: "social", text: "Service status page says all good but mine isn't loading", category: "Outage", sentiment: "neg" },
  { source: "email", text: "Subject: Refund request — payment failed three times", category: "Payment", sentiment: "neg" },
  { source: "chat", text: "Photo upload crashes the app on Samsung S24", category: "Bug", sentiment: "neg" },
  { source: "social", text: "Reading @devexplorer's thread, valid points honestly", category: "PR", sentiment: "neg" },
  { source: "review", text: "Suspicious login attempts on my account every day", category: "Fraud", sentiment: "neg" },
  { source: "chat", text: "Dashboard loading really slowly today, anyone else?", category: "Outage", sentiment: "neu" },
  { source: "email", text: "Subject: Cannot reset password, link keeps expiring", category: "Bug", sentiment: "neg" },
  { source: "social", text: "Great support team, fixed my issue in 5 min", category: "PR", sentiment: "pos" },
  { source: "chat", text: "Card declined but money was taken from my account", category: "Payment", sentiment: "neg" },
  { source: "review", text: "App is buggy after the latest update, please fix", category: "Bug", sentiment: "neg" },
  { source: "social", text: "Status page green but I'm getting 500 errors 🤔", category: "Outage", sentiment: "neg" },
  { source: "email", text: "Subject: Two-factor codes never arrive via SMS", category: "Bug", sentiment: "neg" },
  { source: "chat", text: "I keep getting logged out every few minutes", category: "Bug", sentiment: "neg" },
  { source: "social", text: "@brand please respond to the outage on twitter", category: "PR", sentiment: "neg" },
  { source: "review", text: "Decent app overall but checkout needs work", category: "Payment", sentiment: "neu" },
  { source: "chat", text: "Got charged twice for the same order #4421", category: "Payment", sentiment: "neg" },
];

export const seedFeed = sampleMessages;

export function generateFeedItem(idx: number) {
  const base = sampleMessages[idx % sampleMessages.length];
  return {
    id: `f-${Date.now()}-${idx}`,
    ...base,
    timestamp: new Date(),
  };
}

// 24-hour anomaly timeline data
export const timelineData = (() => {
  const rows: Array<Record<string, number | string>> = [];
  for (let h = 0; h < 24; h++) {
    const t = `${h.toString().padStart(2, "0")}:00`;
    // Spike around hour 18-20 for outage/payment
    const spike = h >= 18 && h <= 20;
    rows.push({
      time: t,
      Payment: Math.round(30 + Math.random() * 15 + (spike ? 90 + (h - 17) * 20 : 0)),
      Bug: Math.round(20 + Math.random() * 12 + (h >= 14 ? 30 : 0)),
      Fraud: Math.round(8 + Math.random() * 6 + (h >= 16 ? 18 : 0)),
      Outage: Math.round(10 + Math.random() * 8 + (spike ? 120 + (h - 17) * 35 : 0)),
      PR: Math.round(12 + Math.random() * 8 + (h >= 17 ? 60 : 0)),
    });
  }
  return rows;
})();

export const sources: { id: SourceKind; label: string; volume: number; lastSync: string; enabled: boolean }[] = [
  { id: "chat", label: "Support Chat", volume: 12842, lastSync: "12 sec ago", enabled: true },
  { id: "social", label: "Social Media", volume: 48211, lastSync: "8 sec ago", enabled: true },
  { id: "review", label: "App & Web Reviews", volume: 1421, lastSync: "1 min ago", enabled: true },
  { id: "email", label: "Email Inbox", volume: 3287, lastSync: "22 sec ago", enabled: true },
];
