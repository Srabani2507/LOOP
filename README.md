# LOOP — AI Customer Feedback Intelligence Platform

> **"Close the loop on customer feedback."**
> LOOP ingests multi-channel customer feedback, uses AI to classify and cluster it, surfaces what is trending, and answers plain-English questions about what customers actually want.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Local Setup](#local-setup)
6. [Environment Variables](#environment-variables)
7. [Database & Seed](#database--seed)
8. [Demo Credentials](#demo-credentials)
9. [Deployment](#deployment)
10. [Screenshots](#screenshots)

---

## Project Overview

LOOP is a corporate-grade web application built as part of the **Zidio Development Internship** (Project LOOP, Web Development Track). It helps product teams make sense of the customer feedback they receive every day — support tickets, app-store reviews, NPS surveys, and sales notes — by:

- **Auto-classifying** every feedback item with AI (sentiment, themes, feature area)
- **Clustering themes** and showing what's trending vs. the prior period
- **Answering plain-English questions** grounded exclusively in real feedback (no hallucinations)
- **Generating leadership-ready VoC reports** with one click

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | PostgreSQL (Neon / Prisma Postgres) |
| ORM | Prisma v7 (with PrismaPg driver adapter) |
| Auth | NextAuth (Auth.js) — credentials provider |
| AI | Groq SDK — `openai/gpt-oss-120b` (120B OSS model) |
| Charts | Recharts |
| Validation | Zod |
| Animations | Framer Motion |
| Deployment | Vercel + hosted PostgreSQL |

---

## Architecture

LOOP follows a standard **three-tier architecture**. The browser talks only to Next.js API route handlers; the API layer is the only thing that talks to the database and to the AI provider.

```
Browser (React / Next.js)
        │
        ▼  (fetch /api/*)
API Route Handlers (server-side)
  ├── auth check (NextAuth session)
  ├── RBAC check (role guard)
  ├── workspaceId scope on every query
  └── Prisma → PostgreSQL
        │
        └── AI calls (Groq SDK) — server-side only, key never exposed to browser
```

### Key security rules
- **Tenant isolation**: every single database query that touches feedback, themes, reports, or users is filtered by `workspaceId`. A user from Workspace A cannot read a single row belonging to Workspace B.
- **RBAC enforced server-side**: role checks happen in route handlers, not just the UI.
- **API key server-side only**: `GROQ_API_KEY` is never shipped to the browser.

### Directory structure

```
LOOP/
├── app/
│   ├── (auth)/          # Login, signup pages
│   ├── (dashboard)/     # Protected app pages (dashboard, inbox, trends, ask, reports, settings, members)
│   └── api/             # Route handlers
│       ├── auth/        # NextAuth
│       ├── feedback/    # CRUD, CSV upload, simulate channel, classify
│       ├── themes/      # Theme clustering + trends
│       ├── insights/    # Ask LOOP Q&A
│       ├── reports/     # VoC report generation
│       ├── dashboard/   # Stats + charts data
│       ├── users/       # Member management
│       └── workspaces/  # Workspace info
├── components/
│   ├── charts/          # VolumeChart, SentimentChart, ThemesChart
│   ├── ui/              # shadcn/ui primitives
│   ├── sidebar.tsx      # Animated navigation
│   ├── top-navbar.tsx   # Header with mobile menu
│   └── feedback-table.tsx
├── lib/
│   ├── ai.ts            # Groq calls: classify, answerQuestion, generateVoCReport
│   ├── search.ts        # Keyword retrieval for Ask LOOP
│   ├── auth.ts          # Session helpers
│   ├── rbac.ts          # requireAuth() guard
│   └── db.ts            # Prisma client singleton
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

---

## Features

### Core (C1–C5)
| Feature | Description |
|---|---|
| **C1 Auth & Workspaces** | Sign-up creates a User + Workspace; creator becomes ADMIN. Sessions persist across refresh. All data scoped to workspace. |
| **C2 RBAC** | Three roles: ADMIN, ANALYST, VIEWER. Enforced server-side. Admins manage members; Analysts ingest/manage feedback; Viewers are read-only. |
| **C3 Feedback Ingestion** | Single-entry form, CSV bulk upload (with success/failure summary), and 5 simulated channel sources. |
| **C4 Feedback Inbox** | Server-side paginated table. Filters: channel, sentiment, theme, status, date range. Full-text search. Status workflow: NEW → REVIEWED → ACTIONED. |
| **C5 Analytics Dashboard** | Volume-over-time chart, sentiment donut, top-themes bar chart. Stat cards for total, positive, negative, new this week, AI-processed, top theme. |

### AI Features (AI1–AI4)
| Feature | Description |
|---|---|
| **AI1 Auto-classification** | On ingestion, each item is sent to the AI and returned with: sentiment, sentimentScore, themes (up to 4), featureArea, rationale. Stored on the record. Manual "Re-classify" action available. |
| **AI2 Theme Clustering & Trends** | Similar feedback grouped into named themes with counts. Trends view shows theme volume over time and flags themes spiking vs. the previous period. Drill-down to underlying feedback. |
| **AI3 Ask LOOP (Grounded Q&A)** | Chat-style interface. Keywords retrieved from workspace feedback → passed to AI as context → AI answers only from that context, citing specific feedback IDs. No hallucinations. |
| **AI4 Voice-of-Customer Report** | One click generates a report for the last 30 days. Pre-computes stats in code (model cannot hallucinate numbers), then asks AI to write the narrative. Reports saved, viewable, shareable (copy link), and exportable (Print / Save as PDF). |

---

## Local Setup

### Prerequisites
- Node.js 18 LTS or newer
- pnpm (or npm/yarn)
- A PostgreSQL database (Neon free tier or Supabase)
- A Groq API key (free tier available at [console.groq.com](https://console.groq.com))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Srabani2507/LOOP.git
cd LOOP

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your actual values (see Environment Variables below)

# 4. Run database migrations
npx prisma migrate deploy

# 5. Seed the database with demo data
npx tsx prisma/seed.ts

# 6. Start the development server
pnpm dev
# App is now running at http://localhost:3000
```

---

## Environment Variables

Create a `.env` file at the project root (never commit this file):

```env
# Database — Neon / Supabase PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# NextAuth — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Groq AI — get your key at https://console.groq.com
GROQ_API_KEY="gsk_..."
```

See `.env.example` for a documented template (no real secrets committed).

---

## Database & Seed

### Migrations

```bash
# Apply all migrations to the database
npx prisma migrate deploy

# (Dev only) Create a new migration after schema changes
npx prisma migrate dev --name your-migration-name
```

### Seed

```bash
# Seeds 1 workspace, 5 users, 20 themes, 200 feedback items, 5 reports
npx tsx prisma/seed.ts
```

The seed script creates realistic data distributed over the last 180 days so all charts are populated.

---

## Demo Credentials

The seed script creates the following users in the **"Demo Workspace"**. All share the same password.

| Role | Email | Password |
|---|---|---|
| **ADMIN** | `srabanikar05@gmail.com` | `password123` |
| **ANALYST** | `rupsarkar@gmail.com` | `password123` |
| **ANALYST** | `priyapatel@gmail.com` | `password123` |
| **VIEWER** | `vikramsingh@gmail.com` | `password123` |
| **VIEWER** | `nehakapoor@gmail.com` | `password123` |

> ⚠️ These are demo credentials only. Do not reuse these passwords for real accounts.

---

## Deployment

The project is deployed on **Vercel** with a hosted PostgreSQL database.

```bash
# Deploy to Vercel (one-command after linking your project)
vercel

# Set environment variables in Vercel project settings:
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, GROQ_API_KEY
```

After deploying, run the seed script against the production database once to populate demo data.

---

## Screenshots

> The app features a dark/light mode with a purple-indigo primary palette.

| Page | Description |
|---|---|
| Dashboard | Real-time stats cards + volume, sentiment, and theme charts |
| Inbox | Paginated feedback table with filters, search, inline status workflow |
| Trends | Theme clustering with spike detection and drill-down |
| Ask LOOP | Chat-style AI Q&A grounded in real feedback |
| Reports | AI-generated VoC reports with PDF export and shareable links |

---

*Built with ❤️ for the Zidio Development Internship · Project LOOP v1.0*