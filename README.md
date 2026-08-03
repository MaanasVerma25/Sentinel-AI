# Sentinel AI 🛡️

**Sentinel AI** is a real-time crisis detection, telemetry monitoring, and incident management platform built for modern engineering and operations teams. It ingests public signals and brand mentions across news outlets, Reddit, social media, and customer channels, automatically classifying anomalies, clustering related telemetry into incidents, and calculating severity metrics in real time.

🔗 **Live Application**: [https://sentinel-ai-phi-five.vercel.app/home](https://sentinel-ai-phi-five.vercel.app/home)

---

## 🚀 Key Features

### 📡 Multi-Source Signal Ingestion Pipeline
- **Reddit API Integration**: Real-time monitoring of corporate mentions, subreddit discussions, and user feedback.
- **News RSS Ingestion**: Live Google News RSS parser scanning public news outlets for brand telemetry.
- **Deduplication Engine**: Hashes incoming text content (`text_hash`) and deduplicates signals against [Supabase](https://supabase.com/) storage to ensure clean metric calculations.

### 🧠 Intelligent Incident Clustering & Classification
- **Automated Categorization**: Heuristic signal classification into 5 operational categories:
  - 🚨 **Outage**: System downtime, gateway failures (502/503/504), crashes, and service disruptions.
  - 💳 **Payment**: Billing errors, Stripe checkout glitches, failed transactions, and subscription issues.
  - 🐛 **Bug**: Product defects, software glitches, exceptions, and functional regressions.
  - 🔒 **Fraud**: Security leaks, scam alerts, compromised accounts, and phishing threats.
  - 📢 **PR**: Brand reputation changes, viral sentiment shifts, and media coverage.
- **Sentiment & Severity Scoring**: Classifies signal sentiment (*critical*, *negative*, *neutral*, *positive*) and computes overall incident severity (*Critical*, *Warning*, *Watching*).
- **Incident Metrics & Sparklines**: Computes baseline deviations, volume growth percentages (% increase), sparklines, impacted user estimates, root causes, and recommended triage steps.

### 📊 Operations Dashboard & Management Tools
- **Executive Dashboard (`/dashboard`)**: High-level telemetry metrics, active crisis clusters, live alert tickers, anomaly charts, and quick-triage controls.
- **Incidents Hub (`/incidents`)**: Filterable crisis management overview with root-cause breakdowns, affected user estimates, and remediation workflows.
- **Live Signal Stream (`/live-feed`)**: Streaming feed of raw incoming mentions with sentiment badges, channel sources, and direct links to original posts.
- **Analytics & Reports (`/reports`)**: Incident trends, sentiment distribution, response metrics, and exportable crisis reports.
- **Ingestion Sources Manager (`/sources`)**: Monitor signal pipeline status, trigger manual ingestion runs, and inspect channel health for Reddit and News feeds.
- **Company Setup & Onboarding (`/setup`, `/onboarding`)**: Interactive wizard for setting up company profiles, brand aliases, baseline metrics, and notification channels.
- **Settings & Integrations (`/settings`)**: Threshold configuration, notification webhooks (Slack, PagerDuty), and workspace management.

---

## 🛠️ Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/guide/start/introduction) (React 19 + TanStack Router + Vite)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)
- **State & Data Fetching**: [@tanstack/react-query](https://tanstack.com/query)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (`@tailwindcss/vite`)
- **UI Components & Motion**: Radix UI Primitives, shadcn/ui, Framer Motion, Spline 3D (`@splinetool/react-spline`), Sonner toasts, Lucide React icons
- **Charts & Visualizations**: Recharts
- **Signal Parsers**: RSS Parser (`rss-parser`), Fetch API
- **Package Manager**: [Bun](https://bun.sh/) / npm

---

## 📂 Project Structure

```
Sentinel-AI/
├── src/
│   ├── components/         # Reusable UI components & 3D Spline scenes
│   ├── hooks/              # Custom React hooks
│   ├── lib/
│   │   ├── clustering.ts   # Incident clustering & severity heuristics
│   │   ├── ingest/         # Ingestion engine (Reddit, Google News RSS)
│   │   ├── mock-data.ts    # Telemetry definitions & fallback data
│   │   └── supabase.ts     # Supabase client setup
│   ├── routes/             # TanStack Router page components
│   │   ├── _app.dashboard.tsx
│   │   ├── _app.incidents.tsx
│   │   ├── _app.live-feed.tsx
│   │   ├── _app.reports.tsx
│   │   ├── _app.sources.tsx
│   │   ├── _app.settings.tsx
│   │   ├── home.tsx
│   │   └── setup.tsx
│   ├── styles.css          # Tailwind CSS configuration & base styles
│   └── types/              # TypeScript interface definitions
├── supabase/               # SQL migrations & schema definitions
├── package.json
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- [Bun](https://bun.sh/) or Node.js (v18+) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/MaanasVerma25/Sentinel-AI.git
   cd Sentinel-AI
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables by creating a `.env` file (refer to `.env.example`):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the local development server:
   ```bash
   npm run dev
   ```

---

## 📜 Available Scripts

- `npm run dev`: Start the Vite development server.
- `npm run build`: Build the production application.
- `npm run lint`: Run ESLint checks across the project.
- `npm run format`: Format project files using Prettier.

---

Sentinel AI — Stay ahead of every crisis.
