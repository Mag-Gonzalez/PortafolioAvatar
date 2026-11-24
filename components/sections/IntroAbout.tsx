"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { profile } from "@/data/portfolio";
import Banner from "@/components/ui/Banner";
import { useI18n } from "@/lib/i18n";
import AvatarStage from "@/components/three/AvatarStage";

const FOCUS_ITEMS = {
  es: ["Desarrollo web", "Interfaces interactivas", "ReserVa", "ZARFA"],
  en: ["Web development", "Interactive interfaces", "ReserVa", "ZARFA"],
};

export default function IntroAbout() {
  const { locale } = useI18n();
  const root = useRef<HTMLElement>(null);
  const heroInner = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const aboutContent = useRef<HTMLDivElement>(null);
  const progressText = useRef<HTMLSpanElement>(null);
  const progressBar = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      sceneState.progress = 1;
      sceneState.aboutIn = 1;
      if (backdrop.current) backdrop.current.style.opacity = "1";
      if (aboutContent.current) aboutContent.current.style.opacity = "1";
      if (progressText.current) progressText.current.textContent = "100%";
      if (progressBar.current) progressBar.current.style.transform = "scaleX(1)";
      return;
    }

    const ctx = gsap.context(() => {
      // 1. Hero text se encoge, asciende y desaparece en la primera fase del scroll
      gsap.to(heroInner.current, {
        yPercent: -22,
        scale: 0.92,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "4% top",
          end: "28% top",
          scrub: 1,
        },
      });

      // 2. Fondo cyberspace (deep blue + glow) se revela de 0 a 1
      gsap.fromTo(
        backdrop.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "6% top",
            end: "28% top",
            scrub: 1,
          },
        },
      );

      // 3. El avatar 3D es una única instancia gestionada por AvatarStage dentro del canvas

      // 4. Paneles HUD holográficos de About aparecen y se desvanecen
      gsap.fromTo(
        aboutContent.current,
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "24% top",
            end: "38% top",
            scrub: 1,
          },
        },
      );

      gsap.to(aboutContent.current, {
        opacity: 0,
        y: -35,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "86% top",
          end: "100% top",
          scrub: 1,
        },
      });

      // 5. Desvanecimiento del fondo al finalizar la sección hacia Projects
      gsap.to(backdrop.current, {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "92% top",
          end: "100% top",
          scrub: 1,
        },
      });

      // 6. Contador de progreso numérico y barra de scroll
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const progress = self.progress;
          sceneState.progress = progress;
          sceneState.heroOut = Math.min(1, progress * 3.4);
          sceneState.aboutIn = Math.min(1, Math.max(0, (progress - 0.16) * 3.2));
          sceneState.aboutOut = Math.min(1, Math.max(0, (progress - 0.82) * 5.5));
          sceneState.idle = progress;

          if (progressText.current) {
            progressText.current.textContent = `${Math.round(progress * 100)}%`;
          }
          if (progressBar.current) {
            progressBar.current.style.transform = `scaleX(${progress})`;
          }
        },
      });

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="intro" id="top" ref={root}>
      {/* Capa continua fija del Hero y About */}
      <div className="intro__sticky">
        {/* Fondo continuo cyberspace con gradiente e iluminación radial */}
        <div className="scene-canvas-host" ref={backdrop} aria-hidden="true">
          <AvatarStage />
        </div>
        <div className="scene-canvas-host__glow" aria-hidden="true" />

        {/* Paneles holográficos informativos; el avatar 3D se renderiza una sola vez en el canvas */}
        <div className="about-content" ref={aboutContent} data-theme="dark">
          <div className="about-panel about-panel--details">
            <div className="about-panel__box">
              <p className="about-panel__title">Miguel Ángel</p>
              <p className="about-panel__meta">
                <span className="pin-dot" aria-hidden />
                {profile.location[locale]}
              </p>
            </div>
          </div>

          <div className="about-panel about-panel--description">
            <div className="about-panel__box">
              <p className="about-panel__copy">{profile.bio[locale]}</p>
            </div>
          </div>

          <div className="about-panel about-panel--focus">
            <div className="about-panel__box">
              <p className="about-panel__title">
                {locale === "es" ? "Enfoque" : "Focus"}
              </p>
              <ul className="about-panel__list">
                {FOCUS_ITEMS[locale].map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="about-progress">
            <span className="about-progress__line" aria-hidden>
              <span ref={progressBar} />
            </span>
            <span className="about-progress__value" ref={progressText}>
              0%
            </span>
          </div>
        </div>
      </div>

      {/* Capa superior del Hero (Texto principal y banner) */}
      <div className="hero" id="hero">
        <div className="hero__grid grid">
          <div className="hero__inner" ref={heroInner}>
            <div className="hero__copys">
              <h1 className="hero__title">
                <span>Miguel</span>
                <span>Ángel</span>
              </h1>
              <Banner className="hero__banner" size="md">
                {locale === "es" ? "Desarrollo web" : "Web development"}
              </Banner>
            </div>
          </div>
        </div>
      </div>

      <div className="intro__spacer" aria-hidden />
      <div className="about-spacer" id="about" aria-hidden />
    </section>
  );
}
