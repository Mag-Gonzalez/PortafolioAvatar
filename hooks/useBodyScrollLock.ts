"use client";

import { useEffect } from "react";

/**
 * Bloquea el scroll del documento mientras una capa modal esté activa.
 * La mutación se hace en un effect para cumplir las reglas de pureza de React.
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [locked]);
}
