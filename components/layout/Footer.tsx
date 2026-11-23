"use client";

import { ArrowUp } from "@/components/ui/Icons";
import { site } from "@/data/portfolio";
import { scrollToSection } from "@/lib/lenis";
import Notch from "@/components/ui/Notch";
import { useI18n } from "@/lib/i18n";
import { playClickSound, playHoverSound } from "@/lib/audio";

export default function Footer() {
  const { locale, toggleLocale } = useI18n();

  return (
    <footer className="footer">
      <div className="footer__notch" aria-hidden>
        <Notch side="left" />
        <Notch side="right" />
      </div>

      <div className="footer__inner">
        <button
          type="button"
          className="footer__top"
          onClick={() => {
            playClickSound();
            scrollToSection("top");
          }}
          onMouseEnter={playHoverSound}
          aria-label={locale === "es" ? "Volver arriba" : "Back to top"}
        >
          <ArrowUp />
        </button>

        <div className="footer__links">
          <div className="footer__legal">
            <a href="#about" onClick={() => scrollToSection("about")} onMouseEnter={playHoverSound}>
              {locale === "es" ? "Sobre mí" : "About"}
            </a>
            <a href="#projects" onClick={() => scrollToSection("projects")} onMouseEnter={playHoverSound}>
              {locale === "es" ? "Proyectos" : "Projects"}
            </a>
            <a href="#contact" onClick={() => scrollToSection("contact")} onMouseEnter={playHoverSound}>
              {locale === "es" ? "Contacto" : "Contact"}
            </a>
          </div>
          <button
            type="button"
            className="footer__lang"
            onClick={() => {
              playClickSound();
              toggleLocale();
            }}
            onMouseEnter={playHoverSound}
            aria-label="Cambiar idioma"
          >
            {locale.toUpperCase()}
          </button>
        </div>

        <div className="footer__credits">
          {site.musicCredit ? (
            <span>
              {locale === "es"
                ? `Sonido generado por ${site.musicCredit}`
                : `Interactive sound by ${site.musicCredit}`}
            </span>
          ) : null}
          <span>{site.copyright}</span>
        </div>
      </div>
    </footer>
  );
}
