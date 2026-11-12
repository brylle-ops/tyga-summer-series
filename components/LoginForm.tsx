"use client";

import { useActionState } from "react";
import { requestLoginLink, type LoginState } from "@/app/join/sign-in/actions";

export default function LoginForm({ next = "/home" }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLoginLink, {});
  return (
    <form action={action} style={{ display: "contents" }}>
      <input type="hidden" name="next" value={next} />
      <label className="field">
        <span className="eyebrow">Email</span>
        <input name="email" type="email" inputMode="email" autoComplete="email" required
          placeholder="you@example.com" defaultValue={state.email} aria-describedby="login-msg" />
      </label>
      {state.message && (
        <div id="login-msg" className="notice" role="alert">
          {state.message}
        </div>
      )}
      <div style={{ flex: 1 }} />
      <button type="submit" className="btn" disabled={pending}>{pending ? "Sending…" : "Email me a sign-in link"}</button>
    </form>
  );
}
