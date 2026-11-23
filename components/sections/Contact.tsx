"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { useI18n } from "@/lib/i18n";
import { scrollToSection } from "@/lib/lenis";
import { playClickSound, playHoverSound } from "@/lib/audio";

const LINKS = [
  { id: "projects", label: "ReserVa", glyph: "R" },
  { id: "projects", label: "ZARFA", glyph: "Z" },
  { id: "about", label: "ADSO SENA", glyph: "S" },
] as const;

export default function Contact() {
  const { locale } = useI18n();
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      sceneState.contactIn = 1;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact__title span",
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 72%", once: true },
        },
      );

      gsap.fromTo(
        ".contact__link",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root.current, start: "top 55%", once: true },
        },
      );

      gsap.to(sceneState, {
        contactIn: 1,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "top 20%",
          scrub: true,
        },
      });

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section className="contact" id="contact" ref={root} data-theme="dark">
      <div className="contact__grid grid">
        <div className="contact__content">
          <h2 className="contact__title">
            <span className="contact__line">
              <span>{locale === "es" ? "Trabajemos" : "Let's work"}</span>
            </span>
            <span className="contact__line">
              <span>{locale === "es" ? "juntos" : "together"}</span>
            </span>
          </h2>

          <div className="contact__links">
            {LINKS.map((link) => (
              <a
                key={link.label}
                href={`#${link.id}`}
                className="contact__link"
                aria-label={link.label}
                title={link.label}
                onClick={(event) => {
                  event.preventDefault();
                  playClickSound();
                  scrollToSection(link.id);
                }}
                onMouseEnter={playHoverSound}
              >
                {link.glyph}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
