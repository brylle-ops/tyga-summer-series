import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { delimiter, join } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

// Fake Square: like the real one, only the single-subscription GET returns signature_key.
const FAKE_SQUARE = `
const sub = { id: "sub1", notification_url: "https://tyga-summer-series.vercel.app/api/square/webhook" };
globalThis.fetch = async (url) => {
  const path = new URL(url).pathname;
  const body = path === "/v2/locations" ? { locations: [{ id: "LOC", name: "Gym", status: "ACTIVE", currency: "AUD" }] }
    : path === "/v2/webhooks/subscriptions" ? { subscriptions: [sub] }
    : { subscription: { ...sub, signature_key: "sig-secret" } };
  return { ok: true, status: 200, json: async () => body };
};
`;

describe("scripts/square-setup.mjs", () => {
  it("reuses an existing webhook, saves its signature key and prints no secrets", () => {
    const dir = mkdtempSync(join(tmpdir(), "square-setup-"));
    try {
      writeFileSync(join(dir, ".env.local"), "SQUARE_ACCESS_TOKEN=token-secret\n");
      writeFileSync(join(dir, "fake-square.mjs"), FAKE_SQUARE);
      // Fake npx so the Vercel step never touches the real project.
      writeFileSync(join(dir, "npx.cmd"), "@exit /b 0\r\n");
      writeFileSync(join(dir, "npx"), "#!/bin/sh\nexit 0\n", { mode: 0o755 });
      const env: NodeJS.ProcessEnv = { ...process.env, SQUARE_ENVIRONMENT: "production" };
      delete env.SQUARE_ACCESS_TOKEN;
      const pathKey = Object.keys(env).find((k) => k.toUpperCase() === "PATH") ?? "PATH";
      env[pathKey] = `${dir}${delimiter}${env[pathKey] ?? ""}`;

      const run = spawnSync(
        process.execPath,
        ["--import", pathToFileURL(join(dir, "fake-square.mjs")).href, join(process.cwd(), "scripts", "square-setup.mjs")],
        { cwd: dir, env, encoding: "utf8" },
      );

      expect(run.status).toBe(0);
      expect(readFileSync(join(dir, ".env.local"), "utf8")).toContain("SQUARE_WEBHOOK_SIGNATURE_KEY=sig-secret");
      expect(run.stdout).toContain("Vercel: SQUARE_WEBHOOK_URL");
      expect(`${run.stdout}${run.stderr}`).not.toMatch(/token-secret|sig-secret/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
