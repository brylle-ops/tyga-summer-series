# TYGA Summer Series app — design spec

Date: 11 Nov 2026 · Status: approved direction; 11 Nov: back to Design v3 screens with Amy's tweaks, running 3D, weekly unlocking · Source design: "TYGA Summer Series" Design v3 artifact

## 1. Purpose

A summer accountability and rewards app for The Yard Gym (Albury) members, "Maintain the standard":
three sessions a week from 7 Dec 2026 to 26 Jan 2027, with missions, points, levels, local perks and
prize draws. It should feel like something members want to be part of, not a program they must finish.
Staff (Amy, Sarah and the team) use the same app to run registrations, singlet orders, roster checks
and retention follow-ups.

**Success looks like:** members can register and choose a singlet before 30 Nov; the supplier gets an
accurate singlet CSV on 30 Nov; from 7 Dec members log sessions and see points/ranks update the same
day; staff see each week who needs a chat.

### Decisions made with Amy
| Topic | Decision |
|---|---|
| Release | Two stages. Stage 1 (join + singlet + Square payment) ASAP; Stage 2 (series features) by 7 Dec |
| Platform | Installable web app (PWA): Next.js on Vercel + Supabase, edited in VS Code |
| Sign-in | Email magic link (Supabase Auth) |
| Membership check | Staff upload Mindbody active-member CSV; sign-up email must match |
| Payment | Square. $15 paid through a Square-hosted checkout page (card, Apple Pay, Google Pay); Square tells the app when it's paid |
| Weekly unlocking | Missions, holiday workouts, perks and resources belong to a week and unlock for members at 12:00am Monday; nothing from future weeks is visible |
| Look | Design v3 screens, wording and flow (the version Amy loved) with her tweaks only: Inter font like her reference board, sharper near-black / off-white / tan colours, less congested. Running 3D character with a Women's / Men's choice |
| Roster check | Daily scheduled task opens Mindbody in Amy's signed-in browser, reads attendance, posts it to the app |

### Assumptions (not yet confirmed — flag if wrong)
- Roughly 150–250 participants; one gym location.
- The Mindbody member CSV contains at least first name, last name, email and mobile.
- Sign-ups close 30 Nov along with singlet changes.
- Partner perks (café, massage, restaurant) are entered by staff; no partner logins.

## 2. Architecture

- **Frontend:** Next.js (App Router) + TypeScript, deployed on Vercel. PWA manifest + service worker so
  members can "Add to Home Screen" (TYGA icon, full screen, dark theme colour).
- **Backend:** Supabase — Postgres, Auth (magic link), Storage (check-in photos), Row Level Security.
- **Server logic:** Next.js server actions / route handlers using the Supabase service role only on the
  server. Points are only ever written server-side.
- **Roles:** `profiles.role` = `member` | `staff`. Staff see an Admin area at `/admin`. RLS: members
  read/write only their own rows; staff read all; leaderboard is served from a view exposing first name
  + last initial + points only.
- **Square payments:** server creates a Square Checkout payment link per registration (Checkout API,
  AUD, `reference_id` = registration id, redirect back to the You're in screen). A Square webhook
  (`payment.updated`, signature verified with `SQUARE_WEBHOOK_SIGNATURE_KEY`) marks the registration paid.
  Keys: `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID`, `SQUARE_ENVIRONMENT` (sandbox/production), server-side only.
- **Roster sync endpoint:** `POST /api/roster-sync`, authenticated by a secret header (`ROSTER_SYNC_SECRET`),
  accepts `[{date, class_name, start_time, email|name}]`.
- **Visual design:** Design v3's screens, wording and flow, with Amy's tweaks ("just a few tweaks"): Inter for
  all UI text (the TYGA / Summer wordmark keeps Archivo Black + script), sharper near-black / off-white / tan
  colours instead of golden-hour cream, more spacing. The running 3D character (Three.js, Rocketbox, MIT) is on
  Welcome — with a Women's / Men's switch — and on the singlet screen, where it follows the member's fit and
  colour choice. It stops when you leave the screen, and shows a still message if a phone can't do 3D.

## 3. Data model (Supabase)

| Table | Key fields |
|---|---|
| `active_members` | email (unique, lower-case), first_name, last_name, mobile, uploaded_at |
| `profiles` | id (= auth user), email, first_name, last_name, mobile, role, member_no, goal, created_at, last_seen_at |
| `registrations` | profile_id, fit (`women`/`men`), colour (`cream`/`charcoal`), size (XS–3XL), terms_accepted_at, payment_status (`unpaid`/`pending`/`paid`/`refunded`), square_order_id, square_payment_id, paid_at, amount_cents |
| `series_weeks` | week_no (1–7), starts_on, unlocks_at (Mon 00:00 AEDT), theme, status (`draft`/`ready`), double_points_dates[] |
| `missions` | week_no, title, detail, points, kind (`auto_3of3`/`manual`/`secret`), reveal_at, ends_at |
| `mission_completions` | mission_id, profile_id, completed_at, approved |
| `checkins` | profile_id, date, type (`yard`/`run`/`holiday_workout`/`recovery`/`rest`), counts_to_3 (bool), photo_path, status (`confirmed`/`pending`/`rejected`), source (`member`/`roster`) |
| `points_ledger` | profile_id, amount, reason, ref_id, created_at (append-only) |
| `perks` | week_no (release week), title, partner, photo_path, unlock_points, expires_on, code_prefix |
| `perk_redemptions` | perk_id, profile_id, code, redeemed_at, redeemed_by |
| `holiday_mode` | profile_id, away_until |
| `resources` | week_no (release week), category, title, photo_path, body/link |
| `holiday_workouts` | week_no (release week), title, detail, filter tags, counts_to_3 |
| `prize_draws` | week_no, winner_profile_id, drawn_at, drawn_by |
| `roster_syncs` | ran_at, rows_received, matched, unmatched |

Leaderboard, levels, weekly 3/3 status and "needing a chat" are SQL views over these tables.

**Weekly unlocking rule:** members can only read rows whose week's `unlocks_at` has passed (enforced in
RLS, not just hidden in the UI). A week is "live" once unlocked; before that staff can edit or swap
anything in it. Members see a locked teaser ("Week 3 missions · Unlocks Mon 21 Dec") with no content.

## 4. Stage 1 — Joining (live ASAP, closes 30 Nov)

1. **Welcome** — wordmark, running 3D character with a Women's / Men's switch, "Maintain the standard",
   "Stay moving, stay connected, and get rewarded for showing up this summer.", "Join the Summer Series · $15",
   "I've already joined".
2. **Sign in** (step 1 of 4: Sign in · Commit · Singlet · Pay) — email → magic link. On first sign-in the email is checked against `active_members`.
   Not found → "We couldn't find your membership — check with the front desk", and the attempt is logged
   for staff. Found → profile created from the CSV (name, mobile), member number assigned in order.
3. **Commit** (step 2) — the three-a-week standard and one goal chip: Maintain my fitness,
   Stay consistent over Christmas, Keep my strength, Start February strong.
4. **Your singlet** (step 3) — Women's / Men's fit, the running character wearing the chosen colour (drag to
   turn), colour by photo (Cream / Charcoal wash), size XS–3XL with a "Size guide" link. Editable until 30 Nov 23:59 AEDT, then locked.
5. **Confirm** — summary (registration + singlet + app/missions/perks/prizes, total $15), the "Before you pay"
   terms text, terms checkbox, button "Pay $15" → Square checkout page → back to the app.
   If they close the checkout, they can return and pay later; nothing is reserved until paid.
6. **You're in** (shown only once Square confirms payment; "Confirming your payment…" while waiting) — member ticket (name, number, singlet, colour), countdown to 7 Dec, welcome mission
   "Book your first 3 sessions for 7–13 Dec" (+10, staff-approved).

**Stage 1 admin (`/admin`)**
- Upload active-member CSV (column mapping preview, replaces previous list).
- Registrations table with count and % of active members.
- **Payments** list: paid / started but unpaid (with mobile, to chase), total collected; matches Square's own reports.
- Singlet grid and supplier CSV count **paid** registrations only.
- **Singlet order grid** — fit × colour rows, size columns, totals; "Download supplier CSV".

## 5. Stage 2 — During the series (ready by 7 Dec)

- **Home** — "Morning, Jess", week number and theme, 3/3 ring with day pips and the +20 bonus prompt, points /
  rank / streak, level card (opens Levels), quick actions (Log, Missions, Perks, Holiday), double-points banner,
  Summer resources link. Bottom tabs: Home, Missions, Log, Ranks, Perks.
- **Daily check-in** — one per type per day. `yard`, `run`, `holiday_workout` count to 3/3 (max one
  counted session per day); `recovery` and `rest` are logged, no 3/3 credit. Optional photo. Yard
  check-ins start `pending` unless the roster already confirms them. "Tomorrow?" shows the next class
  with a Book link to Mindbody.
- **Points rules**
  - Counted session: +5 (Yard sessions only once confirmed)
  - 3 counted sessions in a Mon–Sun week: +20 bonus (once per week)
  - Missions: as set per mission (+10/+20)
  - Double-points dates: session and mission points ×2
  - Levels: 1 Show Up (0), 2 Build Momentum (50), 3 Stay Consistent (100), 4 Maintain the Standard (200),
    5 Summer Series Legend (300)
- **Missions** — tabs This week / Done; week banner (week, dates, theme); next week shown only as a locked
  teaser. Secret missions show "???" until `reveal_at`.
- **Leaderboard** — Points / 3/3 Club tabs, podium for the top 3, own row highlighted; 3/3 Club (this week's count
  and names). Every member at 3/3 for a week is entered in that week's draw.
- **Levels** ("Your summer") — sunrise journey L1–L5 with what each level unlocks.
- **Perks** — My perks / All perks; unlocked voucher, "Next to unlock" with progress; only perks released so far,
  more can drop each Monday. Unlocked perk shows a code (e.g. SUMMER-014) and expiry; staff mark redeemed.
- **Holiday Mode** — "I'm away until <date>", this week's and past weeks' workouts (All / Hotel room / Run / Bodyweight),
  next week's set unlocks Monday,
  visible to staff, excludes member from drop-off flags.
- **Resources** — six categories (recipes, holiday workouts, recovery & mobility, hydration, Christmas
  survival, run sessions), released by week.

**Stage 2 admin**
- KPI tiles: registered & paid, hit 3/3 last week, check-ins to approve, need a follow-up.
- **Approve queue** — pending Yard check-ins not matched by roster sync; approve / reject.
- **Members needing a chat** — flags: no counted session in 7 days; behind this week (0/3 by Thursday);
  not opened the app in 7 days. Skips anyone on Holiday Mode. Most flags first. "Text" opens SMS with mobile.
- **Content calendar** — all 7 weeks with unlock date, counts of missions / holiday workouts / perks /
  resources, and status (Draft, Ready · locked, Live). Open a week to add or edit its content until it goes live.
- **Missions editor** — per week: add/edit, points, secret reveal time, double-points dates.
- **Prize draw** — pick a random 3/3 Club member for a week; record winner.
- **Perk redemption** — search member, mark redeemed.
- **Weekly report export** (CSV).
- "Roster last synced: <time>" indicator.

## 6. Mindbody roster scheduler

A Claude scheduled task, daily at ~6:40am AEDT, alongside Agent1 (not replacing it):
1. Open Mindbody in Amy's signed-in browser; read the previous day's class attendance (member name/email,
   class, time).
2. POST rows to `/api/roster-sync` with the secret header.
3. Endpoint matches by email (then exact full name) to `profiles`; for each match, a `pending` Yard
   check-in that day becomes `confirmed` and earns points; a member attended but didn't log → a
   `confirmed` check-in is created with `source = roster`.
4. Unmatched rows and unconfirmed pending check-ins stay in the staff approve queue.
5. If the task can't sign in, nothing changes; check-ins wait as pending and the admin shows the last sync time.

## 7. Error handling

- Square webhook arrives late or twice → handled idempotently by `square_payment_id`; the app also
  re-checks the order with Square when the member lands back after checkout. Refunds are done in Square;
  the `refunded` webhook removes them from the singlet count.
- Magic link expired → resend screen. Non-member email → friendly message + staff log.
- Singlet edits after cutoff blocked server-side, not just in the UI.
- Duplicate check-ins rejected by a unique constraint (profile, date, type).
- Points ledger is append-only; corrections are reversing entries made by staff.
- Photo upload failure doesn't block the check-in.

## 8. Privacy

Leaderboard shows first name + last initial only. Mobile, goals, Holiday Mode dates and flags are staff-only.
Photos are private (member + staff). Members can delete their account, which removes their data from views.

## 9. Testing

- Square tested end-to-end in Square's sandbox (test cards) before switching to live keys.
- Automated tests for: webhook signature check and duplicate events, points rules (incl. 3/3 bonus once per week, one counted session per day, double
  points), level thresholds, roster matching, membership check, singlet cutoff, RLS policies.
- Each screen checked at phone width (375px) against Design v3 before release.
- Test week with Amy and 2–3 staff before Stage 1 goes public.

## 10. Launch timeline

| When | What |
|---|---|
| Week of 11 Nov | Build Stage 1, staff test |
| ~18 Nov | Stage 1 live: sign-ups + singlets |
| 30 Nov | Sign-ups and singlet changes close; supplier CSV sent |
| 1–6 Dec | Stage 2 finished, roster scheduler tested |
| 7 Dec | Series starts |
| 25–26 Jan | Finale, final draws |

## Out of scope (v1)

App Store / Google Play listing, card entry inside the app itself (Square's hosted page handles it), push notifications, partner logins, live Mindbody API.
