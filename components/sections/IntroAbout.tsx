"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { profile } from "@/data/portfolio";
import Banner from "@/components/ui/Banner";
import { useI18n } from "@/lib/i18n";

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
      if (aboutContent.current) aboutContent.current.style.opacity = "1";
      if (progressText.current) progressText.current.textContent = "100%";
      if (progressBar.current) progressBar.current.style.transform = "scaleX(1)";
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(heroInner.current, {
        yPercent: -18,
        scale: 0.94,
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "6% top",
          end: "30% top",
          scrub: 1,
        },
      });

      gsap.fromTo(
        aboutContent.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "22% top",
            end: "38% top",
            scrub: 1,
          },
        },
      );

      gsap.to(aboutContent.current, {
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "88% top",
          end: "100% top",
          scrub: 1,
        },
      });

      gsap.fromTo(
        backdrop.current,
        { opacity: 0 },
        {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "14% top",
            end: "32% top",
            scrub: 1,
          },
        },
      );

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
      {/* Capa única preparada para el futuro canvas continuo. Sin renderer 3D todavía. */}
      <div className="intro__sticky">
        <div className="scene-canvas-host" id="scene-canvas-host" aria-hidden="true" />
        <div className="scene-canvas-host__glow" aria-hidden="true" />

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
