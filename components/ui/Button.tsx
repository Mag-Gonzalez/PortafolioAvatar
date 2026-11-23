import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "accent" | "theme" | "border" | "background";
type Size = "sm" | "md";

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  round?: boolean;
  className?: string;
  cursor?: "arrow" | "external" | "default";
}

type Props =
  | (CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as?: "a" })
  | (CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { as: "button" });

export default function Button(props: Props) {
  const {
    children,
    variant = "accent",
    size = "md",
    round = false,
    className = "",
    cursor = "default",
    as = "a",
  } = props;

  const classes = [
    "button",
    `button--${variant}`,
    `button--${size}`,
    round ? "button--round" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const cursorAttr = cursor === "default" ? undefined : cursor;

  if (as === "button") {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { children: _c, variant: _v, size: _s, round: _r, className: _cn, cursor: _cu, as: _a, ...rest } =
      props as Extract<Props, { as: "button" }>;
    return (
      <button className={classes} data-cursor={cursorAttr} {...rest}>
        {children}
      </button>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children: _c, variant: _v, size: _s, round: _r, className: _cn, cursor: _cu, as: _a, ...rest } =
    props as Extract<Props, { as?: "a" }>;
  return (
    <a className={classes} data-cursor={cursorAttr} {...rest}>
      {children}
    </a>
  );
}
