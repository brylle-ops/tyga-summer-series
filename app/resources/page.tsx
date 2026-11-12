import { Icon } from "@/components/Icons";
import { LockedTeaser, Screen, TopNav } from "@/components/ui";
import { hasMoreToCome, nextWeek, resources, unlocked } from "@/lib/mock-data";

// Summer resources
export default function Resources() {
  return (
    <Screen tabs>
      <TopNav title="Summer resources" back="/home" />
      <p className="sm mute">New ones land with each week&apos;s missions. Short and useful, never overwhelming.</p>
      <div className="res">
        {unlocked(resources).map((r) => (
          <div key={r.title} style={{ background: r.bg }}>
            <Icon name={r.icon} style={{ color: "var(--cream)" }} />
            <b>{r.title}</b><small>{r.detail}</small>
          </div>
        ))}
      </div>
      {hasMoreToCome(resources) && nextWeek && <LockedTeaser title="New resources next week" when={`Unlocks ${nextWeek.unlocks}`} />}
    </Screen>
  );
}
