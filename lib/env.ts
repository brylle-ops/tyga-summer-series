/** Reads a required environment variable, failing loudly if it's missing. */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

/** When on, any email can sign up (open access); off = only emails on the member list. */
export function allowNonMembers(): boolean {
  const v = (process.env.ALLOW_NON_MEMBERS ?? "").trim().replace(/^["']|["']$/g, "").trim().toLowerCase();
  return v === "true" || v === "1" || v === "yes";
}

/** The site's public address with no trailing slash. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}
