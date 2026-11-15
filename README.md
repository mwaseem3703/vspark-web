# VSpark competition platform

A responsive, light-mode university web development competition platform, based on **Web Mid Lab.pdf** and the [VSpark design reference](https://vspark-omega.vercel.app/). Built with Next.js 16 App Router, TypeScript, Tailwind CSS 4, shadcn-style button primitives, Radix Slot, Lucide, and Supabase SSR. The reference's blue identity is adapted to the brief's explicit light-mode requirement.

## Run locally

Requires Node.js 20.9 or newer (tested with Node 24) and npm.

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:3000**. To check the production bundle:

```sh
npm test
npm run build
npm start
```

## Demo mode

Normal local and hosted operation uses live services and shows no demo banner or sample-workspace buttons. Copy `.env.example` to `.env.local` and configure Supabase before starting. Missing credentials no longer silently enable a sample experience. For an intentional isolated preview only, explicitly set `NEXT_PUBLIC_DEMO_MODE=true`; that preview is clearly labeled and uses fictional participants and browser-local storage.

Try this walkthrough:

1. Open the admin demo and review the overview.
2. In Students, search/filter registrations and approve a pending student.
3. In Competition settings, choose **Open now** and **Save changes**.
4. Open `/login` and select Student demo. The dashboard now offers **Start task**.
5. Select a source folder and provide a valid GitHub repository URL. The app filters excluded paths, validates sizes, and saves a demo submission.
6. Return to Admin demo, evaluate the submission, and assign a score/feedback.
7. Turn on **Publish results** in settings, save, then view `/results`.

To reset the sample data, choose **Reset demo data** on the login page. Demo data is intentionally isolated from live data. The demo role buttons never authenticate real API requests.

## Connect the live backend

1. Create a Supabase project. Run **supabase/schema.sql** once in the SQL Editor of a new project. It creates profiles, competition settings, submissions, upload sessions, private storage buckets, safe signup triggers, and role policies.
2. Copy `.env.example` to `.env.local`. Set `NEXT_PUBLIC_DEMO_MODE=false`, the Supabase URL and anon key, and the **server-only** service-role key. Set `NEXT_PUBLIC_SITE_URL` to the actual application origin.
3. In Supabase Auth URL Configuration, set the Site URL and allow `http://127.0.0.1:3000/auth/callback` for local development and `https://YOUR_DOMAIN/auth/callback` for production. Keep the default PKCE-compatible email confirmation link. Enable email confirmation as appropriate. Supabase sends the email verification message; Nodemailer sends competition registration and approval notifications.
4. Register the organizer through the normal form and confirm the email. In the Supabase SQL Editor, explicitly promote that account:

```sql
update public.profiles
set role = 'admin', status = 'approved'
where email = 'YOUR_ADMIN_EMAIL';
```

5. Configure Gmail and Google Drive as below. Restart Next.js after changing environment variables. On Vercel, redeploy after changing any `NEXT_PUBLIC_` value.
6. Log in as the organizer and set the **real title, task, schedule, location, prizes, and optional bank details**. Sample content is illustrative; real bank details and prize amounts have not been invented.

### Gmail email delivery

Set `SMTP_USER` to the Gmail sender and `SMTP_PASS` to its Google App Password (requires Google's account prerequisites, including 2-Step Verification). Nodemailer connects to Gmail using TLS on port 465. Keep the app password server-only.

Failed delivery does not discard a successful registration or approval. The UI reports the email failure. Supabase verification delivery is configured separately in Supabase Auth; use its SMTP configuration for broader production registration rather than relying on limited default verification delivery.

### Google Drive uploads

**Personal Gmail:** The admin can use **Connect Google Drive** after the one-time OAuth client setup in [GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md). The connection uses narrow `drive.file` access, PKCE, an admin-bound expiring state cookie, and an authenticated-encrypted refresh token in a service-only table. It creates/reuses a private VSpark Submissions folder in My Drive. Connecting keeps submissions closed. Existing sessions, completed submissions, and Drive files are preserved. A participant whose destination changes is prompted to restart their own upload; no bulk session updates occur. The Google authorization and a real upload still need to be verified after the owner's OAuth client is configured.

**Workspace alternative:** The service-account approach below requires a **Google Workspace Shared Drive**, not an ordinary personal Gmail folder. [Google documents that service accounts have no storage quota and cannot own files](https://developers.google.com/workspace/drive/api/guides/about-shareddrives).

1. Enable Google Drive API in a Google Cloud project and create a service account.
2. Add the service account to the intended Workspace Shared Drive with permission to create content. Your university Workspace administrator may need to permit it.
3. Set `GOOGLE_DRIVE_CLIENT_EMAIL`, `GOOGLE_DRIVE_PRIVATE_KEY`, and `GOOGLE_DRIVE_PARENT_FOLDER_ID` to a folder in that Shared Drive. The private key supports literal `\n` line breaks in an environment value.
4. Grant human evaluators access to the Shared Drive. Uploaded projects are **not** made public. Student dashboards show their receipt of submission; Drive links appear in the organizer's evaluation view.

Uploads use a server-owned session and manifest, then upload **one file per request**, preserving folder structure. The server repeats path and size checks, verifies session ownership/approval/event state on every request, and only finalizes after every manifest entry is recorded. Idempotency keys support retries. Limits: **500 files, 3 MB per file, 100 MB total, three-hour upload-session expiry**. Final submissions are immutable, one per student. Uploads that fail can be retried with the same selection; changing the selection starts another session. Organizers should periodically remove abandoned folders in the Shared Drive.

## Pages

| Route                | Purpose                                                                               |
| -------------------- | ------------------------------------------------------------------------------------- |
| `/`                  | Competition landing page, guidelines, recognition, optional bank details              |
| `/register`          | Signup and optional receipt                                                           |
| `/login`             | Student/admin sign-in; demo workspace entry                                           |
| `/pending`           | Registration status and refresh                                                       |
| `/dashboard`         | Student status, countdown, announcement, task access                                  |
| `/dashboard/task`    | Gated brief, PDF download, folder upload, final submission receipt                    |
| `/admin`             | Organizer overview and activity                                                       |
| `/admin/students`    | Search/filter, approve/reject, receipt and WhatsApp links                             |
| `/admin/evaluations` | Project links, marks 0–100, feedback                                                  |
| `/admin/settings`    | Task, schedule, manual submission controls, prizes, bank details, results             |
| `/results`           | Public results only after publication, evaluated projects only, shared ranks for ties |

## Security and brief clarifications

- The brief's two-state submission flag was replaced with **scheduled / open / closed**. A manual close always wins; manual open stays open independent of the schedule.
- The SQL in the PDF has been replaced with a safer schema. Signup metadata cannot select a role or approval status. Browser clients cannot write profile roles, grades, settings, submissions, or upload sessions.
- A security-definer admin helper prevents recursive profile RLS policies. The public leaderboard function returns only participant name, university, and finalized score after publication.
- Server routes recheck authentication, roles, student approval, session ownership, and event timing. Route protection uses Next.js 16's `proxy.ts` convention.
- Unpublished scores and task contents are removed from student/public bootstrap responses. Receipts and task PDFs use private storage and short-lived signed downloads.
- Source filtering excludes dependency/build folders, `.git`, `.vercel`, `.env` and `.env.*`, private keys, common credential files, unsafe path segments, and prototype keys. Review source projects before submission; pattern filtering cannot discover arbitrary secrets embedded in normal source files.
- State-changing endpoints check Origin against the application host. No demo identity is trusted by the server. Credentials stay in server environment variables.
- The database finalization function rechecks approval, timing, file completion, and uniqueness in a transaction.

## Deploy to Vercel

1. Put this folder in your own Git repository, excluding `.env.local`, `node_modules`, `.next`, and `tmp`.
2. Import it into Vercel as a Next.js project. Use `npm run build` and the default Next.js output configuration.
3. Add the live environment values from `.env.example`, including `NEXT_PUBLIC_DEMO_MODE=false` and your deployed `NEXT_PUBLIC_SITE_URL`. Never mark service-role, SMTP, or Drive secrets public.
4. Update Supabase Auth redirect URLs, deploy, then test a real signup/approval/upload/evaluation/results flow before accepting participants.

## Verification

The site is live at https://vspark-competition.vercel.app with production Supabase connected. The production build, TypeScript compilation, thirteen local tests, and previous live integration checks passed. Gmail SMTP is configured and registration is enabled. Google Drive still awaits the owner's OAuth client setup, so submissions remain closed. Confirmation, reset, invitation, registration, and approval emails use branded HTML; browser previews were checked at desktop and phone widths. Actual inbox rendering and the complete participant flow still require a real test. See [DEPLOYMENT.md](DEPLOYMENT.md) for setup status, verification, and operations.

Source map: `src/components` contains the page experiences and shared shells; `src/app/api/[...path]/route.ts` implements server endpoints; `src/lib` contains integrations and validation; `supabase/schema.sql` is the complete database setup.
#   v s p a r k - w e b  
 