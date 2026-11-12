"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestLoginLink, type LoginState } from "@/app/join/sign-in/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(requestLoginLink, {});
  return (
    <form action={action} style={{ display: "contents" }}>
      <label className="field">
        <span className="eyebrow">Email</span>
        <input name="email" type="email" inputMode="email" autoComplete="email" required
          placeholder="you@example.com" defaultValue={state.email} aria-describedby="login-msg" />
      </label>
      {state.message && (
        <div id="login-msg" className="notice" role="alert">
          {state.message}
          {state.notFound && <> Check the spelling, or <Link href="/join/sign-in" className="link">join the Summer Series</Link>.</>}
        </div>
      )}
      <div style={{ flex: 1 }} />
      <button type="submit" className="btn" disabled={pending}>{pending ? "Checking…" : "Email me a sign-in link"}</button>
    </form>
  );
}
