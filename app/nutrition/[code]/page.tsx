import Link from "next/link";
import { notFound } from "next/navigation";
import { Icon } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { LINEUP, MEAL_LABEL, RECIPES } from "@/lib/nutrition";

// One recipe: ingredients, method, and where it sits in the seven-day plan.
export default async function RecipePage({ params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase();
  const i = RECIPES.findIndex((r) => r.code === code);
  if (i < 0) notFound();
  const r = RECIPES[i];
  const days = LINEUP.filter((d) => d.b === code || d.l === code || d.d === code).map((d) => d.day);
  const prev = RECIPES[i - 1];
  const next = RECIPES[i + 1];
  return (
    <Screen tabs className="sand">
      <TopNav title="Recipe" back="/nutrition" />
      <div className={`rtile ${r.meal}`} style={{ padding: 0, border: 0, background: "none" }}>
        <span className="rart" style={{ aspectRatio: "16/9" }}><Icon name={r.icon} /><i>{r.code}</i></span>
      </div>
      <div>
        <div className="xs mute" style={{ letterSpacing: 1.2 }}>{MEAL_LABEL[r.meal].toUpperCase()} · {r.yields} · PREP {r.prep} · {r.cook.toUpperCase()}</div>
        <h1 className="disp" style={{ fontSize: 30 }}>{r.title}</h1>
      </div>
      <div className="sheet pad">
        <div className="eyebrow">Ingredients</div>
        <ul style={{ margin: "6px 0 14px", paddingLeft: 18, display: "grid", gap: 4 }}>{r.ingredients.map((x) => <li key={x}>{x}</li>)}</ul>
        <div className="eyebrow">Make it</div>
        <p style={{ margin: "6px 0 0" }}>{r.method}</p>
      </div>
      {days.length > 0 && <p className="sm mute">In your seven-day plan: Day {days.join(", Day ")}.</p>}
      <Link href="/missions" className="info-link">
        <span className="grow"><b className="disp sm-d">Fuel It mission</b><small style={{ display: "block", color: "var(--ink-mute)", fontSize: 12 }}>Cook a Summer Series recipe in Week 6, earn +15</small></span>
        <span aria-hidden="true">›</span>
      </Link>
      <div className="li" style={{ justifyContent: "space-between" }}>
        {prev ? <Link className="chip" href={`/nutrition/${prev.code}`}>‹ {prev.code}</Link> : <span />}
        {next ? <Link className="chip" href={`/nutrition/${next.code}`}>{next.code} ›</Link> : <span />}
      </div>
    </Screen>
  );
}
