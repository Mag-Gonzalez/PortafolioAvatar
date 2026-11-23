"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { projects, type Project, type ProjectCategory } from "@/data/portfolio";
import { ArrowUpRight } from "@/components/ui/Icons";
import Notch from "@/components/ui/Notch";
import { useI18n } from "@/lib/i18n";
import { playClickSound, playHoverSound } from "@/lib/audio";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";

const statusLabel: Record<Project["status"], { es: string; en: string }> = {
  disponible: { es: "Disponible", en: "Available" },
  "en-progreso": { es: "En progreso", en: "In progress" },
  completado: { es: "Completado", en: "Completed" },
};

export default function Projects() {
  const { locale } = useI18n();
  const root = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState<ProjectCategory>("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useBodyScrollLock(Boolean(selectedProject));

  const categories = [
    { id: "all", label: { es: "Todos", en: "All Projects" } },
    { id: "saas", label: { es: "SaaS & Reservas", en: "SaaS & Booking" } },
    { id: "creative", label: { es: "Creative 3D & WebGL", en: "Creative 3D" } },
    { id: "fullstack", label: { es: "Full Stack & Cloud", en: "Full Stack" } },
  ];

  const filteredProjects = projects.filter(
    (p) => activeCategory === "all" || p.category === activeCategory,
  );

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const items = gsap.utils.toArray<HTMLElement>(".projects__item");

      items.forEach((item) => {
        gsap.fromTo(
          item,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: { trigger: item, start: "top 88%", once: true },
          },
        );

        const image = item.querySelector("img");
        if (image) {
          gsap.fromTo(
            image,
            { yPercent: -5 },
            {
              yPercent: 5,
              ease: "none",
              scrollTrigger: {
                trigger: item,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      });

      ScrollTrigger.refresh();
    }, root);

    return () => ctx.revert();
  }, [activeCategory]);

  const handleOpenModal = (project: Project) => {
    playClickSound();
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    playClickSound();
    setSelectedProject(null);
  };

  return (
    <section className="projects" id="projects" ref={root}>
      <div className="section-banner" aria-hidden>
        {locale === "es" ? "Seleccionados / 01—04" : "Selected / 01—04"}
      </div>

      <div className="projects__inner">
        <div className="projects__head">
          <div>
            <span className="projects__eyebrow">
              {locale === "es" ? "03 / Proyectos" : "03 / Projects"}
            </span>
            <h2 className="projects__title">
              {locale === "es" ? "Trabajos" : "Featured"}
              <br />
              <em>{locale === "es" ? "recientes" : "Works"}</em>
            </h2>
          </div>
          <p className="projects__intro">
            {locale === "es"
              ? "Una selección de sistemas web, experiencias 3D y aplicaciones reales desarrolladas con tecnologías modernas."
              : "A curated selection of production web platforms, 3D experiences, and enterprise solutions built with modern stacks."}
          </p>
        </div>

        {/* Filtros de proyectos */}
        <div className="projects__filters" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`project-filter-btn ${activeCategory === cat.id ? "is-active" : ""}`}
              onClick={() => {
                playClickSound();
                setActiveCategory(cat.id as ProjectCategory);
              }}
              onMouseEnter={playHoverSound}
            >
              {cat.label[locale]}
            </button>
          ))}
        </div>

        {/* Cuadrícula de proyectos */}
        <div className="projects__grid">
          {filteredProjects.map((project, index) => (
            <div className="projects__item" key={project.slug}>
              <div
                className="project-card"
                onClick={() => handleOpenModal(project)}
                onMouseEnter={playHoverSound}
                data-cursor="pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handleOpenModal(project);
                }}
              >
                <div className="project-card__media">
                  <Image
                    src={project.image}
                    alt={project.name}
                    fill
                    sizes="(max-width: 900px) 100vw, 60vw"
                    unoptimized
                  />
                </div>
                <div className="project-card__overlay" />
                <div className="project-card__top">
                  <span className="mono">{String(index + 1).padStart(2, "0")}</span>
                  <span className="project-card__status">
                    {statusLabel[project.status][locale]} · {project.year}
                  </span>
                </div>
                <div className="project-card__body">
                  <h3 className="project-card__title">{project.name}</h3>
                  <p className="project-card__desc">{project.shortDesc[locale]}</p>
                  <ul className="project-card__tech">
                    {project.technologies.slice(0, 4).map((tech) => (
                      <li key={tech}>{tech}</li>
                    ))}
                  </ul>
                  <span className="project-card__link">
                    {locale === "es" ? "Ver caso de estudio" : "View Case Study"}{" "}
                    <ArrowUpRight />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Detalle de Proyecto (Estilo David Heckhoff) */}
      {selectedProject && (
        <div
          className="project-modal-backdrop"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="project-modal-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="project-modal-close"
              onClick={handleCloseModal}
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            <div className="project-modal-header">
              <span className="project-modal-year">{selectedProject.year}</span>
              <h3 className="project-modal-title">{selectedProject.name}</h3>
              <p className="project-modal-lead">{selectedProject.shortDesc[locale]}</p>
            </div>

            <div className="project-modal-content">
              <h4>{locale === "es" ? "Descripción general" : "Overview"}</h4>
              <p>{selectedProject.description[locale]}</p>

              {selectedProject.metrics && (
                <div className="project-modal-metric">
                  <span className="metric-tag">
                    ⚡ {selectedProject.metrics}
                  </span>
                </div>
              )}

              <h4>{locale === "es" ? "Características clave" : "Key Highlights"}</h4>
              <ul className="project-modal-highlights">
                {selectedProject.highlights[locale].map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>

              <h4>{locale === "es" ? "Stack tecnológico" : "Tech Stack"}</h4>
              <div className="project-modal-tech-list">
                {selectedProject.technologies.map((tech) => (
                  <span key={tech} className="tech-badge">
                    {tech}
                  </span>
                ))}
              </div>

              <div className="project-modal-actions">
                {selectedProject.href && (
                  <a
                    href={selectedProject.href}
                    className="button button--accent button--md"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playClickSound()}
                  >
                    {locale === "es" ? "Ver demo en vivo" : "Live Demo"} <ArrowUpRight />
                  </a>
                )}
                {selectedProject.repository && (
                  <a
                    href={selectedProject.repository}
                    className="button button--theme button--md"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => playClickSound()}
                  >
                    GitHub <ArrowUpRight />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="projects__notch projects__notch--left" aria-hidden>
        <Notch side="left" />
      </div>
      <div className="projects__notch projects__notch--right" aria-hidden>
        <Notch side="right" />
      </div>
    </section>
  );
}
