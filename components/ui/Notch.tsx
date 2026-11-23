interface NotchProps {
  side: "left" | "right";
  className?: string;
}

/** Muesca redondeada propia, equivalente a la transición escalonada de la referencia. */
export default function Notch({ side, className = "" }: NotchProps) {
  return (
    <span className={`notch ${side === "right" ? "notch--right" : ""} ${className}`} aria-hidden>
      <svg viewBox="0 0 48 48" width="100%" height="100%" focusable="false">
        <path d="M0 0H48A48 48 0 0 1 0 48Z" fill="currentColor" />
      </svg>
    </span>
  );
}
