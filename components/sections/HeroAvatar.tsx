"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { playHoverSound, playClickSound } from "@/lib/audio";

export default function HeroAvatar() {
  const { locale } = useI18n();
  const stageRef = useRef<HTMLDivElement>(null);
  const targetTilt = useRef({ x: 0, y: 0 });
  const currentTilt = useRef({ x: 0, y: 0 });
  const animFrameId = useRef<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Loop de interpolación suave (lerp) para un tracking 3D fluido y sedoso
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (isTouch || prefersReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const nx = (e.clientX / innerWidth - 0.5) * 2; // de -1 a 1
      const ny = (e.clientY / innerHeight - 0.5) * 2; // de -1 a 1

      // Rotación máxima: ±14deg en Y, ±10deg en X
      targetTilt.current = {
        x: Math.max(-14, Math.min(14, nx * 14)),
        y: Math.max(-10, Math.min(10, -ny * 10)),
      };
    };

    const handleMouseLeave = () => {
      targetTilt.current = { x: 0, y: 0 };
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    const updateTilt = () => {
      // Lerp con factor 0.08 para amortiguación natural
      currentTilt.current.x += (targetTilt.current.x - currentTilt.current.x) * 0.08;
      currentTilt.current.y += (targetTilt.current.y - currentTilt.current.y) * 0.08;

      if (stageRef.current) {
        const { x, y } = currentTilt.current;
        const rotateZ = x * 0.12;
        stageRef.current.style.transform = `perspective(1100px) rotateY(${x.toFixed(2)}deg) rotateX(${y.toFixed(2)}deg) rotateZ(${rotateZ.toFixed(2)}deg)`;
      }

      animFrameId.current = requestAnimationFrame(updateTilt);
    };

    animFrameId.current = requestAnimationFrame(updateTilt);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, []);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    playHoverSound();
  }, []);

  const handleMouseLeaveSelf = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleClick = useCallback(() => {
    playClickSound();
  }, []);

  return (
    <div
      ref={stageRef}
      className={`hero-avatar-stage ${isHovered ? "is-hovered" : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeaveSelf}
      onClick={handleClick}
      role="region"
      aria-label="Avatar 3D interactivo de Miguel Ángel"
    >
      {/* Resplandor ambiental de fondo (Aura) */}
      <div className="hero-avatar-aura" aria-hidden />

      {/* Anillos orbitales giratorios holográficos */}
      <div className="hero-avatar-orbits" aria-hidden>
        <svg viewBox="0 0 400 400" className="orbit-svg orbit-outer">
          <circle
            cx="200"
            cy="200"
            r="188"
            fill="none"
            stroke="var(--cyan)"
            strokeWidth="1.2"
            strokeDasharray="8 12"
            opacity="0.38"
          />
        </svg>
        <svg viewBox="0 0 400 400" className="orbit-svg orbit-inner">
          <circle
            cx="200"
            cy="200"
            r="152"
            fill="none"
            stroke="var(--orange)"
            strokeWidth="1.2"
            strokeDasharray="6 8"
            opacity="0.32"
          />
        </svg>
      </div>

      {/* Contenedor / Chasis futurista del Avatar */}
      <div className="hero-avatar-chassis">
        {/* Marcadores HUD en las 4 esquinas */}
        <div className="hud-corner hud-corner--tl" aria-hidden />
        <div className="hud-corner hud-corner--tr" aria-hidden />
        <div className="hud-corner hud-corner--bl" aria-hidden />
        <div className="hud-corner hud-corner--br" aria-hidden />

        {/* Imagen 3D del Avatar en alta resolución */}
        <div className="hero-avatar-media">
          <Image
            src="/assets/avatar/avatar-seamless.png"
            alt="Avatar 3D estilizado de Miguel Ángel"
            width={768}
            height={1024}
            className="hero-avatar-image"
            priority
            unoptimized
          />

          {/* Sombra de viñeta suave inferior para fundir con el pedestal */}
          <div className="hero-avatar-vignette" aria-hidden />

          {/* Línea de escaneo láser sutil holográfica */}
          <div className="hero-avatar-scanline" aria-hidden />
        </div>

        {/* Resplandor de marco exterior interactivo */}
        <div className="hero-avatar-frame-glow" aria-hidden />
      </div>

      {/* Insignias flotantes tecnológicas en capas 3D (Z-index parallax) */}
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

      {/* Píldora de estado en vivo */}
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
