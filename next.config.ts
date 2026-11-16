import type { NextConfig } from "next";

// Basic hardening headers: no framing (clickjacking), no MIME sniffing, limited referrer, no unused device access.
const nextConfig: NextConfig = {
  // Reward image uploads are capped at 2 MB (checked again in the action); the default body limit is 1 MB.
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
  async headers() {
    return [
    {
      source: "/:path*",
      headers: [
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        // Enforced subset of a CSP: no framing, no plugins, no <base> tricks, forms may only post to us or Square.
        { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self' https://*.squareup.com https://*.squareupsandbox.com https://*.square.link https://square.link https://*.square.site" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      ],
    },
    // Static assets: a week of caching with background revalidation (files may be replaced under the same name, so not immutable).
    ...["/img/:path*", "/icons/:path*"].map((source) => ({
      source,
      headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }],
    })),
    ];
  },
};

export default nextConfig;
