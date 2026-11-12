# TYGA Summer Series app

The Yard Gym Albury's summer accountability app — *Maintain the standard*, 7 Dec – 26 Jan.

**Status: screens + Square checkout.** Every screen from Design v3 is built (with Amy's font/colour tweaks) and the Pay $15
button creates a real Square checkout (see below). Nothing else is saved yet: no sign-in, no check-ins. All names and
numbers are example data from `lib/mock-data.ts`.

## Run it on your computer

You need Node.js 20 or newer (https://nodejs.org).

```bash
npm install
npm run dev
```

Then open http://localhost:3000. For the phone view, use your browser's device toolbar
(Chrome: right-click → Inspect → phone icon).

## Set up Square payments (Pay $15)

The **Pay $15** button creates a one-time Square checkout page ($15 AUD, card / Apple Pay /
Google Pay). The member's singlet choice is saved as the payment note, and Square sends them back to
the "You're in" screen afterwards. Start in **sandbox** (test cards, no real money).

1. Go to https://developer.squareup.com/apps and sign in with the gym's Square login.
2. Create an application (any name, e.g. "TYGA Summer Series") and open it.
3. **Credentials** → switch to **Sandbox** → copy the **Sandbox Access token**.
4. **Locations** → copy the **Sandbox** location ID.
5. In the project folder, copy `.env.example` to a new file called `.env.local` and paste both in:
   ```
   SQUARE_ENVIRONMENT=sandbox
   SQUARE_ACCESS_TOKEN=paste-token-here
   SQUARE_LOCATION_ID=paste-location-id-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
6. Stop and restart `npm run dev` (it only reads `.env.local` on start).
7. Go to http://localhost:3000/join/checkout → **Pay $15** → pay with a Square test card
   (see https://developer.squareup.com/docs/devtools/sandbox/payments). The payment appears in
   the **Sandbox** Square Dashboard.

**Going live:** repeat steps 3–4 on the **Production** tab, set `SQUARE_ENVIRONMENT=production`, and set
`NEXT_PUBLIC_SITE_URL` to the real app address. Keep `.env.local` private — never email it, share it
in chat or upload it; it is already excluded from git.

Not yet: until sign-in, the singlet picker and the database are connected, every payment note uses the
example choice ("Women's M · Cream") and the app can't confirm payment by itself — check payments in
the Square Dashboard.

## Screens

| Address | Screen |
|---|---|
| `/` | Welcome — running 3D character with a Women's / Men's switch |
| `/join/sign-in` | Step 1 · Sign in (email link) |
| `/join/commit` | Step 2 · Three-a-week commitment + goal |
| `/join/singlet` | Step 3 · Fit, colour and size — the runner follows the choices |
| `/join/checkout` | Step 4 · Pay $15 (Square) |
| `/join/confirmed` | You're in — member ticket |
| `/home` | Dashboard |
| `/log` | Did you move today? (daily check-in) |
| `/missions` | Weekly missions |
| `/ranks` | Leaderboard |
| `/levels` | Your summer — levels sunrise |
| `/perks` | Perks |
| `/holiday` | Holiday Mode |
| `/resources` | Summer resources |
| `/admin` | Staff admin + content calendar (best on a laptop) |

## Weekly unlocking

Missions, holiday workouts, perks and resources each belong to a week (`week` in `lib/mock-data.ts`).
Members only see weeks that have unlocked; the next week shows as a locked teaser. To preview a
different week, change `currentWeekNo` in `lib/mock-data.ts`.

## Where things live

- `app/` — one folder per screen (`page.tsx`)
- `app/globals.css` — Design v3 styles with Amy's tweaks (Inter, near-black / off-white / tan)
- `components/` — shared pieces: icons, wordmark, tab bar, join steps, locked teaser, 3D runner, singlet picker
- `lib/mock-data.ts` — the example data (gets swapped for Supabase later)
- `public/img` — singlet photos
- `public/runner` — the running 3D character (Three.js, Microsoft Rocketbox avatars, MIT)
- `docs/superpowers/specs/` — the design spec

## Next

Supabase (magic-link sign-in, database), Square checkout, check-ins and points, the Mindbody
roster scheduler — see the spec.
