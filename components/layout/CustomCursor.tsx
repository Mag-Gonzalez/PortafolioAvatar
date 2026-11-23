"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { ArrowUpRight } from "@/components/ui/Icons";

type Variant = "default" | "arrow" | "external";

export default function CustomCursor() {
  const wrapper = useRef<HTMLDivElement>(null);
  const scale = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const el = wrapper.current;
    const inner = scale.current;
    if (!el || !inner) return;

    document.body.classList.add("has-custom-cursor");
    el.style.opacity = "1";

    const moveX = gsap.quickTo(el, "x", { duration: 0.22, ease: "power3.out" });
    const moveY = gsap.quickTo(el, "y", { duration: 0.22, ease: "power3.out" });
    let visible = false;

    const onMove = (event: MouseEvent) => {
      moveX(event.clientX);
      moveY(event.clientY);

      if (!visible) {
        visible = true;
        gsap.to(inner, { scale: 1, duration: 0.2, overwrite: true });
      }

      const target = event.target as HTMLElement | null;
      const interactive = target?.closest<HTMLElement>("[data-cursor], a, button");
      const isDark = Boolean(target?.closest('[data-theme="dark"]'));
      const variant: Variant =
        interactive?.dataset.cursor === "external"
          ? "external"
          : interactive
            ? "arrow"
            : "default";

      el.dataset.variant = variant;
      el.dataset.tone = isDark ? "light" : "dark";
    };

    const onLeave = () => {
      visible = false;
      gsap.to(inner, { scale: 0, duration: 0.18, overwrite: true });
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.body.classList.remove("has-custom-cursor");
      gsap.killTweensOf([el, inner]);
    };
  }, []);

  return (
    <div className="cursor" ref={wrapper} aria-hidden="true">
      <div className="cursor__scale" ref={scale}>
        <span className="cursor__ring" />
        <span className="cursor__arrow">
          <ArrowUpRight />
        </span>
      </div>
    </div>
  );
}
