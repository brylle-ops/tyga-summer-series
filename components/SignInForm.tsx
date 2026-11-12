"use client";

import { useActionState } from "react";
import { requestSignInLink, type SignInState } from "@/app/join/sign-in/actions";

export default function SignInForm({ next, label = "Send my sign-in link" }: { next?: string; label?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(requestSignInLink, {});
  return (
    <form action={action} style={{ display: "contents" }}>
      {next && <input type="hidden" name="next" value={next} />}
      <label className="field">
        <span className="eyebrow">Email</span>
        <input name="email" type="email" inputMode="email" autoComplete="email" required
          placeholder="you@example.com" defaultValue={state.email} aria-describedby="signin-msg" />
      </label>
      {state.message && <p id="signin-msg" className="notice" role="alert">{state.message}</p>}
      <div style={{ flex: 1 }} />
      <button type="submit" className="btn" disabled={pending}>{pending ? "Sending…" : label}</button>
    </form>
  );
}
