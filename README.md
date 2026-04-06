# CEC Meeting Visualizer

> **IDLC Finance PLC — Credit Evaluation Committee**
> Interactive proposal management platform for CEC meetings.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/RRhythm003/cec-visualizer)

**Live:** [cec-visualizer.vercel.app](https://cec-visualizer.vercel.app)

---

## Overview

The CEC Meeting Visualizer transforms IDLC's Credit Evaluation Committee workflow from 40+ page PDFs into a fast, filterable, division-first interactive dashboard — targeting 80% pre-read completion (up from 40%) and under 15 seconds to locate any proposal.

## Demo Accounts (UAT)

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** (CEC Secretary) | `admin@cec-visualizer.com` | `Admin@CEC2025` | Full access — upload PDFs, record resolutions, lock meetings, export |
| **Approver** (CEC Member) | `approver@cec-visualizer.com` | `Approver@CEC2025` | View all proposals, all divisions, detail panels |
| **Proposer** (RM / Credit Officer) | `proposer@cec-visualizer.com` | `Proposer@CEC2025` | Own division proposals, resolution tracking |

## Features

### Core
- **Dashboard** — 25-proposal CEC meeting view with division/category sidebar, stats row, and card grid
- **7 Proposal Templates** — Disbursement, Settlement, Call-Up, NOC, Pricing Change, Security Change, Write-Off
- **Detail Panel** — slide-in drawer with full financials, risk indicators, resolution form
- **Advanced Filters** — Division · Category · Resolution · IRG Grade · CIB Status · Exposure range · Free-text search
- **Sort** — Exposure (High/Low), Waiver Amount, IRG Risk
- **Dark Mode** — full CSS-variable dark theme toggle

### Live Meeting Room
- **Multi-participant virtual session** — real-time presence with role-colored avatars
- **Proposal navigator** — sequential presentation with focus indicator
- **Quick resolution recording** — Admin sets Approved / Board / Deferred / Declined with notes
- **Live timer** — session elapsed time display
- **Lock meeting** — post-finalization read-only mode

### Meetings Tab
- **Full history** — year-grouped archive of all CEC meetings
- **Keyword search** — across meeting codes, client names, AG codes, resolution notes
- **Auto-archive** — previous year meetings auto-archived at start of new year
- **Match highlighting** — search results show matching proposals within each meeting

### Export
- **PDF Minutes** — formatted CEC-style meeting minutes with all proposals + resolutions
- **XLSX Export** — flat table for portfolio analysis in Excel

### Admin
- **PDF Upload / Parse** — folder path input or file picker with simulated extraction
- **Inline resolution editing** — Admin can update any proposal's resolution + notes
- **Audit trail** — all edits timestamped

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS (DM Sans / DM Serif Display / DM Mono) |
| State | React Context + Zustand |
| Export | jsPDF + jspdf-autotable + xlsx |
| Icons | Lucide React |
| Backend (optional) | Supabase (PostgreSQL + Realtime + Auth) |
| Hosting | Vercel |

## Getting Started

```bash
git clone https://github.com/RRhythm003/cec-visualizer
cd cec-visualizer
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with a demo account.

**The app works fully without any backend configuration.** Demo data is seeded client-side based on the reference CEC meeting CEC250921-0068 (25 proposals).

## Supabase (Production Backend)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Copy `.env.example` → `.env.local` and fill in your Supabase URL + anon key
4. Enable auto-archive via `pg_cron` (see schema.sql comment)

## Color System

| Token | Value | Usage |
|-------|-------|-------|
| `--red` | `#E8202A` | IDLC brand, CTAs, Admin role |
| Corporate Blue | `#1D4ED8` | Corporate division, Approver role |
| SME Green | `#15803D` | SME Banking, Approved status, Proposer role |
| Amber | `#B45309` | Deferred, Settlement, Consumer Asset |
| Board Purple | `#7C3AED` | Board Approval Pending |

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── login/            # Login with demo accounts
│   └── dashboard/
│       ├── page.tsx      # Main proposal dashboard
│       ├── meetings/     # Meeting history + search
│       └── meeting/[id]/ # Live meeting room
├── components/
│   ├── layout/           # Sidebar, TopBar
│   ├── dashboard/        # StatsRow, ProposalCard
│   ├── proposal/         # DetailPanel
│   └── meeting/          # MeetingSetup, MeetingRoom
├── context/              # AuthContext, MeetingContext
├── lib/
│   ├── data/             # Demo users + 25 proposals (CEC250921-0068)
│   └── export/           # PDF + XLSX export
└── types/                # TypeScript types
```

---

*Built for IDLC Finance PLC Credit Department · CEC Visualizer v0.1.0*
