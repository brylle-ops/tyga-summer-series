// Limits on the code login (pure rules, easy to test). Counted in the database so every server instance agrees.
export const LIMITS = { requestsPerEmail: 5, requestsOverall: 60, failedCodes: 10 } as const; // per 10 min / per 1 min / per 10 min

/** Pure decision so it can be tested: too many code requests for one email, or a flood across the whole app. */
export function requestBlocked(forEmail: number, overall: number): boolean {
  return forEmail >= LIMITS.requestsPerEmail || overall >= LIMITS.requestsOverall;
}
export function verifyBlocked(failures: number): boolean {
  return failures >= LIMITS.failedCodes;
}

