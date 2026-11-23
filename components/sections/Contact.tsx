"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { sceneState } from "@/lib/sceneState";
import { profile } from "@/data/portfolio";
import { GithubIcon, LinkedinIcon, MailIcon } from "@/components/ui/Icons";
import { useI18n } from "@/lib/i18n";
import { playClickSound, playHoverSound } from "@/lib/audio";

const icons = {
  mail: MailIcon,
  github: GithubIcon,
  linkedin: LinkedinIcon,
};

export default function Contact() {
  const { locale } = useI18n();
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    // Reloj en tiempo real de Colombia (UTC-5)
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: "America/Bogota",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      };
      setCurrentTime(new Intl.DateTimeFormat("en-US", options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sceneState.contactIn = 1;
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact__line > span",
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: 1.2,
          ease: "power4.out",
          stagger: 0.1,
          scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
        },
      );

      gsap.fromTo(
        ".contact__eyebrow, .contact__aside > *",
        { y: 28, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
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
    }, root);

    return () => ctx.revert();
  }, []);

  const handleCopyEmail = () => {
    playClickSound();
    void navigator.clipboard.writeText(profile.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    playClickSound();
    setFormSent(true);
    setTimeout(() => setFormSent(false), 4000);
  };

  return (
    <section className="contact" id="contact" ref={root} data-theme="dark">
      <div className="contact__grid" aria-hidden />

      <div className="contact__inner container">
        <div className="contact__main">
          <span className="contact__eyebrow">
            {locale === "es" ? "05 / Contacto" : "05 / Contact"}
          </span>
          <h2 className="contact__title">
            <span className="contact__line">
              <span>{locale === "es" ? "Hablemos" : "Let's build"}</span>
            </span>
            <span className="contact__line">
              <span className="contact__accent">
                {locale === "es" ? "de tu idea" : "together"}
              </span>
            </span>
          </h2>

          {/* Formulario rápido interactivo */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form__row">
              <input
                type="text"
                placeholder={locale === "es" ? "Tu nombre" : "Your name"}
                required
                className="contact-input"
              />
              <input
                type="email"
                placeholder={locale === "es" ? "Tu correo" : "Your email"}
                required
                className="contact-input"
              />
            </div>
            <textarea
              placeholder={
                locale === "es"
                  ? "¿En qué proyecto o idea estás pensando?"
                  : "Tell me about your project or idea..."
              }
              rows={3}
              required
              className="contact-input contact-textarea"
            />
            <button
              type="submit"
              className="button button--accent button--md contact-submit-btn"
              onMouseEnter={playHoverSound}
            >
              {formSent
                ? locale === "es"
                  ? "✓ ¡Mensaje registrado!"
                  : "✓ Message sent!"
                : locale === "es"
                ? "Enviar propuesta"
                : "Send inquiry"}
            </button>
          </form>
        </div>

        <div className="contact__aside">
          <p className="contact__lead">
            {locale === "es"
              ? "¿Tienes un proyecto en mente, una oportunidad de prácticas o simplemente quieres saludar? Escríbeme y lo conversamos."
              : "Have a project in mind, an internship opportunity, or just want to say hi? Drop me a message and let's talk."}
          </p>

          <div className="contact-mail-box">
            <a
              className="contact__mail"
              href={`mailto:${profile.email}`}
              data-cursor="external"
              onMouseEnter={playHoverSound}
            >
              <MailIcon />
              <span>{profile.email}</span>
            </a>
            <button
              type="button"
              className="copy-mail-btn"
              onClick={handleCopyEmail}
              onMouseEnter={playHoverSound}
              title={locale === "es" ? "Copiar correo" : "Copy email"}
            >
              {copied
                ? locale === "es"
                  ? "✓ ¡Copiado!"
                  : "✓ Copied!"
                : locale === "es"
                ? "Copiar"
                : "Copy"}
            </button>
          </div>

          <div className="contact__socials">
            {profile.socials.map((social) => {
              const Icon = icons[social.icon];
              const external = social.href.startsWith("http");
              return (
                <a
                  key={social.label}
                  className="contact__social"
                  href={social.href}
                  aria-label={social.label}
                  title={social.label}
                  data-cursor={external ? "external" : "arrow"}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  onMouseEnter={playHoverSound}
                  onClick={() => playClickSound()}
                >
                  <Icon />
                </a>
              );
            })}
          </div>

          <div className="contact-status-card">
            <div className="status-indicator">
              <span className="status-ping" />
              <span className="status-dot" />
            </div>
            <div className="status-info">
              <span className="status-text">
                {locale === "es"
                  ? "Bogotá, Colombia (UTC-5) · Disponible"
                  : "Bogota, Colombia (UTC-5) · Available"}
              </span>
              <span className="status-time">🕒 {currentTime || "02:00 PM"}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
