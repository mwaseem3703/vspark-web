# Hosted deployment

- Website: https://vspark-web.vercel.app
- Vercel project: `vspark-competition`, team `ahmad5-cd9b` (Hobby).
- Supabase project: `vspark-competition` (`ktvwewkqizwaazziesdv`, Tokyo).
- Next.js functions use Vercel's Tokyo region (`hnd1`).
- Production and preview use live Supabase data, with demo mode disabled.
- Supabase service-role access is stored as a Vercel server-only secret. Credentials are excluded from Git and deployment uploads.

## Backend setup applied

`supabase/schema.sql` was applied to the empty hosted project in one transaction. All application tables have row-level security enabled. The `receipts` and `tasks` storage buckets are private. Anonymous callers cannot read the task or raw participant/submission records.

`supabase/config.toml` declares only the production Site URL and explicit callback/setup redirects. Existing email verification and other undeclared Supabase security settings are preserved.

## Remaining external connections

1. **Gmail SMTP configured:** Gmail authentication was verified using the sender and App Password in the owner's ignored `.env.local`. Matching server-only `SMTP_USER` / `SMTP_PASS` values are configured in Vercel Production and Preview; Supabase Auth custom SMTP uses the same Gmail sender. The SMTP-enabled production deployment is Ready and the app reports email ready. Registration is no longer paused for missing SMTP. The admin login email is unchanged. No real account was created or test email sent during the final smoke check; inbox delivery and the complete signup/approval flow still need a participant test.
2. **Google Drive:** The owner uses personal Gmail. Follow [GOOGLE_DRIVE_SETUP.md](GOOGLE_DRIVE_SETUP.md) to create a Google OAuth Web Application client and add `GOOGLE_DRIVE_OAUTH_CLIENT_ID` / `GOOGLE_DRIVE_OAUTH_CLIENT_SECRET` to Vercel. The server-only encryption key is already configured. Admin → Competition settings → Connect Google Drive then requests narrow `drive.file` access and creates/reuses a private My Drive destination. Refresh tokens are encrypted before storage in the service-only `drive_connections` table; no token is returned by bootstrap. Google authorization and a real folder upload remain pending the owner's client setup. Shared Drive service-account configuration remains supported as an alternative. Saving a folder link alone never marks uploads ready.
3. **Event details:** The organizer must confirm the task, timing, prize labels, location, and optional bank details in the admin dashboard before announcing the competition. Initial dates are placeholders, not an announced event schedule.

After changing public environment values or adding a service connection, redeploy to apply the new configuration.

## GitHub connection

The source is pushed to the private `M-Ahmad069/vspark-competition` repository. The owner connected GitHub in Vercel, and `vercel git connect` successfully linked this repository to the existing project. The previous missing-account-connection blocker is resolved.

## Verification performed

The Vercel production build is Ready. All public pages respond successfully and unknown routes return 404. Nine live integration checks passed: sanitized public responses, safe signup roles, cookie sign-in/pending protection, admin/Origin checks, student approval, grading privacy, unconfigured-upload protection, private receipts/signed downloads, and logout/registration status. All temporary QA accounts and files were removed afterward. Local TypeScript compilation and five submission-rule tests also passed.

The appearance update adds a light/dark control in public and workspace navigation, initializes from the system preference, and remembers explicit choices in this browser. The initial theme is applied before paint. Motion uses transform/opacity effects with reduced-motion alternatives and section reveals; forms use mobile-friendly input sizing. Seven local tests now include folder-link normalization and rejection of lookalike hosts, file links, and unsafe destinations. The additive migration `supabase/migrations/2026102201_admin_drive_folder.sql` adds private destination and verification columns without changing existing event data.

The scroll refinement replaces single-use subtle reveals with explicit targets for headings, cards, journey steps, FAQ, and the final CTA. Sibling cards stagger, reveals re-arm after leaving the viewport, the journey line and top progress bar follow scrolling, and hero artwork uses desktop scroll parallax. Reduced-motion users receive static content. Personal Drive authorization adds tests for encrypted-token integrity, PKCE, state/admin binding, and expiration. Migration `2026102301_personal_drive.sql` adds the private token table and a service-only atomic connection function.

## Email design

The confirmation, recovery, and invitation templates are applied to hosted Supabase with no pending declared configuration changes. The registration/approval HTML update is committed and passes the production build and 13 tests, but Vercel blocked deployment `dpl_64ACGKfsJ5o1ys7kDsZFWpKutEGY` due to Git commit-author permissions. A supported redeploy attempt was refused. Those two notification designs are not yet live; verify the `M-Ahmad069` GitHub login connection in Vercel Account Settings before deploying the new application code.

Supabase confirmation, password-reset, and invitation emails use the branded HTML in `supabase/templates`, referenced by `supabase/config.toml`. `src/lib/email-template.ts` supplies the shared email layout for application registration and approval notifications; Nodemailer sends HTML plus the original plain-text alternative. The templates use inline styles, presentation tables, a mobile viewport, escaped participant text, and an action-button fallback link. The reset layout was checked in desktop and 390px mobile browser previews. Rendering inside specific inbox clients and delivery of these newly styled messages still need an inbox test. Google Drive setup is documented in `GOOGLE_DRIVE_SETUP.md`; OAuth client ID and secret remain required.

## Organizer access

With explicit owner approval, the organizer account was created as an approved administrator and its password-setup invitation was emailed to the owner's event address. A password setup page is available at `/auth/setup` for invitation/recovery links. The owner chooses the application password personally; no password from chat is reused.

## Operations

```sh
vercel link --yes --project vspark-competition --scope ahmad5-cd9b
vercel deploy --prod --yes --scope ahmad5-cd9b
vercel inspect https://vspark-web.vercel.app --scope ahmad5-cd9b
```

Do not rerun the initial schema script against an existing database. Future database changes should use new reviewed migrations. For signup/auth troubleshooting, check both Vercel function logs and Supabase Auth logs.
