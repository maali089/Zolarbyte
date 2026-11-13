import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FloatingContact } from "@/components/FloatingContact";
import { isPreview, site } from "@/lib/site";
import "./globals.css";
import "./relaunch.css";

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
    default: "ZOLARBYTE ENERGY – Photovoltaik, Wärmepumpen und Stromspeicher vom Elektrotechnik-Meisterbetrieb",
    template: "%s – ZOLARBYTE ENERGY",
  },
  description: site.description,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "ZOLARBYTE ENERGY",
  },
  robots: isPreview ? { index: false, follow: false } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#050506",
};

/*
 * Markenauftritt beim ersten Öffnen der Startseite (nur große Bildschirme).
 * Läuft direkt nach dem Header: Das Header-Zeichen erscheint kurz groß über dem
 * Energiehaus (als „Sonne“ der Szene) und gleitet an seinen Platz. Text, Navigation
 * und Buttons sind die ganze Zeit sichtbar und bedienbar – keine Ladepause.
 * Nicht bei reduzierter Bewegung, Sprungmarken, kleinen Bildschirmen oder erneutem Aufruf.
 */
const INTRO_SCRIPT = `(function(){try{
var d=document.documentElement;
if(location.pathname!=="/"||location.hash||innerWidth<1000||sessionStorage.getItem("zb-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var m=document.querySelector("[data-zb-mark]");if(!m)return;
var r=m.getBoundingClientRect(),w=innerWidth,vh=innerHeight;
var size=Math.min(w*0.12,vh*0.2,170),cx=w*0.74,cy=Math.min(vh*0.24,250);
d.style.setProperty("--zb-dx",(cx-(r.left+r.width/2)).toFixed(1)+"px");
d.style.setProperty("--zb-dy",(cy-(r.top+r.height/2)).toFixed(1)+"px");
d.style.setProperty("--zb-s",(size/r.width).toFixed(3));
d.classList.add("zb-intro");
sessionStorage.setItem("zb-intro","1");
setTimeout(function(){d.classList.remove("zb-intro")},2000);
}catch(e){}})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
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
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <main id="inhalt" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <FloatingContact />
      </body>
    </html>
  );
}
