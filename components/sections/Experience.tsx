"use client";

import { experienceData } from "@/data/portfolio";
import { useI18n } from "@/lib/i18n";
import { playHoverSound } from "@/lib/audio";
import Notch from "@/components/ui/Notch";

export default function Experience() {
  const { locale } = useI18n();

  return (
    <section className="experience-section" id="experience" data-theme="dark">
      <div className="section-banner" aria-hidden>
        {locale === "es" ? "Trayectoria / Formación" : "Trajectory / Formation"}
      </div>

      <div className="container">
        <div className="experience-head">
          <div>
            <span className="experience-eyebrow">
              {locale === "es" ? "04 / Experiencia" : "04 / Trajectory"}
            </span>
            <h2 className="experience-title">
              {locale === "es" ? "Formación &" : "Education &"}
              <br />
              <em>{locale === "es" ? "recorrido" : "Path"}</em>
            </h2>
          </div>
          <p className="experience-lead">
            {locale === "es"
              ? "Mi camino de formación profesional en el SENA y evolución constante construyendo software real."
              : "My academic journey at SENA and continuous evolution creating production software."}
          </p>
        </div>

        <div className="experience-timeline">
          {experienceData.map((item, index) => (
            <div
              key={index}
              className="experience-item"
              onMouseEnter={playHoverSound}
            >
              <div className="experience-item__period">
                <span>{item.period}</span>
                <span className="experience-item__dot" aria-hidden />
              </div>
              <div className="experience-item__content">
                <span className="experience-item__inst">{item.institution}</span>
                <h3 className="experience-item__role">{item.role[locale]}</h3>
                <span className="experience-item__loc">{item.location}</span>
                <p className="experience-item__desc">{item.description[locale]}</p>
                <div className="experience-item__tags">
                  {item.skills.map((skill) => (
                    <span key={skill} className="exp-tag">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="experience-notch experience-notch--left" aria-hidden>
        <Notch side="left" />
      </div>
      <div className="experience-notch experience-notch--right" aria-hidden>
        <Notch side="right" />
      </div>
    </section>
  );
}

