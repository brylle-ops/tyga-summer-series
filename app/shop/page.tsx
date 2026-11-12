import Link from "next/link";
import { Screen, TopNav } from "@/components/ui";

type Product = { slug: string; name: string; blurb: string; price: string; href?: string; image?: string };

// Skeleton: swap in real names, prices and photos (drop images in /public/img and set `image`).
const PRODUCTS: Product[] = [
  { slug: "singlet", name: "Summer Series singlet", blurb: "Limited edition · Women's & Men's · Cream or Charcoal wash", price: "$15", href: "/join/singlet", image: "/img/singlet-cream-front.jpg" },
  { slug: "product-2", name: "Product name", blurb: "Short description goes here", price: "$—" },
  { slug: "product-3", name: "Product name", blurb: "Short description goes here", price: "$—" },
  { slug: "product-4", name: "Product name", blurb: "Short description goes here", price: "$—" },
];

// Shop: merch and products. Joining the series is free — you only sign in to buy or to take part.
export default function Shop() {
  return (
    <Screen>
      <TopNav title="Shop" back="/" />
      <div style={{ marginTop: 6 }}>
        <div className="eyebrow">TYGA Summer Series</div>
        <div className="h1" style={{ marginTop: 6 }}>
          Wear the standard.<br /><span className="script" style={{ fontSize: 34 }}>merch &amp; more</span>
        </div>
      </div>
      <div className="shop-grid">
        {PRODUCTS.map((p) => {
          const body = (
            <>
              <div className={`shop-img ${p.image ? "" : "empty"}`}>
                {p.image ? <img src={p.image} alt={p.name} /> : <span>Image coming soon</span>}
              </div>
              <div className="shop-info">
                <b>{p.name}</b>
                <span className="xs mute">{p.blurb}</span>
                <span className="shop-foot">
                  <span className="shop-price">{p.price}</span>
                  <span className="xs">{p.href ? "Choose ›" : "Coming soon"}</span>
                </span>
              </div>
            </>
          );
          return p.href
            ? <Link key={p.slug} href={p.href} className="shop-card">{body}</Link>
            : <div key={p.slug} className="shop-card soon" aria-disabled="true">{body}</div>;
        })}
      </div>
      <p className="xs mute" style={{ textAlign: "center" }}>
        You&apos;ll sign in with your email before you order. <Link href="/login" className="link">Sign in</Link>
      </p>
    </Screen>
  );
}
