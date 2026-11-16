# VSpark 2026 — Web Development Competition & Evaluation Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.4.2-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_&_Auth-3ecf8e?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel_Edge-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vspark-competition.vercel.app)
[![Tests](https://img.shields.io/badge/Tests-13%2F13_Passed-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)](https://github.com/mwaseem3703/vspark-web)

A comprehensive, full-stack competition management, student workspace, and faculty evaluation portal engineered for academic hackathons and university web development contests. Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS 4**, **Supabase SSR**, and **Node.js**, providing automated registration, team formation, live 120-minute countdown scheduling, client-side code sanitization, dual-cloud persistence (Supabase Storage + Google Drive OAuth 2.0), flexible dual-mode faculty grading, and real-time live leaderboards.

---

## 📽️ Project Video Walkthrough & Demo

> [!NOTE]
> **Video Walkthrough Placeholder:** A video demonstration showcasing participant registration, team formation, faculty verification, live 120-minute workspace countdown, file packaging, dual-mode evaluation scoring, and live leaderboard podium rankings.

<!-- VIDEO_DEMO_START -->
[![VSpark Competition Platform Walkthrough Video](https://img.shields.io/badge/Demo_Video-Click_to_Watch_Walkthrough-2563eb?style=for-the-badge&logo=youtube&logoColor=white)](https://your-video-link-here.com)

*Video Link Placeholder: Replace `https://your-video-link-here.com` with your YouTube, Loom, or Google Drive demonstration recording.*
<!-- VIDEO_DEMO_END -->

---

## 🌐 Live Production Links

- **Production Portal:** [https://vspark-competition.vercel.app](https://vspark-competition.vercel.app)
- **Public Leaderboard & Results:** [https://vspark-competition.vercel.app/results](https://vspark-competition.vercel.app/results)
- **Student Dashboard:** [https://vspark-competition.vercel.app/dashboard](https://vspark-competition.vercel.app/dashboard)
- **Faculty Admin Console:** [https://vspark-competition.vercel.app/admin](https://vspark-competition.vercel.app/admin)
- **GitHub Repository:** [https://github.com/mwaseem3703/vspark-web](https://github.com/mwaseem3703/vspark-web)

---

## ⚡ Complete Feature Breakdown (A to Z)

### 1. Participant Registration & Team Dynamics
- **Solo & Team (2 Members) Registration:** Participants can register as individual developers or as a collaborative 2-member team.
- **Automated Dual-Account Provisioning:** When registering as a team, separate authenticated user accounts are automatically created in Supabase Auth for both the **Team Leader** (Primary submitter) and **Teammate** (View-only member), allowing both members to sign in with their respective emails.
- **Payment Slip & Deposit Upload:** Mandatory proof-of-payment upload supporting JazzCash, Easypaisa, and bank deposit receipts (JPG, PNG, PDF up to 10 MB) stored securely in private Supabase Storage buckets.
- **Smart Form Formatting:** All input labels feature automatic Title Casing, inline requirement asterisks (`*`), contact number format sanitization, and duplicate email checking.
- **Automated Registration Emails:** Instant dispatch of personalized confirmation emails to both Leader and Teammate with team details, roles, and review status.

### 2. Faculty Admin Command Center (`/admin`)
- **Overview Dashboard (`/admin`):**
  - Live metric widgets: Total Registrations, Approved Participants, Active Submissions, Graded Projects, and Storage Health.
  - Quick-action shortcuts to Event Controls, Evaluation Room, Student Management, and Announcement Dispatcher.
  - Service connectivity status indicators for PostgreSQL Database, Google Drive OAuth 2.0, and Gmail SMTP Relay.
- **Unified Student & Team Management (`/admin/students`):**
  - **Team Deduplication:** Team registrations appear as **1 unified team row** (`👥 Team: [Team Name]`), displaying both Leader and Teammate credentials, avoiding confusing duplicate rows.
  - **Figma-Style Status Tabs:** Filter registrations by All Registrations, Teams (👥), Individual (👤), Pending Verification, Active / Approved, and Rejected.
  - **Live Search Engine:** Instant filter across participant names, emails, university, team names, and teammate details.
  - **Comprehensive Student Detail Modal:** Clicking any row opens an in-depth modal displaying:
    - **Member 1 (Leader) Card:** Full name, email, phone with 1-click WhatsApp link, department, semester, plus dedicated **"Email Leader"** and **"Reset Leader Password"** action buttons.
    - **Member 2 (Teammate) Card:** Full name, email, phone with 1-click WhatsApp link, department, semester, plus dedicated **"Email Teammate"** and **"Reset Teammate Password"** action buttons.
    - **Shared Deposit Receipt:** Embedded thumbnail preview and full-resolution receipt modal.
    - **Shared Project Submissions:** Direct links to submitted GitHub repository, student Google Drive folder, and clean source ZIP archive download.
    - **Single-Click Team Review:** Approve or reject both team members simultaneously with automated notification dispatch.
- **Faculty Evaluation Room (`/admin/evaluations`):**
  - **Dual-Mode Scoring Interface:**
    - **Option A (Direct Marks 0–100):** Quick numeric input, continuous range slider, and 1-click preset badges (50, 60, 65, 70, 75, 80, 85, 90, 95, 100) for rapid holistic grading.
    - **Option B (9-Criteria Detailed Rubric):** Granular category sliders aligned with the official competition rubric (UI/UX 10, Auth 15, CRUD 20, Storage 10, API 15, Deployment 15, Code Quality 5, Docs 5, Defense 5).
    - **Two-Way Live Synchronization:** Editing the direct total proportionally distributes points across rubric criteria; tweaking individual rubric criteria automatically updates the total.
  - **Direct Code Inspection:** In-modal GitHub link, Drive folder link, and ZIP archive download.
  - **Qualitative Jury Feedback:** Multi-line text field for constructive evaluator comments and notes.
- **Competition Controls & Rules Engine (`/admin/settings`):**
  - **Event State Controls:** Toggle competition state between **Scheduled** (locked), **Open Now** (active coding), and **Closed** (submission freeze).
  - **Synchronized Duration Timer:** Configurable start time, end time, and live 120-minute countdown tracking.
  - **Dynamic Rules & Guidelines Editor:** Live editor for Allowed Tech Stacks, Competition Rules, Bank Account details, and Submission Checklist.
  - **Challenge Task Markdown & PDF Uploader:** Upload problem statement PDF briefs and edit live task descriptions with automatic student visibility locking until the start signal.
  - **Public Results Publishing Toggle:** Turn public visibility on/off for the public leaderboard.

### 3. Student Competition Workspace (`/dashboard`)
- **Time-Locked Problem Brief:** Problem statement, PDF attachments, and submission controls remain securely locked until the faculty officially starts the competition.
- **Live Synchronized Timer:** Persistent banner displaying time remaining with automatic submission freeze when time expires.
- **Code Packaging & Secret Shield:**
  - In-browser client-side archive generator powered by `JSZip`.
  - **Automatic Exclusion Filtering:** Strips `.git`, `node_modules`, `.next`, `.turbo`, `.env*`, `.pem`, `.key`, build caches, and sensitive credentials prior to bundle creation.
  - Compresses source code into clean `.zip` archives in under 1.2 seconds directly in memory.
- **Triple-Redundancy Submission Engine:**
  - **GitHub Repository URL:** Validated HTTPS repository URL with evaluator collaborator prompt.
  - **Google Drive Folder URL:** Dedicated cloud folder for project builds and documents.
  - **Source Code Archive:** Direct upload to Supabase Storage with automatic mirroring to Google Drive.
- **Single-Attempt Submission Policy:** Strict database-level lock preventing duplicate folder creation, accidental re-submissions, or post-deadline modifications.

### 4. Public Leaderboard & Results (`/results`)
- **Top 3 Podium Display:** Dynamic Olympic-style podium celebrating Gold, Silver, and Bronze winners with customized scalloped badges.
- **Prominent Team Identification:** Teams are highlighted with large team names (`👥 Team: [Team Name]`) accompanied by clear member attributions (`Leader: [Name] · Partner: [Name]`).
- **Live Leaderboard Table:** Ranked list showing position, team/student name, institution, category sub-scores, final marks out of 100, and verified submission links.
- **Interactive Student Scorecard Modal:** Clicking any entry opens a comprehensive scorecard displaying individual rubric category marks, total grade, and faculty evaluation notes.

### 5. Automated Transactional Email Engine
- **Production URL Sanitization:** All outgoing emails automatically replace any local references with the live production domain (`https://vspark-competition.vercel.app`).
- **Team Registration Emails:** Dispatched to both Leader and Teammate upon form submission.
- **Team Approval Emails:** Personalized notification sent to both members when the faculty approves their account.
- **Password Recovery Emails:** One-click secure reset links with pre-filled email parameters.
- **Faculty Direct Messaging:** Rich HTML announcements and targeted direct student communications sent from the admin console.
- **Podium Honors Notification:** Automated congratulations email dispatched to top ranking winners upon results publication.

### 6. Live Background Synchronization
- **Zero-Reload State Synchronization:** Automatic background polling every 6 seconds on active tabs.
- **Focus & Visibility Triggered Refresh:** Re-validates registration status, timer status, and leaderboard standings immediately when returning to the tab.
- **Cross-Tab State Sharing:** Synchronizes state across multiple open windows via storage events.

---

## 🛠️ Technology Stack Architecture

| Layer | Component | Version / Tooling | Architectural Purpose |
|---|---|---|---|
| **Frontend Core** | Next.js App Router | 16.4.2 (Turbopack) | Server Components, Route Handlers, Server-Side Rendering (SSR) |
| **Language** | TypeScript | 5.9 | Strict static type safety across schemas, API payloads, and state |
| **Styling & Design** | Tailwind CSS + Radix UI | v4.0 + Lucide React | Figma-spec design system, accessible modals, responsive layouts |
| **Database** | PostgreSQL | 15 (Supabase Cloud) | Relational tables, transaction safety, foreign keys, cascade rules |
| **Authentication** | Supabase SSR Auth | `@supabase/ssr` v0.5 | Secure HTTP-only cookie sessions, role-based JWT claims |
| **Data Protection** | PostgreSQL RLS | Row Level Security | Strict database security policies guarding admin endpoints |
| **Cloud Storage** | Supabase Storage | S3-Compatible Buckets | Private buckets for `payment-receipts`, `submissions`, and `tasks` |
| **Drive Integration** | Google Drive API | v3 (OAuth 2.0 PKCE) | Authenticated personal Google Drive integration (15 GB quota) |
| **Email Service** | Nodemailer | TLS Port 465 | Branded HTML transactional email delivery via SMTP relay |
| **Testing Harness** | Node.js Test Runner | `tsx --test` | Automated unit, security, and integration test suite |
| **Hosting & CI/CD** | Vercel Edge Network | Production Cloud | Global edge routing, automatic HTTPS, and zero-downtime deploys |

---

## ⚖️ Official 100-Point Evaluation Rubric

| # | Assessment Category | Max Marks | Standards, Capabilities & Evaluation Criteria |
|:---:|:---|:---:|:---|
| **1** | **UI/UX & Responsiveness** | **10** | Modern visual layout, responsive mobile/tablet/desktop design, visual hierarchy, consistent typography. |
| **2** | **Authentication & Security** | **15** | Role-based access control (Admin vs Student), protected routes, password hashing, secure session cookies. |
| **3** | **Database Design & CRUD** | **20** | Relational schema design, complete Create/Read/Update/Delete operations, input validation, data integrity. |
| **4** | **Cloud Storage & File Uploads** | **10** | File uploads (receipts/archives), MIME type validation, file size limits, private bucket signed URLs. |
| **5** | **External API & Email Services** | **15** | Cloud integrations (Google Drive OAuth 2.0 API v3) and transactional SMTP emails with HTML templates. |
| **6** | **Live Deployment & Performance** | **15** | Verified live URL on Vercel/Netlify, HTTPS configuration, zero console exceptions, fast edge response. |
| **7** | **Code Quality & Architecture** | **5** | Clean modular TypeScript, readable naming conventions, separation of concerns, zero compilation errors. |
| **8** | **Documentation & Setup Guide** | **5** | Comprehensive README, architecture overview, environment variable setup, reproduction instructions. |
| **9** | **Defense & Technical Presentation**| **5** | Confident explanation of architecture, problem-solving reasoning, and technical defense during faculty review. |
| | **TOTAL SCORE** | **100** | **Comprehensive Standardized Evaluation Score** |

---

## 📂 Repository Directory Structure

```
vspark-competition/
├── public/                     # Static branding assets, icons, and SVG illustrations
├── src/
│   ├── app/                    # Next.js App Router structure
│   │   ├── (public)/           # Public views (Landing, Login, Register, Pending, Results)
│   │   ├── admin/              # Faculty management console routes
│   │   │   ├── evaluations/    # Jury grading room & rubric modal
│   │   │   ├── settings/       # Master competition controls & tech stack rules
│   │   │   └── students/       # Unified student & team directory
│   │   ├── dashboard/          # Student participant portal
│   │   │   ├── task/           # Problem brief, countdown timer & file submission
│   │   │   └── team/           # Team partner status & submission details
│   │   ├── api/                # REST API endpoints with RBAC & schema validation
│   │   │   └── [...path]/      # Unified API controller handling auth, drive, submissions, grading
│   │   └── auth/               # OAuth callbacks (Google Drive OAuth PKCE, Supabase Auth)
│   ├── components/             # Reusable UI component architecture
│   │   ├── admin.tsx           # Admin console, student directory, evaluation modal
│   │   ├── auth.tsx            # Multi-mode registration, sign-in, recovery forms
│   │   ├── provider.tsx        # AppContext provider with live 6-second auto-sync
│   │   ├── results.tsx         # Podium top 3, leaderboard rankings, scorecard modal
│   │   ├── shell.tsx           # Layout navigation headers, status badges, workspace wrappers
│   │   ├── student.tsx         # Participant workspace, countdown timer, submission form
│   │   └── ui/                 # Accessible Radix UI components (Button, Input, Slider, Modal)
│   └── lib/                    # Core utilities, validation schemas, and API clients
│       ├── competition.ts      # Event state calculation, WhatsApp URL generator
│       ├── competition-rules.ts# Dynamic rules and guidelines parser
│       ├── drive-oauth.ts      # Google Drive OAuth 2.0 PKCE flow & AES-256 token encryption
│       ├── email-template.ts   # Branded responsive HTML transactional email generator
│       ├── mail.ts             # Nodemailer SMTP transport & dispatch routines
│       ├── types.ts            # TypeScript definitions (Profile, Submission, Evaluation, Settings)
│       └── utils.ts            # Formatting helpers, date formatters, cn class merger
├── supabase/
│   └── schema.sql              # Complete PostgreSQL schema, RLS policies & initial seeds
└── tests/                      # Automated security, timer & validation test suites
    ├── competition.test.ts     # Timer lifecycle & schedule override unit tests
    ├── drive.test.ts           # Google Drive OAuth security & PKCE validation tests
    ├── email-template.test.ts  # HTML email sanitization & URL validation tests
    └── submission.test.ts      # Code exclusion filtering & sensitive token blocking tests
```

---

## ⚙️ Quickstart & Local Setup Guide

### System Prerequisites
- **Node.js:** v20.9.0 or newer (tested on Node 22 LTS and Node 24)
- **npm:** 10.x or higher
- **Supabase Account:** Free or Pro Supabase project (or local Supabase CLI)
- **Google Cloud Console Account:** (Optional, for personal Google Drive OAuth integration)
- **Gmail Account:** (For SMTP transactional email dispatch with App Password)

### 1. Repository Installation
```bash
git clone https://github.com/mwaseem3703/vspark-web.git
cd vspark-web
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```bash
cp .env.example .env.local
```

Populate the required environment variables:
```ini
# Supabase Database & Auth Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Production Application Origin (Used for email links & callbacks)
NEXT_PUBLIC_SITE_URL=https://vspark-competition.vercel.app

# Faculty Administrator Account (Auto-provisioned on migration)
ADMIN_EMAIL=aliblogspot769@gmail.com
ADMIN_PASSWORD=YourSecureFacultyPassword123!

# Gmail SMTP Email Dispatcher (TLS Port 465)
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password

# Google Drive OAuth 2.0 Integration (Optional, utilizes 15 GB quota)
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret

# Offline Demo Mode (Set false for live PostgreSQL backend)
NEXT_PUBLIC_DEMO_MODE=false
```

### 3. Database Schema Migration
Open your Supabase Project Dashboard, navigate to **SQL Editor**, and execute the complete script located at `supabase/schema.sql`.

This initializes:
- `profiles` table with Solo and Team (`team_name`, `team_role`, `team_id`, `teammate_*`) columns.
- `competition_settings` table pre-configured with rules, rubric criteria, and bank account fields.
- `submissions` and `evaluations` tables with single-attempt constraints and 100-mark rubrics.
- Private storage buckets: `payment-receipts`, `submissions`, and `tasks`.
- Secure Row Level Security (RLS) policies preventing privilege escalation.

### 4. Running the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Testing & Quality Assurance

The codebase includes an automated unit and integration test suite:

```bash
# Execute unit & security integration tests
npm test

# Run TypeScript static type checking
npm run typecheck

# Verify production Next.js build compilation
npm run build
```

### Test Suite Coverage (`13/13 Passed`):
- `competition.test.ts`: Timer schedule transitions, start/end boundary conditions, manual override priority.
- `submission.test.ts`: Sensitive file exclusion (`.env`, `.git`, `node_modules`, `.pem`), archive sanitization.
- `drive.test.ts`: Google Drive OAuth PKCE flow, AES-256-GCM token encryption, origin validation.
- `email-template.test.ts`: HTML entity escaping, link sanitization, production URL enforcement.

---

## 🔒 Security Architecture

1. **Role-Based Access Control (RBAC):** Next.js Edge Middleware and server API routes verify Supabase JWT tokens and user role attributes before granting access to `/admin/*` routes.
2. **PostgreSQL Row Level Security (RLS):** Student clients can only read approved competition tasks and submit once under their authenticated profile ID. Faculty administrative actions bypass RLS strictly through secure server-side service-role clients.
3. **Sensitive File & Secret Shield:** The client-side file upload engine inspects file paths and automatically ignores development files, build artifacts, and private credential files (`.env`, `.pem`, `.key`, `id_rsa`).
4. **Encrypted Token Persistence:** Google Drive OAuth refresh tokens are encrypted using AES-256-GCM with fresh initialization vectors (IVs) and authentication tags before being stored in PostgreSQL.
5. **Idempotent Single-Attempt Submissions:** Submissions are guarded by database-level unique constraints preventing concurrent duplicate folder creation or post-evaluation modifications.

---

## 👥 Authors & Academic Attribution

- **Lead Developer & Software Engineer:** Muhammad Waseem (Reg No: SP24-BSE-053)
- **Institution:** COMSATS University Islamabad, Vehari Campus
- **Department:** Department of Computer Science & Web Development Society
- **Faculty Supervisor & Lead Evaluator:** Faculty Admin (`aliblogspot769@gmail.com`)
- **Repository:** [https://github.com/mwaseem3703/vspark-web](https://github.com/mwaseem3703/vspark-web)
- **License:** Official Software Property of VSpark University Competition. All rights reserved.
