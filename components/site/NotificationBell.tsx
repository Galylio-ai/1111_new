"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Check, TrendingDown } from "lucide-react";
import { useAuth } from "@/lib/auth";

type Notif = {
  id: string;
  title: string;
  body: string | null;
  slug: string | null;
  shopSlug: string | null;
  img: string | null;
  oldPrice: number | null;
  newPrice: number | null;
  read: boolean;
  createdAt: string;
};

const fmt = (n: number | null) =>
  n == null ? "—" : n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 3 });

function productHref(slug: string | null, shopSlug: string | null): string {
  if (!slug) return "/profil";
  return shopSlug ? `/boutiques/${shopSlug}/${slug}` : `/comparaison?a=${encodeURIComponent(slug)}`;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<Notif[]>([]);
  const boxRef = useRef<HTMLDivElement>(null);

  const headers = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("access_token") ?? "" : ""}`,
  });

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const d = await fetch("/api/notifications", { headers: headers() }).then((r) => r.json());
      setItems(d.items ?? []);
      setUnread(d.unread ?? 0);
    } catch {
      /* ignore */
    }
  }, [user]);

  // Poll every 60s while logged in.
  useEffect(() => {
    if (!user) { setItems([]); setUnread(0); return; }
    load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [user, load]);

  // Close on outside click.
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: headers(), body: JSON.stringify({}) }).catch(() => {});
    setItems((xs) => xs.map((x) => ({ ...x, read: true })));
    setUnread(0);
  }

  // Hidden entirely for logged-out visitors.
  if (!user) return null;

  return (
    <div ref={boxRef} className="relative hidden sm:block">
      <button
        onClick={() => { setOpen((o) => !o); if (!open && unread > 0) markAllRead(); }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <>
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-red px-1 text-[10px] font-bold text-white ring-2 ring-white dark:ring-bg-900">
              {unread > 9 ? "9+" : unread}
            </span>
            <span className="pointer-events-none absolute right-1 top-1 h-4 w-4 animate-ping rounded-full bg-brand-red/60" />
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-bg-card">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-white/10">
            <span className="text-sm font-black text-slate-900 dark:text-white">Notifications</span>
            {items.some((i) => !i.read) && (
              <button onClick={markAllRead} className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-gold hover:underline">
                <Check className="h-3 w-3" /> Tout marquer lu
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <Bell className="h-8 w-8 text-slate-300 dark:text-white/20" />
                <p className="text-xs text-slate-400 dark:text-white/40">Aucune notification pour le moment.</p>
              </div>
            ) : (
              items.slice(0, 8).map((n) => (
                <Link
                  key={n.id}
                  href={productHref(n.slug, n.shopSlug)}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 border-b border-slate-50 px-4 py-3 transition last:border-0 hover:bg-slate-50 dark:border-white/[0.05] dark:hover:bg-white/[0.04] ${!n.read ? "bg-brand-gold/[0.04]" : ""}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10">
                    {n.img ? <img src={n.img} alt="" className="h-full w-full object-contain" /> : <TrendingDown className="h-4 w-4 text-emerald-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-bold text-slate-900 dark:text-white">{n.title}</div>
                    {n.newPrice != null && (
                      <div className="mt-0.5 text-xs">
                        {n.oldPrice != null && <span className="text-slate-400 line-through">{fmt(n.oldPrice)} </span>}
                        <span className="font-black text-emerald-600 dark:text-emerald-400">{fmt(n.newPrice)} DT</span>
                      </div>
                    )}
                    <div className="mt-0.5 text-[10px] text-slate-400 dark:text-white/35">{new Date(n.createdAt).toLocaleDateString("fr-FR")}</div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <Link
            href="/profil"
            onClick={() => setOpen(false)}
            className="block border-t border-slate-100 px-4 py-2.5 text-center text-xs font-bold text-brand-gold transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
          >
            Voir toutes les notifications
          </Link>
        </div>
      )}
    </div>
  );
}
