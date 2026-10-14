# One Herd, One Truth — Frontend

React 18 SPA for the One Herd, One Truth Big Data POC. Displays governed metrics, data quality scores, entity resolution results, pipeline benchmarks, and a governed AI Q&A interface backed by the FastAPI backend (or mock data in development).

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18 or later |
| npm | 9 or later |

## Quick Start

```bash
# 1. Enter the frontend directory
cd "d:\Byteridge\BigData AI POC\frontend"

# 2. Copy the example env file (required before npm install)
copy .env.example .env

# 3. Install dependencies
npm install

# 4. Start the dev server
npm run dev

# 5. Open in browser
# http://localhost:5173
```

## Route Table

The app has 13 screens. Dashboard (Screen 0) is the landing page and an intentional addition beyond the original 12-screen spec; the original 12 spec screens are numbered 1–12 below.

| Path | Screen | Description | API Endpoints Used |
|------|--------|-------------|-------------------|
| `/dashboard` | Screen 0 — Dashboard (Overview) | Hierarchical Country → Region → Farm filter; KPI strip, pipeline flow diagram, production and DQ charts | `GET /api/v1/metrics`, `GET /api/v1/dq/scorecard` |
| `/compare` | Screen 1 — Source Compare | Side-by-side metric comparison across three sources with disagreement highlighting | `GET /api/v1/compare/raw` |
| `/landscape` | Screen 2 — Data Landscape | Source schema cards, field-level diffs, entity volume bar charts | `GET /api/v1/landscape` |
| `/quality` | Screen 3 — Data Quality | DQ scorecard MetricCards and filterable issue log with row drawer | `GET /api/v1/dq/scorecard`, `GET /api/v1/dq/issues` |
| `/resolution` | Screen 4 — Entity Resolution | Match review queue, field-level diff panel, Merge / Split / Mark Unsure actions | `GET /api/v1/resolution/queue`, `POST /api/v1/resolution/decide` |
| `/metrics` | Screen 5 — Metric Catalog | Certified metric catalog with search, status filter, and impact samples | `GET /api/v1/metrics`, `GET /api/v1/metrics/{id}/impact` |
| `/pipeline` | Screen 6 — Pipeline & Scale | Pipeline diagram, run history table, T0–T3 benchmark tier table | `GET /api/v1/pipeline/runs`, `GET /api/v1/benchmarks` |
| `/lineage` | Screen 7 — Data Lineage | SVG DAG from sources through to metric layer; entity lineage search | `GET /api/v1/lineage/metric`, `GET /api/v1/lineage/entity` |
| `/stream` | Screen 8 — Live Stream | Replay-mode event log with polling every 2 s; inject bad batch | `GET /api/v1/stream/stats`, `POST /api/v1/stream/inject` |
| `/business` | Screen 9 — Business Payoff | Feed cost scatter chart, before/after resolution toggle, farm ranking drawer | `GET /api/v1/business/feed-cost` |
| `/ask` | Screen 10 — Ask | Governed AI Q&A using certified metrics only; scripted mock responses | `POST /api/v1/ask` |
| `/onboard` | Screen 11 — Onboard | 5-step schema mapping wizard — ⚠ PROTOTYPE, not autonomous | `POST /api/v1/onboard/propose`, `POST /api/v1/onboard/approve` |
| `/results` | Screen 12 — POC Results | Measured vs target benchmark table, QA evaluation, limitations, next steps | `GET /api/v1/results` |

## Mock vs Live Mode

| Mode | How to activate | Behaviour |
|------|----------------|-----------|
| **Mock mode** (default) | `VITE_MOCK_MODE=true` in `.env` | All API calls return pre-scripted in-memory data. No backend required. |
| **Live mode** | `VITE_MOCK_MODE=false` in `.env` | API calls go to the FastAPI backend at `VITE_API_BASE_URL`. Backend must be running on `:8000`. |

To switch to live mode:

```env
# .env
VITE_MOCK_MODE=false
VITE_API_BASE_URL=http://localhost:8000
```

Then start the FastAPI backend (`cd one_herd_truth && uvicorn main:app --reload`) before running `npm run dev`.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_MOCK_MODE` | `true` | Set to `true` to use in-memory mock data. Set to `false` to call the real FastAPI backend. |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Base URL of the FastAPI backend. Only used when `VITE_MOCK_MODE=false`. |
| `VITE_APP_NAME` | `One Herd, One Truth` | Application name shown in the browser title and UI. |

## Build & Test Commands

```bash
# Build for production (type-checks first)
npm run build

# Run all Vitest scaffold tests (single pass)
npm run test

# Run tests in watch mode (development)
npm run test:watch

# Type-check only (no emit)
npm run lint
```

## Tech Stack

| Concern | Library | Version |
|---------|---------|---------|
| UI framework | React | 18.3.1 |
| Language | TypeScript | 5.5.3 |
| Build tool | Vite | 5.4.2 |
| Routing | React Router | v6.26.2 |
| Server state | TanStack Query | v5.59.0 |
| Global state | Zustand | 4.5.5 |
| HTTP client | Axios | 1.7.7 |
| Styling | Tailwind CSS | v3.4.13 |
| Component primitives | Radix UI (via shadcn/ui) | various |
| Charts | Recharts | 2.12.7 |
| Icons | Lucide React | 0.441.0 |
| Schema validation | Zod | 3.23.8 |
| Test runner | Vitest | 2.1.1 |
| Test utilities | @testing-library/react | 16.0.1 |

## Design System

### Colours

| Role | Value | Usage |
|------|-------|-------|
| Primary (forest green) | `#1a4d2e` | Buttons, active states, certified metrics |
| Muted background | `#f5f4f0` | Card backgrounds, sidebar |
| Amber | amber-\* Tailwind | Warnings, draft states, PROTOTYPE banners |
| Red | red-\* Tailwind | Errors, quarantine, conflicts |
| Emerald | emerald-\* Tailwind | Certified metrics, quality passes |
| Blue | blue-\* Tailwind | Info, items requiring review |

### Typography

- Body / UI: Inter or `system-ui`
- IDs and technical identifiers: `JetBrains Mono` or `Menlo` (`font-mono`)

### Status Badge Rule

**Never communicate status by colour alone** — always pair with an icon or text label. Use `<StatusBadge status="certified" />` which renders both a check icon and the text "Certified".

### Status Values

| Status | Colour | Icon | Used for |
|--------|--------|------|---------|
| `certified` | Emerald | ✓ CheckCircle | Production-approved metrics |
| `in_review` | Amber | ⏱ Clock | Metrics pending review |
| `draft` | Grey | ○ Circle | Work-in-progress metrics |
