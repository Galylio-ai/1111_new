"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/* ── SVG micro-icons ───────────────────────────────────────────────── */
const IconEnvelope = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="16" height="12" rx="2.5" />
    <path d="M2 7l8 5 8-5" />
  </svg>
);
const IconPhone = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 2h3l1.5 3.5L8 7a11 11 0 0 0 5 5l1.5-1.5L18 12v3a2 2 0 0 1-2 2A15 15 0 0 1 3 4a2 2 0 0 1 2-2z" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="9" width="12" height="8" rx="2" />
    <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
  </svg>
);
const IconEye = ({ off }: { off?: boolean }) =>
  off ? (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l14 14M8.5 8.56A4 4 0 0 0 10 14a4 4 0 0 0 4-4 4 4 0 0 0-.56-2" />
      <path d="M2 10s3-6 8-6c1.13 0 2.18.27 3.13.73M18 10s-3 6-8 6a7.8 7.8 0 0 1-3.13-.73" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="10" cy="10" rx="8" ry="5" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  );

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ ...(mode === "email" ? { email } : { phone }), password });
      // Read redirect from URL at submit time — avoids useSearchParams + Suspense requirement
      let target = "/profil";
      if (typeof window !== "undefined") {
        const r = new URLSearchParams(window.location.search).get("redirect");
        if (r && r.startsWith("/") && !r.startsWith("//")) target = r;
      }
      router.push(target);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-brand-gold/60 focus:bg-white focus:ring-4 focus:ring-brand-gold/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:bg-white/[0.07]";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-[#070a14]">
      {/* Background: ambient glows + grid + mascot watermark */}
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[140px] dark:bg-brand-red/15" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[34rem] w-[34rem] translate-x-1/2 rounded-full bg-brand-gold/10 blur-[130px]" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          color: "var(--grid, #94a3b8)",
        }}
      />
      <img
        src="/mascot.png"
        alt=""
        className="pointer-events-none absolute -right-10 bottom-0 hidden w-80 opacity-[0.07] blur-[1px] lg:block xl:w-96"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Brand pill on top */}
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-brand-redDark ring-1 ring-black/5 dark:ring-white/10">
              <img src="/mascot.png" alt="" className="h-7 w-7 object-contain" />
            </span>
            <span className="text-lg font-black tracking-tight">
              <span className="text-brand-gold">°</span>1111<span className="bg-gradient-to-r from-brand-goldDark to-amber-400 bg-clip-text text-transparent dark:from-brand-gold dark:to-amber-200">.TN</span>
            </span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-brand-gold/40 hover:text-brand-gold dark:border-white/10 dark:bg-white/5 dark:text-white/60"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Accueil
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] dark:backdrop-blur-xl">
          {/* gold hairline */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />

          <div className="p-7 sm:p-9">
            {/* Header */}
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Bon retour 👋
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-white/45">
              Connectez-vous pour suivre vos prix et alertes.
            </p>

            {/* Toggle */}
            <div className="mt-7 grid grid-cols-2 gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.03]">
              {(["email", "phone"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={`rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
                    mode === m
                      ? "bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 text-brand-goldDark ring-1 ring-brand-gold/30 dark:text-brand-gold"
                      : "text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white/70"
                  }`}
                >
                  {m === "email" ? "E-mail" : "Téléphone"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Identifier */}
              <div className="group relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30">
                  {mode === "email" ? <IconEnvelope /> : <IconPhone />}
                </span>
                <input
                  type={mode === "email" ? "email" : "tel"}
                  required
                  value={mode === "email" ? email : phone}
                  onChange={(e) => mode === "email" ? setEmail(e.target.value) : setPhone(e.target.value)}
                  placeholder={mode === "email" ? "vous@exemple.com" : "+21620123456"}
                  className={inputBase}
                />
              </div>

              {/* Password */}
              <div>
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30">
                    <IconLock />
                  </span>
                  <input
                    type={showPwd ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    className={`${inputBase} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-white/30 dark:hover:text-white/60"
                  >
                    <IconEye off={showPwd} />
                  </button>
                </div>
                <div className="mt-2 text-right">
                  <Link href="/mot-de-passe-oublie" className="text-xs font-semibold text-brand-gold/80 transition hover:text-brand-gold">
                    Mot de passe oublié ?
                  </Link>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <svg viewBox="0 0 20 20" fill="none" className="mt-px h-4 w-4 shrink-0 text-red-400" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <circle cx="10" cy="10" r="8" />
                    <path d="M10 6v4M10 14h.01" />
                  </svg>
                  <p className="text-sm font-medium text-red-300">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-red to-brand-redDark py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(225,29,45,0.6)] ring-1 ring-white/10 transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_10px_30px_-4px_rgba(225,29,45,0.7)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeOpacity=".5" />
                      </svg>
                      Connexion…
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-7 text-center text-sm text-slate-500 dark:text-white/40">
              Pas encore de compte ?{" "}
              <Link href="/register" className="font-bold text-brand-gold transition hover:text-amber-300">
                S'inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-[11px] text-slate-400 dark:text-white/20">
          © 2025 1111.tn · Le moteur d'intelligence des prix en Tunisie
        </p>
      </div>
    </main>
  );
}
