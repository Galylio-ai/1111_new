"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

/* ── SVG micro-icons ───────────────────────────────────────────────── */
const IconPerson = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="6.5" r="3.5" />
    <path d="M2 18c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
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
const IconPin = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 2a6 6 0 0 1 6 6c0 4-6 10-6 10S4 12 4 8a6 6 0 0 1 6-6z" />
    <circle cx="10" cy="8" r="2" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="9" width="12" height="8" rx="2" />
    <path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 7.5l5 5 5-5" />
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

const TUNISIAN_STATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès",
  "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kébili",
  "Le Kef", "Mahdia", "La Manouba", "Médenine", "Monastir",
  "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
  "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

/* ── Password strength indicator ───────────────────────────────────── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["bg-white/10", "bg-red-500", "bg-orange-400", "bg-amber-400", "bg-emerald-500"];
  const labels = ["", "Faible", "Moyen", "Bien", "Fort"];
  const textColors = ["", "text-red-400", "text-orange-400", "text-amber-400", "text-emerald-400"];
  if (!password) return null;
  return (
    <div className="mt-2.5 space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : "bg-white/8"}`}
          />
        ))}
      </div>
      <p className={`text-[11px] font-bold tracking-wide ${textColors[score]}`}>{labels[score]}</p>
    </div>
  );
}

/* ── Field wrapper ──────────────────────────────────────────────────── */
function Field({ label, badge, children }: { label: string; badge?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-white/35">
        {label}
        {badge && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold normal-case tracking-normal text-slate-400 dark:bg-white/8 dark:text-white/30">{badge}</span>}
      </label>
      {children}
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [state, setState] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const PHONE_RE = /^\+216[24579][0-9]{7}$/;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirmPwd) { setError("Les mots de passe ne correspondent pas"); return; }
    if (!email && !phone) { setError("Veuillez renseigner un e-mail ou un téléphone"); return; }
    if (phone && !PHONE_RE.test(phone)) { setError("Numéro de téléphone invalide (ex: +21620123456)"); return; }
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        ...(email ? { email } : {}),
        ...(phone && PHONE_RE.test(phone) ? { phone } : {}),
        password,
        state,
      });
      router.push(email ? `/verify-email?email=${encodeURIComponent(email)}` : "/profil");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "w-full rounded-2xl border bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:bg-white focus:ring-4 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:bg-white/[0.07]";
  const inputDefault = `${inputBase} border-slate-200 focus:border-brand-gold/60 focus:ring-brand-gold/10 dark:border-white/10`;

  const pwdMatchClass =
    confirmPwd && confirmPwd !== password
      ? `${inputBase} border-red-500/50 pr-12 focus:border-red-400 focus:ring-red-400/15`
      : confirmPwd && confirmPwd === password
      ? `${inputBase} border-emerald-500/50 pr-12 focus:border-emerald-400 focus:ring-emerald-400/15`
      : `${inputDefault} pr-12`;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-[#070a14]">
      {/* Background: ambient glows + grid + mascot watermark */}
      <div className="pointer-events-none absolute -top-40 right-1/4 h-[36rem] w-[36rem] translate-x-1/2 rounded-full bg-brand-gold/10 blur-[140px] dark:bg-brand-gold/12" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[130px] dark:bg-brand-red/15" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.035]"
        style={{
          backgroundImage: "linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)",
          backgroundSize: "44px 44px",
          color: "#94a3b8",
        }}
      />
      <img
        src="/mascot.png"
        alt=""
        className="pointer-events-none absolute -left-10 bottom-0 hidden w-80 opacity-[0.07] blur-[1px] lg:block xl:w-96"
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
            href="/login"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-brand-gold/40 hover:text-brand-gold dark:border-white/10 dark:bg-white/5 dark:text-white/60"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
            Se connecter
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] dark:backdrop-blur-xl">
          {/* gold hairline */}
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />

          <div className="p-7 sm:p-9">
            {/* Header */}
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              Créez votre compte ✨
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-white/45">
              Rejoignez 1111.tn et économisez sur tous vos achats.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {/* Full name */}
              <Field label="Nom complet">
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30">
                    <IconPerson />
                  </span>
                  <input
                    required minLength={2}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Votre nom et prénom"
                    className={inputDefault}
                  />
                </div>
              </Field>

              {/* Email + Phone in a row on wider cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="E-mail" badge="ou tél.">
                  <div className="group relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30">
                      <IconEnvelope />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className={`${inputDefault} pl-12 pr-3`}
                    />
                  </div>
                </Field>

                <Field label="Téléphone" badge="opt.">
                  <div className="group relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30">
                      <IconPhone />
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+216…"
                      className={`${inputBase} pl-12 pr-3 ${
                        phone && !PHONE_RE.test(phone)
                          ? "border-red-500/50 focus:border-red-400 focus:ring-red-400/15"
                          : "border-white/10 focus:border-brand-gold/60 focus:ring-brand-gold/10"
                      }`}
                    />
                  </div>
                </Field>
              </div>

              {/* Gouvernorat */}
              <Field label="Gouvernorat">
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30">
                    <IconPin />
                  </span>
                  <select
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-10 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-brand-gold/60 focus:bg-white focus:ring-4 focus:ring-brand-gold/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:bg-[#0f1422] [&>option]:bg-white dark:[&>option]:bg-[#0f1422]"
                  >
                    <option value="" disabled>Sélectionner…</option>
                    {TUNISIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/30">
                    <IconChevron />
                  </span>
                </div>
              </Field>

              {/* Password */}
              <Field label="Mot de passe">
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30">
                    <IconLock />
                  </span>
                  <input
                    type={showPwd ? "text" : "password"}
                    required minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputDefault} pr-12`}
                  />
                  <button type="button" onClick={() => setShowPwd((v) => !v)} tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-white/30 dark:hover:text-white/60">
                    <IconEye off={showPwd} />
                  </button>
                </div>
                <PasswordStrength password={password} />
              </Field>

              {/* Confirm password */}
              <Field label="Confirmer le mot de passe">
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30">
                    <IconLock />
                  </span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={confirmPwd}
                    onChange={(e) => setConfirmPwd(e.target.value)}
                    placeholder="••••••••"
                    className={pwdMatchClass}
                  />
                  <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:text-white/30 dark:hover:text-white/60">
                    <IconEye off={showConfirm} />
                  </button>
                </div>
                {confirmPwd && confirmPwd === password && (
                  <p className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8l3 3 7-7" />
                    </svg>
                    Mots de passe identiques
                  </p>
                )}
              </Field>

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
                      Inscription…
                    </>
                  ) : (
                    "Créer mon compte"
                  )}
                </span>
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </button>
            </form>

            {/* Footer link */}
            <p className="mt-7 text-center text-sm text-slate-500 dark:text-white/40">
              Déjà inscrit ?{" "}
              <Link href="/login" className="font-bold text-brand-gold transition hover:text-amber-300">
                Se connecter
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
