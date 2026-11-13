import Link from "next/link";

export default function NotFound() {
  return (
    <main className="screen" style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 24 }}>
      <div style={{ display: "grid", gap: 12, textAlign: "center", maxWidth: 320 }}>
        <h1 className="h1">Page not found</h1>
        <p className="sm mute">That page doesn&apos;t exist.</p>
        <Link href="/" className="btn">Back to the app</Link>
      </div>
    </main>
  );
}
