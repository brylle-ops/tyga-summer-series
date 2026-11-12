import { Icon } from "@/components/Icons";
import { LockedTeaser, Screen, SegLinks, TopNav } from "@/components/ui";
import { PERKS, perkCode } from "@/lib/perks";
import { loadMemberView, requireSeriesMember } from "@/lib/series-data";
import { LEVELS } from "@/lib/series";

// Perks unlock by level; each member gets their own code to show at the counter
export default async function Perks({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  const profile = await requireSeriesMember();
  const v = await loadMemberView(profile);
  const released = PERKS.filter((p) => p.week <= Math.max(v.week, 1));
  const mine = released.filter((p) => p.level <= v.me.level);
  const later = released.filter((p) => p.level > v.me.level);
  const all = tab === "all";
  return (
    <Screen tabs>
      <TopNav title="Perks" />
      <SegLinks options={[{ label: "My perks", href: "/perks" }, { label: "All perks", href: "/perks?tab=all" }]} active={all ? "All perks" : "My perks"} />
      {!all && mine.length === 0 && <p className="notice">Reach level 2 (50 points) to unlock your first perk.</p>}
      {!all && mine.map((p) => (
        <div key={p.key} className="voucher">
          <div className="v-top">
            <span className="ico" style={{ background: "rgba(29,27,24,.08)", color: "var(--ink)", width: 48, height: 48, borderRadius: 15 }}><Icon name={p.icon} /></span>
            <div className="grow">
              <div className="xs" style={{ color: "var(--ink-mute)", fontWeight: 600, letterSpacing: 1.5 }}>UNLOCKED · LEVEL {p.level}</div>
              <b style={{ fontSize: 16 }}>{p.title}</b>
              <div className="sm" style={{ color: "var(--ink-mute)" }}>{p.partner}</div>
            </div>
          </div>
          <div className="v-code"><b>{perkCode(p.key, profile?.member_no ?? 148)}</b><span className="xs" style={{ color: "var(--ink-mute)" }}>Show at the counter · use by 26 Jan</span></div>
        </div>
      ))}
      <div className="eyebrow" style={{ marginTop: 4 }}>{all ? "All perks" : "Next to unlock"}</div>
      {(all ? released : later).map((p) => {
        const need = LEVELS[p.level - 1].at;
        const unlocked = p.level <= v.me.level;
        return (
          <div key={p.key} className={`perk ${unlocked ? "" : "locked"}`}>
            <div className="art" style={{ background: p.art }}><Icon name={p.icon} style={{ color: "var(--cream)" }} /></div>
            <div className="grow">
              <b>{p.title}</b><div className="xs mute">{p.partner} · Level {p.level}</div>
              {!unlocked && <div className="bar" style={{ marginTop: 7 }}><i style={{ width: `${Math.min(100, Math.round((v.me.points / need) * 100))}%` }} /></div>}
            </div>
            {unlocked ? <span className="xs mute">Unlocked</span> : <span className="xs mute">{need - v.me.points} pts</span>}
          </div>
        );
      })}
      {PERKS.some((p) => p.week > Math.max(v.week, 1)) && v.nextWeek && <LockedTeaser title="More perks on the way" when={`Next drop ${v.nextWeek.unlocks}`} />}
    </Screen>
  );
}
