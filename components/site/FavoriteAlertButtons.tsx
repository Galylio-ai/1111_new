"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, BellRing, Heart, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

// Add-to-favorites + price-drop-alert buttons for a product detail page.
// Talks to the Next.js API routes (/api/favorites, /api/alerts) using the
// auth-service access token from localStorage.
export function FavoriteAlertButtons({
  slug,
  shopSlug,
}: {
  slug: string;
  shopSlug?: string;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [fav, setFav] = useState(false);
  const [alerted, setAlerted] = useState(false);
  const [busyFav, setBusyFav] = useState(false);
  const [busyAlert, setBusyAlert] = useState(false);
  const [ready, setReady] = useState(false);

  const token = () => (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);
  const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${token() ?? ""}` });

  // On mount (when logged in), check current favorite/alert state for this slug.
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setReady(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const [fr, ar] = await Promise.all([
          fetch("/api/favorites", { headers: authHeaders() }).then((r) => r.json()).catch(() => ({ items: [] })),
          fetch("/api/alerts", { headers: authHeaders() }).then((r) => r.json()).catch(() => ({ items: [] })),
        ]);
        if (cancelled) return;
        setFav((fr.items ?? []).some((i: { slug: string }) => i.slug === slug));
        setAlerted((ar.items ?? []).some((i: { slug: string }) => i.slug === slug));
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, [authLoading, user, slug]);

  function requireLogin(): boolean {
    if (!user) {
      router.push("/login");
      return false;
    }
    return true;
  }

  async function toggleFav() {
    if (!requireLogin()) return;
    setBusyFav(true);
    try {
      if (fav) {
        await fetch(`/api/favorites?slug=${encodeURIComponent(slug)}`, { method: "DELETE", headers: authHeaders() });
        setFav(false);
      } else {
        const r = await fetch("/api/favorites", {
          method: "POST", headers: authHeaders(),
          body: JSON.stringify({ slug, shopSlug }),
        });
        if (r.ok) setFav(true);
      }
    } finally {
      setBusyFav(false);
    }
  }

  async function toggleAlert() {
    if (!requireLogin()) return;
    setBusyAlert(true);
    try {
      if (alerted) {
        await fetch(`/api/alerts?slug=${encodeURIComponent(slug)}`, { method: "DELETE", headers: authHeaders() });
        setAlerted(false);
      } else {
        const r = await fetch("/api/alerts", {
          method: "POST", headers: authHeaders(),
          body: JSON.stringify({ slug, shopSlug, email: user?.email, fullName: user?.full_name }),
        });
        if (r.ok) setAlerted(true);
      }
    } finally {
      setBusyAlert(false);
    }
  }

  const disabled = authLoading || !ready;

  return (
    <div className="mt-3 flex flex-wrap items-center gap-3">
      <button
        onClick={toggleFav}
        disabled={disabled || busyFav}
        aria-pressed={fav}
        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition disabled:opacity-50 ${
          fav
            ? "border-brand-red/40 bg-brand-red/10 text-brand-red"
            : "border-slate-300 bg-white text-slate-800 hover:border-brand-red/40 hover:text-brand-red dark:border-white/15 dark:bg-white/[0.03] dark:text-white/85"
        }`}
      >
        {busyFav ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className={`h-4 w-4 ${fav ? "fill-brand-red" : ""}`} />}
        {fav ? "Dans vos favoris" : "Ajouter aux favoris"}
      </button>

      <button
        onClick={toggleAlert}
        disabled={disabled || busyAlert}
        aria-pressed={alerted}
        className={`inline-flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-bold transition disabled:opacity-50 ${
          alerted
            ? "border-brand-gold/50 bg-brand-gold/10 text-brand-gold"
            : "border-slate-300 bg-white text-slate-800 hover:border-brand-gold/50 hover:text-brand-gold dark:border-white/15 dark:bg-white/[0.03] dark:text-white/85"
        }`}
      >
        {busyAlert ? <Loader2 className="h-4 w-4 animate-spin" /> : alerted ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {alerted ? "Alerte activée" : "M'alerter si le prix baisse"}
      </button>
    </div>
  );
}
