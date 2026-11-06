import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { isPreview, site } from "@/lib/site";
import "./globals.css";

const display = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Zolarbyte – Elektrotechnik-Meisterbetrieb in Karlsfeld bei München",
    template: "%s – Zolarbyte",
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Zolarbyte",
  },
  robots: isPreview ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#121216",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de" data-scroll-behavior="smooth" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a className="skip-link" href="#inhalt">
          Zum Inhalt springen
        </a>
        {isPreview ? (
          <div className="preview-bar" role="note">
            Interne Vorschau – noch nicht veröffentlicht
          </div>
        ) : null}
        <Header />
        <main id="inhalt" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
