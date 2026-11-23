"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { profile } from "@/data/portfolio";
import Banner from "@/components/ui/Banner";
import ScrollIndicator from "@/components/layout/ScrollIndicator";
import HeroAvatar from "@/components/sections/HeroAvatar";
import { useI18n } from "@/lib/i18n";
import { playHoverSound } from "@/lib/audio";

export default function IntroAbout() {
  const { locale } = useI18n();
  const root = useRef<HTMLElement>(null);
  const heroInner = useRef<HTMLDivElement>(null);
  const avatarWrapper = useRef<HTMLDivElement>(null);
  const aboutSection = useRef<HTMLDivElement>(null);
  const details = useRef<HTMLDivElement>(null);
  const description = useRef<HTMLDivElement>(null);
  const skills = useRef<HTMLDivElement>(null);
  const progressText = useRef<HTMLSpanElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const match = gsap.matchMedia();

      match.add(
        {
          desktop: "(min-width: 1024px)",
          mobile: "(max-width: 1023px)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (context) => {
          const { desktop, reduce } = context.conditions as {
            desktop: boolean;
            mobile: boolean;
            reduce: boolean;
          };

          if (reduce) {
            if (aboutSection.current) gsap.set(aboutSection.current, { opacity: 1 });
            return;
          }

          // Transición al hacer scroll desde Hero hacia About
          // El texto del hero y el avatar se mueven suavemente
          if (desktop) {
            gsap.to(heroInner.current, {
              y: "-12vh",
              opacity: 0,
              ease: "power2.inOut",
              scrollTrigger: {
                trigger: root.current,
                start: "10% top",
                end: "45% top",
                scrub: 1,
              },
            });

            gsap.to(avatarWrapper.current, {
              y: "-6vh",
              scale: 0.92,
              opacity: 0.2,
              ease: "power2.inOut",
              scrollTrigger: {
                trigger: root.current,
                start: "15% top",
                end: "50% top",
                scrub: 1,
              },
            });
          } else {
            // Versión táctil / móvil
            gsap.to([heroInner.current, avatarWrapper.current], {
              opacity: 0,
              y: "-5vh",
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "10% top",
                end: "35% top",
                scrub: 1,
              },
            });
          }

          // Barra de progreso interactiva ligada al scroll del bloque
          gsap.to(
            {},
            {
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.5,
                onUpdate: (self) => {
                  const val = Math.round(self.progress * 100);
                  if (progressText.current) progressText.current.textContent = `${val}%`;
                  if (progressBar.current)
                    progressBar.current.style.transform = `scaleX(${self.progress})`;
                },
              },
            },
          );

          // Entrada de la información de "Sobre mí" SOLO cuando el usuario hace scroll
          // (Evita que aparezcan cuadros vacíos en el Hero)
          const aboutTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: root.current,
              start: desktop ? "35% top" : "25% top",
              end: "80% top",
              scrub: 1,
            },
          });

          aboutTimeline.fromTo(
            aboutSection.current,
            { opacity: 0, y: "10vh", pointerEvents: "none" },
            { opacity: 1, y: 0, pointerEvents: "auto", duration: 1, ease: "power2.out" },
          );

          // Salida al abandonar la sección
          gsap.to(aboutSection.current, {
            opacity: 0,
            y: "-10vh",
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "85% top",
              end: "bottom top",
              scrub: true,
            },
          });
        },
      );

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="intro" id="top" ref={root}>
      {/* ====================================================================
          HERO PRINCIPAL (EQUILIBRADO, IMPACTANTE, SIN ELEMENTOS INCOMPLETOS)
          ==================================================================== */}
      <div className="hero-viewport">
        <div className="hero-container container">
          {/* Columna Izquierda: Tipografía y jerarquía */}
          <div className="hero-content" ref={heroInner}>
            <div className="hero-eyebrow">
              <span className="pulsing-dot" />
              <span>{profile.badge[locale]}</span>
            </div>

            <h1 className="hero-title">
              <span className="hero-title-first">{profile.firstName}</span>
              <span className="hero-title-last">{profile.lastName}</span>
            </h1>

            <Banner className="hero-banner">{profile.role[locale]}</Banner>

            <p className="hero-summary">
              {locale === "es"
                ? "Estudiante ADSO SENA. Construyo experiencias web interactivas, interfaces fluidas y arquitecturas full stack modernas."
                : "SENA ADSO Student. Building interactive web experiences, fluid interfaces, and modern full-stack architectures."}
            </p>

            <div className="hero-actions">
              <a href="#projects" className="button button--accent button--md">
                {locale === "es" ? "Ver proyectos" : "View projects"}
              </a>
              <a href="#about" className="button button--theme button--md">
                {locale === "es" ? "Sobre mí" : "About me"}
              </a>
            </div>
          </div>

          {/* Columna Derecha: Avatar protagonista estilizado */}
          <div className="hero-visual" ref={avatarWrapper}>
            <HeroAvatar />
          </div>
        </div>

        <ScrollIndicator />
      </div>

      {/* ====================================================================
          SECCIÓN "SOBRE MÍ" (SE REVELA CON EL SCROLL CON CONTENIDO COMPLETO)
          ==================================================================== */}
      <div className="about-overlay" ref={aboutSection} id="about" data-theme="dark">
        <div className="container about-container">
          <div className="about-header">
            <span className="about-eyebrow">
              {locale === "es" ? "01 / Sobre mí" : "01 / About"}
            </span>
            <h2 className="about-title">
              {locale === "es" ? "Pasión por el" : "Passion for"}
              <br />
              <em>{locale === "es" ? "código y el diseño" : "Code & Design"}</em>
            </h2>
          </div>

          <div className="about-cards-grid">
            {/* Tarjeta 1: Perfil personal */}
            <div className="about-card about-card--profile" ref={details} onMouseEnter={playHoverSound}>
              <div className="about-card-badge">
                <div className="about-card-avatar">
                  <Image
                    src="/assets/avatar/avatar-main.jpg"
                    alt={profile.name}
                    width={64}
                    height={64}
                    className="about-avatar-img"
                    unoptimized
                  />
                  <span className="avatar-status-beacon" title="En línea" />
                </div>
                <div>
                  <h3 className="about-card-name">{profile.name}</h3>
                  <span className="about-card-role">{profile.role[locale]}</span>
                </div>
              </div>
              <div className="about-card-meta">
                <span>📍 {profile.location[locale]}</span>
                <span className="meta-highlight">⚡ SENA ADSO</span>
              </div>
            </div>

            {/* Tarjeta 2: Biografía y Filosofía */}
            <div className="about-card about-card--bio" ref={description} onMouseEnter={playHoverSound}>
              <h4 className="about-card-heading">
                {locale === "es" ? "Enfoque & Filosofía" : "Focus & Philosophy"}
              </h4>
              <p className="about-bio-text">{profile.bio[locale]}</p>
              <p className="about-philo-text">{profile.philosophy[locale]}</p>
            </div>

            {/* Tarjeta 3: Métricas y Estadísticas */}
            <div className="about-card about-card--stats" ref={skills} onMouseEnter={playHoverSound}>
              <h4 className="about-card-heading">
                {locale === "es" ? "Métricas clave" : "Key Metrics"}
              </h4>
              <div className="about-stats-grid">
                {profile.stats.map((stat, i) => (
                  <div key={i} className="about-stat-item">
                    <span className="about-stat-number">{stat.value}</span>
                    <span className="about-stat-label">{stat.label[locale]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="about-scroll-progress">
            <div className="about-progress-line">
              <span ref={progressBar} />
            </div>
            <span className="about-progress-number" ref={progressText}>
              0%
            </span>
          </div>
        </div>
      </div>

      <div className="intro__spacer" aria-hidden />
    </section>
  );
}
