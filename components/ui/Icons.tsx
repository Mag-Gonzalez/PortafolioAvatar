import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export function LogoMark(props: IconProps) {
  return (
    <svg viewBox="0 0 40 42" fill="none" aria-hidden {...props}>
      <path
        d="M20 2 37 12v18L20 40 3 30V12L20 2Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="m13 25 7-11 7 11M16.5 20h7" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="20" cy="32" r="2" fill="currentColor" />
    </svg>
  );
}

export function ArrowUpRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </svg>
  );
}

export function ArrowUp(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function GithubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.6 9.6 0 0 1 12 6.8c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
    </svg>
  );
}

export function LinkedinIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M6.5 8.5H3.8V20h2.7V8.5ZM5.15 3.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM20.2 13.7c0-3.2-1.7-4.7-4-4.7a3.5 3.5 0 0 0-3.1 1.7V8.5H10.4V20h2.7v-6.3c0-1.7.8-2.7 2.2-2.7 1.3 0 1.9.9 1.9 2.7V20h2.9v-6.3Z" />
    </svg>
  );
}

export function SoundOnIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </svg>
  );
}

export function SoundOffIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 9v6h4l5 4V5L8 9H4Z" />
      <path d="m17 9 4 6m0-6-4 6" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
