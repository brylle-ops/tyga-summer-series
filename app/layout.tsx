import type { Metadata, Viewport } from "next";
import { IconSprite } from "@/components/Icons";
import "./globals.css";

export const metadata: Metadata = {
  title: "TYGA Summer Series",
  description: "Maintain the standard — The Yard Gym Albury summer series, 7 Dec – 26 Jan.",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  appleWebApp: { capable: true, title: "TYGA Summer", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0e0e0e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Inter:wght@400;500;600;700;800&family=Yellowtail&display=swap"
        />
      </head>
      <body>
        <IconSprite />
        {children}
      </body>
    </html>
  );
}
