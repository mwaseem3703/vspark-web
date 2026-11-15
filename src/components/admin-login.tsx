"use client";

import { useState, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, ShieldCheck } from "lucide-react";

export function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (document.cookie.includes("admin_session=true")) {
      router.replace("/admin");
    }
  }, [router]);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid faculty administrator credentials.");
      }

      window.location.href = "/admin";
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-slate-200 rounded-[2px] p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Brand Bar */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/vspark.png"
              alt="VSpark"
              className="vspark-logo-light h-9 w-auto object-contain"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/dark-logo.webp"
              alt="VSpark"
              className="vspark-logo-dark h-9 w-auto object-contain"
            />
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-[2px] border border-blue-200 uppercase tracking-wider">
              Faculty Console
            </span>
          </div>

          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Faculty & Admin Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Restricted portal for competition organizers and evaluators.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-[2px] bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Admin Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@vspark.edu"
                  style={{ paddingLeft: "38px", paddingRight: "12px" }}
                  className="w-full h-10 text-xs bg-white border border-slate-300 rounded-[2px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors"
                />
                <Mail
                  size={15}
                  style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  className="text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  style={{ paddingLeft: "38px", paddingRight: "40px" }}
                  className="w-full h-10 text-xs bg-white border border-slate-300 rounded-[2px] text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 transition-colors font-mono"
                />
                <Lock
                  size={15}
                  style={{ position: "absolute", left: "13px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  className="text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}
                  className="text-slate-400 hover:text-slate-600 p-1 flex items-center justify-center cursor-pointer"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full h-10 inline-flex items-center justify-center text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-[2px] shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              {busy ? "Verifying Credentials..." : "Access Control Center"}
            </button>
          </form>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft size={13} /> Return to Public Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
