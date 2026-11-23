import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { site } from "@/data/portfolio";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Preloader from "@/components/layout/Preloader";
import CustomCursor from "@/components/layout/CustomCursor";
import Header from "@/components/layout/Header";

// Fuentes locales: Urbanist (SIL OFL) y ProFontWindows (freeware, redistribute terms incluidas).
const urbanist = localFont({
  src: "./fonts/Urbanist-latin.woff2",
  variable: "--font-urbanist-local",
  weight: "100 900",
  display: "swap",
  fallback: ["system-ui", "Arial", "sans-serif"],
});

const profontWindows = localFont({
  src: "./fonts/ProFontWindows.ttf",
  variable: "--font-profont-local",
  weight: "400",
  display: "swap",
  fallback: ["Courier New", "monospace"],
});

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  applicationName: site.title,
  authors: [{ name: "Miguel Ángel González Muñoz" }],
  keywords: ["portafolio", "desarrollo web", "React", "Next.js", "TypeScript"],
  openGraph: {
    type: "website",
    locale: "es_CO",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f5efe6",
  colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      className={`${urbanist.variable} ${profontWindows.variable} antialiased`}
    >
      <body>
        <a className="sr-only" href="#main">
          Saltar al contenido
        </a>
        <Preloader />
        <CustomCursor />
        <Header />
        <SmoothScroll>
          <main id="main">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
