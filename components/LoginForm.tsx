"use client";

import { useActionState } from "react";
import { requestLoginLink, verifyLoginCode, type LoginState } from "@/app/join/sign-in/actions";

// Two steps on one screen: email -> code from the email.
export default function LoginForm({ next = "/home" }: { next?: string }) {
  const [asked, ask, asking] = useActionState<LoginState, FormData>(requestLoginLink, {});
  const [checked, check, checking] = useActionState<LoginState, FormData>(verifyLoginCode, {});

  if (asked.sent) {
    const email = asked.email ?? "";
    const message = checked.message ?? asked.message;
    return (
      <form action={check} style={{ display: "contents" }}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="next" value={next} />
        <p className="sm mute">We emailed a code to <b>{email}</b>. It works once and expires in an hour.</p>
        <label className="field">
          <span className="eyebrow">code</span>
          <input name="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={12} placeholder="Code from your email" aria-describedby="login-msg" />
        </label>
        {message && <div id="login-msg" className="notice" role="alert">{message}</div>}
        <div style={{ flex: 1 }} />
        <button type="submit" className="btn" disabled={checking}>{checking ? "Checking…" : "Sign in"}</button>
        <button type="button" className="btn ghost" style={{ height: 46, fontSize: 14 }} onClick={() => window.location.reload()}>Use a different email</button>
      </form>
    );
  }

  return (
    <form action={ask} style={{ display: "contents" }}>
      <label className="field">
        <span className="eyebrow">Email</span>
        <input name="email" type="email" inputMode="email" autoComplete="email" required
          placeholder="you@example.com" defaultValue={asked.email} aria-describedby="login-msg" />
      </label>
      {asked.message && <div id="login-msg" className="notice" role="alert">{asked.message}</div>}
      <div style={{ flex: 1 }} />
      <button type="submit" className="btn" disabled={asking}>{asking ? "Sending…" : "Email me a code"}</button>
    </form>
  );
}
