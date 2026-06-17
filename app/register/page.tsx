"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Eye, EyeOff, Lock, Mail, MapPin, Phone, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const TUNISIAN_STATES = [
  "Ariana", "Béja", "Ben Arous", "Bizerte", "Gabès",
  "Gafsa", "Jendouba", "Kairouan", "Kasserine", "Kébili",
  "Le Kef", "Mahdia", "La Manouba", "Médenine", "Monastir",
  "Nabeul", "Sfax", "Sidi Bouzid", "Siliana", "Sousse",
  "Tataouine", "Tozeur", "Tunis", "Zaghouan",
] as const;

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const colors = ["bg-slate-200 dark:bg-white/10", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  const labels = ["", "Faible", "Moyen", "Bien", "Fort"];
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= score ? colors[score] : "bg-slate-200 dark:bg-white/10"}`} />
        ))}
      </div>
      <p className={`text-[11px] font-semibold ${score <= 1 ? "text-red-500" : score === 2 ? "text-orange-400" : score === 3 ? "text-yellow-500" : "text-emerald-500"}`}>
        {labels[score]}
      </p>
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
    if (password !== confirmPwd) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    if (!email && !phone) {
      setError("Veuillez renseigner un e-mail ou un téléphone");
      return;
    }
    if (phone && !PHONE_RE.test(phone)) {
      setError("Numéro de téléphone invalide (ex: +21620123456)");
      return;
    }
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        ...(email ? { email } : {}),
        ...(phone && PHONE_RE.test(phone) ? { phone } : {}),
        password,
        state,
      });
      router.push("/profil");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bg-900">
      <Header />

      <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-sm flex-col items-center justify-center px-4 py-12">
        <div className="w-full rounded-2xl border border-bg-border bg-bg-card p-8 shadow-card">
          {/* Title */}
          <div className="mb-7 text-center">
            <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-gold/25 to-brand-gold/5 ring-1 ring-brand-gold/30 shadow-[0_0_30px_-8px_rgba(246,196,83,0.4)]">
              <User className="h-6 w-6 text-brand-gold" strokeWidth={2.2} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Créer un compte
            </h1>
            <p className="mt-1 font-arabic text-sm text-slate-500 dark:text-white/50" dir="rtl">
              إنشاء حساب
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                Nom complet
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Votre nom et prénom"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                E-mail <span className="normal-case font-normal opacity-60">(ou téléphone)</span>
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@exemple.com"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                Téléphone <span className="normal-case font-normal opacity-60">(optionnel)</span>
              </label>
              <div className="relative">
                <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+21620123456"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 dark:text-white dark:placeholder:text-white/30 dark:bg-white/[0.04] ${
                    phone && !/^\+216[24579][0-9]{7}$/.test(phone)
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 bg-white dark:border-red-700"
                      : "border-slate-300 focus:border-brand-gold/50 focus:ring-brand-gold/20 bg-white dark:border-white/10"
                  }`}
                />
              </div>
            </div>

            {/* Gouvernorat */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                Gouvernorat
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <select
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-900 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-[#0f1422] dark:text-white"
                >
                  <option value="" disabled>Sélectionner…</option>
                  {TUNISIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-brand-gold/50 focus:ring-2 focus:ring-brand-gold/20 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:placeholder:text-white/30"
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/70">
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/50">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-white/30" />
                <input
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:ring-2 dark:text-white dark:placeholder:text-white/30 dark:bg-white/[0.04] ${
                    confirmPwd && confirmPwd !== password
                      ? "border-red-400 focus:border-red-400 focus:ring-red-400/20 dark:border-red-700"
                      : confirmPwd && confirmPwd === password
                      ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-400/20 dark:border-emerald-700 bg-white"
                      : "border-slate-300 focus:border-brand-gold/50 focus:ring-brand-gold/20 dark:border-white/10 bg-white"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-white/30 dark:hover:text-white/70">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <span className="relative z-10">{loading ? "Inscription…" : "Créer mon compte"}</span>
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-white/50">
            Déjà inscrit ?{" "}
            <Link href="/login" className="font-semibold text-brand-gold hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>

      <Footer />
    </main>
  );
}
