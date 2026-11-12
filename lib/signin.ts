import { normaliseEmail, type MemberRow } from "@/lib/members";

export const NON_MEMBER_MESSAGE = "We couldn't find your membership — check with the front desk";

export type MembershipResult =
  | { status: "invalid" }
  | { status: "not_member"; email: string }
  | { status: "member"; member: MemberRow };

/** Is this email on the gym's active member list? (or anyone, if sign-ups are open to non-members) */
export async function checkMembership(
  raw: string,
  lookup: (email: string) => Promise<MemberRow | null>,
  opts: { allowNonMembers?: boolean } = {},
): Promise<MembershipResult> {
  const email = normaliseEmail(raw);
  if (!email) return { status: "invalid" };
  const member = await lookup(email);
  if (member) return { status: "member", member };
  if (opts.allowNonMembers) return { status: "member", member: { email, first_name: "", last_name: "", mobile: "" } };
  return { status: "not_member", email };
}

/** Where to send someone after sign-in: same-site paths only, so the link can't bounce people to another site. */
export function safeNext(next: string | null | undefined, fallback = "/home"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
