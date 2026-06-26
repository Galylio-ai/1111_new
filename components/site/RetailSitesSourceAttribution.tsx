import { ExternalLink } from "lucide-react";
import { retailSitesMonth, retailSitesSource } from "@/lib/topRetailSites";

type Props = {
  className?: string;
  /** `footer` — bordered strip for card / page intro; `text` — plain line */
  variant?: "text" | "footer";
};

export function RetailSitesSourceAttribution({ className = "", variant = "text" }: Props) {
  const link = (
    <a
      href={retailSitesSource.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 font-semibold text-amber-700 underline decoration-amber-300/60 underline-offset-2 transition hover:text-brand-gold dark:text-amber-300 dark:decoration-amber-400/30 dark:hover:text-brand-gold"
      title={retailSitesSource.title}
    >
      {retailSitesSource.label}
      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-80" />
    </a>
  );

  if (variant === "footer") {
    return (
      <div
        className={`rounded-lg border border-amber-200/80 bg-amber-50/60 px-2.5 py-2 dark:border-amber-400/15 dark:bg-amber-500/[0.06] ${className}`}
      >
        <p className="text-[10px] leading-relaxed text-slate-500 dark:text-white/50">
          <span className="font-bold uppercase tracking-wide text-slate-400 dark:text-white/35">Source</span>
          {" · "}
          {link}
          <span className="text-slate-400 dark:text-white/35">
            {" "}
            — {retailSitesSource.title} · {retailSitesMonth}
          </span>
        </p>
      </div>
    );
  }

  return (
    <p className={`text-[10px] leading-relaxed text-slate-400 dark:text-white/40 ${className}`}>
      Source : {link}
      {" · "}
      {retailSitesSource.title} · {retailSitesMonth}
    </p>
  );
}
