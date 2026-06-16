import type { CSSProperties, ReactNode } from "react";

/* CSS-based on-load reveal — reliable in every browser (no IntersectionObserver),
   always settles visible. `delay` (seconds) staggers siblings. */
export function Reveal({
  delay = 0,
  className = "",
  style,
  children,
}: {
  delay?: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className={`reveal-up ${className}`} style={{ animationDelay: `${delay}s`, ...style }}>
      {children}
    </div>
  );
}
