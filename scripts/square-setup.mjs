// One-command Square setup. Run it yourself in the terminal:  node scripts/square-setup.mjs
// Needs only SQUARE_ACCESS_TOKEN in .env.local (and optionally SQUARE_ENVIRONMENT, VERCEL_TOKEN).
// It finds the location, creates the webhook subscription, saves the values to .env.local
// and (if VERCEL_TOKEN is set) to Vercel. It never prints secret values.
import fs from "node:fs";
import { spawnSync } from "node:child_process";

const ENV_FILE = ".env.local";
const SITE = "https://tyga-summer-series.vercel.app";
const WEBHOOK_URL = `${SITE}/api/square/webhook`;
const VERSION = "2026-09-16";
const EVENTS = ["payment.created", "payment.updated", "refund.created", "refund.updated"];

const read = () => (fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, "utf8") : "");
const get = (name) => process.env[name] || read().match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]?.trim().replace(/^["']|["']$/g, "");
function save(name, value) {
  let s = read();
  const re = new RegExp(`^${name}=.*$`, "m");
  s = re.test(s) ? s.replace(re, () => `${name}=${value}`) : `${s.replace(/\n*$/, "\n")}${name}=${value}\n`;
  fs.writeFileSync(ENV_FILE, s);
}
const die = (m) => { console.error(`\n✗ ${m}`); process.exit(1); };

const token = get("SQUARE_ACCESS_TOKEN");
if (!token) die("Put SQUARE_ACCESS_TOKEN=... in .env.local first (Square dashboard → your app → Credentials → Sandbox access token), save, run again.");
const env = get("SQUARE_ENVIRONMENT") === "production" ? "production" : "sandbox";
const base = env === "production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";

async function sq(path, body) {
  const res = await fetch(base + path, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token}`, "Square-Version": VERSION, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) die(`Square said ${res.status}: ${(data.errors || []).map((e) => e.detail || e.code).join("; ") || "no detail"}`);
  return data;
}

console.log(`Square ${env}`);

// 1. Location
const locs = (await sq("/v2/locations")).locations?.filter((l) => l.status === "ACTIVE") ?? [];
if (!locs.length) die("No active location on this Square account.");
const loc = locs.find((l) => l.currency === "AUD") ?? locs[0];
save("SQUARE_LOCATION_ID", loc.id);
console.log(`✓ Location: ${loc.name} (${loc.currency})`);
if (loc.currency !== "AUD") console.log("  ! This location is not AUD. Checkout is priced in AUD, so Square may reject it. Use an AUD location.");

// 2. Webhook subscription (reuse if one already points at our URL)
const subs = (await sq("/v2/webhooks/subscriptions")).subscriptions ?? [];
let sub = subs.find((s) => s.notification_url === WEBHOOK_URL);
if (sub) console.log("✓ Webhook already exists, reusing it");
else {
  sub = (await sq("/v2/webhooks/subscriptions", {
    idempotency_key: crypto.randomUUID(),
    subscription: { name: "TYGA Summer Series", enabled: true, event_types: EVENTS, notification_url: WEBHOOK_URL, api_version: VERSION },
  })).subscription;
  console.log("✓ Webhook created");
}
if (!sub?.signature_key) die("Square gave no signature key. Open the subscription in the Square dashboard and copy it into SQUARE_WEBHOOK_SIGNATURE_KEY.");
save("SQUARE_WEBHOOK_SIGNATURE_KEY", sub.signature_key);
save("SQUARE_WEBHOOK_URL", WEBHOOK_URL);
save("SQUARE_ENVIRONMENT", env);
save("NEXT_PUBLIC_SITE_URL", get("NEXT_PUBLIC_SITE_URL") && !get("NEXT_PUBLIC_SITE_URL").includes("localhost") ? get("NEXT_PUBLIC_SITE_URL") : "http://localhost:3000");
console.log("✓ Saved to .env.local");

// 3. Vercel (optional)
if (!process.env.VERCEL_TOKEN && !get("VERCEL_TOKEN")) {
  console.log("\nVercel not updated (no VERCEL_TOKEN). Paste these 5 into Vercel yourself: SQUARE_ENVIRONMENT, SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_WEBHOOK_SIGNATURE_KEY, SQUARE_WEBHOOK_URL");
  console.log("(they are in .env.local). Or add VERCEL_TOKEN=... to .env.local and run this again.");
  process.exit(0);
}
const childEnv = { ...process.env, VERCEL_TOKEN: process.env.VERCEL_TOKEN || get("VERCEL_TOKEN") };
const vercel = (args, input) => spawnSync("npx", ["vercel", ...args], { input, env: childEnv, shell: true, encoding: "utf8" });
const push = { SQUARE_ENVIRONMENT: env, SQUARE_ACCESS_TOKEN: token, SQUARE_LOCATION_ID: loc.id, SQUARE_WEBHOOK_SIGNATURE_KEY: sub.signature_key, SQUARE_WEBHOOK_URL: WEBHOOK_URL };
for (const [k, v] of Object.entries(push)) {
  vercel(["env", "rm", k, "production", "-y"]);
  const r = vercel(["env", "add", k, "production"], v);
  console.log(r.status === 0 ? `✓ Vercel: ${k}` : `✗ Vercel: ${k} failed (is the project linked? run: npx vercel link)`);
}
console.log("\nDone. Redeploy in Vercel (or push any commit), then test /join/singlet with card 4111 1111 1111 1111.");
