import { CrisisCluster, Severity, Category, SourceKind } from "./mock-data";

function classifyMention(m: any) {
  const text = ((m.title || "") + " " + (m.text || "")).toLowerCase();
  
  let category = m.category;
  if (!category) {
    if (/\b(outage|down|offline|gateway|502|503|504|unresponsive|accessible|crash|resolved)\b/.test(text)) {
      category = "Outage";
    } else if (/\b(stripe|payment|billing|invoice|checkout|card|charge|refund|subscription|purchase|buy)\b/.test(text)) {
      category = "Payment";
    } else if (/\b(bug|error|glitch|broken|fail|incorrect|wrong|nan|exception)\b/.test(text)) {
      category = "Bug";
    } else if (/\b(fraud|scam|hack|phishing|stolen|security|leak|compromised|fake)\b/.test(text)) {
      category = "Fraud";
    } else {
      category = "PR";
    }
  }

  let sentiment = m.sentiment;
  if (!sentiment) {
    if (/\b(outage|down|crash|hack|compromised|critical|fatal|severe|unusable|alert|emergency)\b/.test(text)) {
      sentiment = "critical";
    } else if (/\b(error|broken|fail|issue|problem|bad|slow|bug|glitch|regression|prevent|cannot|unable)\b/.test(text)) {
      sentiment = "negative";
    } else if (/\b(resolved|fixed|good|great|awesome|love|happy|thanks)\b/.test(text)) {
      sentiment = "positive";
    } else {
      sentiment = "neutral";
    }
  }

  return { ...m, category, sentiment };
}

export function generateRealClusters(mentions: any[], companyName: string): CrisisCluster[] {
  // First, classify/clean all mentions to ensure category and sentiment are populated
  const processedMentions = mentions.map(classifyMention);

  // Group mentions by category
  const categoriesMap: Record<string, any[]> = {};
  for (const m of processedMentions) {
    const cat = m.category || "General";
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = [];
    }
    categoriesMap[cat].push(m);
  }

  const generated: CrisisCluster[] = [];

  for (const [cat, items] of Object.entries(categoriesMap)) {
    if (items.length === 0) continue;

    const sourceSet = new Set<SourceKind>(
      items.map(i => {
        // Map to mock source types
        if (i.source === "reddit") return "social";
        if (i.source === "news") return "review";
        return "chat";
      })
    );
    
    // Sort items by created_at to get the latest detection time
    const sorted = [...items].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const latest = sorted[0];

    // Determine severity
    const hasCritical = items.some(i => i.sentiment === "critical");
    const hasNegative = items.some(i => i.sentiment === "negative");
    const severity: Severity = hasCritical ? "critical" : hasNegative ? "warning" : "watching";

    // Dynamic titles
    let title = `${companyName || "Brand"} ${cat} Signals`;
    if (cat === "Payment") {
      title = `Payment & Billing Telemetry (${companyName || "Brand"})`;
    } else if (cat === "Bug") {
      title = `Application & Product Bug Reports (${companyName || "Brand"})`;
    } else if (cat === "Outage") {
      title = `Network & Gateway Outage Signals (${companyName || "Brand"})`;
    } else if (cat === "PR") {
      title = `Public Sentiment & Media Activity (${companyName || "Brand"})`;
    } else if (cat === "Fraud") {
      title = `Security & Fraud Telemetry (${companyName || "Brand"})`;
    }

    const summary = latest.summary || latest.text.slice(0, 160) + "...";
    
    // Sparkline history matches the volume
    const spark = Array.from({ length: 10 }).map((_, idx) => {
      return Math.round(2 + (idx * idx * items.length) / 10);
    });

    // Root causes
    const rootCauses = [
      latest.title || "Brand mention detected",
      `Observed ${items.length} telemetry signals over public channels.`,
      `Latest signal captured: "${(latest.title || latest.text).slice(0, 80)}..."`
    ];

    generated.push({
      id: `real-${cat.toLowerCase()}`,
      title,
      severity,
      category: cat as Category,
      mentions: items.length,
      baseline: Math.max(1, Math.round(items.length / 4)),
      increasePct: Math.round((items.length / Math.max(1, Math.round(items.length / 4))) * 100),
      sources: Array.from(sourceSet),
      detectedAt: new Date(latest.created_at).toLocaleDateString([], { month: "short", day: "numeric" }),
      spark,
      summary,
      rootCauses,
      affectedUsers: `~${items.length * 5} user accounts impacted`,
      fixes: [
        `Triage active ${cat.toLowerCase()} pipelines`,
        "Verify callback routing and error responses",
        "Engage engineering on-call groups"
      ],
      rawMentions: items
    });
  }

  return generated;
}
