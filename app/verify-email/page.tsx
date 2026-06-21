"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  function token(): string | null {
    return typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  }

  function setDigit(i: number, v: string) {
    const c = v.replace(/\D/g, "").slice(-1);
    setDigits((d) => { const n = [...d]; n[i] = c; return n; });
    if (c && i < 5) refs.current[i + 1]?.focus();
  }
  function onKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  }
  function onPaste(e: React.ClipboardEvent) {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (txt) { setDigits(txt.padEnd(6, "").split("").slice(0, 6)); refs.current[Math.min(txt.length, 5)]?.focus(); e.preventDefault(); }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setNotice("");
    const otp = digits.join("");
    if (otp.length !== 6) { setError("Entrez les 6 chiffres."); return; }
    const t = token();
    if (!t) { setError("Veuillez vous connecter d'abord."); return; }
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${t}` },
        body: JSON.stringify({ otp }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => null);
        throw new Error(d?.message ?? "Code invalide ou expiré");
      }
      setNotice("E-mail vérifié ! Redirection…");
      setTimeout(() => router.push("/profil"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    } finally { setLoading(false); }
  }

  async function resend() {
    setError(""); setNotice("");
    const t = token();
    if (!t) { setError("Veuillez vous connecter d'abord."); return; }
    try {
      const r = await fetch(`${API}/api/auth/resend-otp`, {
        method: "POST", headers: { Authorization: `Bearer ${t}` },
      });
      if (!r.ok) throw new Error("Impossible de renvoyer le code");
      setNotice("Nouveau code envoyé.");
      setResendIn(45);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10 dark:bg-[#070a14]">
      <div className="pointer-events-none absolute -top-40 left-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-brand-gold/10 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 right-1/4 h-[34rem] w-[34rem] translate-x-1/2 rounded-full bg-brand-red/10 blur-[130px] dark:bg-brand-red/15" />

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2 text-slate-900 dark:text-white">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-red to-brand-redDark ring-1 ring-black/5 dark:ring-white/10">
              <img src="/mascot.png" alt="" className="h-7 w-7 object-contain" />
            </span>
            <span className="text-lg font-black tracking-tight">
              <span className="text-brand-gold">°</span>1111<span className="bg-gradient-to-r from-brand-goldDark to-amber-400 bg-clip-text text-transparent dark:from-brand-gold dark:to-amber-200">.TN</span>
            </span>
          </Link>
        </div>

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] dark:border-white/10 dark:bg-white/[0.03] dark:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)] dark:backdrop-blur-xl">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-brand-gold/70 to-transparent" />
          <div className="p-7 text-center sm:p-9">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gold/15 text-brand-gold">
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="3" /><path d="M3 8l9 6 9-6" />
              </svg>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Vérifiez votre e-mail</h1>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-white/45">
              Saisissez le code à 6 chiffres envoyé à votre adresse e-mail.
            </p>

            {notice && <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">{notice}</div>}
            {error && <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-600 dark:text-red-300">{error}</div>}

            <form onSubmit={verify} className="mt-6">
              <div className="flex justify-center gap-2" onPaste={onPaste}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={(e) => setDigit(i, e.target.value)}
                    onKeyDown={(e) => onKeyDown(i, e)}
                    className="h-14 w-12 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-black text-slate-900 outline-none transition focus:border-brand-gold/60 focus:bg-white focus:ring-4 focus:ring-brand-gold/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:bg-white/[0.07]"
                  />
                ))}
              </div>

              <button type="submit" disabled={loading}
                className="group relative mt-6 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-brand-red to-brand-redDark py-3.5 text-sm font-bold text-white shadow-[0_8px_24px_-6px_rgba(225,29,45,0.6)] ring-1 ring-white/10 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60">
                {loading ? "Vérification…" : "Vérifier"}
              </button>
            </form>

            <div className="mt-5 text-sm text-slate-500 dark:text-white/45">
              Pas reçu de code ?{" "}
              {resendIn > 0 ? (
                <span className="text-slate-400 dark:text-white/30">Renvoyer dans {resendIn}s</span>
              ) : (
                <button onClick={resend} className="font-bold text-brand-gold transition hover:text-amber-300">Renvoyer le code</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
