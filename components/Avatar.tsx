// Round member photo, or their initials when there is no photo.
export default function Avatar({ url, initials, className = "av" }: { url?: string; initials: string; className?: string }) {
  return url
    // eslint-disable-next-line @next/next/no-img-element
    ? <span className={className}><img src={url} alt="" className="av-img" /></span>
    : <span className={className}>{initials}</span>;
}
