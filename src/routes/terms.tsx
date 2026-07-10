import { createFileRoute, Link } from "@tanstack/react-router";
import { Radar, ArrowLeft, FileText, Scale, AlertTriangle, Server, Ban, CreditCard, Gavel, RefreshCw } from "lucide-react";

export const Route = createFileRoute("/terms")({
  component: TermsPage,
});

function TermsPage() {
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
            <FileText className="h-3 w-3" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-[#6C7584] text-sm font-mono">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-12">
          <Section
            icon={Scale}
            title="1. Acceptance of Terms"
            content={[
              "By accessing or using Sentinel AI (\"the Service\"), you agree to be bound by these Terms of Service (\"Terms\"). If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms.",
              "If you do not agree to these Terms, you must not access or use the Service. We reserve the right to modify these Terms at any time, and continued use constitutes acceptance of the modified Terms.",
            ]}
          />

          <Section
            icon={FileText}
            title="2. Description of Service"
            content={[
              "Sentinel AI is a real-time AI-powered crisis detection platform that monitors connected data sources — including support chats, social media, reviews, and email — to identify, classify, and alert you to emerging crises.",
              "The Service includes:",
              "• AI-powered sentiment analysis and crisis severity scoring.",
              "• Real-time monitoring dashboard with live feed and analytics.",
              "• Multi-channel alert delivery (Slack, email, webhooks).",
              "• Incident management and reporting tools.",
              "• Data source integrations and API access.",
              "We reserve the right to modify, suspend, or discontinue any feature of the Service with reasonable notice.",
            ]}
          />

          <Section
            icon={Server}
            title="3. Account & Access"
            content={[
              "To use Sentinel AI, you must create an account and provide accurate, complete information. You are responsible for:",
              "• Maintaining the confidentiality of your account credentials and API keys.",
              "• All activities that occur under your account.",
              "• Notifying us immediately of any unauthorized access or security breach.",
              "• Ensuring that connected data source credentials are valid and that you have authorization to monitor the content from those sources.",
              "We reserve the right to suspend or terminate accounts that violate these Terms or pose a security risk.",
            ]}
          />

          <Section
            icon={Ban}
            title="4. Acceptable Use"
            content={[
              "You agree not to use Sentinel AI to:",
              "• Monitor content you do not have legal authorization to access.",
              "• Harass, stalk, or intimidate individuals identified through crisis detection.",
              "• Circumvent rate limits, access controls, or other technical restrictions.",
              "• Reverse-engineer, decompile, or attempt to extract source code from the Service.",
              "• Resell, sublicense, or redistribute access to the Service without written authorization.",
              "• Transmit malware, exploit vulnerabilities, or interfere with the Service's infrastructure.",
              "• Use the Service in any manner that violates applicable laws or regulations.",
              "Violation of these terms may result in immediate suspension or termination of your account.",
            ]}
          />

          <Section
            icon={AlertTriangle}
            title="5. Data & Content Ownership"
            content={[
              "• **Your Data**: You retain all rights to the data you provide and the content from your connected data sources. You grant Sentinel AI a limited license to process this data solely for the purpose of providing the Service.",
              "• **AI Outputs**: Crisis scores, classifications, and alerts generated by our AI models are provided as part of the Service. These outputs are tools to assist human decision-making and should not be the sole basis for critical actions.",
              "• **Our IP**: The Service, including its AI models, algorithms, interface, and documentation, is owned by Sentinel AI and protected by intellectual property laws.",
              "• **Feedback**: Any suggestions or feedback you provide about the Service may be used by us without obligation to you.",
            ]}
          />

          <Section
            icon={AlertTriangle}
            title="6. Disclaimers & Limitation of Liability"
            content={[
              "THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED.",
              "• **No Guarantee of Detection**: Sentinel AI uses AI models that may produce false positives or miss genuine crises. The Service is a detection aid, not a replacement for human judgment and crisis response teams.",
              "• **Third-Party Integrations**: We are not responsible for outages, data loss, or issues caused by third-party platforms you connect to the Service.",
              "• **Limitation**: To the maximum extent permitted by law, Sentinel AI's total liability for any claims arising from or related to the Service shall not exceed the fees you paid in the 12 months preceding the claim.",
              "• **Exclusion**: We shall not be liable for indirect, incidental, special, consequential, or punitive damages, including loss of data, revenue, or business opportunities.",
            ]}
          />

          <Section
            icon={CreditCard}
            title="7. Billing & Subscription"
            content={[
              "• Paid plans are billed in advance on a monthly or annual basis as selected during subscription.",
              "• You authorize us to charge the payment method on file for all applicable fees.",
              "• Prices may change with 30 days' prior notice. Price changes apply at the next billing cycle.",
              "• You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial periods.",
              "• We reserve the right to suspend the Service for overdue accounts after a 7-day grace period.",
            ]}
          />

          <Section
            icon={Gavel}
            title="8. Indemnification"
            content={[
              "You agree to indemnify and hold harmless Sentinel AI, its affiliates, officers, and employees from any claims, liabilities, damages, losses, and expenses (including reasonable legal fees) arising from:",
              "• Your use of the Service.",
              "• Your violation of these Terms.",
              "• Your violation of any third-party rights, including intellectual property or privacy rights.",
              "• Content monitored through your connected data sources.",
            ]}
          />

          <Section
            icon={RefreshCw}
            title="9. Termination"
            content={[
              "Either party may terminate this agreement:",
              "• **By You**: You may close your account at any time through account settings. Your data will be deleted within 30 days of account closure.",
              "• **By Us**: We may suspend or terminate your access immediately if you breach these Terms, or with 30 days' notice for any other reason.",
              "• **Effect**: Upon termination, your right to use the Service ceases immediately. Sections related to IP, liability, and indemnification survive termination.",
              "• **Data Export**: You may export your data before account closure. We will provide reasonable assistance for data portability requests.",
            ]}
          />

          <Section
            icon={Scale}
            title="10. Governing Law & Disputes"
            content={[
              "• These Terms are governed by and construed in accordance with applicable laws.",
              "• Any disputes arising from these Terms or the Service shall first be attempted to be resolved through good-faith negotiation.",
              "• If negotiation fails, disputes shall be resolved through binding arbitration in accordance with applicable arbitration rules.",
              "• Nothing in these Terms prevents either party from seeking injunctive relief in a court of competent jurisdiction for the protection of intellectual property rights.",
              "For questions about these Terms, contact us at legal@sentinel-ai.dev.",
            ]}
          />
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#343940] py-10 bg-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 text-[10px] font-mono uppercase tracking-wider text-[#6C7584] md:flex-row">
          <div className="flex items-center gap-2.5">
            <Radar className="h-4 w-4 text-[#298DFF]" />
            <span className="font-bold text-white">Sentinel AI</span>
            <span>· Real-time crisis detection</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="text-[#343940]">|</span>
            <Link to="/terms" className="text-[#298DFF] hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
          <span>© {new Date().getFullYear()} Sentinel AI. All rights reserved.</span>
        </div>
      </footer>
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
