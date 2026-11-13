import Link from "next/link";
import { Icon } from "@/components/Icons";
import { LockedTeaser, Screen, TopNav } from "@/components/ui";
import { resources } from "@/lib/mock-data";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";

// Summer resources
export default async function Resources() {
  const v = await loadMemberView(await requireSeriesMember());
  const wk = Math.max(v.week, 1);
  const nextWeek = v.nextWeek;
  return (
    <Screen tabs>
      <TopNav title="Summer resources" back="/home" />
      <p className="sm mute">New ones land with each week&apos;s missions. Short and useful, never overwhelming.</p>
      <div className="res">
        {resources.filter((r) => r.week <= wk).map((r) => {
          const inner = <><Icon name={r.icon} style={{ color: "var(--cream)" }} /><b>{r.title}</b><small>{r.detail}</small></>;
          return r.title === "High-protein recipes"
            ? <Link key={r.title} href="/nutrition" style={{ background: r.bg }}>{inner}</Link>
            : <div key={r.title} style={{ background: r.bg }}>{inner}</div>;
        })}
      </div>
      {resources.some((r) => r.week > wk) && nextWeek && <LockedTeaser title="New resources next week" when={`Unlocks ${nextWeek.unlocks}`} />}
    </Screen>
  );
}
