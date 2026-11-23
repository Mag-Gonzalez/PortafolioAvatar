"use client";

import { useEffect, useState } from "react";
import { LogoMark } from "@/components/ui/Icons";

export default function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timer: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      timer = setTimeout(() => setHidden(true), reduce ? 0 : 650);
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    return () => {
      window.removeEventListener("load", finish);
      if (timer) clearTimeout(timer);
    };
  }, []);

  return (
    <div className={`preloader ${hidden ? "preloader--hidden" : ""}`} aria-hidden="true">
      <div className="preloader__mark">
        <LogoMark className="preloader__logo" />
        <span className="preloader__wipe" />
      </div>
    </div>
  );
}
