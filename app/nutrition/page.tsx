import { Icon } from "@/components/Icons";
import { Screen, TopNav } from "@/components/ui";
import { BEFORE_TRAINING, LINEUP, MEAL_LABEL, PLAN_NOTE, QUICK_FOOD, RECIPES, byCode, type Meal, type Recipe } from "@/lib/nutrition";

export const metadata = { title: "Yard Fuel · TYGA Summer Series" };

const GROUPS: { meal: Meal | "dinner-snack"; title: string; sub: string; meals: Meal[] }[] = [
  { meal: "breakfast", title: "Start well", sub: "Three breakfasts", meals: ["breakfast"] },
  { meal: "lunch", title: "Keep going", sub: "Three lunches", meals: ["lunch"] },
  { meal: "dinner-snack", title: "Dinner, sorted", sub: "Batch-friendly dinners and a snack", meals: ["dinner", "snack"] },
];

// Yard Fuel: the gym's seven-day meal plan, in summer colours. Recipes open on tap.
export default function Nutrition() {
  return (
    <Screen tabs bodyStyle={{ gap: 14 }}>
      <TopNav title="Yard Fuel" back="/home" />

      <section className="nu-hero" aria-labelledby="nu-h">
        <span className="nu-sun" aria-hidden="true" />
        <div className="eyebrow">The Yard · 7 days of Yard Fuel</div>
        <h1 id="nu-h" className="nu-title">Start well.<br /><span className="script">keep going</span></h1>
        <p className="sm">10 recipes. A simple rotation. Food that fits into your week.</p>
        <div className="nu-count">
          <div><b>3</b><small>breakfasts</small></div>
          <div><b>3</b><small>lunches</small></div>
          <div><b>3</b><small>dinners</small></div>
          <div><b>1</b><small>snack</small></div>
        </div>
      </section>

      <section aria-labelledby="nu-week">
        <div className="li"><h2 id="nu-week" className="h2 grow">The seven-day line-up</h2></div>
        <p className="xs mute" style={{ margin: "2px 0 8px" }}>Start on any day. Swap meals as needed. Tap a code to jump to the recipe.</p>
        <div className="nu-days">
          {LINEUP.map((d) => (
            <div key={d.day} className="nu-day">
              <b>Day {d.day}</b>
              {(["b", "l", "d"] as const).map((k) => {
                const r = byCode(d[k]);
                return (
                  <a key={k} href={`#${r.code}`} className={`nu-chip ${r.meal}`}>
                    <span>{r.code}</span>{r.short}
                  </a>
                );
              })}
            </div>
          ))}
        </div>
        <p className="xs mute" style={{ marginTop: 8 }}>{PLAN_NOTE}</p>
      </section>

      {GROUPS.map((g) => (
        <section key={g.meal} aria-labelledby={`g-${g.meal}`}>
          <h2 id={`g-${g.meal}`} className="h2">{g.title}</h2>
          <p className="xs mute" style={{ margin: "2px 0 8px" }}>{g.sub}</p>
          <div className="nu-list">
            {RECIPES.filter((r) => g.meals.includes(r.meal)).map((r) => <RecipeCard key={r.code} r={r} />)}
          </div>
        </section>
      ))}

      <section className="nu-quick" aria-labelledby="nu-q">
        <h2 id="nu-q" className="h2">Quick food options</h2>
        <div className="chips" style={{ marginTop: 8 }}>
          {QUICK_FOOD.map((q) => <span key={q} className="chip">{q}</span>)}
        </div>
        <p className="xs mute" style={{ marginTop: 10 }}>{BEFORE_TRAINING}</p>
      </section>
    </Screen>
  );
}

function RecipeCard({ r }: { r: Recipe }) {
  return (
    <details id={r.code} className={`nu-card ${r.meal}`}>
      <summary>
        <span className="nu-code">{r.code}</span>
        <span className="grow">
          <b>{r.title}</b>
          <small>{r.yields} · Prep {r.prep} · {r.cook}</small>
        </span>
        <Icon name={r.icon} className="nu-ico" />
      </summary>
      <div className="nu-body">
        <div className="eyebrow">{MEAL_LABEL[r.meal]} · ingredients</div>
        <ul>{r.ingredients.map((i) => <li key={i}>{i}</li>)}</ul>
        <div className="eyebrow" style={{ marginTop: 10 }}>Make it</div>
        <p className="sm">{r.method}</p>
      </div>
    </details>
  );
}
