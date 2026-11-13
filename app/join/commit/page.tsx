import { redirect } from "next/navigation";
import { Screen, TopNav } from "@/components/ui";
import { getCurrentMember, supabaseReady } from "@/lib/session";
import { GOALS } from "@/lib/singlet";
import { saveGoal } from "../actions";

const ERRORS: Record<string, string> = {
  goal: "Pick the goal that fits you best.",
  name: "Please add your first and last name.",
  save: "We couldn't save that just now — please try again.",
};

// Join · step 2: the three-a-week commitment and a goal
export default async function Commit({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const me = await getCurrentMember();
  if (supabaseReady() && !me) redirect("/login?next=/join/commit");
  const current = me?.profile.goal ?? null;

  return (
    <Screen>
      <TopNav title="Your summer" back="/" />
      <div style={{ marginTop: 6 }}>
        <div className="eyebrow">{me?.profile.first_name ? `Welcome, ${me.profile.first_name}` : "Your summer commitment"}</div>
        <div className="h1" style={{ marginTop: 6 }}>
          Three a week.<br /><span className="script" style={{ fontSize: 38 }}>that&apos;s the standard</span>
        </div>
      </div>
      <p className="sm mute">Any mix counts. More is fine, but showing up is what wins.</p>
      <div className="three">
        <div><b>1</b><small>Yard<br />session</small></div>
        <div><b>2</b><small>Run or<br />Run Club</small></div>
        <div><b>3</b><small>Summer or<br />holiday workout</small></div>
      </div>
      <form action={saveGoal} style={{ display: "contents" }}>
        <fieldset style={{ border: 0, padding: 0, margin: 0, display: "contents" }}>
          {me && (!me.profile.first_name || !me.profile.last_name) && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <label className="field"><span className="eyebrow">First name</span>
                <input name="first_name" required maxLength={60} autoComplete="given-name" defaultValue={me.profile.first_name ?? ""} /></label>
              <label className="field"><span className="eyebrow">Last name</span>
                <input name="last_name" required maxLength={60} autoComplete="family-name" defaultValue={me.profile.last_name ?? ""} /></label>
            </div>
          )}
          <legend className="eyebrow" style={{ marginTop: 4 }}>What&apos;s your goal?</legend>
          <div className="chips">
            {GOALS.map((g, i) => (
              <label key={g} className="chip">
                <input type="radio" name="goal" value={g} required defaultChecked={current ? g === current : i === 0} />{g}
              </label>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          {error && ERRORS[error] && <p className="notice" role="alert">{ERRORS[error]}</p>}
          <label className="check">
            <input type="checkbox" name="commit" required />
            <span>I&apos;m in for 3 sessions a week, 7 Dec – 26 Jan.</span>
          </label>
          <button type="submit" className="btn">Let&apos;s go</button>
        </fieldset>
      </form>
    </Screen>
  );
}
