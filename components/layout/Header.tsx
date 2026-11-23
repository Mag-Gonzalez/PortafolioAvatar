"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LogoMark, SoundOffIcon, SoundOnIcon } from "@/components/ui/Icons";
import { scrollToSection } from "@/lib/lenis";
import { useI18n } from "@/lib/i18n";
import { toggleSound, playClickSound, playHoverSound } from "@/lib/audio";

const NAV_LINKS = [
  { id: "about", label: { es: "Sobre mí", en: "About" } },
  { id: "projects", label: { es: "Proyectos", en: "Projects" } },
  { id: "contact", label: { es: "Contacto", en: "Contact" } },
] as const;

export default function Header() {
  const { locale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState(0);
  const [sound, setSound] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);

      const about = document.getElementById("about");
      const contact = document.getElementById("contact");
      const marker = window.innerHeight * 0.5;
      const aboutRect = about?.getBoundingClientRect();
      const contactRect = contact?.getBoundingClientRect();

      setDark(
        Boolean(
          (aboutRect && aboutRect.top < marker && aboutRect.bottom > marker) ||
            (contactRect && contactRect.top < marker),
        ),
      );
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (element): element is HTMLElement => Boolean(element),
    );

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const index = NAV_LINKS.findIndex((link) => link.id === visible.target.id);
        if (index >= 0) setActive(index);
      },
      { rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.2, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const go = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    event.preventDefault();
    playClickSound();
    scrollToSection(id);
  };

  return (
    <header
      className={`header ${scrolled ? "header--scrolled" : ""} ${dark ? "header--dark" : ""}`}
    >
      <button
        type="button"
        className="header__logo"
        onClick={(event) => go(event, "top")}
        onMouseEnter={playHoverSound}
        aria-label="Miguel Ángel — volver al inicio"
      >
        <LogoMark />
      </button>

      <nav className="header__nav" aria-label="Navegación principal">
        <div className="header__nav-pill">
          <motion.span
            className="header__nav-indicator"
            aria-hidden
            animate={{ x: active * 128 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
          />
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={`header__nav-link ${active === index ? "is-active" : ""}`}
              onClick={(event) => go(event, link.id)}
              onMouseEnter={playHoverSound}
              aria-current={active === index ? "page" : undefined}
            >
              {link.label[locale]}
            </a>
          ))}
        </div>
      </nav>

      <div className="header__actions">
        <a
          href="#contact"
          className="header__cta"
          onClick={(event) => go(event, "contact")}
          onMouseEnter={playHoverSound}
        >
          {locale === "es" ? "Escríbeme" : "Get in touch"}
        </a>
        <button
          type="button"
          className="header__sound"
          onClick={() => {
            playClickSound();
            setSound(toggleSound());
          }}
          onMouseEnter={playHoverSound}
          aria-label={sound ? "Silenciar sonido" : "Activar sonido interactivo"}
          aria-pressed={sound}
        >
          {sound ? <SoundOnIcon /> : <SoundOffIcon />}
        </button>
      </div>
    </header>
  );
}
