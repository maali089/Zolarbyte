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
  themeColor: "#050506",
};

/*
 * Markenauftritt beim ersten Öffnen der Startseite.
 * Läuft direkt nach dem Header, noch vor dem ersten Bild: misst die Header-Position
 * des Zeichens und lässt genau dieses Element von der Bildmitte dorthin wandern
 * (kein Doppelgänger, kein Ladebildschirm). Navigation bleibt sofort bedienbar.
 * Nicht bei reduzierter Bewegung, Sprungmarken oder erneutem Aufruf in derselben Sitzung.
 */
const INTRO_SCRIPT = `(function(){try{
var d=document.documentElement;
if(location.pathname!=="/"||location.hash||sessionStorage.getItem("zb-intro")||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
var m=document.querySelector("[data-zb-mark]"),h=document.querySelector(".site-header");if(!m||!h)return;
var r=m.getBoundingClientRect(),w=innerWidth,vh=innerHeight,hb=h.getBoundingClientRect().bottom;
var size=Math.min(w*0.44,(vh-hb)*0.4,250),cx=w/2,cy=hb+(vh-hb)*0.45;
d.style.setProperty("--zb-dx",(cx-(r.left+r.width/2)).toFixed(1)+"px");
d.style.setProperty("--zb-dy",(cy-(r.top+r.height/2)).toFixed(1)+"px");
d.style.setProperty("--zb-s",(size/r.width).toFixed(3));
d.style.setProperty("--scene-offset","1.25s");
d.classList.add("zb-intro");
sessionStorage.setItem("zb-intro","1");
setTimeout(function(){d.classList.remove("zb-intro")},2800);
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
      </body>
    </html>
  );
}
