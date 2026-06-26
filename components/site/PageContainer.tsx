import type { ReactNode } from "react";

/** Same horizontal rhythm as homepage sections (GrandeDistribRow, QoffaSection, …). */
export const PAGE_CONTAINER =
  "mx-auto w-full max-w-[1600px] px-3 sm:px-4";

export function PageContainer({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${PAGE_CONTAINER} ${className}`.trim()}>{children}</div>;
}
