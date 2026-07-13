import { createFileRoute, Link } from "@tanstack/react-router";
import { Footer } from "@/components/footer";
import { Radar, ArrowLeft, Shield, Eye, Lock, Database, UserCheck, Mail } from "lucide-react";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-[#c4cad3] font-sans antialiased">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 border-b border-[#343940] bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link
            to="/home"
            className="flex items-center gap-2 text-sm text-[#6C7584] hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Radar className="h-4 w-4 text-[#298DFF]" />
            <span className="text-sm font-bold text-white tracking-wide">Sentinel AI</span>
          </div>
        </div>
      </nav>

      {/* ── Content ── */}
      <main className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#298DFF]/30 bg-[#298DFF]/10 px-3 py-1 text-xs font-mono uppercase tracking-wider text-[#298DFF] mb-6">
            <Shield className="h-3 w-3" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-[#6C7584] text-sm font-mono">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          <Section
            icon={Eye}
            title="1. Information We Collect"
            content={[
              "Sentinel AI collects information necessary to provide real-time crisis detection and monitoring services. This includes:",
              "• **Account Information**: When you create an account, we collect your name, email address, organization name, and authentication credentials.",
              "• **Data Source Credentials**: API keys and access tokens for the platforms you connect (e.g., support chat systems, social media accounts, email services). These are encrypted at rest using AES-256 encryption.",
              "• **Monitored Content**: Text content from your connected data sources that is processed by our AI models for crisis detection. This data is processed in real-time and retained based on your configured retention policy.",
              "• **Usage Data**: Feature usage patterns, dashboard interactions, alert configurations, and system performance metrics to improve our services.",
              "• **Device & Browser Information**: IP address, browser type, operating system, and device identifiers for security and service optimization purposes.",
            ]}
          />

          <Section
            icon={Database}
            title="2. How We Use Your Information"
            content={[
              "We use the collected information for the following purposes:",
              "• **Crisis Detection**: Processing connected data source content through our AI models to identify, classify, and score potential crises in real-time.",
              "• **Alert Delivery**: Sending notifications through your configured channels (Slack, email, webhooks) when crisis signals are detected.",
              "• **Service Improvement**: Analyzing anonymized usage patterns to improve detection accuracy, reduce false positives, and optimize system performance.",
              "• **Security**: Monitoring for unauthorized access, protecting against abuse, and maintaining audit logs for compliance.",
              "• **Communication**: Sending service updates, security notices, and (with your consent) product announcements.",
            ]}
          />

          <Section
            icon={Lock}
            title="3. Data Security"
            content={[
              "Protecting your data is fundamental to our service:",
              "• All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption.",
              "• API keys and third-party credentials are stored in an isolated, encrypted vault with access controls.",
              "• We conduct regular security audits and penetration testing.",
              "• Access to production data is restricted to authorized personnel with multi-factor authentication.",
              "• Our infrastructure is hosted on SOC 2 Type II compliant cloud providers.",
              "• We implement rate limiting, DDoS protection, and anomaly detection on all endpoints.",
            ]}
          />

          <Section
            icon={UserCheck}
            title="4. Data Sharing & Third Parties"
            content={[
              "We do not sell your personal information. We share data only in the following circumstances:",
              "• **Service Providers**: With trusted infrastructure and AI model providers who process data on our behalf under strict data processing agreements.",
              "• **Legal Requirements**: When required by law, regulation, or valid legal process.",
              "• **Business Transfers**: In connection with a merger, acquisition, or sale of assets, with prior notice to affected users.",
              "• **With Your Consent**: When you explicitly authorize sharing with a specific third party.",
            ]}
          />

          <Section
            icon={Shield}
            title="5. Data Retention"
            content={[
              "We retain your data based on the following principles:",
              "• **Monitored Content**: Retained for the duration specified in your plan's data retention settings (default: 30 days), then automatically purged.",
              "• **Account Information**: Retained for the duration of your account and up to 30 days after deletion.",
              "• **Audit Logs**: Retained for 90 days for security and compliance purposes.",
              "• **Aggregated Analytics**: De-identified, aggregated data may be retained indefinitely for service improvement.",
              "You may request data deletion at any time through your account settings or by contacting us.",
            ]}
          />

          <Section
            icon={Eye}
            title="6. Your Rights"
            content={[
              "Depending on your jurisdiction, you may have the following rights:",
              "• **Access**: Request a copy of the personal data we hold about you.",
              "• **Correction**: Request correction of inaccurate or incomplete data.",
              "• **Deletion**: Request deletion of your personal data, subject to legal retention requirements.",
              "• **Portability**: Receive your data in a structured, machine-readable format.",
              "• **Objection**: Object to processing of your data for specific purposes.",
              "• **Restriction**: Request restriction of processing in certain circumstances.",
              "To exercise these rights, contact us at privacy@sentinel-ai.dev.",
            ]}
          />

          <Section
            icon={Database}
            title="7. Cookies & Tracking"
            content={[
              "We use minimal, essential cookies:",
              "• **Authentication Cookies**: To maintain your login session securely.",
              "• **Preference Cookies**: To remember your dashboard layout and notification settings.",
              "• We do not use third-party advertising trackers or cross-site tracking technologies.",
              "• Analytics data is collected using privacy-respecting, first-party tooling.",
            ]}
          />

          <Section
            icon={Mail}
            title="8. Contact & Updates"
            content={[
              "For questions about this privacy policy or our data practices:",
              "• Email: privacy@sentinel-ai.dev",
              "• We will notify you of material changes to this policy via email and an in-app notice at least 14 days before the changes take effect.",
              "• Continued use of Sentinel AI after changes constitutes acceptance of the updated policy.",
            ]}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ── Reusable section component ─────────────────────────────────────────────── */
function Section({
  icon: Icon,
  title,
  content,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  content: string[];
}) {
  return (
    <section className="group">
      <div className="flex items-start gap-4 mb-4">
        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#343940] bg-[#0d1117] group-hover:border-[#298DFF]/40 transition-colors">
          <Icon className="h-4 w-4 text-[#298DFF]" />
        </div>
        <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
      </div>
      <div className="ml-12 space-y-3">
        {content.map((paragraph, i) => (
          <p
            key={i}
            className="text-sm leading-relaxed text-[#9CA3AF]"
            dangerouslySetInnerHTML={{
              __html: paragraph.replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="text-[#c4cad3] font-medium">$1</strong>'
              ),
            }}
          />
        ))}
      </div>
    </section>
  );
}
