// Round member photo, or their initials when there is no photo.
export default function Avatar({ url, initials, className = "av" }: { url?: string; initials: string; className?: string }) {
  return url
    // eslint-disable-next-line @next/next/no-img-element
    ? <span className={className}><img src={url} alt="" className="av-img" /></span>
    : <span className={className}>{initials}</span>;
}

/** Small photo + name, for staff tables and lists. */
export function WithPhoto({ url, name, children }: { url?: string; name: string; children?: React.ReactNode }) {
  const initials = name.split(/\s+/).map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase() || "?";
  return (
    <span className="with-photo">
      <Avatar url={url} initials={initials} className="av av-sm" />
      <span>{children ?? name}</span>
    </span>
  );
}
