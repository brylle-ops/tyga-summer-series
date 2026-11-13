"use client";

// Friendly fallback if a page fails, so people never see a raw error screen.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="screen" style={{ display: "grid", placeItems: "center", minHeight: "100dvh", padding: 24 }}>
      <div style={{ display: "grid", gap: 12, textAlign: "center", maxWidth: 320 }}>
        <h1 className="h1">Something went wrong</h1>
        <p className="sm mute">We couldn&apos;t load that. Try again, or head back home.</p>
        <button type="button" className="btn" onClick={reset}>Try again</button>
        <a href="/home" className="btn ghost">Go home</a>
      </div>
    </main>
  );
}
