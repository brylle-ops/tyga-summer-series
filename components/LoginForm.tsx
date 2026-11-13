"use client";

import { useActionState, useState } from "react";
import { requestLoginLink, verifyLoginCode, type LoginState } from "@/app/join/sign-in/actions";

// Two explicit steps instead of one form full of flags: ask for the email, then check the code.
function EmailStep({ onSent }: { onSent: (s: LoginState) => void }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(async (prev, formData) => {
    const next = await requestLoginLink(prev, formData);
    if (next.sent) onSent(next);
    return next;
  }, {});
  return (
    <form action={action} style={{ display: "contents" }}>
      <label className="field">
        <span className="eyebrow">Email</span>
        <input name="email" type="email" inputMode="email" autoComplete="email" required
          placeholder="you@example.com" defaultValue={state.email} aria-describedby="login-msg" />
      </label>
      {state.message && <div id="login-msg" className="notice" role="alert">{state.message}</div>}
      <div style={{ flex: 1 }} />
      <button type="submit" className="btn" disabled={pending}>{pending ? "Sending…" : "Email me a code"}</button>
    </form>
  );
}

function CodeStep({ email, note, next, onBack }: { email: string; note?: string; next: string; onBack: () => void }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(verifyLoginCode, {});
  const message = state.message ?? note;
  return (
    <form action={action} style={{ display: "contents" }}>
      <input type="hidden" name="email" value={email} />
      <input type="hidden" name="next" value={next} />
      <p className="sm mute">We emailed a code to <b>{email}</b>. It works once and expires in an hour.</p>
      <label className="field">
        <span className="eyebrow">Code</span>
        <input name="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={12}
          placeholder="Code from your email" aria-describedby="login-msg" />
      </label>
      {message && <div id="login-msg" className="notice" role="alert">{message}</div>}
      <div style={{ flex: 1 }} />
      <button type="submit" className="btn" disabled={pending}>{pending ? "Checking…" : "Sign in"}</button>
      <button type="button" className="btn ghost" style={{ height: 46, fontSize: 14 }} onClick={onBack}>Use a different email</button>
    </form>
  );
}


export default function LoginForm({ next = "/home" }: { next?: string }) {
  const [sent, setSent] = useState<LoginState | null>(null);
  return sent?.email
    ? <CodeStep email={sent.email} note={sent.message} next={next} onBack={() => setSent(null)} />
    : <EmailStep onSent={setSent} />;
}
