"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

/* ── icons ──────────────────────────────────────────────────────────────── */
const IconEnvelope = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="16" height="12" rx="2.5" /><path d="M2 7l8 5 8-5" />
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="9" width="12" height="8" rx="2" /><path d="M7 9V6.5a3 3 0 0 1 6 0V9" />
  </svg>
);
const IconKey = () => (
  <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="10" r="3.5" /><path d="M10.5 10H18M15 10v3M18 10v2.5" />
  </svg>
);

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const inputBase =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-brand-gold/60 focus:bg-white focus:ring-4 focus:ring-brand-gold/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30 dark:focus:bg-white/[0.07]";

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setNotice(""); setLoading(true);
    try {
      const r = await fetch(`${API}/api/auth/forgot-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      // Always advance (don't leak whether the email exists), but surface server errors.
      if (!r.ok && r.status !== 404) {
        const d = await r.json().catch(() => null);
        throw new Error(d?.message ?? "Une erreur est survenue");
      }
      setNotice("Si un compte existe, un code à 6 chiffres a été envoyé par e-mail.");
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setNotice(""); setLoading(true);
    try {
      const r = await fetch(`${API}/api/auth/reset-password`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPassword }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => null);
        throw new Error(d?.message ?? "Code invalide ou expiré");
      }
      setNotice("Mot de passe réinitialisé. Redirection vers la connexion…");
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-[#070a14]">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-red/10 blur-[140px] dark:bg-brand-red/15" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[34rem] w-[34rem] translate-x-1/2 rounded-full bg-brand-gold/10 blur-[130px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-brand-redDark ring-1 ring-black/5 dark:ring-white/10">
              <img src="/mascot.png" alt="" className="h-7 w-7 object-contain" />
            </span>
            <span className="text-lg font-black tracking-tight">
              <span className="text-brand-gold">°</span>1111<span className="bg-gradient-to-r from-brand-goldDark to-amber-400 bg-clip-text text-transparent dark:from-brand-gold dark:to-amber-200">.TN</span>
            </span>
          </Link>
          <Link href="/login" className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-brand-gold/40 hover:text-brand-gold dark:border-white/10 dark:bg-white/5 dark:text-white/60">
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 12L6 8l4-4" /></svg>
            Connexion
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] dark:backdrop-blur-xl">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
          <div className="p-7 sm:p-9">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
              {step === 1 ? "Mot de passe oublié ?" : "Réinitialiser"}
            </h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-white/45">
              {step === 1
                ? "Entrez votre e-mail pour recevoir un code de réinitialisation."
                : `Code envoyé à ${email}. Saisissez-le avec votre nouveau mot de passe.`}
            </p>

            {notice && (
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">{notice}</div>
            )}
            {error && (
              <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-300">{error}</div>
            )}

            {step === 1 ? (
              <form onSubmit={requestOtp} className="mt-6 space-y-4">
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30"><IconEnvelope /></span>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" className={inputBase} />
                </div>
                <SubmitBtn loading={loading}>Envoyer le code</SubmitBtn>
              </form>
            ) : (
              <form onSubmit={resetPassword} className="mt-6 space-y-4">
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30"><IconKey /></span>
                  <input inputMode="numeric" pattern="\d{6}" maxLength={6} required value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Code à 6 chiffres" className={`${inputBase} tracking-[0.4em]`} />
                </div>
                <div className="group relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-brand-gold dark:text-white/30"><IconLock /></span>
                  <input type="password" required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe (8+ caractères)" className={inputBase} />
                </div>
                <SubmitBtn loading={loading}>Réinitialiser le mot de passe</SubmitBtn>
                <button type="button" onClick={() => { setStep(1); setOtp(""); setError(""); }} className="w-full text-center text-xs font-semibold text-slate-400 transition hover:text-brand-gold dark:text-white/40">
                  ← Modifier l'e-mail
                </button>
              </form>
            )}

            <p className="mt-7 text-center text-sm text-slate-500 dark:text-white/40">
              Vous vous souvenez ?{" "}
              <Link href="/login" className="font-bold text-brand-gold transition hover:text-amber-300">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading}
      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-red to-brand-redDark py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(225,29,45,0.6)] ring-1 ring-white/10 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60">
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeOpacity=".5" />
          </svg>
        ) : null}
        {children}
      </span>
    </button>
  );
}
