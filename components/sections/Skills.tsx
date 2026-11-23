"use client";

import { useState } from "react";
import { skillsData, type SkillItem } from "@/data/portfolio";
import { useI18n } from "@/lib/i18n";
import { playHoverSound, playClickSound } from "@/lib/audio";
import Notch from "@/components/ui/Notch";

type CategoryFilter = "all" | "frontend" | "backend" | "tools";

export default function Skills() {
  const { locale } = useI18n();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all");

  const categories = [
    { id: "all", label: { es: "Todas", en: "All Skills" } },
    { id: "frontend", label: { es: "Frontend & 3D WebGL", en: "Frontend & WebGL" } },
    { id: "backend", label: { es: "Backend & Datos", en: "Backend & Data" } },
    { id: "tools", label: { es: "Herramientas & Flujo", en: "Tools & Workflow" } },
  ];

  const filteredSkills = skillsData.filter(
    (skill) => activeCategory === "all" || skill.category === activeCategory,
  );

  const handleCategoryChange = (cat: CategoryFilter) => {
    playClickSound();
    setActiveCategory(cat);
  };

  return (
    <section className="skills-section" id="skills">
      <div className="section-banner" aria-hidden>
        {locale === "es" ? "Arsenal Técnico / 01—13" : "Tech Arsenal / 01—13"}
      </div>

      <div className="container">
        <div className="skills-head">
          <div>
            <span className="skills-eyebrow">
              {locale === "es" ? "02 / Habilidades" : "02 / Tech Stack"}
            </span>
            <h2 className="skills-title">
              {locale === "es" ? "Tecnologías &" : "Technologies &"}
              <br />
              <em>{locale === "es" ? "especialidades" : "Specialties"}</em>
            </h2>
          </div>
          <p className="skills-lead">
            {locale === "es"
              ? "Herramientas modernas con las que construyo soluciones web de alto rendimiento, interfaces inmersivas y arquitecturas limpias."
              : "Modern technologies I leverage to build high-performance web systems, immersive interfaces, and scalable architectures."}
          </p>
        </div>

        {/* Filtros de categoría */}
        <div className="skills-filters" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`skills-filter-btn ${activeCategory === cat.id ? "is-active" : ""}`}
              onClick={() => handleCategoryChange(cat.id as CategoryFilter)}
              onMouseEnter={playHoverSound}
            >
              {cat.label[locale]}
            </button>
          ))}
        </div>

        {/* Cuadrícula de habilidades */}
        <div className="skills-grid">
          {filteredSkills.map((skill: SkillItem) => (
            <div
              key={skill.name}
              className={`skill-card ${skill.popular ? "skill-card--featured" : ""}`}
              onMouseEnter={playHoverSound}
            >
              <div className="skill-card__top">
                <span className="skill-card__tag">
                  {skill.category === "frontend"
                    ? "Frontend"
                    : skill.category === "backend"
                    ? "Backend"
                    : "Tooling"}
                </span>
                <span
                  className={`skill-card__level ${
                    skill.level === "Dominado"
                      ? "level--high"
                      : "level--mid"
                  }`}
                >
                  {locale === "es" ? skill.level : skill.levelEn}
                </span>
              </div>
              <h3 className="skill-card__name">{skill.name}</h3>
              <p className="skill-card__desc">{skill.description[locale]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="skills-notch skills-notch--left" aria-hidden>
        <Notch side="left" />
      </div>
      <div className="skills-notch skills-notch--right" aria-hidden>
        <Notch side="right" />
      </div>
    </section>
  );
}

