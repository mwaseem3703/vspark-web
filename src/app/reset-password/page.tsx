"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { PublicShell } from "@/components/shell";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(initialEmail);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotFound(false);

    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid registered email address.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password: newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.notFound || res.status === 404) {
          setNotFound(true);
        }
        throw new Error(data.error || "Failed to update password.");
      }

      setSuccess(true);
    } catch (err) {
      setError((err as Error).message || "Failed to update password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-[#101a2b] rounded-[2px] border border-slate-200 dark:border-[#1e293b] shadow-sm p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/vspark.png"
            alt="VSpark"
            className="vspark-logo-light h-10 w-auto mx-auto object-contain mb-3"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/dark-logo.webp"
            alt="VSpark"
            className="vspark-logo-dark h-10 w-auto mx-auto object-contain mb-3"
          />
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Reset Account Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Set a new secure password for your VSpark student account.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-[2px] space-y-2 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              <span className="font-medium leading-relaxed">{error}</span>
            </div>
            {notFound && (
              <div className="pt-2 pl-6.5 border-t border-rose-200/60 dark:border-rose-900/60">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 font-bold text-rose-800 dark:text-rose-300 hover:text-rose-950 dark:hover:text-rose-200 underline"
                >
                  Register for a new account &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {success ? (
          <div className="space-y-5 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Password Updated Successfully
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Your new password has been set. You can now sign in to your student dashboard.
              </p>
            </div>
            <Link
              href="/login"
              className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-[2px] shadow-xs transition-colors"
            >
              Sign In Now <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Target Account
              </label>
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[2px] bg-slate-50 dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] text-xs font-semibold text-slate-800 dark:text-slate-200">
                <Mail size={16} className="text-slate-500 dark:text-slate-400 shrink-0" />
                <span className="truncate">{email || "student@example.com"}</span>
                <span className="ml-auto text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  Locked
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", zIndex: 1 }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  style={{ paddingLeft: "42px", paddingRight: "42px" }}
                  className="w-full h-10 text-xs rounded-[2px] border border-slate-300 dark:border-[#29364b] bg-white dark:bg-[#0d1527] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", background: "none", border: "none", cursor: "pointer", zIndex: 1 }}
                  className="hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", zIndex: 1 }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  style={{ paddingLeft: "42px", paddingRight: "42px" }}
                  className="w-full h-10 text-xs rounded-[2px] border border-slate-300 dark:border-[#29364b] bg-white dark:bg-[#0d1527] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                borderRadius: "2px",
              }}
              className="w-full h-10 px-4 inline-flex items-center justify-center gap-2 text-xs font-bold hover:bg-blue-700 shadow-xs transition-colors disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <KeyRound size={14} />
                  Update Password
                </>
              )}
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            href="/login"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline inline-flex items-center gap-1"
          >
            <ArrowLeft size={13} /> Back to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <PublicShell>
      <Suspense
        fallback={
          <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center text-xs text-slate-500 font-medium">
            Loading password recovery...
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </PublicShell>
  );
}
