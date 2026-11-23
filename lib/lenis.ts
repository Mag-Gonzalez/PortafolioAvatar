"use client";

import Lenis from "lenis";

let instance: Lenis | null = null;

export function setLenis(value: Lenis | null) {
  instance = value;
}

export function getLenis() {
  return instance;
}

export function scrollToSection(id: string) {
  const target = document.getElementById(id);
  if (!target) return;

  if (instance) {
    instance.scrollTo(target, { offset: 0, duration: 1.1 });
    return;
  }

  target.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth",
  });
}
