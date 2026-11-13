import type { MetadataRoute } from "next";

// Makes the site installable: "Add to Home Screen" opens it full screen like an app, straight to Home.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TYGA Summer Series",
    short_name: "TYGA Summer",
    description: "Maintain the standard — The Yard Gym Albury summer series.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0e0e0e",
    theme_color: "#0e0e0e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
