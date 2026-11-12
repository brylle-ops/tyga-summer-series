# Go live: Supabase + Vercel + Square (stage 1)

Do these in order. Nothing here costs money on free plans. Keep every key private.

## 1. Supabase (database + sign-in)
1. supabase.com → **New project** → name `tyga-summer-series`, region **Sydney**, save the database password somewhere safe.
2. **SQL Editor → New query** → paste all of `supabase/migrations/0001_stage1.sql` → **Run**. You should see "Success".
3. **Project Settings → API Keys**: copy the **Project URL**, the **publishable** key (`sb_publishable_…`) and a **secret** key (`sb_secret_…`).
4. **Authentication → URL Configuration**: Site URL = your Vercel address (step 2, e.g. `https://tyga-summer-series.vercel.app`). Add Redirect URLs: `https://tyga-summer-series.vercel.app/**` and `http://localhost:3000/**`.
5. **Authentication → Emails → Magic Link** template — replace the link with:
   `<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/join/commit">Sign in to the Summer Series</a>`
   Do the same in the **Confirm signup** template (first-time members get that one).
6. **Authentication → Emails → SMTP Settings**: turn on custom SMTP (e.g. a free Resend account, sender `summer@<your domain>`). **Without this, Supabase only emails your own team and only a few per hour — real members won't get links.**
7. After Amy and Sarah have each signed in once, run in SQL Editor:
   `update profiles set role = 'staff' where email in ('amy@…', 'sarah@…');`

## 2. Vercel (hosting)
1. Push this folder to a new **private** GitHub repo (VS Code: Source Control → Publish to GitHub).
2. vercel.com → **Add New → Project** → import the repo → Framework: Next.js → **Deploy**.
3. **Settings → Environment Variables** — add everything from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
   - `SQUARE_ENVIRONMENT=sandbox`, `SQUARE_ACCESS_TOKEN`, `SQUARE_LOCATION_ID` (sandbox values for now)
   - `NEXT_PUBLIC_SITE_URL` = your Vercel address
   - `MEMBER_SYNC_SECRET` = a long random string (30+ characters)
   - `ACTIVE_MEMBER_STATUSES` = what Mindbody's **Membership Status** says for current members (e.g. `Active`)
   - `ALLOW_NON_MEMBERS=true` (non-members can join and pay; they type their name on the Commit step)
4. **Deployments → ⋯ → Redeploy** so the variables take effect.

## 3. Square webhook (marks people paid)
1. developer.squareup.com → your app → **Webhooks → Subscriptions** (Sandbox) → **Add subscription**.
2. URL: `https://<your vercel address>/api/square/webhook`. Events: `payment.created`, `payment.updated`, `refund.created`, `refund.updated`.
3. Copy its **Signature key** → Vercel `SQUARE_WEBHOOK_SIGNATURE_KEY`. Put the exact URL in `SQUARE_WEBHOOK_URL`. Redeploy.

## 4. Daily member list from the TYG Dashboard
In the TYG Dashboard's Apps Script, add this and run it after the morning import (Triggers → time-driven, ~9:30am):
```js
function syncSummerSeriesMembers() {
  const sh = SpreadsheetApp.getActive().getSheetByName('TYG Master');
  const [head, ...rows] = sh.getDataRange().getValues();
  const col = (n) => head.indexOf(n);
  const members = rows.map(r => ({
    email: r[col('Email')], first_name: String(r[col('Name')]).split(' ')[0],
    last_name: String(r[col('Name')]).split(' ').slice(1).join(' '),
    mobile: r[col('Phone')], status: r[col('Membership Status')],
  }));
  const res = UrlFetchApp.fetch('https://<your vercel address>/api/members/sync', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + PropertiesService.getScriptProperties().getProperty('MEMBER_SYNC_SECRET') },
    payload: JSON.stringify({ members }),
  });
  Logger.log(res.getResponseCode() + ' ' + res.getContentText());
}
```
Store the same secret under **Project Settings → Script Properties → `MEMBER_SYNC_SECRET`**. Adjust the column names if they differ. Staff can also upload a CSV on `/admin` as a backup.

## 5. Test on the preview (sandbox, no real money)
Sign in with a listed email → choose goal and singlet → Pay $15 with test card `4111 1111 1111 1111` → "You're in" shows the ticket within ~10 s → `/admin` shows the payment and singlet count → Supplier CSV downloads.

## 6. Before launch
Open `app/privacy/page.tsx` and set `CONTACT` to the gym's real email or phone for privacy requests.

## 7. Launch
Swap Square to **production** values (`SQUARE_ENVIRONMENT=production`, live token + location, a production webhook subscription and its key) → redeploy.
