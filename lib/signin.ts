/** Where to send someone after sign-in: same-site paths only, so the link can't bounce people to another site. */
export function safeNext(next: string | null | undefined, fallback = "/home"): string {
  if (!next || !/^\/[^/\\\x00-\x1f]/.test(next)) return next === "/" ? "/" : fallback;
  return next;
}

/** The code from the email: digits only (people paste it with spaces). Null unless it is 6-10 digits. */
export function normaliseCode(raw: string): string | null {
  const digits = raw.replace(/\s+/g, "");
  return /^\d{6,10}$/.test(digits) ? digits : null;
}
