"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { playHoverSound } from "@/lib/audio";

export default function HeroAvatar() {
  const { locale } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Parallax 3D suave al mover el ratón en escritorio
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2;
      const y = (e.clientY / innerHeight - 0.5) * 2;
      setTilt({
        x: Math.max(-14, Math.min(14, x * 12)),
        y: Math.max(-10, Math.min(10, -y * 10)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="hero-avatar-stage"
      style={{
        transform: `perspective(900px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
      }}
      onMouseEnter={playHoverSound}
      aria-label="Avatar de Miguel Angel Gonzalez Muñoz"
    >
      {/* Resplandor ambiental de fondo */}
      <div className="hero-avatar-aura" aria-hidden />

      {/* Anillos orbitales giratorios decorativos */}
      <div className="hero-avatar-orbits" aria-hidden>
        <svg viewBox="0 0 400 400" className="orbit-svg orbit-outer">
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.5"
            strokeDasharray="12 10"
            opacity="0.4"
          />
        </svg>
        <svg viewBox="0 0 400 400" className="orbit-svg orbit-inner">
          <circle
            cx="200"
            cy="200"
            r="150"
            fill="none"
            stroke="var(--orange)"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            opacity="0.35"
          />
        </svg>
      </div>

      {/* Tarjeta / Contenedor principal del avatar con el recorte de alta resolución */}
      <div className="hero-avatar-chassis">
        <div className="hero-avatar-media">
          <Image
            src="/assets/avatar/avatar-cutout.png"
            alt="Miguel Angel Gonzalez Muñoz — Desarrollador"
            fill
            sizes="(max-width: 768px) 260px, (max-width: 1200px) 380px, 460px"
            className="hero-avatar-image"
            priority
            unoptimized
          />
          {/* Sombra de viñeta suave inferior para integrar con el fondo */}
          <div className="hero-avatar-vignette" />
        </div>

        {/* Reflejo de luz y marco exterior */}
        <div className="hero-avatar-frame-glow" aria-hidden />
      </div>

      {/* Insignias flotantes tecnológicas */}
      <div className="hero-floating-badge badge-top-right">
        <span className="badge-dot" />
        <span>⚡ SENA ADSO</span>
      </div>

      <div className="hero-floating-badge badge-bottom-left">
        <span>🚀 Full Stack</span>
      </div>

      <div className="hero-floating-badge badge-bottom-right">
        <span>🎨 WebGL & 3D</span>
      </div>

      {/* Indicador de estado en vivo */}
      <div className="hero-avatar-status-pill">
        <span className="pulsing-dot" />
        <span>
          {locale === "es"
            ? "Disponible para proyectos · Colombia"
            : "Available for projects · Colombia"}
        </span>
      </div>
    </div>
  );
}

