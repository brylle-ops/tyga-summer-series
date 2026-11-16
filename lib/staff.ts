// Staff access by email: these addresses are treated as staff after sign-in (the one-time code proves ownership).
const BUILT_IN = ["brylle@supersidekick.co"];

/** Built-in staff emails plus any in the comma-separated STAFF_EMAILS env var, lowercased and trimmed. */
export function staffEmails(env: string | undefined = process.env.STAFF_EMAILS): string[] {
  const extra = (env ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
  return [...new Set([...BUILT_IN, ...extra])];
}

export function isStaffEmail(email: string, env: string | undefined = process.env.STAFF_EMAILS): boolean {
  return staffEmails(env).includes(email.trim().toLowerCase());
}
