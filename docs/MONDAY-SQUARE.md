# Monday 16 Nov 2026 — connect Square (about 10 minutes)

Everything is built. Only your Square login is needed, so this can't be done while you're away.

## Before you start (2 minutes)
1. Sign in at https://developer.squareup.com/apps → open the app → Credentials.
2. Copy the **Sandbox access token**.
3. In VS Code open `.env.local`, add the line `SQUARE_ACCESS_TOKEN=<paste>` and save.
4. Optional, so Vercel is updated automatically: create a token at https://vercel.com/account/tokens and add
   `VERCEL_TOKEN=<paste>` to `.env.local`.

## Run
In the terminal: `node scripts/square-setup.mjs`
It finds your location, creates the webhook, saves the keys to `.env.local` and pushes them to Vercel.
It never prints a secret, so you can paste the output to Claude.

## Then
1. Without VERCEL_TOKEN: paste the 5 SQUARE_ values from `.env.local` into Vercel → Settings → Environment Variables.
2. Redeploy on Vercel.
3. Test: `/join/singlet` → pick a size → Checkout → card `4111 1111 1111 1111`, any future date, any CVV → `/join/confirmed` shows paid.

## Check
- The Square location must be **AUD** (the script warns if not).
- An unsigned POST to `/api/square/webhook` answers 401. A 503 means keys are still missing.

## Also due before launch
- Run `supabase/migrations/0003_hardening.sql` in the Supabase SQL editor.
- Switch to Production token + `SQUARE_ENVIRONMENT=production` (run the script again).
- Delete `SERIES_PREVIEW_WEEK`; make the GitHub repo private; set the privacy contact in `app/privacy/page.tsx`.

Tell Claude: "Square is set up, run the checks." It will verify the live checkout.
