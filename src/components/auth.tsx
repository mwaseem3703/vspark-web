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
  Send,
  RefreshCw,
  Copy,
  CreditCard,
  User,
  Users,
  UserCheck,
  UserPlus,
  GraduationCap,
} from "lucide-react";
import { Logo, PublicShell } from "./shell";
import { useApp, request } from "./provider";
import { Button } from "./ui/button";
import type { Profile } from "@/lib/types";
import { OFFICIAL_RUBRIC } from "@/lib/types";
import { extractConfigFromDescription, renderFormattedText } from "@/lib/competition-rules";

export const DEPARTMENTS = [
  "Computer Science",
  "Software Engineering",
  "Artificial Intelligence",
  "Information Technology",
  "Data Science",
  "Cyber Security",
  "Electrical / Computer Engineering",
  "Other",
];

export const SEMESTERS = [
  "1st Semester",
  "2nd Semester",
  "3rd Semester",
  "4th Semester",
  "5th Semester",
  "6th Semester",
  "7th Semester",
  "8th Semester",
  "Graduated / Alumni",
];

export function AuthPage({ register = false }: { register?: boolean }) {
  const { demo, data, ready, demoLogin, resetDemo, update, refresh, notify } = useApp();
  const registrationPending = register && !demo && ready && data.services?.email === false;
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [receipt, setReceipt] = useState("");
  const [participationType, setParticipationType] = useState<"individual" | "team">("individual");

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

  const [copiedAccount, setCopiedAccount] = useState(false);
  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const config = extractConfigFromDescription(data?.settings?.task_description);
  const bankName = config.bankName || data?.settings?.bank_name || "Easypaisa / HBL";
  const accountTitle = config.accountTitle || data?.settings?.bank_title || "COMSATS Web Society";
  const accountNumber = config.accountNumber || data?.settings?.bank_account || "0123 4567 8901 23";
  const bankIban = data?.settings?.bank_iban || "";
  const feeAmount = config.feeAmount || data?.settings?.fee_amount || "Rs. 500";

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

    if (register) {
      const p1 = String(form.get("password") || "");
      const p2 = String(form.get("confirm_password") || "");
      if (p1 !== p2) {
        setError("Passwords do not match. Please ensure both passwords are identical.");
        setBusy(false);
        return;
      }
      if (participationType === "team") {
        const teamName = String(form.get("team_name") || "").trim();
        const email1 = String(form.get("email") || "").trim().toLowerCase();
        const tmName = String(form.get("teammate_name") || "").trim();
        const email2 = String(form.get("teammate_email") || "").trim().toLowerCase();
        const tmPhone = String(form.get("teammate_phone") || "").trim();
        if (!teamName) {
          setError("Please enter your team name.");
          setBusy(false);
          return;
        }
        if (!tmName || !email2 || !tmPhone) {
          setError("Please provide all required details for Member 2 (Teammate).");
          setBusy(false);
          return;
        }
        if (email1 === email2) {
          setError("Team Leader and Teammate cannot have the same email address.");
          setBusy(false);
          return;
        }
      }
    }

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
          participation_type: participationType,
          team_name: participationType === "team" ? String(form.get("team_name")).trim() : null,
          team_role: participationType === "team" ? "leader" : "individual",
          department: form.get("department") ? String(form.get("department")) : null,
          semester: form.get("semester") ? String(form.get("semester")) : null,
          teammate_name: participationType === "team" ? String(form.get("teammate_name")).trim() : null,
          teammate_email: participationType === "team" ? String(form.get("teammate_email")).trim().toLowerCase() : null,
          teammate_phone: participationType === "team" ? String(form.get("teammate_phone")).trim() : null,
          teammate_department: participationType === "team" ? String(form.get("teammate_department")) : null,
          teammate_semester: participationType === "team" ? String(form.get("teammate_semester")) : null,
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

  // Guidelines & Rubric Cards rendered underneath the registration form
  const renderGuidelinesCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* CARD 1: PERMITTED TECHNOLOGIES */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#101a2b] border border-slate-200/90 dark:border-[#1e293b] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
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
        <div className="flex flex-wrap gap-1.5">
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
          <strong className="text-slate-800 dark:text-slate-200">AI Assistance Allowed:</strong> ChatGPT and Claude are permitted for debugging, syntax, and brainstorming. Full live code defense is required during jury evaluation.
        </p>
      </div>

      {/* CARD 2: 100-POINT EVALUATION RUBRIC */}
      <div className="p-5 rounded-lg bg-white dark:bg-[#101a2b] border border-slate-200/90 dark:border-[#1e293b] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
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
      <div className="p-5 rounded-lg bg-white dark:bg-[#101a2b] border border-slate-200/90 dark:border-[#1e293b] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
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

      {/* CARD 4: REGISTRATION FEE & BANK DETAILS */}
      <div className="p-5 rounded-lg bg-gradient-to-br from-emerald-50/70 to-blue-50/70 dark:from-[#0d1e1c] dark:to-[#0d172a] border border-emerald-200/90 dark:border-emerald-800/60 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-[2px] bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
              <CreditCard className="w-3.5 h-3.5" />
            </span>
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-tight">Payment Account Details</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800">
            {feeAmount} Entry Fee
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2 rounded-[2px] bg-white/90 dark:bg-[#101a2b] border border-slate-200/70 dark:border-[#1e293b]">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Bank / Wallet:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{bankName}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-[2px] bg-white/90 dark:bg-[#101a2b] border border-slate-200/70 dark:border-[#1e293b]">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Account Title:</span>
            <span className="font-bold text-slate-900 dark:text-slate-100">{accountTitle}</span>
          </div>
          <div className="flex items-center justify-between p-2 rounded-[2px] bg-white/90 dark:bg-[#101a2b] border border-slate-200/70 dark:border-[#1e293b]">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Account Number:</span>
              <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-400 tracking-wide">{accountNumber}</span>
            </div>
            <button
              type="button"
              onClick={() => copyToClipboard(accountNumber)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[2px] text-[11px] font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors cursor-pointer"
              title="Copy account number"
            >
              {copiedAccount ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copiedAccount ? "Copied!" : "Copy"}
            </button>
          </div>
          {bankIban && (
            <div className="flex items-center justify-between p-2 rounded-[2px] bg-white/90 dark:bg-[#101a2b] border border-slate-200/70 dark:border-[#1e293b]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">IBAN:</span>
              <span className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">{bankIban}</span>
            </div>
          )}
        </div>

        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-2.5 leading-snug">
          Transfer the registration fee to the official account above and attach your payment receipt to complete registration.
        </p>
      </div>
    </div>
  );

  // 1. REGISTER PAGE VIEW: CLEAN, CONCISE & NO EXTRA CLUTTER
  if (register) {
    return (
      <PublicShell>
        {/* TOP HERO BANNER */}
        <section className="page-hero">
          <div className="page-hero-inner container">
            <h1>Register to compete</h1>
            <p>
              Create your participant account to access your competition workspace.
            </p>
          </div>
        </section>

        {/* MAIN REGISTRATION SECTION: FORM CARD + ASIDE */}
        <div className="container form-page">
          {/* LEFT: FORM CARD */}
          <section className="form-card">
            <div className="form-card-head">
              <div>
                <h2>Participant Registration</h2>
                <small>Fields marked * are required.</small>
              </div>
            </div>

            {registrationPending && (
              <p className="info-note mb-4" role="status">
                Registration is opening soon. Please check back after the announcement.
              </p>
            )}

            <form onSubmit={submit}>
              <div className="form-grid">
                {/* Full Name */}
                <label className="field">
                  <span>Full Name <i>*</i></span>
                  <input
                    name="full_name"
                    placeholder="e.g. Ayesha Khan"
                    required
                    maxLength={100}
                    autoComplete="name"
                  />
                </label>

                {/* University */}
                <label className="field">
                  <span>University <i>*</i></span>
                  <input
                    name="university_name"
                    defaultValue="COMSATS University Islamabad, Vehari Campus"
                    placeholder="University Name"
                    required
                    maxLength={150}
                    autoComplete="organization"
                  />
                </label>

                {/* University Email */}
                <label className="field">
                  <span>Email Address <i>*</i></span>
                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    maxLength={254}
                    autoComplete="email"
                  />
                </label>

                {/* Contact Number */}
                <label className="field">
                  <span>Contact Number <i>*</i></span>
                  <input
                    name="phone_no"
                    type="tel"
                    placeholder="0300 0000000"
                    required
                    autoComplete="tel"
                  />
                </label>

                {/* Department */}
                <label className="field">
                  <span>Department <i>*</i></span>
                  <select name="department" defaultValue="Computer Science" required>
                    {DEPARTMENTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </label>

                {/* Semester */}
                <label className="field">
                  <span>Semester <i>*</i></span>
                  <select name="semester" defaultValue="6th Semester" required>
                    {SEMESTERS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </label>

                {/* Participation Type Dropdown */}
                <label className="field">
                  <span>Participation Type <i>*</i></span>
                  <select
                    name="participation_type"
                    value={participationType}
                    onChange={(e) => {
                      setParticipationType(e.target.value as "individual" | "team");
                      setError("");
                    }}
                    required
                  >
                    <option value="individual">Individual</option>
                    <option value="team">Team (2 Members)</option>
                  </select>
                </label>

                {/* DYNAMIC TEAM FIELDS (ONLY VISIBLE WHEN TEAM IS SELECTED) */}
                {participationType === "team" && (
                  <>
                    <label className="field">
                      <span>Team Name <i>*</i></span>
                      <input
                        name="team_name"
                        placeholder="Team Name"
                        required={participationType === "team"}
                        maxLength={100}
                      />
                    </label>

                    <label className="field">
                      <span>Second Member Full Name <i>*</i></span>
                      <input
                        name="teammate_name"
                        placeholder="Teammate's Full Name"
                        required={participationType === "team"}
                        maxLength={100}
                      />
                    </label>

                    <label className="field">
                      <span>Second Member Email <i>*</i></span>
                      <input
                        name="teammate_email"
                        type="email"
                        placeholder="teammate@example.com"
                        required={participationType === "team"}
                        maxLength={254}
                      />
                    </label>

                    <label className="field">
                      <span>Second Member Phone <i>*</i></span>
                      <input
                        name="teammate_phone"
                        type="tel"
                        placeholder="0300 0000000"
                        required={participationType === "team"}
                      />
                    </label>

                    <label className="field">
                      <span>Second Member Department <i>*</i></span>
                      <select name="teammate_department" defaultValue="Computer Science" required={participationType === "team"}>
                        {DEPARTMENTS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </label>

                    <label className="field">
                      <span>Second Member Semester <i>*</i></span>
                      <select name="teammate_semester" defaultValue="6th Semester" required={participationType === "team"}>
                        {SEMESTERS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}

                {/* Passwords */}
                <label className="field">
                  <span>Create Password <i>*</i></span>
                  <div className="relative">
                    <input
                      name="password"
                      type={show ? "text" : "password"}
                      placeholder="At least 8 characters"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShow(!show)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={show ? "Hide password" : "Show password"}
                    >
                      {show ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </label>

                <label className="field">
                  <span>Confirm Password <i>*</i></span>
                  <div className="relative">
                    <input
                      name="confirm_password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter password"
                      required
                      minLength={8}
                      maxLength={128}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </label>

                {/* Payment Account Details & Receipt Dropzone */}
                <div className="field-full p-3.5 rounded-lg bg-slate-50 dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Entry Fee: <strong>{feeAmount}</strong> ({bankName})
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(accountNumber)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {copiedAccount ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                      {copiedAccount ? "Copied" : "Copy Account"}
                    </button>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    Title: <strong className="text-slate-700 dark:text-slate-300">{accountTitle}</strong> · Acc: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{accountNumber}</span>
                  </div>

                  <label className="field">
                    <span>Payment Receipt / Screenshot <i>*</i></span>
                    <div className="file-drop receipt-drop">
                      <Upload size={16} />
                      <strong>{receipt || "Attach Deposit Slip"}</strong>
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
                    </div>
                  </label>
                </div>
              </div>

              {/* Rules Agreement Checkbox */}
              <label className="checkline">
                <input type="checkbox" required />
                <span>
                  I agree to the{" "}
                  <Link href="/rules" className="inline-link">
                    competition rules
                  </Link>
                  .
                </span>
              </label>

              {error && (
                <div
                  className="p-3 my-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium"
                  role="alert"
                >
                  {error}
                </div>
              )}

              {/* Submit Action */}
              <div className="form-submit">
                <Button
                  disabled={busy || registrationPending || (!demo && !ready)}
                  type="submit"
                  className="h-10 px-6 text-xs font-bold"
                >
                  {busy ? "Creating Account…" : participationType === "team" ? "Register Team →" : "Create Account →"}
                </Button>
              </div>

              {/* Bottom Link */}
              <div className="form-bottom">
                <span>
                  Already registered?{" "}
                  <Link href="/login" className="inline-link font-semibold">
                    Log in here &rarr;
                  </Link>
                </span>
              </div>
            </form>
          </section>

          {/* RIGHT: CLEAN SIDEBAR ASIDE */}
          <aside className="form-aside">
            <h3>Competition Info</h3>

            <div className="space-y-1">
              <div className="aside-detail">
                <div>
                  <b>120 minutes</b>
                  <small>Timed challenge from task start.</small>
                </div>
              </div>
              <div className="aside-detail">
                <div>
                  <b>1 or 2 members</b>
                  <small>Individual or two-person team.</small>
                </div>
              </div>
              <div className="aside-detail">
                <div>
                  <b>100 marks</b>
                  <small>Evaluation rubric defined in rules.</small>
                </div>
              </div>
              <div className="aside-detail">
                <div>
                  <b>Registration Fee</b>
                  <small>{feeAmount} per team / participant.</small>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </PublicShell>
    );
  }

  // 2. LOGIN PAGE VIEW: CLASSIC SPLIT STORY + LOGIN PANEL
  return (
    <PublicShell>
      <div className="auth-layout container">
        {/* Left Side Story */}
        <aside className="auth-story">
          <div className="eyebrow">
            <Sparkles size={15} /> YOUR NEXT CHAPTER
          </div>
          <h2>
            Welcome back,
            <br />
            <span>builder.</span>
          </h2>

          <p>
            Your ideas are waiting. Pick up where you left off and keep building something that matters.
          </p>

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
        </aside>

        {/* Right Side Login Panel */}
        <section className="auth-panel">
          <Link href="/" className="back-link">
            <ArrowLeft size={14} /> Back to home
          </Link>
          <div className="eyebrow">GOOD TO SEE YOU AGAIN</div>
          <h1>Log in to VSpark</h1>
          <p>Enter your credentials to access your competition workspace.</p>

          <form onSubmit={submit} className="form-stack">
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

            <label>
              Password
              <div className="password-input">
                <input
                  name="password"
                  placeholder="Your password"
                  required
                  type={show ? "text" : "password"}
                  minLength={8}
                  maxLength={128}
                  autoComplete="current-password"
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

            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}

            <Button size="lg" disabled={busy || (!demo && !ready)} type="submit">
              {busy ? (
                <>
                  <span className="spinner" /> Please wait…
                </>
              ) : (
                <>
                  Log in <ArrowUpRight size={17} />
                </>
              )}
            </Button>
          </form>

          <p className="auth-switch">
            New here?{" "}
            <Link href="/register">
              Create an account <ArrowUpRight size={12} />
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
                  className="h-10 px-4 rounded-[4px] text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer border-0 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading || !forgotEmail.trim()}
                  style={{
                    backgroundColor: "#2563eb",
                    color: "#ffffff",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  className="btn btn-primary h-10 px-6 rounded-[4px] text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shadow-sm transition-all disabled:opacity-50"
                >
                  {forgotLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Sending Link...</span>
                    </>
                  ) : (
                    <>
                      <Send size={14} />
                      <span>Send Reset Link</span>
                    </>
                  )}
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

  useEffect(() => {
    if (ready && p?.status === "approved") {
      router.replace("/dashboard/task");
    }
  }, [ready, p?.status, router]);

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
