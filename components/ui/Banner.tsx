import type { ReactNode } from "react";

interface BannerProps {
  children: ReactNode;
  size?: "sm" | "md";
  className?: string;
  rotation?: number;
  animated?: boolean;
}

export default function Banner({
  children,
  size = "md",
  className = "",
  rotation = -5,
  animated = true,
}: BannerProps) {
  return (
    <span
      className={`banner banner--${size} ${animated ? "banner--animated" : ""} ${className}`}
      style={{ "--banner-rotation": `${rotation}deg` } as React.CSSProperties}
    >
      <span className="banner__background" aria-hidden />
      <span className="banner__copy">{children}</span>
    </span>
  );
}
