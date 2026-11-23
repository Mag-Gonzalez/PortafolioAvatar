"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { projects } from "@/data/portfolio";
import Banner from "@/components/ui/Banner";
import { ArrowUpRight } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { scrollToSection } from "@/lib/lenis";
import { playClickSound, playHoverSound } from "@/lib/audio";

export default function Projects() {
  const { locale } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".preview-card",
        { opacity: 0, y: 56 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: root.current, start: "top 68%", once: true },
        },
      );
      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="projects" id="projects" ref={root}>
      <div className="projects__notch projects__notch--start" aria-hidden>
        <span />
        <span />
      </div>
      <div className="projects__notch projects__notch--end" aria-hidden>
        <span />
        <span />
      </div>

      <div className="projects__grid grid">
        <div className="projects__title">
          <Banner className="projects__banner" size="sm">
            {locale === "es" ? "Seleccionados" : "Selected"}
          </Banner>
          <h2>{locale === "es" ? "Proyectos" : "Projects"}</h2>
        </div>

        <div className="projects__cards">
          {projects.map((project) => (
            <article
              className={`preview-card preview-card--${project.slug}`}
              key={project.slug}
              data-cursor="arrow"
            >
              <div className="preview-card__top">
                <div className="preview-card__visual" aria-hidden>
                  <span className="preview-card__rings" />
                  <span className="preview-card__monogram">
                    {project.name.charAt(0)}
                  </span>
                </div>
                <span className="preview-card__arrow" aria-hidden>
                  <ArrowUpRight />
                </span>
                <span className="preview-card__notch preview-card__notch--left" aria-hidden />
                <span className="preview-card__notch preview-card__notch--right" aria-hidden />
              </div>
              <div className="preview-card__content">
                <h3>{project.name}</h3>
                <p>{project.shortDesc[locale]}</p>
              </div>
            </article>
          ))}

          <a
            href="#contact"
            className="preview-card preview-card--empty"
            onClick={(event) => {
              event.preventDefault();
              playClickSound();
              scrollToSection("contact");
            }}
            onMouseEnter={playHoverSound}
          >
            <div className="preview-card__top" aria-hidden>
              <svg viewBox="0 0 256 256" focusable="false">
                <path d="M128 0v256M0 128h256" />
              </svg>
            </div>
            <div className="preview-card__content">
              <h3>
                {locale === "es" ? "Inicia un proyecto" : "Start a new project"}
              </h3>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
