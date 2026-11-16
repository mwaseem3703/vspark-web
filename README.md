# VSpark 2026 — Web Development Competition Platform

A full-stack, university-grade web competition and evaluation portal built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**, **Supabase SSR**, and **Node.js**. Designed for high-stakes hackathons and university coding competitions, providing end-to-end registration, team formation, automated timer scheduling, cloud file submissions, faculty evaluation rubrics, and real-time live leaderboards.

---

## 📽️ Project Video Walkthrough & Demo

> [!NOTE]
> **Video Walkthrough Placeholder:** A full screencast walkthrough demonstrating participant registration, team formation, live admin approval, timer countdown, project submissions, and jury scoring.

<!-- VIDEO_DEMO_START -->
[![VSpark Competition Platform Walkthrough](https://img.shields.io/badge/Demo_Video-Click_to_Watch-2563eb?style=for-the-badge&logo=youtube&logoColor=white)](https://your-video-link-here.com)

*Replace `https://your-video-link-here.com` with your Loom, YouTube, or Google Drive demo recording.*
<!-- VIDEO_DEMO_END -->

---

## 🚀 Key Features

### 1. Participant Registration & Team Management
- **Solo & Team (Max 2 Members) Modes:** Participants can register as individual developers or as a 2-member team.
- **Leader & Member Roles:** The team creator acts as Team Leader (Primary submitter), while Member 2 receives full access credentials.
- **Proof of Payment Upload:** Secure upload for bank deposit slips and transaction screenshots (PNG, JPG, PDF) with instant preview.
- **Smart Form Validation:** Client- and server-side validation with Title Cased labels, live formatting, and inline requirement asterisks.
- **Auto-Sync Pending State:** Approved participants are automatically transitioned from the waiting screen directly into the competition workspace via live polling without manual page reload.

### 2. Faculty & Admin Management Console
- **Student & Team Management (`/admin/students`):**
  - Instant search across name, email, university, team name, and partner name.
  - Tab filters for All Students, Teams (👥), Solo (👤), Pending, Approved, and Rejected.
  - **Comprehensive Details Modal:** Clicking any student row opens a detailed modal showing leader & teammate credentials, contact numbers with direct WhatsApp links, payment slip preview, and submitted code.
  - Quick action controls: Approve/Reject, Send Password Reset Link, and Direct Email messaging.
- **Official Jury Evaluation (`/admin/evaluations`):**
  - Structured 100-mark rubric covering UI/UX, Authentication, CRUD & Database, Cloud Storage, External APIs, Deployment, Code Quality, Documentation, and Defense.
  - Direct repository code inspection, Drive folder review, and source ZIP download.
- **Competition Controls (`/admin/settings`):**
  - Event timer controls (Scheduled, Open Now, or Closed).
  - Manual override switches, challenge brief markdown editor, and prize pool configuration.
  - One-click public results publishing.

### 3. Competition Workspace & Gated Submissions
- **Time-Locked Challenge Access:** The problem statement, PDF brief, and submission form remain locked until the competition officially starts.
- **Live Countdown Timer:** Synchronized timer tracking competition start, active coding duration, and submission deadline.
- **Source Code Packaging & Filtering:** Client-side archive builder automatically filters out `.git`, `node_modules`, `.next`, `.env` files, build caches, and private tokens before submission.
- **Triple Submission Redundancy:** Supports GitHub Repository URL, Google Drive Folder URL, and directly bundled ZIP archives.

### 4. Live Background Synchronization
- Dynamic background polling interval (every 6 seconds when tab is active).
- Instant data re-fetch on window focus and tab visibility change.
- Multi-tab synchronization via local storage events in demo environments.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Actions, Route Handlers) |
| **Language** | TypeScript (Strict type checking) |
| **Styling** | Tailwind CSS 4, Radix UI Primitives, Lucide Icons |
| **Database & Auth** | Supabase (PostgreSQL with Row Level Security, SSR Auth) |
| **Storage** | Supabase Storage (Private Buckets) / Google Drive API (OAuth2) |
| **Email Delivery** | Nodemailer (Gmail TLS port 465 SMTP integration) |
| **Testing** | Node.js Test Runner with `tsx` (`tests/*.test.ts`) |

---

## 📂 Project Structure

```
vspark-competition/
├── public/                 # Static branding, logos, and competition assets
├── src/
│   ├── app/                # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── (public)/       # Landing, Login, Register, Pending, Results
│   │   ├── admin/          # Admin portal (Overview, Students, Evaluations, Settings)
│   │   ├── dashboard/      # Participant portal (Workspace, Brief, Submission)
│   │   └── api/            # Server endpoints with authentication & RBAC guards
│   ├── components/         # Core UI components
│   │   ├── admin.tsx       # Faculty console, student table & detail modal
│   │   ├── auth.tsx        # Registration form, login & password recovery
│   │   ├── provider.tsx    # AppContext provider with live auto-refresh
│   │   ├── shell.tsx       # Reusable layout shells and navigation headers
│   │   └── student.tsx     # Student workspace, submission form & timer
│   └── lib/                # Utility modules, schemas, and API clients
│       ├── competition.ts  # State management, WhatsApp link generator
│       ├── types.ts        # TypeScript schemas for profiles, teams, submissions
│       └── utils.ts        # Formatting, date helpers, class merger
├── supabase/
│   └── schema.sql          # Complete PostgreSQL schema, triggers & RLS policies
└── tests/                  # Automated integration and unit test suite
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js:** 20.9 or newer (tested on Node 22 and Node 24)
- **npm:** 10.x or higher
- **Supabase Account** (or local Supabase CLI instance)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Waseem-Akram-dev/vspark-competition.git
cd vspark-competition
npm install
```

### 2. Environment Configuration
Create a `.env.local` file from the provided example:
```bash
cp .env.example .env.local
```

Configure your environment variables:
```ini
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Application Origin
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Faculty Admin Credentials
ADMIN_EMAIL=admin@vspark.edu
ADMIN_PASSWORD=YourSecurePassword123!

# SMTP Email Dispatch (Gmail App Password)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# Optional: Demo Mode (true for offline isolated mock data, false for live backend)
NEXT_PUBLIC_DEMO_MODE=false
```

### 3. Database Initialization
Run `supabase/schema.sql` in the **SQL Editor** of your Supabase project. It automatically configures:
- `profiles` table with Team and Solo participation tracking.
- `submissions` and `evaluations` tables with 100-mark scoring schema.
- Private storage buckets (`payment-receipts`, `submissions`, `tasks`).
- Secure Row Level Security (RLS) policies preventing unauthorized role elevation.

### 4. Running the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing & Verification

Run the automated test suite:
```bash
# Run unit & security integration tests
npm test

# Run TypeScript compilation checks
npm run typecheck

# Verify production build bundle
npm run build
```

---

## 🔒 Security & Integrity Measures

- **Role-Based Access Control (RBAC):** Next.js middleware and API route handlers verify JWT tokens and database roles before granting access to `/admin/*` routes.
- **SQL Injection & RLS Protection:** Browser clients communicate via Supabase SSR with strict Row Level Security. Role modification and score publishing are restricted to security-definer server routines.
- **Client-Side Secret Shield:** File submission uploads scan and block `.env`, `.pem`, `.key`, `id_rsa`, and sensitive token patterns.
- **Idempotent State Changes:** All approval, score submission, and timer mutations use transaction locks and origin verification.

---

## 📄 License
This project was developed for the **VSpark University Web Development Competition**. All rights reserved.
