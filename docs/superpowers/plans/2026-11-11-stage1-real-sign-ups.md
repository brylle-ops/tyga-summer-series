# Stage 1 — Real Sign-ups Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the join flow into a real one — members sign in by email link (if they're on the gym's member list), save their goal and singlet, pay $15 through Square, and see their ticket once Square confirms; staff see real registrations, payments and the singlet order.

**Architecture:** Supabase (Postgres + Auth magic link + RLS) behind Next.js server actions and route handlers. The browser only ever holds the publishable key; anything privileged (member-list lookup, webhook writes, admin reads) uses the secret key on the server. Business rules live in small pure modules under `lib/` with Vitest tests; pages and actions are thin wrappers around them.

**Tech Stack:** Next.js 16.4.6 (App Router), React 19.3.1, TypeScript, `@supabase/supabase-js`, `@supabase/ssr`, `papaparse`, Vitest, `@electric-sql/pglite` (RLS tests only), Square Checkout API + webhooks.

**Spec:** `docs/superpowers/specs/2026-11-11-tyga-summer-series-design.md` (§2 Architecture, §3 Data model, §4 Stage 1, §7 Error handling, §8 Privacy, §9 Testing)

> **Screen update (11 Nov, after this plan was written):** the app went back to Design v3's flow. Where a task
> says `app/join/details`, use `app/join/sign-in` (email form) and `app/join/commit` (goal, `saveGoal`); where it
> says `app/join/size` / `SizeForm`, size is chosen on `app/join/singlet` inside `components/SingletPicker.tsx`
> (one `saveSinglet` action saves fit, colour and size). Fit values in the UI are `womens`/`mens`
> (`components/Runner.tsx`); map them to the database's `women`/`men` in `lib/singlet.ts`. The goal copy
> and all rules below are unchanged.

## Global Constraints

- Price: **$15.00 AUD = 1500 cents**; Square `Square-Version: 2026-09-16`; sandbox base `https://connect.squareupsandbox.com`, production `https://connect.squareup.com` (already in `lib/square.ts`).
- Singlet values: fit `women` | `men`; colour `cream` | `charcoal`; size `XS` `S` `M` `L` `XL` `2XL` `3XL`. Display: "Women's" / "Men's", "Cream" / "Charcoal wash".
- Singlet + sign-up cutoff: changes allowed until **30 Nov 2026 23:59 AEDT**; locked from `2026-12-01T00:00:00+11:00`, enforced server-side.
- Goals (exact copy): "Maintain my fitness", "Stay consistent over Christmas", "Keep my strength", "Start February strong".
- Non-member copy (exact): "We couldn't find your membership — check with the front desk".
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SQUARE_ENVIRONMENT`, `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SQUARE_WEBHOOK_URL`, `NEXT_PUBLIC_SITE_URL`. Secret ones never get a `NEXT_PUBLIC_` prefix and are only imported from server files.
- Emails are compared trimmed and lower-cased everywhere.
- Leave the stage 2 screens (home, log, missions, perks, ranks, progress, resources, holiday) on `lib/mock-data.ts`; don't change their look.
- Every user-facing page keeps the v4 look (existing classes in `app/globals.css`); new UI reuses `.btn`, `.field`, `.notice`, `.paper`, `.chip`, `.seg`, `.size-table`.

## Review Focus

1. **Email typed differently from the member list** ("Jess.Smith@Gmail.com " vs `jess.smith@gmail.com`) must still match → pinned in Task 3 (`normaliseEmail`) and Task 4 (`checkMembership`).
2. **Square webhook delivered twice, late, or for an order we don't know** must not double-count, crash, or 500 → pinned in Task 7 (`handleSquareWebhook` duplicate/unknown tests).
3. **Member opens checkout twice and pays both** — first payment stands, second is recorded as a duplicate for staff to refund, registration not overwritten → pinned in Task 7.
4. **Singlet change at the cutoff boundary** (23:59:59 AEDT allowed, 00:00:00 1 Dec blocked, server clock in UTC) → pinned in Task 5 (`isSingletLocked`).
5. **Real-world member CSV** (BOM, Windows line endings, quoted names with commas, blank/invalid emails, duplicate emails, "E-mail Address" headers) → pinned in Task 3 (`parseMemberCsv`).

---

### Task 1: Test runner, Supabase clients and env

**Files:**
- Modify: `package.json` (deps + `"test": "vitest run"`), `.env.example`, `README.md` (setup section)
- Create: `vitest.config.ts`, `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `lib/env.ts`
- Create: `tests/square.test.ts` (port of the ad-hoc checks already run for `lib/square.ts`)

**Interfaces:**
- Produces: `createClient(): Promise<SupabaseClient>` (server, cookie session, publishable key) in `lib/supabase/server.ts`; `createAdminClient(): SupabaseClient` (secret key, no session) in `lib/supabase/admin.ts`; `requireEnv(name: string): string` in `lib/env.ts` (throws `Error("<name> is not set")`).

- [ ] **Step 1:** `npm i @supabase/supabase-js @supabase/ssr papaparse` and `npm i -D vitest @types/papaparse @electric-sql/pglite`; add `"test": "vitest run"`.
- [ ] **Step 2: Write `tests/square.test.ts`** with the existing checks: body for `buildPaymentLinkBody({note:"Women's M · Cream", email:"a@b.com"}, "LOC1", "https://tyga.example", "k")` has `quick_pay.price_money = {amount:1500,currency:"AUD"}`, `checkout_options.redirect_url = "https://tyga.example/join/confirmed"`, `pre_populated_data.buyer_email = "a@b.com"`; `createSummerSeriesCheckout` hits the sandbox URL by default and production when `SQUARE_ENVIRONMENT=production`; a 401 with `errors[0].code="UNAUTHORIZED"` rejects with `/401 — UNAUTHORIZED/`; missing token rejects with `SquareConfigError`. Mock `fetch` with `vi.stubGlobal`.
- [ ] **Step 3:** Run `npm test` → PASS (code already exists; this guards it).
- [ ] **Step 4: Implement the two Supabase factories** — `server.ts` uses `createServerClient` from `@supabase/ssr` with `cookies()` `getAll`/`setAll` (wrap `setAll` in try/catch for Server Components); `admin.ts` uses `createClient` from supabase-js with `{ auth: { persistSession: false, autoRefreshToken: false } }`. Both read keys through `requireEnv`. Add the new vars to `.env.example` with one-line comments, and a "Set up Supabase" section to the README (create project, copy URL + publishable + secret keys, run the migration SQL in the SQL editor, Auth → URL configuration: Site URL + redirect `…/auth/confirm`, magic-link email template link `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`).
- [ ] **Step 5:** `npm run build` → compiles. Commit `chore: add vitest, supabase clients and env`.

### Task 2: Database schema and Row Level Security

**Files:**
- Create: `supabase/migrations/0001_stage1.sql`, `tests/db/rls.test.ts`, `tests/db/harness.ts`

**Interfaces:**
- Produces tables (spec §3, stage 1 subset):
  - `active_members(email text primary key check (email = lower(trim(email))), first_name text, last_name text, mobile text, uploaded_at timestamptz default now())`
  - `profiles(id uuid primary key references auth.users on delete cascade, email text not null unique, first_name text, last_name text, mobile text, role text not null default 'member' check (role in ('member','staff')), member_no int unique default nextval('member_no_seq'), goal text, created_at timestamptz default now(), last_seen_at timestamptz)`
  - `registrations(profile_id uuid primary key references profiles on delete cascade, fit text check (fit in ('women','men')), colour text check (colour in ('cream','charcoal')), size text check (size in ('XS','S','M','L','XL','2XL','3XL')), terms_accepted_at timestamptz, payment_status text not null default 'unpaid' check (payment_status in ('unpaid','pending','paid','refunded')), square_order_id text unique, square_payment_id text unique, paid_at timestamptz, amount_cents int, updated_at timestamptz default now())`
  - `square_payments(payment_id text primary key, order_id text, status text, amount_cents int, duplicate boolean default false, received_at timestamptz default now())` — every payment Square reports, so staff can spot double payments.
  - `signin_attempts(id bigint generated always as identity primary key, email text, found boolean, created_at timestamptz default now())`
  - sequence `member_no_seq start 1`; function `is_staff() returns boolean` (`security definer`, `select role='staff' from profiles where id = auth.uid()`).
- RLS on every table. Policies: `profiles` select/update own row (update cannot change `role`, `member_no`, `email` — use a column-level `grant update (goal, last_seen_at)`); staff select all. `registrations` select own; insert/update own **only** columns `fit, colour, size, terms_accepted_at` (column grants) — payment columns are written by the secret key only; staff select all. `active_members`, `square_payments`, `signin_attempts`: staff select only, no member access.

- [ ] **Step 1: Write `tests/db/harness.ts`** — boots PGlite, creates roles `anon`/`authenticated`, schema `auth` with table `auth.users(id uuid primary key)` and `auth.uid()` returning `current_setting('request.jwt.claim.sub', true)::uuid`, runs the migration file; exports `asUser(db, id, sql, params)` that does `set role authenticated; set request.jwt.claim.sub = id` around the query, and `asService(db, sql)` as the owner.
- [ ] **Step 2: Write `tests/db/rls.test.ts`**: (a) member A sees own profile + registration, sees 0 rows of member B; (b) member A cannot `update registrations set payment_status='paid'` (permission error) and cannot update `profiles.role`; (c) member cannot select `active_members` or `square_payments` (0 rows / denied); (d) staff user (role='staff') selects all registrations; (e) `member_no` auto-increments 1, 2 for two inserted profiles; (f) inserting `active_members` email `'Jess@X.com'` fails the lower-case check.
- [ ] **Step 3:** `npm test -- tests/db` → FAIL (no migration).
- [ ] **Step 4: Write `0001_stage1.sql`** with the tables, sequence, `is_staff()`, grants and policies above.
- [ ] **Step 5:** `npm test -- tests/db` → PASS. Commit `feat(db): stage 1 schema with RLS`.

### Task 3: Member list upload

**Files:**
- Create: `lib/members.ts`, `tests/members.test.ts`, `app/admin/members/actions.ts`
- Modify: `app/admin/page.tsx` (upload form in the header: file input + "Upload member list" button, result notice "Uploaded 312 members · 4 rows skipped (no email)")

**Interfaces:**
- Produces: `normaliseEmail(raw: string): string | null` (trim + lower; `null` if not a plausible email: one `@`, a dot after it, no spaces); `type MemberRow = { email: string; first_name: string; last_name: string; mobile: string }`; `parseMemberCsv(text: string): { rows: MemberRow[]; skipped: number; error?: string }`; server action `uploadMemberList(formData: FormData): Promise<{ ok: boolean; message: string }>` (staff-only; replaces `active_members` in one transaction via a `replace_active_members(rows jsonb)` SQL function added to the migration in this task).

- [ ] **Step 1: Write `tests/members.test.ts`:** `normaliseEmail("  Jess.Smith@Gmail.COM ")` → `"jess.smith@gmail.com"`; `normaliseEmail("not an email")` → `null`. `parseMemberCsv` on: a file starting with a BOM and `\r\n` line endings; headers `"First Name","Last Name","E-mail Address","Mobile Phone"` (header match is case-insensitive and ignores spaces, hyphens, underscores; accepts `email`/`emailaddress`/`e-mail address`, `firstname`/`first name`, `lastname`/`last name`/`surname`, `mobile`/`mobilephone`/`phone`/`cellphone`); a quoted name `"Smith, Jr"`; a blank email row and an invalid email row (→ `skipped: 2`); the same email twice in different case (→ one row, last wins). A file with no email column → `{ rows: [], skipped: 0, error: "No email column found" }`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Implement `lib/members.ts`** with papaparse (`header: true, skipEmptyLines: true`, strip BOM first).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5: Implement `uploadMemberList`** — check `is_staff` via the session client, read the file (`formData.get("file") as File`), `parseMemberCsv`, refuse when `rows.length === 0`, call `rpc("replace_active_members", { rows })` with the admin client; `revalidatePath("/admin")`. Add `replace_active_members` (security definer, `delete from active_members; insert … select from jsonb_to_recordset`) to the migration and an RLS-harness test that it replaces the list atomically.
- [ ] **Step 6:** `npm test && npm run build` → PASS. Commit `feat: upload the gym's member list`.

### Task 4: Email sign-in with membership check

**Files:**
- Create: `lib/signin.ts`, `tests/signin.test.ts`, `app/join/details/actions.ts`, `app/auth/confirm/route.ts`, `app/join/check-email/page.tsx`, `lib/session.ts`
- Modify: `app/join/details/page.tsx`

**Interfaces:**
- Consumes: `normaliseEmail` (Task 3), `createClient`/`createAdminClient` (Task 1).
- Produces: `checkMembership(email: string, lookup: (email: string) => Promise<MemberRow | null>): Promise<{ status: "invalid" } | { status: "not_member"; email: string } | { status: "member"; member: MemberRow }>` in `lib/signin.ts`; server action `requestSignInLink(prev: SignInState, formData: FormData): Promise<SignInState>` where `type SignInState = { message?: string }`; `getCurrentMember(): Promise<{ profile: Profile; registration: Registration | null } | null>` in `lib/session.ts` (types exported from there, matching the Task 2 columns); `ensureProfile(userId: string, email: string): Promise<void>` in `lib/session.ts` (admin client: creates the profile from `active_members` if missing — members have no insert policy on `profiles` — and sets `last_seen_at`).

- [ ] **Step 1: Write `tests/signin.test.ts`:** `checkMembership(" JESS@x.com", lookup)` calls `lookup("jess@x.com")` and returns `member`; unknown → `not_member`; `"nope"` → `invalid` without calling lookup.
- [ ] **Step 2:** Run → FAIL. **Step 3:** implement. **Step 4:** Run → PASS.
- [ ] **Step 5: Implement `requestSignInLink`** — `checkMembership` with a lookup on the admin client; log every attempt to `signin_attempts`; `invalid` → "Please enter a valid email."; `not_member` → the exact non-member copy; `member` → `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: \`${NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/join/details\`, shouldCreateUser: true } })`, on error "We couldn't send the link just now — please try again in a minute.", on success `redirect("/join/check-email")`.
- [ ] **Step 6: Implement `/auth/confirm`** — read `token_hash`, `type`, `next` (only same-site paths starting with `/`, default `/join/details`); `verifyOtp({ type, token_hash })`; on success `ensureProfile` then redirect to `next`; on failure redirect to `/join/check-email?expired=1`.
- [ ] **Step 7: Check-email screen** — v4 look: "Check your email", "We sent a sign-in link to your inbox. It works once and expires in 1 hour.", with `?expired=1` showing a `.notice` "That link has expired or was already used — enter your email again." and a "Back" link to `/join/details`.
- [ ] **Step 8: Details page** becomes: signed out → email form (`useActionState(requestSignInLink)`, message shown in `.notice`); signed in → "Signed in as jess@…" plus the commitment + goal form (Task 5's `saveGoal`). Welcome "Skip" goes to `/home` only when signed in, otherwise `/join/details`.
- [ ] **Step 9:** `npm test && npm run build` → PASS. Commit `feat: email link sign-in with member check`.

### Task 5: Saving goal and singlet choices

**Files:**
- Create: `lib/singlet.ts`, `tests/singlet.test.ts`, `app/join/actions.ts`, `components/SingletForm.tsx`, `components/SizeForm.tsx`
- Modify: `app/join/details/page.tsx`, `app/join/singlet/page.tsx`, `app/join/size/page.tsx`

**Interfaces:**
- Produces: `type Fit = "women" | "men"; type Colour = "cream" | "charcoal"; type Size = "XS"|"S"|"M"|"L"|"XL"|"2XL"|"3XL"`; `SINGLET_LOCK_AT = new Date("2026-12-01T00:00:00+11:00")`; `isSingletLocked(now: Date): boolean`; `singletLabel(fit: Fit, colour: Colour, size?: Size): string` → `"Women's M · Cream"` / `"Men's XL · Charcoal wash"` (no size → `"Women's · Cream"`); `parseSingletInput(form: FormData): { fit: Fit; colour: Colour } | null`; `isGoal(v: string): boolean`. Server actions in `app/join/actions.ts`: `saveGoal(formData)`, `saveSinglet(formData)`, `saveSize(formData)` — each requires a session (else redirect `/join/details`), refuses after `isSingletLocked(new Date())` with redirect `?locked=1`, upserts the caller's own `registrations`/`profiles` row with the session client (RLS-checked), then redirects to the next step.

- [ ] **Step 1: Write `tests/singlet.test.ts`:** `isSingletLocked(new Date("2026-11-30T12:59:59Z"))` → false (23:59:59 AEDT); `isSingletLocked(new Date("2026-11-30T13:00:00Z"))` → true; labels as above; `parseSingletInput` rejects `fit=kids` and missing colour; `isGoal` true only for the four exact goals.
- [ ] **Step 2:** Run → FAIL. **Step 3:** implement `lib/singlet.ts`. **Step 4:** Run → PASS.
- [ ] **Step 5: Forms** — `SingletForm` (client) keeps colour/fit in state using the existing `.seg` and radios as real `<input type="radio">` elements styled the same, submitting to `saveSinglet`; `SizeForm` makes each `.size-table` row a radio (whole row clickable, selected row `.on`), submitting to `saveSize`. Pre-select from the saved registration (default Cream / Women's / no size; "Next" disabled until a size is chosen). Details goal chips become radios submitting to `saveGoal`. When locked, pages show a `.notice` "Singlet choices closed on 30 Nov" and disable the forms.
- [ ] **Step 6:** `npm test && npm run build` → PASS. Commit `feat: save goal and singlet choices`.

### Task 6: Checkout with the member's real details

**Files:**
- Modify: `app/join/checkout/actions.ts`, `app/join/checkout/page.tsx`, `lib/square.ts`
- Create: `lib/checkout.ts`, `tests/checkout.test.ts`

**Interfaces:**
- Consumes: `getCurrentMember` (Task 4), `singletLabel` (Task 5), `createSummerSeriesCheckout` (exists).
- Produces: `checkoutBlocker(reg: Registration | null, now: Date): "no_singlet" | "no_size" | "paid" | "closed" | null`; `paymentNote(profile: Profile, reg: Registration): string` → `"#148 Jess Smith · Women's M · Cream"`.
- Spec deviation (deliberate): the spec says `reference_id = registration id`, but Quick Pay links have no reference field. We match on the Square **order id** returned by `createSummerSeriesCheckout` (stored in `registrations.square_order_id`, unique).

- [ ] **Step 1: Write `tests/checkout.test.ts`:** blockers for missing fit/colour, missing size, already `paid`, after lock; `null` for a complete unpaid or pending registration; note format exactly as above.
- [ ] **Step 2:** FAIL → **Step 3:** implement → **Step 4:** PASS.
- [ ] **Step 5: `startCheckout`** — signed-out → `/join/details`; blocker → redirect back to the right step (`/join/singlet`, `/join/size`, `/join/confirmed`, or `?error=closed` with copy "Sign-ups closed on 30 Nov"); require the terms checkbox (`formData.get("terms") === "on"`, else `?error=terms` "Please accept the Summer Series terms"); save `terms_accepted_at`; create the checkout with `note: paymentNote(...)`, `email: profile.email`; with the **admin** client set `square_order_id = orderId, payment_status = 'pending'` (only if not `paid`); redirect to Square. The page shows the member's real singlet and a real, unticked terms checkbox.
- [ ] **Step 6:** `npm test && npm run build` → PASS. Commit `feat: checkout uses the member's saved singlet`.

### Task 7: Square webhook marks registrations paid

**Files:**
- Create: `lib/square-webhook.ts`, `tests/square-webhook.test.ts`, `app/api/square/webhook/route.ts`

**Interfaces:**
- Produces: `verifySquareSignature(rawBody: string, signature: string | null, notificationUrl: string, signatureKey: string): boolean` — base64 HMAC-SHA256 of `notificationUrl + rawBody`, compared with `crypto.timingSafeEqual` (false on missing/length mismatch); `type PaymentEvent = { kind: "payment"; paymentId: string; orderId: string; status: string; amountCents: number } | { kind: "refund"; paymentId: string; orderId: string; status: string }`; `parseSquareEvent(body: unknown): PaymentEvent | null` (`payment.created`/`payment.updated` → `data.object.payment.{id, order_id, status, amount_money.amount}`; `refund.created`/`refund.updated` → `data.object.refund.{payment_id, order_id, status}`; anything else → `null`); `handleSquareWebhook(rawBody: string, signature: string | null, deps: { store: WebhookStore; key: string; url: string }): Promise<{ status: number }>` with `interface WebhookStore { findRegistrationByOrder(orderId): Promise<{ profile_id: string; payment_status: string; square_payment_id: string | null } | null>; markPaid(profileId, paymentId, amountCents): Promise<void>; markRefunded(profileId): Promise<void>; recordPayment(p: { paymentId; orderId; status; amountCents; duplicate: boolean }): Promise<void> }`. The route builds the store on the admin client and returns `new Response(null, { status })`.
- Rules: bad signature → 401; unparseable/irrelevant event → 200 (ignored); payment `COMPLETED` for a known order → `markPaid` unless already paid with the **same** payment id (no-op) — if already paid with a **different** payment id, `recordPayment({…, duplicate: true})` and don't touch the registration; unknown order → `recordPayment` and 200; refund `COMPLETED` whose `paymentId` equals the registration's `square_payment_id` → `markRefunded`. Always `recordPayment` for payment events.

- [ ] **Step 1: Write `tests/square-webhook.test.ts`** using an in-memory `WebhookStore` and a signature generated in the test with Node `crypto`: valid signature accepted / tampered body → 401 / missing header → 401; `COMPLETED` payment marks paid with `amount_cents 1500`; same event twice → `markPaid` called once; second different payment on a paid order → registration unchanged, duplicate recorded; `APPROVED`/`PENDING` status → not paid; unknown order → 200, recorded; refund `COMPLETED` → refunded; `order.updated` event → 200 ignored.
- [ ] **Step 2:** FAIL → **Step 3:** implement lib + route (read the raw body with `await req.text()` before parsing) → **Step 4:** PASS.
- [ ] **Step 5:** `npm run build`. Commit `feat: square webhook confirms payments`.

### Task 8: "You're in" shows the real ticket

**Files:**
- Modify: `app/join/confirmed/page.tsx`
- Create: `components/AutoRefresh.tsx`

**Interfaces:**
- Consumes: `getCurrentMember` (Task 4), `singletLabel` (Task 5).
- Produces: `<AutoRefresh seconds={3} max={20} />` — client component calling `router.refresh()` every `seconds`; after `max` tries it stops and shows: "Still confirming with Square. If you've paid, you can close this page — your ticket will be here next time you open the app."
- Spec deviation (deliberate): the spec also asks the app to re-check the order with Square on return. The webhook plus auto-refresh covers this; a direct re-check is left out because Square's sandbox panel doesn't reproduce real order states, so it couldn't be tested before launch. Revisit if live webhooks prove slow.

- [ ] **Step 1:** Signed out → redirect `/join/details`. `paid` → the existing ticket with real name, `#member_no`, singlet label and colour, countdown computed to `2026-12-07T00:00:00+11:00` (days/hrs/min from now, server-rendered). `pending` → "Confirming your payment…" with `<AutoRefresh />`. `unpaid` → link back to checkout. `refunded` → "Your registration was refunded" notice.
- [ ] **Step 2:** `npm run build`; manual check with a sandbox Test Payment (see Task 10). Commit `feat: real member ticket after payment`.

### Task 9: Admin with real stage 1 data

**Files:**
- Create: `lib/admin-report.ts`, `tests/admin-report.test.ts`, `app/admin/singlets.csv/route.ts`, `app/admin/layout.tsx`
- Modify: `app/admin/page.tsx`

**Interfaces:**
- Produces: `buildSingletGrid(regs: Pick<Registration,"fit"|"colour"|"size"|"payment_status">[]): { label: string; counts: Record<Size, number>; total: number }[]` (rows in order Women's · Cream, Women's · Charcoal wash, Men's · Cream, Men's · Charcoal wash; **only `paid`**); `toSupplierCsv(grid): string` — header `Fit,Colour,XS,S,M,L,XL,2XL,3XL,Total` and a final `Total` row, `\r\n` line endings; `paymentSummary(regs): { paid: number; pendingOrUnpaid: number; collectedCents: number }`.
- `app/admin/layout.tsx` redirects non-staff to `/home` and signed-out users to `/join/details`.

- [ ] **Step 1: Write `tests/admin-report.test.ts`:** grid counts only paid rows (a `pending` and a `refunded` registration are excluded); totals per row; CSV exact text for a 2-registration fixture; `collectedCents` sums `amount_cents` of paid rows.
- [ ] **Step 2:** FAIL → **Step 3:** implement → **Step 4:** PASS.
- [ ] **Step 5: Admin page** — keep the v4 layout; replace mock KPI "Registered & paid" (count + % of `active_members`), the Payments table (name, mobile, status, date, amount; "started, not paid" = `pending`/`unpaid` with a size chosen), the Singlet order grid, the duplicate payments from `square_payments.duplicate` as a `.tag` "Paid twice — refund in Square". Stage 2 sections (content calendar, members needing a chat, check-ins) stay on mock data, labelled with a small "Example data until stage 2" tag. "Supplier CSV" links to `/admin/singlets.csv` (staff-checked, `Content-Disposition: attachment; filename="tyga-singlets.csv"`).
- [ ] **Step 6:** `npm test && npm run build` → PASS. Commit `feat: admin shows real registrations, payments and singlet order`.

### Task 10: Preview deployment and end-to-end check

**Files:**
- Modify: `README.md` ("Deploy a preview" section)

- [ ] **Step 1: README checklist** (written for Brylle/Amy, no secrets in it): create the Supabase project → run `supabase/migrations/0001_stage1.sql` in the SQL editor → set Auth URL configuration and the magic-link template → mark Amy's and Sarah's profiles `role = 'staff'` after their first sign-in → push the project to GitHub and import it in Vercel → add all env vars in Vercel (sandbox Square values) → in Square Developer Dashboard add a **Sandbox** webhook subscription to `https://<vercel-url>/api/square/webhook` for `payment.created`, `payment.updated`, `refund.created`, `refund.updated`, copy its signature key into `SQUARE_WEBHOOK_SIGNATURE_KEY` and the exact URL into `SQUARE_WEBHOOK_URL` → redeploy.
- [ ] **Step 2: End-to-end run on the preview** (record results in the README "Last checked" line): upload a 3-row test CSV as staff → sign in as a listed email (link arrives, lands on Details) → a non-listed email shows the non-member copy → choose goal, Charcoal wash / Men's / L → checkout note in Square reads `#<n> <name> · Men's L · Charcoal wash` → sandbox **Test Payment** → "You're in" turns into the ticket within ~10 s → admin shows the payment and the grid count → supplier CSV downloads → a sandbox refund removes it from the grid.
- [ ] **Step 3:** Commit `docs: preview deployment checklist`; send the new zip.
