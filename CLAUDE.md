# TYGA Summer Series — handoff for Claude (read this first)

> **STATUS UPDATE (13 Nov 2026) — supersedes older sections below where they conflict**
> - **Open access:** anyone signs in at `/login` with an emailed **code** (not a link); new emails get an account, then name + goal at `/join/commit`, then `/home`. No $15 registration fee, no member-list gate, no 30 Nov cutoff. `/join/sign-in` just redirects to `/login`. The old link flow (`/auth/*`, `/join/check-email`) is deleted.
> - **Square is only for the optional singlet ($15)**: Welcome -> `/shop` -> `/join/singlet` -> `/join/checkout` -> `/join/confirmed` (order page).
> - Series screens are open to any signed-in member. Leaderboard ranks only named, non-staff members.
> - **Staff dashboards:** `/admin` (orders, approvals, follow-ups) and `/admin/leaderboard` (top 10, consistency, perk candidates, "Mark redeemed", CSV). Pure logic in `lib/dashboard.ts` (tested).
> - Perf: Vercel region `syd1` (`vercel.json`), 20s cache of everyone's stats, per-request cached `getCurrentMember`.
> - Installable PWA (`app/manifest.ts`, `public/icons`). Env: `ALLOW_NON_MEMBERS` and `MEMBER_SYNC_SECRET` are no longer needed.
> - **Still open:** Resources + Holiday workouts are placeholder content; double-points dates; holiday mode doesn't protect streaks; 25-26 Jan check-ins dropped; guessable perk codes; DB name-length constraints; bot limit on code login; real perk partners; Resend sender domain; delete `SERIES_PREVIEW_WEEK` before launch.


Also read `AGENTS.md` (Next.js 16 has breaking changes — check `node_modules/next/dist/docs/` before writing Next code).

## What this is
A mobile-first web app for **The Yard Gym Albury** (TYGA) "Summer Series" — a 7-week accountability/rewards
program, **7 Dec 2026 – 26 Jan 2027**. Members register, pick a goal + singlet, pay **$15 AUD via Square**, then log
3 sessions a week, do weekly missions, earn points/levels/perks, and appear on a leaderboard. Staff use `/admin`.

- Live: https://tyga-summer-series.vercel.app
- GitHub: https://github.com/brylle-ops/tyga-summer-series (branch `main` — every push auto-deploys on Vercel)
- Vercel project: `tatay/tyga-summer-series`
- Supabase project ref: `hbedbdmvqozkhvrigwhc` (region Sydney)
- Spec: `docs/superpowers/specs/2026-11-11-tyga-summer-series-design.md`
- Stage 1 plan: `docs/superpowers/plans/2026-11-11-stage1-real-sign-ups.md`
- Setup guide: `docs/SETUP-SUPABASE-VERCEL.md`

## Stack
Next.js 16 (App Router, server actions, `proxy.ts` instead of middleware) · React 19 · TypeScript · Supabase
(Postgres + Auth + RLS, `@supabase/ssr`) · Square Checkout (Quick Pay link + webhook) · Resend SMTP for auth emails ·
Vitest + PGlite (real Postgres in-memory for RLS tests). `npm test` (75 tests), `npm run build`.

## Design (approved by Amy — do not restyle)
"Design v3" screens/wording + Amy's tweaks: Inter font, near-black `#0e0e0e` / off-white `#f4f1ec` / tan `#e3cba4`,
roomy spacing. Running 3D character (Three.js bundle in `public/runner`) on Welcome (Women's/Men's switch) and singlet
screen. Styles in `app/globals.css`; shared UI in `components/ui.tsx`. Weekly content unlocks Monday 12am Albury time.

## Code map
- `app/page.tsx` Welcome → "Join · $15" (`/join/sign-in`) or "I've already joined" (`/login`)
- Join flow: `app/join/sign-in` (email) → `/join/check-email` → email link → `/auth/confirm` → `/auth/continue`
  (tap Continue) → `/join/commit` (goal + name for non-members) → `/join/singlet` → `/join/checkout` (Square) →
  `/join/confirmed` (ticket; polls until webhook marks paid)
- `app/login` returning members: only emails with an existing `profiles` row get a link (else "no account")
- Series screens (paid or staff only, via `requireSeriesMember()` in `lib/series-data.ts`): `home log missions ranks
  levels perks holiday resources`; writes in `app/series/actions.ts`
- Admin (staff only): `app/admin/*` — payments, singlet grid + supplier CSV, member CSV upload, Yard-session approvals,
  add missions, follow-ups
- APIs: `app/api/square/webhook` (HMAC-verified), `app/api/members/sync` (TYG Dashboard daily member list, bearer secret)
- Rules/pure logic + tests: `lib/series.ts` (weeks, points, levels, streaks), `lib/checkout.ts`, `lib/singlet.ts`,
  `lib/members.ts`, `lib/signin.ts`, `lib/square-webhook.ts`, `lib/paging.ts` (Supabase 1,000-row limit)
- Auth/session: `lib/session.ts` (`getCurrentMember`, `ensureProfile`), `lib/supabase/{server,admin}.ts`, `proxy.ts`
- DB: `supabase/migrations/0001_stage1.sql`, `0002_stage2.sql` — BOTH ALREADY RUN in Supabase. Members have read-only
  RLS access to their own rows; all writes go through the server with the secret key.
- No Supabase keys → "example mode" (screens show `lib/mock-data.ts`).

## Environment (Vercel → Settings → Environment Variables). Never commit `.env.local`.
Set: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (Config), `SUPABASE_SECRET_KEY` (Secret),
`NEXT_PUBLIC_SITE_URL=https://tyga-summer-series.vercel.app`, `SQUARE_ENVIRONMENT=sandbox`, `SQUARE_WEBHOOK_URL`,
`ACTIVE_MEMBER_STATUSES=active`, `ALLOW_NON_MEMBERS=true`, `SERIES_PREVIEW_WEEK=1` (TESTING ONLY — delete before launch).
Probably missing: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, `MEMBER_SYNC_SECRET`.

Supabase dashboard settings already done: Site URL + redirect URLs (`https://tyga-summer-series.vercel.app/**`,
`http://localhost:3000/**`); custom SMTP = Resend (`smtp.resend.com:465`, user `resend`, sender
`onboarding@resend.dev`); email rate limit 100/h; email templates "Magic link" and "Confirm sign up" link to
`{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email`.

## CURRENT BLOCKER: sign-in (email magic link) — nobody has completed it end-to-end
History: (1) Supabase built-in email rate limit (2/h) → fixed with Resend SMTP. (2) Default PKCE link only works in the
same browser → switched templates to token_hash. (3) Email link scanners (Gmail/Outlook) opened the link first and used
the one-time token → added `/auth/continue` page (token only used on button tap). (4) A login succeeded once
(Supabase auth log) but no `profiles` row was created and the user saw "expired" (likely double tap) → Continue is now
single-tap, reused links fall back to `getUser()`, and `ensureProfile` logs errors. (5) Users saw "We couldn't find
your membership" — `active_members` is EMPTY (sync not set up) and `ALLOW_NON_MEMBERS` was compared strictly →
now parsed forgivingly via `allowNonMembers()` in `lib/env.ts`.
Known constraints: Resend `onboarding@resend.dev` ONLY delivers to the Resend account owner's email until the gym's
domain is verified in Resend. One staff profile exists (member #1, role `staff`) — created by hand in SQL.

**Recommended simplification (do this):** replace the magic LINK with a 6-digit email CODE (Supabase OTP):
`signInWithOtp({ email })` then the user types the code and we call `verifyOtp({ email, token, type: "email" })`, then
`ensureProfile()`. Codes don't break with link scanners, other browsers, or double taps. Change the two Supabase email
templates to show `{{ .Token }}`. Keep `/auth/confirm` + `/auth/continue` working for old emails or delete them.
Add tests for the sign-in decision logic (none exist for the auth flow yet).

## Verify sign-in is fixed
1. `/join/sign-in` with the Resend owner's email → code arrives → enter → lands on `/join/commit`.
2. Supabase SQL: `select count(*) from profiles;` increases. 3. `/login` with same email works → `/home` (staff).
Check Vercel → Logs for lines starting `[sign-in]`, `[login]`, `[confirm]`, `[profile]`.

## After sign-in works (in order)
1. Click-test every series + admin screen on the live site (log a session, tick a mission, holiday mode, leaderboard,
   approve Yard session, add mission, supplier CSV).
2. Launch blockers: verify the gym domain in Resend + change sender; Square sandbox keys + webhook subscription
   (`payment.created/updated`, `refund.created/updated` → `/api/square/webhook`) then production keys; delete
   `SERIES_PREVIEW_WEEK`; optionally connect the TYG Dashboard member sync (Apps Script in `docs/SETUP-SUPABASE-VERCEL.md`).
3. Before launch: set the real privacy contact in `app/privacy/page.tsx` (`CONTACT`).

## Working rules (learned the hard way)
- The user edits in VS Code on Windows and pushes with `git add . && git commit -m "..." && git push`. Run
  `npm test && npm run build` before every push — a failed Vercel build keeps the old version live silently.
- Keep changes small; the user wants low credit usage and plain-English explanations (not a developer).
- Never put secrets in chat, code, or commits. The user pastes keys into Vercel/Supabase themselves.
- Making a profile staff: `update profiles set role='staff' where email='…';` (Supabase SQL editor).
- Suggested skills: superpowers:systematic-debugging (for the sign-in bug), superpowers:test-driven-development,
  design-and-build-skills:security-and-hardening (auth), superpowers:verification-before-completion.
