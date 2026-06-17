"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Phone } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

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
      await login({
        ...(mode === "email" ? { email } : { phone }),
        password,
      });
      router.push("/profil");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg-900">
      <Header />

      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-sm flex-col items-center justify-center px-4 py-12">
        {/* Card */}
        <div className="w-full rounded-2xl border border-bg-border bg-bg-card p-8 shadow-card">
          {/* Logo + title */}
          <div className="mb-7 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 ring-1 ring-brand-gold/30 shadow-[0_0_30px_-8px_rgba(246,196,83,0.4)]">
              <Lock className="h-6 w-6 text-brand-gold" strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Se connecter
            </h1>
            <p className="mt-1 font-arabic text-sm text-slate-500 dark:text-white/50" dir="rtl">
              تسجيل الدخول
            </p>
          </div>

          {/* Toggle email / phone */}
          <div className="mb-5 flex rounded-xl border border-bg-border bg-bg-700 p-1">
            <button
              type="button"
              onClick={() => setMode("email")}
              className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${
                mode === "email"
                  ? "bg-bg-card text-slate-900 shadow-sm ring-1 ring-bg-border dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/80"
              }`}
            >
              E-mail
            </button>
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${
                mode === "phone"
                  ? "bg-bg-card text-slate-900 shadow-sm ring-1 ring-bg-border dark:text-white"
                  : "text-slate-500 hover:text-slate-700 dark:text-white/50 dark:hover:text-white/80"
              }`}
            >
              Téléphone
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or phone field */}
            {mode === "email" ? (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vous@exemple.com"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+21620123456"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                  Mot de passe
                </label>
                <Link
                  href="/mot-de-passe-oublie"
                  className="text-xs font-semibold text-brand-gold hover:underline"
                >
                  Oublié ?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/70"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 dark:border-red-800/50 dark:bg-red-950/40 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-brand-red via-brand-redDark to-[#7a0f1a] py-2.5 text-sm font-bold text-white shadow-glow ring-1 ring-white/10 transition hover:shadow-[0_0_30px_rgba(225,29,45,0.55)] disabled:opacity-60"
            >
              <span className="relative z-10">
                {loading ? "Connexion…" : "Se connecter"}
              </span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-slate-500 dark:text-white/50">
            Pas encore de compte ?{" "}
            <Link href="/register" className="font-semibold text-brand-gold hover:underline">
              S'inscrire
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
