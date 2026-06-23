"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, BellRing, Camera, CheckCircle2, ChevronDown, Heart,
  LogOut, Mail, MapPin, Phone, ShieldCheck, Trash2, TrendingDown, User,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

const TUNISIAN_STATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès",
  "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kébili",
  "Le Kef", "Mahdia", "La Manouba", "Médenine", "Monastir",
  "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
  "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

const tabs = [
  { id: "info", label: "Informations", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "alertes", label: "Mes alertes", icon: BellRing },
  { id: "favoris", label: "Favoris", icon: Heart },
  { id: "securite", label: "Sécurité", icon: ShieldCheck },
] as const;
type Tab = typeof tabs[number]["id"];

const fmtPrice = (n: number | null) =>
  n == null ? "—" : n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 3 });

type FavoriteItem = { id: string; slug: string; shopSlug: string | null; name: string; img: string | null; brand: string | null; price: number | null };
type AlertItem = { id: string; slug: string; shopSlug: string | null; name: string; img: string | null; baselinePrice: number | null; lastPrice: number | null };
type NotifItem = { id: string; title: string; body: string | null; slug: string | null; shopSlug: string | null; img: string | null; oldPrice: number | null; newPrice: number | null; read: boolean; createdAt: string };

function productHref(slug: string | null, shopSlug: string | null): string {
  if (!slug) return "#";
  return shopSlug ? `/boutiques/${shopSlug}/${slug}` : `/comparaison?a=${encodeURIComponent(slug)}`;
}

function Avatar({ url, name, onUpload }: { url?: string; name: string; onUpload: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className="relative inline-block">
      {url ? (
        <img src={url} alt={name} className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-gold/30 shadow-lg" />
      ) : (
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-gold/30 to-brand-red/20 ring-4 ring-brand-gold/30 shadow-lg">
          <span className="text-2xl font-black text-brand-gold">{initials}</span>
        </div>
      )}
      <button
        onClick={() => inputRef.current?.click()}
        className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-brand-gold text-black shadow-lg transition hover:bg-brand-goldDark"
      >
        <Camera className="h-3.5 w-3.5" />
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
      />
    </div>
  );
}

export default function ProfilPage() {
  const { user, loading, logout, refreshUser } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("info");

  // Edit form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const [saveErr, setSaveErr] = useState("");

  // Password change state
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // Engagement data
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [engLoading, setEngLoading] = useState(true);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("access_token") ?? "" : ""}`,
  });

  async function loadEngagement() {
    setEngLoading(true);
    try {
      const [f, a, n] = await Promise.all([
        fetch("/api/favorites", { headers: authHeaders() }).then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/alerts", { headers: authHeaders() }).then((r) => r.json()).catch(() => ({ items: [] })),
        fetch("/api/notifications", { headers: authHeaders() }).then((r) => r.json()).catch(() => ({ items: [] })),
      ]);
      setFavorites(f.items ?? []);
      setAlerts(a.items ?? []);
      setNotifs(n.items ?? []);
    } finally {
      setEngLoading(false);
    }
  }

  async function removeFavorite(slug: string) {
    await fetch(`/api/favorites?slug=${encodeURIComponent(slug)}`, { method: "DELETE", headers: authHeaders() });
    setFavorites((xs) => xs.filter((x) => x.slug !== slug));
  }
  async function removeAlert(slug: string) {
    await fetch(`/api/alerts?slug=${encodeURIComponent(slug)}`, { method: "DELETE", headers: authHeaders() });
    setAlerts((xs) => xs.filter((x) => x.slug !== slug));
  }
  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: authHeaders(), body: JSON.stringify({}) });
    setNotifs((xs) => xs.map((x) => ({ ...x, read: true })));
  }
  async function clearNotifs() {
    await fetch("/api/notifications", { method: "DELETE", headers: authHeaders() });
    setNotifs([]);
  }

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) loadEngagement();
  }, [user]);

  // When opening Notifications, mark them read so the navbar bell clears.
  useEffect(() => {
    if (tab === "notifications" && notifs.some((n) => !n.read)) {
      markAllRead();
    }
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      setFullName(user.full_name);
      setPhone(user.phone ?? "");
      setState(user.state ?? "");
    }
  }, [user]);

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    setSaveErr(""); setSaveMsg("");
    setSaving(true);
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`${API}/api/users/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          full_name: fullName,
          ...(phone ? { phone } : {}),
          ...(state ? { state } : {}),
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message ?? "Erreur de mise à jour");
      await refreshUser();
      setSaveMsg("Profil mis à jour avec succès");
    } catch (err: unknown) {
      setSaveErr(err instanceof Error ? err.message : "Erreur");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarUpload(file: File) {
    const token = localStorage.getItem("access_token");
    const form = new FormData();
    form.append("avatar", file);
    const r = await fetch(`${API}/api/users/me/avatar`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token ?? ""}` },
      body: form,
    });
    if (r.ok) refreshUser();
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdErr(""); setPwdMsg("");
    if (newPwd !== confirmPwd) { setPwdErr("Les mots de passe ne correspondent pas"); return; }
    setPwdLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`${API}/api/auth/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ current_password: currentPwd, new_password: newPwd }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.message ?? "Erreur");
      setPwdMsg("Mot de passe modifié avec succès");
      setCurrentPwd(""); setNewPwd(""); setConfirmPwd("");
    } catch (err: unknown) {
      setPwdErr(err instanceof Error ? err.message : "Erreur");
    } finally {
      setPwdLoading(false);
    }
  }

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  if (loading || !user) {
    return (
      <main className="min-h-screen bg-bg-900">
        <Header />
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-gold/30 border-t-brand-gold" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-900">
      <Header />

      <div className="mx-auto max-w-[1000px] px-4 py-10">
        {/* Profile header card */}
        <div className="relative mb-6 overflow-hidden rounded-2xl border border-bg-border bg-bg-card p-6 shadow-card">
          <div className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-brand-red/10 blur-3xl" />
          <div className="pointer-events-none absolute right-0 top-0 h-44 w-44 rounded-full bg-brand-gold/8 blur-3xl" />

          <div className="relative flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar url={user.avatar_url} name={user.full_name} onUpload={handleAvatarUpload} />

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {user.full_name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {user.email && (
                  <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-white/60">
                    <Mail className="h-3.5 w-3.5 text-brand-gold/70" /> {user.email}
                  </span>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-white/60">
                    <Phone className="h-3.5 w-3.5 text-brand-gold/70" /> {user.phone}
                  </span>
                )}
                {user.state && (
                  <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-white/60">
                    <MapPin className="h-3.5 w-3.5 text-brand-gold/70" /> {user.state}
                  </span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-gold/25 bg-brand-gold/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-brand-gold">
                  {user.role}
                </span>
                {user.is_email_verified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-300">
                    <CheckCircle2 className="h-3 w-3" /> E-mail vérifié
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/25 bg-orange-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-orange-500 dark:text-orange-300">
                    E-mail non vérifié
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:border-red-800/50 dark:hover:bg-red-950/30 dark:hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex gap-1 overflow-x-auto rounded-2xl border border-bg-border bg-bg-card p-1.5 shadow-card">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-gradient-to-b from-slate-200 to-slate-100 text-slate-900 shadow-inner ring-1 ring-slate-300 dark:from-white/10 dark:to-white/[0.04] dark:text-white dark:ring-white/10"
                  : "text-slate-500 hover:text-slate-800 dark:text-white/50 dark:hover:text-white/80"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab panels */}
        <div className="rounded-2xl border border-bg-border bg-bg-card p-6 shadow-card">

          {/* INFO TAB */}
          {tab === "info" && (
            <form onSubmit={handleSaveInfo} className="space-y-5">
              <h2 className="section-title mb-4">Mes informations</h2>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">Nom complet</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                  <input
                    required minLength={2}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">Téléphone</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+21620123456"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">Gouvernorat</label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-900 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-[#0f1422] dark:text-white"
                  >
                    <option value="">Sélectionner…</option>
                    {TUNISIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                </div>
              </div>

              {saveMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> {saveMsg}
                </div>
              )}
              {saveErr && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
                  {saveErr}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red via-brand-redDark to-[#7a0f1a] px-6 py-2.5 text-sm font-bold text-white shadow-glow ring-1 ring-white/10 transition hover:shadow-[0_0_30px_rgba(225,29,45,0.55)] disabled:opacity-60"
              >
                <span className="relative z-10">{saving ? "Enregistrement…" : "Enregistrer"}</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>
          )}

          {/* NOTIFICATIONS TAB */}
          {tab === "notifications" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="section-title">Notifications</h2>
                {notifs.length > 0 && (
                  <button onClick={clearNotifs} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" /> Tout effacer
                  </button>
                )}
              </div>
              {engLoading ? (
                <div className="flex justify-center py-12"><div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-gold/30 border-t-brand-gold" /></div>
              ) : notifs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Bell className="h-12 w-12 text-slate-300 dark:text-white/20" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-slate-500 dark:text-white/50">Aucune notification</p>
                  <p className="text-xs text-slate-400 dark:text-white/35">Vous serez notifié ici quand le prix d'un produit suivi baisse.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {notifs.map((n) => (
                    <li key={n.id}>
                      <Link href={productHref(n.slug, n.shopSlug)}
                        className={`flex items-center gap-3 rounded-xl border p-3 transition hover:border-brand-gold/40 ${n.read ? "border-bg-border bg-transparent" : "border-brand-gold/30 bg-brand-gold/[0.04]"}`}>
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10">
                          {n.img ? <img src={n.img} alt="" className="h-full w-full object-contain" /> : <TrendingDown className="h-5 w-5 text-emerald-500" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{n.title}</div>
                          {n.body && <div className="truncate text-xs text-slate-500 dark:text-white/55">{n.body}</div>}
                          <div className="mt-0.5 text-[10px] text-slate-400 dark:text-white/35">{new Date(n.createdAt).toLocaleString("fr-FR")}</div>
                        </div>
                        {n.newPrice != null && (
                          <div className="text-right">
                            {n.oldPrice != null && <div className="text-[11px] text-slate-400 line-through">{fmtPrice(n.oldPrice)}</div>}
                            <div className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{fmtPrice(n.newPrice)} DT</div>
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ALERTES TAB */}
          {tab === "alertes" && (
            <div>
              <h2 className="section-title mb-4">Mes alertes prix</h2>
              {engLoading ? (
                <div className="flex justify-center py-12"><div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-gold/30 border-t-brand-gold" /></div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <BellRing className="h-12 w-12 text-slate-300 dark:text-white/20" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-slate-500 dark:text-white/50">Aucune alerte configurée</p>
                  <p className="text-xs text-slate-400 dark:text-white/35">Cliquez sur « M'alerter si le prix baisse » sur une page produit.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {alerts.map((a) => (
                    <li key={a.id} className="flex items-center gap-3 rounded-xl border border-bg-border p-3">
                      <Link href={productHref(a.slug, a.shopSlug)} className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10">
                          {a.img ? <img src={a.img} alt="" className="h-full w-full object-contain" /> : <Bell className="h-5 w-5 text-slate-300" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{a.name}</div>
                          <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-white/55">
                            <span>Prix suivi : <span className="font-bold tabular-nums">{fmtPrice(a.baselinePrice)} DT</span></span>
                            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><Bell className="h-3 w-3" /> Active</span>
                          </div>
                        </div>
                      </Link>
                      <button onClick={() => removeAlert(a.slug)} aria-label="Supprimer l'alerte"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-300 hover:text-red-500 dark:border-white/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* FAVORIS TAB */}
          {tab === "favoris" && (
            <div>
              <h2 className="section-title mb-4">Mes favoris</h2>
              {engLoading ? (
                <div className="flex justify-center py-12"><div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-gold/30 border-t-brand-gold" /></div>
              ) : favorites.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <Heart className="h-12 w-12 text-slate-300 dark:text-white/20" strokeWidth={1.5} />
                  <p className="text-sm font-semibold text-slate-500 dark:text-white/50">Aucun favori enregistré</p>
                  <p className="text-xs text-slate-400 dark:text-white/35">Cliquez sur ♥ sur n'importe quel produit pour le sauvegarder ici.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {favorites.map((f) => (
                    <div key={f.id} className="group flex items-center gap-3 rounded-xl border border-bg-border p-3 transition hover:border-brand-gold/40">
                      <Link href={productHref(f.slug, f.shopSlug)} className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-white/10">
                          {f.img ? <img src={f.img} alt="" className="h-full w-full object-contain" /> : <Heart className="h-5 w-5 text-slate-300" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          {f.brand && <div className="truncate text-[10px] font-bold uppercase tracking-wider text-brand-gold/80">{f.brand}</div>}
                          <div className="truncate text-sm font-bold text-slate-900 dark:text-white">{f.name}</div>
                          <div className="mt-0.5 text-sm font-black text-brand-gold tabular-nums">{fmtPrice(f.price)} DT</div>
                        </div>
                      </Link>
                      <button onClick={() => removeFavorite(f.slug)} aria-label="Retirer des favoris"
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 transition hover:border-red-300 hover:text-red-500 dark:border-white/10">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECURITE TAB */}
          {tab === "securite" && (
            <form onSubmit={handleChangePassword} className="space-y-5">
              <h2 className="section-title mb-4">Changer le mot de passe</h2>

              {(["Mot de passe actuel", "Nouveau mot de passe", "Confirmer le nouveau"] as const).map((lbl, i) => {
                const vals = [currentPwd, newPwd, confirmPwd];
                const setters = [setCurrentPwd, setNewPwd, setConfirmPwd];
                return (
                  <div key={lbl}>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">{lbl}</label>
                    <input
                      type="password"
                      required
                      minLength={i > 0 ? 8 : 1}
                      value={vals[i]}
                      onChange={(e) => setters[i](e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
                    />
                  </div>
                );
              })}

              {pwdMsg && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0" /> {pwdMsg}
                </div>
              )}
              {pwdErr && (
                <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
                  {pwdErr}
                </div>
              )}

              <button
                type="submit"
                disabled={pwdLoading}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-brand-red via-brand-redDark to-[#7a0f1a] px-6 py-2.5 text-sm font-bold text-white shadow-glow ring-1 ring-white/10 transition hover:shadow-[0_0_30px_rgba(225,29,45,0.55)] disabled:opacity-60"
              >
                <span className="relative z-10">{pwdLoading ? "Enregistrement…" : "Modifier le mot de passe"}</span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
