"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Code2,
  Eye,
  EyeOff,
  Upload,
  Clock3,
  Mail,
  ShieldCheck,
  Sparkles,
  Award,
  Layers,
  MessageCircle,
} from "lucide-react";
import { Logo, PublicShell } from "./shell";
import { useApp, request } from "./provider";
import { Button } from "./ui/button";
import type { Profile } from "@/lib/types";
import { OFFICIAL_RUBRIC } from "@/lib/types";
import { extractConfigFromDescription, renderFormattedText } from "@/lib/competition-rules";

export function AuthPage({ register = false }: { register?: boolean }) {
  const { demo, data, ready, demoLogin, resetDemo, update, refresh, notify } = useApp();
  const registrationPending = register && !demo && ready && data.services?.email === false;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [receipt, setReceipt] = useState("");

  useEffect(() => {
    if (!ready || demo) return;
    if (data.profile) {
      if (data.profile.role === "admin") {
        router.replace("/admin");
      } else if (data.profile.status === "approved") {
        router.replace("/dashboard/task");
      } else {
        router.replace("/pending");
      }
    }
  }, [ready, demo, data.profile, router]);

  // Forgot password modal state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState("");
  const [forgotError, setForgotError] = useState("");

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      setForgotError("Please enter a valid registered email address.");
      return;
    }
    setForgotLoading(true);
    setForgotError("");
    setForgotSuccess("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to send password reset email.");
      }
      setForgotSuccess(`Password reset link sent to ${forgotEmail.trim()}! Please check your inbox.`);
      setTimeout(() => {
        setForgotOpen(false);
        setForgotSuccess("");
        setForgotEmail("");
      }, 4000);
    } catch (err) {
      setForgotError((err as Error).message || "Failed to send password reset.");
    } finally {
      setForgotLoading(false);
    }
  };

  const config = extractConfigFromDescription(data?.settings?.task_description);
  const techPills = (config.allowedTechStack || "Next.js 15/16, React 19, Tailwind CSS, TypeScript, Supabase, Node.js, Vercel")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const defaultRulesList = [
    { title: "Timed 120-Minute Challenge", desc: "Workspace freezes automatically when the clock reaches zero. Late submissions are blocked." },
    { title: "Public GitHub Repository", desc: "A valid, publicly accessible GitHub repository link must be provided." },
    { title: "Clean Google Drive Folder Upload", desc: "Upload clean source code without node_modules, .next, .git, or .env files." },
    { title: "Zero Pre-built Boilerplates", desc: "External complete cloned templates are strictly prohibited." },
    { title: "Permitted Tech Stack Only", desc: "Build using approved frameworks: Next.js, React, Tailwind, TypeScript, Supabase." },
    { title: "Live Code Defense", desc: "Participants must present and defend their code and architecture live before the jury." },
  ];

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      if (demo) {
        if (!register) {
          setError("Use a demo workspace below. Real sign-in becomes available after Supabase is connected.");
          return;
        }
        const profile: Profile = {
          id: crypto.randomUUID(),
          full_name: String(form.get("full_name")).trim(),
          email: String(form.get("email")).trim(),
          phone_no: String(form.get("phone_no")).trim(),
          university_name: String(form.get("university_name")).trim(),
          role: "student",
          status: "pending",
          created_at: new Date().toISOString(),
        };
        update((d) => ({ ...d, students: [...d.students, profile], profile }));
        notify("Demo registration created. No email or receipt was uploaded.");
        router.push("/pending");
      } else {
        const result = await request(register ? "auth/register" : "auth/login", {
          method: "POST",
          body: form,
        });
        await refresh();
        if (result.notice) notify(result.notice);
        router.push(result.redirect || "/dashboard/task");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function openDemo(role: "student" | "admin") {
    demoLogin(role);
    router.push(role === "admin" ? "/admin" : "/dashboard/task");
  }

  return (
    <PublicShell>
      <div className={`auth-layout container ${register ? "auth-layout-register" : ""}`}>
        {/* Left Side Story / Guidelines */}
        <aside className="auth-story">
          <div className="eyebrow">
            <Sparkles size={15} /> YOUR NEXT CHAPTER
          </div>
          <h2>
            {register ? (
              <>
                Big ideas start
                <br />
                with a <span>little spark.</span>
              </>
            ) : (
              <>
                Welcome back,
                <br />
                <span>builder.</span>
              </>
            )}
          </h2>

          <p>
            {register
              ? "Join the official VSpark 2026 Web Challenge. Read the guidelines below and create your team profile."
              : "Your ideas are waiting. Pick up where you left off and keep building something that matters."}
          </p>

          {/* DYNAMIC 3 CARDS ON REGISTER PAGE */}
          {register && (
            <div className="space-y-4 my-6">
              {/* CARD 1: PERMITTED TECHNOLOGIES */}
              <div className="p-4 rounded-[2px] bg-white dark:bg-[#101a2b] border border-slate-200/90 dark:border-[#1e293b] shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-[2px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                      <Layers className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">Permitted Technologies</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold">
                    Approved Stack
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2.5">
                  {techPills.map((pill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-[2px] bg-blue-50 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 text-[11px] font-semibold border border-blue-100/80 dark:border-blue-900/60"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                  <strong className="text-slate-800 dark:text-slate-200">AI Assistance Allowed:</strong> ChatGPT and Claude are permitted for debugging and brainstorming. Full code defense required during evaluation.
                </p>
              </div>

              {/* CARD 2: 100-POINT EVALUATION RUBRIC */}
              <div className="p-4 rounded-[2px] bg-white dark:bg-[#101a2b] border border-slate-200/90 dark:border-[#1e293b] shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-[2px] bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      <Award className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">Evaluation & Grading Rubric</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 text-[10px] font-bold">
                    100 Pts Total
                  </span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {OFFICIAL_RUBRIC.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 p-1.5 rounded-[2px] bg-slate-50/70 dark:bg-[#0d1527] border border-slate-100 dark:border-[#1e293b] text-[11px]"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{item.label}</span>
                      </div>
                      <span className="font-bold text-blue-700 dark:text-blue-400 shrink-0">{item.max}m</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CARD 3: RULES & SUBMISSION FREEZE */}
              <div className="p-4 rounded-[2px] bg-white dark:bg-[#101a2b] border border-slate-200/90 dark:border-[#1e293b] shadow-xs">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-[2px] bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      <Clock3 className="w-3.5 h-3.5" />
                    </span>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">Rules & Submission Freeze</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-[10px] font-bold">
                    120 Mins Clock
                  </span>
                </div>
                <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                  {defaultRulesList.map((rule, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-[11.5px] leading-snug">
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="text-slate-700 dark:text-slate-300">
                        <strong className="text-slate-900 dark:text-slate-100 font-bold">{rule.title}:</strong> {rule.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!register && (
            <>
              <div className="auth-visual">
                <div className="auth-code-symbol">
                  &lt;<span>/</span>&gt;
                </div>
                <span className="auth-visual-label">
                  <span className="online-dot" /> THE NEXT GREAT IDEA COULD BE YOURS.
                </span>
              </div>
              <div className="auth-benefits">
                <span>
                  <Check size={16} /> Open to all university students
                </span>
                <span>
                  <Check size={16} /> Official Entry Fee: Rs. 500
                </span>
                <span>
                  <Check size={16} /> Your skills. Your opportunity.
                </span>
              </div>
            </>
          )}
        </aside>

        {/* Right Side Form */}
        <section className="auth-panel">
          <Link href="/" className="back-link">
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div className="eyebrow">{register ? "LET’S MAKE IT OFFICIAL" : "GOOD TO SEE YOU AGAIN"}</div>
          <h1>{register ? "Create your account" : "Log in to VSpark"}</h1>
          <p>
            {register ? "Your first step toward something great." : "Enter your details to access your workspace."}
          </p>
          {registrationPending && (
            <p className="info-note" role="status">
              Registration is opening soon. Please check back after the organizer’s announcement.
            </p>
          )}
          <form onSubmit={submit} className="form-stack">
            {register && (
              <label>
                Full name
                <input
                  name="full_name"
                  placeholder="Your full name"
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                name="email"
                placeholder="you@university.edu"
                required
                type="email"
                autoComplete="email"
                maxLength={254}
              />
            </label>
            {register && (
              <>
                <label>
                  Phone number <span className="label-hint">Include country code</span>
                  <input
                    name="phone_no"
                    placeholder="+92 300 1234567"
                    type="tel"
                    required
                    pattern="\+?[0-9\s()\-]{8,20}"
                    autoComplete="tel"
                  />
                </label>
                <label>
                  University
                  <input
                    name="university_name"
                    placeholder="Your university name"
                    required
                    maxLength={150}
                    autoComplete="organization"
                  />
                </label>
              </>
            )}
            <label>
              Password
              <div className="password-input">
                <input
                  name="password"
                  placeholder={register ? "At least 8 characters" : "Your password"}
                  required
                  type={show ? "text" : "password"}
                  minLength={8}
                  maxLength={128}
                  autoComplete={register ? "new-password" : "current-password"}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                  className="eye-toggle-btn"
                >
                  {show ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>
            {!register && (
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-6px", marginBottom: "8px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setForgotOpen(true);
                    setForgotError("");
                    setForgotSuccess("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#2563eb",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                    padding: 0,
                  }}
                >
                  Forgot Password?
                </button>
              </div>
            )}
            {register && (
              <label>
                Payment deposit receipt <span className="label-hint">Rs. 500 · Slip / Screenshot</span>
                <span className="file-drop receipt-drop">
                  <Upload size={20} />
                  <strong>{receipt || "Click to attach your deposit slip"}</strong>
                  <span>PNG, JPG, or PDF · Up to 3 MB</span>
                  <input
                    type="file"
                    name="receipt"
                    accept="image/png,image/jpeg,application/pdf"
                    aria-label="Payment deposit receipt"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && f.size > 3 * 1024 * 1024) {
                        e.target.value = "";
                        setReceipt("");
                        setError("Receipt must be smaller than 3 MB.");
                      } else {
                        setReceipt(f?.name || "");
                        setError("");
                      }
                    }}
                  />
                </span>
              </label>
            )}
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <Button size="lg" disabled={busy || registrationPending || (!demo && !ready)} type="submit">
              {busy ? (
                <>
                  <span className="spinner" /> Please wait…
                </>
              ) : (
                <>
                  {register ? "Create account" : "Log in"}
                  <ArrowUpRight size={17} />
                </>
              )}
            </Button>
            {register && (
              <p className="form-footnote">
                <ShieldCheck size={13} /> Your registration will be reviewed by an organizer.
              </p>
            )}
          </form>
          <p className="auth-switch">
            {register ? "Already part of the community?" : "New here?"}{" "}
            <Link href={register ? "/login" : "/register"}>
              {register ? "Log in" : "Create an account"} <ArrowUpRight size={12} />
            </Link>
          </p>
          {demo && (
            <div className="demo-options">
              <div>
                <span>TAKE A LOOK AROUND</span>
                <p>Try the workspaces with sample data.</p>
              </div>
              <div>
                <Button variant="outline" size="sm" onClick={() => openDemo("student")}>
                  <Code2 size={15} /> Student demo
                </Button>
                <Button variant="outline" size="sm" onClick={() => openDemo("admin")}>
                  <ShieldCheck size={15} /> Admin demo
                </Button>
              </div>
              <button type="button" className="reset-demo" onClick={resetDemo}>
                Reset demo data
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !forgotLoading) setForgotOpen(false);
          }}
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[12px] max-w-[440px] w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-[2px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                  <Mail size={16} />
                </span>
                <h3 className="m-0 text-base font-bold text-slate-900 dark:text-slate-100">
                  Forgot Your Password?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setForgotOpen(false)}
                className="bg-transparent border-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-lg p-1"
              >
                &times;
              </button>
            </div>

            <p className="m-0 mb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enter your registered student email address. We will send you an official secure link to reset your account password.
            </p>

            {forgotError && (
              <div className="p-3 mb-3.5 rounded-[2px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs">
                {forgotError}
              </div>
            )}

            {forgotSuccess && (
              <div className="p-3 mb-3.5 rounded-[2px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                {forgotSuccess}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Registered Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-[2px] border border-slate-300 dark:border-[#29364b] bg-white dark:bg-[#0d1527] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  disabled={forgotLoading}
                  className="h-9 px-4 rounded-[2px] text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer border-0 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail.trim()}
                  className="h-9 px-5 rounded-[2px] text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer border-0 transition-colors disabled:opacity-50"
                >
                  {forgotLoading ? "Sending Link..." : "Send Reset Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PublicShell>
  );
}

export function PendingPage() {
  const { data, ready, demo, update, refresh, notify, logout } = useApp();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const p = data.profile;

  return (
    <PublicShell>
      <div className="container pending-wrap">
        <div className="pending-card">
          <span className="pending-icon">
            {p?.status === "approved" ? <ShieldCheck size={35} /> : <Clock3 size={35} />}
          </span>
          <div className="eyebrow">{p?.status === "approved" ? "YOU’RE IN" : "ONE STEP CLOSER"}</div>
          <h1>
            {p?.status === "approved"
              ? "You’re ready to build."
              : p?.status === "rejected"
                ? "Registration not approved."
                : "Good things are in the works."}
          </h1>
          <p>
            {p?.status === "approved"
              ? "Your account is approved. Head to your dashboard to find your next challenge."
              : p?.status === "rejected"
                ? "An organizer reviewed your registration and did not approve it. Contact your event organizer for more information."
                : "Your account is awaiting admin verification. We’ll email you when you’re approved and ready to go."}
          </p>
          {p && (
            <div className="pending-details">
              <span>
                <Mail size={17} />
                {p.email}
              </span>
              <span>
                <Check size={17} />
                Registration received{demo ? " (demo)" : ""}
              </span>
            </div>
          )}

          {/* Direct WhatsApp Contact Button for Quick Approval */}
          <div className="my-4">
            <a
              href="https://wa.me/923001234567?text=Hello%20VSpark%20Faculty%2C%20I%20have%20registered%20for%20the%20competition."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[2px] bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm"
            >
              <MessageCircle size={16} /> Contact Faculty on WhatsApp for Quick Verification
            </a>
          </div>

          {!p && ready && (
            <p className="info-note">
              If email confirmation is enabled, check your inbox to confirm your email, then log in to view your
              registration status.
            </p>
          )}

          {p?.status === "approved" ? (
            <Button asChild>
              <Link href="/dashboard">
                Go to dashboard <ArrowUpRight size={16} />
              </Link>
            </Button>
          ) : p ? (
            <Button
              variant="outline"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                await refresh();
                setBusy(false);
                notify(
                  demo
                    ? "Demo registration is pending. Use the admin demo to approve it."
                    : "Registration status refreshed.",
                );
              }}
            >
              Check registration status
            </Button>
          ) : (
            <Button asChild>
              <Link href="/login">Log in to check status</Link>
            </Button>
          )}

          {demo && p && p.status !== "approved" && (
            <button
              className="text-link demo-pending-link"
              onClick={() => {
                update((d) => ({
                  ...d,
                  profile: d.profile ? { ...d.profile, status: "approved" } : null,
                  students: d.students.map((s) => (s.id === p.id ? { ...s, status: "approved" } : s)),
                }));
                router.push("/dashboard/task");
              }}
            >
              Preview an approved account <ArrowUpRight size={14} />
            </button>
          )}

          {p && (
            <button
              className="text-link muted pending-logout"
              onClick={async () => {
                await logout();
                router.push("/");
              }}
            >
              Log out
            </button>
          )}
        </div>
        <p className="pending-note">
          <Logo small /> A little patience. A lot of possibility.
        </p>
      </div>
    </PublicShell>
  );
}
