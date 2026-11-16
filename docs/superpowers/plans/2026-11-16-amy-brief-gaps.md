# Plan: close the gaps between Amy's brief and the app (16 Nov 2026)

Spec (binding): Amy's "Rewards & Perks" brief, her "Weekly Missions" sheet and the 8-phone mockup, as summarised in
`docs/superpowers/specs/2026-11-11-tyga-summer-series-design.md` plus the memory notes. The owner is a non-developer; copy must be plain
Australian English. Project root: the folder containing this file's `docs/` directory.

## Global Constraints
- Next.js 16 App Router + React 19 + TypeScript + Supabase. Next 16 has breaking changes: read `node_modules/next/dist/docs/` before using any API you have not used in this repo. `proxy.ts` replaces middleware. Server actions live in files starting with `"use server"`.
- Staff-only pages and actions MUST check staff (`isStaff()` from `lib/session.ts`, or the `app/admin/layout.tsx` guard) and write with `createAdminClient()` (`lib/supabase/admin.ts`). Members only ever read their own rows.
- Never read, print or commit `.env*` files or any secret. No new npm dependencies.
- Reuse existing styling: sand theme classes in `app/globals.css` (`.sheet`, `.srow`, `.disp`, `.card`, `.mini`, `.btn`, `.notice`, `.reward-facts`, `.admin-page`, `.desk`, `.tablewrap`). Append new CSS at the end of `globals.css`; do not restyle existing classes.
- Tests: add vitest tests for new pure logic. Before every commit `npx tsc --noEmit`, `npx vitest run` and `npm run build` must pass. Currently 95 tests pass.
- Commit locally on the current branch with a clear message ending with the line `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do NOT push.
- Database changes go in a NEW migration file under `supabase/migrations/` (the owner runs it in the Supabase SQL editor). Code must not crash if the new table/column does not exist yet: handle the error, log with `console.error`, and show a plain message.
- Windows + Git Bash: avoid long shell heredocs with quotes; create files with your file-write tool.

### Task 1: Staff access by email, Orders page, admin shortcuts
The owner is signed in as `brylle@supersidekick.co` but sees no admin because their profile role is `member`. Fix without needing SQL.
1. Create `lib/staff.ts` exporting `staffEmails(env?: string)` (built-in list `["brylle@supersidekick.co"]` plus a comma-separated `STAFF_EMAILS` env var, lowercased, trimmed) and `isStaffEmail(email: string, env?: string): boolean` (case-insensitive). Add `tests/staff.test.ts`.
2. In `lib/session.ts`, make `getCurrentMember()` return the profile with `role: "staff"` when `isStaffEmail(profile.email)` even if the database role is `member` (in memory only; do not write to the database). All existing `role === "staff"` checks then work. Sign-in already proves email ownership by a one-time code.
3. New staff page `app/admin/orders/page.tsx` ("Orders"): who ordered singlets. One row per registration joined with profile: full name, email, mobile, fit (women/men), colour, size, payment status (unpaid/pending/paid/refunded), amount in dollars, paid date (Albury time, `en-AU`). Filter links `?status=paid` (default shows paid + pending) / `?status=all`. Top summary: paid count, pending count, revenue total, and counts per size. Include a "Download supplier CSV" link to the existing `/admin/singlets.csv`. Use `fetchAll` from `lib/paging.ts` to avoid the 1,000-row limit. Names and emails are staff-only here.
4. Add "Orders" to `components/AdminNav.tsx` (order: Overview, Orders, Members, Leaderboard, Rewards, Member app).
5. On `app/admin/page.tsx` add a "Quick links" card row at the top of the desk grid linking to Orders, Members, Leaderboard and Rewards, each with a one-line description.
Acceptance: `isStaffEmail("Brylle@SuperSidekick.co")` is true; a non-listed email is false; the Orders page renders for staff and redirects non-staff via the existing admin layout; tsc/tests/build green.

### Task 2: Recipe photos
Recipes (`lib/nutrition.ts`, codes B1 B2 B3 L1 L2 L3 D1 D2 D3 S1) show coloured icon tiles. Photos will be provided as files `public/img/recipes/<code>.webp` (square, ~800px).
1. Create `lib/recipe-photos.ts` exporting `RECIPE_PHOTOS: ReadonlySet<string>` of codes that have a photo, and `recipePhoto(code): string | null` returning `/img/recipes/<code>.webp` or null. Initialise the set from the files that currently exist in `public/img/recipes/` (it may be empty or partly filled; the owner/controller adds more later by editing this one file).
2. `app/nutrition/page.tsx` tiles: when a photo exists render it (an `<img>` with width/height, `loading="lazy"`, meaningful `alt` = recipe title) inside `.rart`, keeping the code chip; otherwise keep the existing icon tile.
3. `app/nutrition/[code]/page.tsx`: show the photo as a 16:9 `object-fit: cover` hero when it exists.
4. Add a test for `recipePhoto`.
Acceptance: pages still build and render with zero photos and with some photos; no layout shift (explicit dimensions/aspect ratio).

### Task 3: Rewards admin upgrades: image upload, redemptions, announcements
Amy's brief: admins upload logos/promotional images, track redemptions, and send reward announcements.
1. Create migration `supabase/migrations/0007_announcements_proofs.sql` containing: table `announcements (id bigint identity pk, title text not null check (char_length(title) <= 80), body text not null check (char_length(body) <= 300), created_at timestamptz default now())` with RLS enabled, no policies, `revoke all from anon, authenticated`, `grant all to service_role`; and `alter table mission_completions add column if not exists proof_path text;` (used by Task 4).
2. Reward image upload: in `app/admin/rewards/page.tsx` edit form add a file input (png/jpg/webp, max 2 MB). In `app/admin/rewards/actions.ts` `saveReward`: if a file is present validate type + size server-side, upload with `createAdminClient().storage.from("rewards")` to a random filename, creating the public bucket `rewards` on first use if missing (`createBucket("rewards", { public: true })`), then store the public URL in `image_url`. The existing https URL field stays as a fallback. The form needs `encType="multipart/form-data"` (server actions handle this natively).
3. Redemptions: on each reward card in the admin page show "Entries: N" (draw), "Redeemed: N" (from `reward_redemptions`), and a collapsible list of who redeemed with date.
4. Announcements: staff section on `/admin/rewards` to post an announcement (title + body) and list recent ones with a Delete button (actions `postAnnouncement`, `deleteAnnouncement`, staff-guarded, validated lengths). Member `app/notifications/page.tsx` shows the latest 5 announcements (newest first, flagged "NEW" when under 7 days old) above the generated items; Home bell dot (`app/home/page.tsx`) also shows when an announcement is under 7 days old. Add a small `lib/announcements.ts` with a pure `isFresh(createdAt, now)` and tests.
Acceptance: uploading an image on a reward shows it on the member Perks card; announcements appear for members; everything degrades with a plain message if migration 0007 is not run; tsc/tests/build green.

### Task 4: Mission proof photo + staff verification
Amy's sheet: points are for missions "completed and verified"; some missions say "take a photo or screenshot and upload it in the app".
1. `app/missions/[id]/page.tsx`: add an optional "Add a photo or screenshot" file input (png/jpg/webp, max 4 MB) to the "I've done it" form (`encType` multipart). Missions whose title is "Fuel It", "Wear the Singlet", "Run It", "Hello, 2027!", "Squad Session" show the hint text that a photo helps staff verify; no mission is blocked without a photo.
2. `completeMission` in `app/series/actions.ts`: if a file is attached, validate type/size server-side, upload to a PRIVATE bucket `proofs` (create on first use, `public: false`) at `<profile_id>/<mission_id>-<random>.<ext>`, and save `proof_path` on the `mission_completions` row. If the `proof_path` column does not exist yet, fall back to completing without the photo and log the error.
3. New staff page `app/admin/missions/page.tsx` ("Mission check"): the latest 100 completions (newest first) with member full name, mission title, week, time, points, a "View photo" link (a 10-minute signed URL created server-side, only when `proof_path` exists) and a "Revoke" button (staff action `revokeCompletion` deleting that row and its stored file, then revalidate) so a wrong or fake completion stops counting. Add "Missions" to `AdminNav`.
4. Pure helper + tests in `lib/proof.ts`: `proofExtension(mime)` returns "png"|"jpg"|"webp"|null and `validateProof(file: {type:string,size:number}, maxBytes)` returns an error string or null.
Acceptance: completing with and without a photo works; revoke removes the points (the completion row is gone); tsc/tests/build green.

### Task 5: UI/UX and performance pass
Apply the ui-ux-pro-max pre-delivery rules and cheap Vercel performance wins (no Vercel metrics are available).
1. Touch targets: every tappable control (`.mini`, `.chip`, `.tabs a`, `.srow`, `.hbtn`, `.ptag.go`, the weekly-strip links, buttons) at least 44x44px hit area; 8px+ spacing between adjacent targets. Adjust CSS only.
2. Focus: add a visible `:focus-visible` outline (2px, high contrast on both dark and sand themes) for links, buttons, inputs, summary elements; never remove outlines.
3. Motion: add `@media (prefers-reduced-motion: reduce)` disabling transitions/animations (including `.switch`).
4. Accessibility: audit `app/**/*.tsx` and `components/*.tsx` for icon-only buttons/links without `aria-label`, images without `alt`, form inputs without labels, and fix them. Check colour contrast of `.tabs a` (#b9a892 on #1b1511), `.mute` on sand, `.ptag` on cream against 4.5:1 and adjust colours where they fail.
5. Performance: in `next.config.ts` add `headers()` entries giving `/img/*` and `/icons/*` `Cache-Control: public, max-age=31536000, immutable` (keep all existing security headers); make sure large images have explicit `width`/`height`; confirm `app/layout.tsx` font link uses `display=swap`. Do not add dependencies.
Acceptance: build passes; list in your report each fix made and anything you chose not to change and why.
