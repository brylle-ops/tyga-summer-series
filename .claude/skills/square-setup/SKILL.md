---
name: square-setup
description: Connect the TYGA app to the Square account (sandbox or production): location id, webhook subscription + signature key, .env.local and Vercel env vars. Use when asked to connect/set up/fix Square payments or the singlet checkout.
---

# Square setup (TYGA singlet checkout)

Code is already done (`lib/square.ts`, `app/api/square/webhook`, `app/join/checkout`). Only credentials are missing.
Never read `.env.local` with tools and never print or paste secret values.

## Steps
1. Ask the user ONLY for: Square dashboard (developer.squareup.com/apps → app → Credentials) → **Sandbox access token**
   (Production token + `SQUARE_ENVIRONMENT=production` at launch). They add `SQUARE_ACCESS_TOKEN=...` to `.env.local` and save.
2. Optional: a Vercel token (vercel.com/account/tokens) as `VERCEL_TOKEN=...` in `.env.local` so Vercel is updated too.
3. Tell the user to run in their terminal: `node scripts/square-setup.mjs`
   It finds the AUD location, creates/reuses the webhook (`payment.*`, `refund.*` → `/api/square/webhook`),
   saves `SQUARE_LOCATION_ID`, `SQUARE_WEBHOOK_SIGNATURE_KEY`, `SQUARE_WEBHOOK_URL`, `SQUARE_ENVIRONMENT` to `.env.local`,
   and pushes the 5 vars to Vercel production if `VERCEL_TOKEN` exists.
4. Redeploy on Vercel. Test `/join/singlet` → Checkout → card `4111 1111 1111 1111` → `/join/confirmed` should show paid.
5. Verify without secrets: POST an unsigned body to `/api/square/webhook` → expect 401 (not 503 = keys missing).

## Gotchas
- Quick Pay is priced in AUD; the Square location must be AUD or Square rejects it.
- Sandbox vs production tokens and locations differ; rerun the script after switching `SQUARE_ENVIRONMENT`.
- Production also makes the app ignore `SERIES_PREVIEW_WEEK`.
- CSP `form-action` allows Square domains (next.config.ts); if the redirect to Square is blocked, check there.
