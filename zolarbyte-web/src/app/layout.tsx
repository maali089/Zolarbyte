import type { Metadata, Viewport } from "next";
import { Barlow_Semi_Condensed, Schibsted_Grotesk } from "next/font/google";
import { ViewTransition } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileDock } from "@/components/MobileDock";
import { GroundObserver } from "@/components/fx/GroundObserver";
import { RevealObserver } from "@/components/fx/RevealObserver";
import { LivingGrid } from "@/components/grid/LivingGrid";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { SunCursor } from "@/components/motion/SunCursor";
import { isPreview, site } from "@/lib/site";
import "./globals.css";

const display = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

const tech = Barlow_Semi_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Photovoltaik & Elektroinstallation in Karlsfeld – Zolarbyte",
    template: "%s – Zolarbyte",
  },
  description: site.description,
  applicationName: "Zolarbyte",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Zolarbyte",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
  robots: isPreview ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#f1f2ee",
  colorScheme: "light",
};

// Setzt html.js vor dem ersten Paint: Reveal-Animationen verstecken nur mit JS.
const jsFlag = `document.documentElement.classList.add('js')`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" className={`${display.variable} ${tech.variable}`} data-ground="day" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body>
        <a className="skip-link" href="#inhalt">
          Zum Inhalt springen
        </a>
        {isPreview ? (
          <div className="preview-bar" role="note">
            Interne Vorschau – noch nicht veröffentlicht
          </div>
        ) : null}
        <LivingGrid />
        <Header />
        <ViewTransition>
          <main id="inhalt" tabIndex={-1}>
            {children}
          </main>
        </ViewTransition>
        <Footer />
        <MobileDock />
        <SmoothScroll />
        <SunCursor />
        <RevealObserver />
        <GroundObserver />
      </body>
    </html>
  );
}
