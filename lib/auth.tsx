"use client";
import { createContext, useContext, useEffect, useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export type AuthUser = {
  id: string;
  full_name: string;
  email?: string;
  phone?: string;
  state: string;
  role: string;
  is_email_verified: boolean;
  avatar_url?: string;
};

type AuthCtx = {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: { email?: string; phone?: string; password: string }) => Promise<void>;
  register: (payload: { full_name: string; email?: string; phone?: string; password: string; state: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe(token: string): Promise<AuthUser | null> {
    try {
      const r = await fetch(`${API}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!r.ok) return null;
      const j = await r.json();
      return j.data ?? j.user ?? j;
    } catch {
      return null;
    }
  }

  async function refreshUser() {
    const token = localStorage.getItem("access_token");
    if (!token) { setUser(null); return; }
    const u = await fetchMe(token);
    setUser(u);
  }

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  async function login(payload: { email?: string; phone?: string; password: string }) {
    const r = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.message ?? "Identifiants incorrects");
    // backend wraps tokens in j.data or at root level
    const data = j.data ?? j;
    const accessToken = data.access_token ?? data.token;
    const refreshToken = data.refresh_token;
    localStorage.setItem("access_token", accessToken);
    if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
    const u = await fetchMe(accessToken);
    setUser(u);
  }

  async function register(payload: { full_name: string; email?: string; phone?: string; password: string; state: string }) {
    const r = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!r.ok) throw new Error(j.message ?? "Erreur lors de l'inscription");
    // backend wraps tokens in j.data or at root level
    const data = j.data ?? j;
    const accessToken = data.access_token ?? data.token;
    const refreshToken = data.refresh_token;
    if (accessToken) {
      localStorage.setItem("access_token", accessToken);
      if (refreshToken) localStorage.setItem("refresh_token", refreshToken);
      const u = await fetchMe(accessToken);
      setUser(u);
    }
  }

  async function logout() {
    const refresh_token = localStorage.getItem("refresh_token");
    if (refresh_token) {
      await fetch(`${API}/api/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token }),
      }).catch(() => {});
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }

  return <Ctx.Provider value={{ user, loading, login, register, logout, refreshUser }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
