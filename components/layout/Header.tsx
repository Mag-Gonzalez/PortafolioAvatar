"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoMark, SoundOffIcon, SoundOnIcon } from "@/components/ui/Icons";
import { scrollToSection } from "@/lib/lenis";
import { useI18n } from "@/lib/i18n";
import { toggleSound, playClickSound, playHoverSound } from "@/lib/audio";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const NAV_LINKS = [
  { id: "top", label: { es: "Inicio", en: "Home" } },
  { id: "about", label: { es: "Sobre mí", en: "About" } },
  { id: "skills", label: { es: "Habilidades", en: "Skills" } },
  { id: "projects", label: { es: "Proyectos", en: "Projects" } },
  { id: "experience", label: { es: "Trayectoria", en: "Experience" } },
  { id: "contact", label: { es: "Contacto", en: "Contact" } },
] as const;

export default function Header() {
  const { locale, toggleLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(0);
  const [sound, setSound] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useBodyScrollLock(mobileMenuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS
      .map((link) => document.getElementById(link.id))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = NAV_LINKS.findIndex((link) => link.id === visible.target.id);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: [0, 0.2, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const handleToggleSound = () => {
    const next = toggleSound();
    setSound(next);
  };

  const handleToggleLocale = () => {
    playClickSound();
    toggleLocale();
  };

  const go = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    playClickSound();
    setMobileMenuOpen(false);
    scrollToSection(id);
  };

  const toggleMobileMenu = () => {
    playClickSound();
    const next = !mobileMenuOpen;
    setMobileMenuOpen(next);
  };

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <button
        type="button"
        className="header__logo"
        onClick={() => {
          playClickSound();
          scrollToSection("top");
        }}
        aria-label="MAGM — Volver al inicio"
        tabIndex={0}
        onMouseEnter={playHoverSound}
      >
        <LogoMark />
        <span>MAGM</span>
      </button>

      {/* Navegación de escritorio (Píldora flotante animada) */}
      <nav className="header__nav header__nav--desktop" aria-label="Navegación principal">
        <div className="header__nav-pill">
          <motion.span
            className="header__nav-indicator"
            aria-hidden
            animate={{ x: active * 94 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
          />
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`header__nav-link ${active === index ? "is-active" : ""}`}
              onClick={(event) => go(event, link.id)}
              onMouseEnter={playHoverSound}
              aria-current={active === index ? "true" : undefined}
            >
              {link.label[locale]}
            </a>
          ))}
        </div>
      </nav>

      {/* Acciones de la derecha en escritorio */}
      <div className="header__right header__right--desktop">
        <button
          type="button"
          className="header-lang-btn"
          onClick={handleToggleLocale}
          onMouseEnter={playHoverSound}
          title={locale === "es" ? "Cambiar a inglés" : "Switch to Spanish"}
        >
          {locale.toUpperCase()}
        </button>

        <button
          type="button"
          className="button button--theme button--md button--round header__sound"
          onClick={handleToggleSound}
          onMouseEnter={playHoverSound}
          aria-label={sound ? "Silenciar sonido" : "Activar sonido interactivo"}
          aria-pressed={sound}
        >
          {sound ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>

        <a
          href="#contact"
          className="button button--accent button--md header__cta"
          onClick={(event) => go(event, "contact")}
          onMouseEnter={playHoverSound}
        >
          {locale === "es" ? "Hablemos" : "Let's talk"}
        </a>
      </div>

      {/* Botón de Menú Móvil (Hamburguesa táctil moderna) */}
      <button
        type="button"
        className={`header__mobile-toggle ${mobileMenuOpen ? "is-open" : ""}`}
        onClick={toggleMobileMenu}
        aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
        aria-expanded={mobileMenuOpen}
      >
        <span className="toggle-line line-1" />
        <span className="toggle-line line-2" />
        <span className="toggle-line line-3" />
      </button>

      {/* Menú Desplegable Móvil Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="mobile-nav-overlay"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
          >
            <div className="mobile-nav-content">
              <nav className="mobile-nav-links">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    className="mobile-nav-link"
                    onClick={(e) => go(e, link.id)}
                  >
                    {link.label[locale]}
                  </a>
                ))}
              </nav>

              <div className="mobile-nav-controls">
                <button
                  type="button"
                  className="mobile-control-btn"
                  onClick={handleToggleLocale}
                >
                  🌐 Idioma: {locale.toUpperCase()}
                </button>
                <button
                  type="button"
                  className="mobile-control-btn"
                  onClick={handleToggleSound}
                >
                  {sound ? "🔊 Sonido: Activado" : "🔇 Sonido: Silenciado"}
                </button>
                <a
                  href="#contact"
                  className="button button--accent button--md mobile-cta-btn"
                  onClick={(e) => go(e, "contact")}
                >
                  {locale === "es" ? "Hablemos" : "Let's talk"}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
