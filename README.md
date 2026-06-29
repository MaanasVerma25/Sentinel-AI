# Sentinel AI

Sentinel AI is a real-time crisis detection and management platform designed for operations teams. It ingests signals from various sources (chat, social, reviews, email), uses AI to flag anomalies, clusters them into incidents, and provides actionable insights.

## Features

- **Real-Time Detection**: Flag anomalies within seconds across all integrated sources.
- **Intelligent Clustering**: Automatically group related signals into coherent incidents.
- **Severity Scoring**: Prioritize incidents based on volume, sentiment velocity, and spread rate.
- **Live Feed**: A streaming ticker of every incoming signal for real-time monitoring.
- **Smart Alerting**: ML-driven alerts via Slack, PagerDuty, and more.
- **Multi-Source Correlation**: Connect dots across different channels to see the full story.

## Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/router/v1/docs/guide/start/introduction) (Vite + TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database/Auth**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)
- **Package Manager**: [Bun](https://bun.sh/)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) installed on your machine.

### Installation

1. Clone the repository.
2. Install dependencies:
   ```bash
   bun install
   ```
3. Set up your environment variables (copy .env.example to .env).
4. Start the development server:
   ```bash
   npm run dev
   ```

## Lovable Integration

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history (force pushing, rebasing, or amending/squashing commits) to prevent loss of project history.

## Development

- `npm run dev`: Start the development server.
- `npm run build`: Build for production.
- `npm run lint`: Run ESLint.
- `npm run format`: Format code with Prettier.

---

Built with Sentinel AI. Stay ahead of every crisis.
