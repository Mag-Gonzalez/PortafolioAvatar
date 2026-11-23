import type { Metadata, Viewport } from "next";
import "./globals.css";
import { site } from "@/data/portfolio";
import SmoothScroll from "@/components/providers/SmoothScroll";
import Preloader from "@/components/layout/Preloader";
import CustomCursor from "@/components/layout/CustomCursor";
import Header from "@/components/layout/Header";

// Definición de fuentes seguras sin dependencia externa de red
const fontVariables = "font-sans-fallback";

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  applicationName: site.title,
  authors: [{ name: "Miguel Angel Gonzalez Muñoz" }],
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
    <html lang="es" className={fontVariables}>
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
