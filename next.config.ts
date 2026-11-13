import type { NextConfig } from "next";

// Basic hardening headers: no framing (clickjacking), no MIME sniffing, limited referrer, no unused device access.
const nextConfig: NextConfig = {
  async headers() {
    return [{
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
    }];
  },
};

export default nextConfig;
