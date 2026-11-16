"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Building2,
  Phone,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Download,
  FileCode2,
  Check,
  LogOut,
} from "lucide-react";
import { Workspace, PageHeading, StatusBadge } from "./shell";
import { useApp } from "./provider";
import { useRouter } from "next/navigation";

export function StudentSettingsPage() {
  const router = useRouter();
  const { data, demo, notify, logout } = useApp();
  const profile = data.profile;
  const submission = data.submissions.find((s) => s.profile_id === profile?.id);

  // Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError("Please provide your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    if (oldPassword === newPassword) {
      setError("New password must be different from current password.");
      return;
    }

    setBusy(true);

    try {
      if (demo) {
        setSuccess("Password updated successfully (Demo preview mode).");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        return;
      }

      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to update password.");
      }

      setSuccess("Your account password has been updated successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      notify("Password updated successfully.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Workspace>
      <PageHeading
        eyebrow="STUDENT ACCOUNT"
        title="Account & Security Settings"
        description="Manage your profile details, update your password, and verify your submission status."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Info & Submission Status */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#101a2b] rounded-[2px] border border-slate-200 dark:border-[#1e293b] p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-[2px] bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-lg flex items-center justify-center border border-blue-100 dark:border-blue-900/50">
                {profile?.full_name
                  ? profile.full_name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")
                  : "ST"}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {profile?.full_name || "Student Participant"}
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">{profile?.email}</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-slate-400" /> Account Status
                </span>
                <StatusBadge status={profile?.status || "pending"} />
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Building2 size={14} className="text-slate-400" /> University
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile?.university_name || "Not specified"}
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800/40">
                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" /> Contact Phone
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {profile?.phone_no || "Not specified"}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await logout();
                    router.push("/login");
                  } catch (e) {
                    alert((e as Error).message);
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-[2px] bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-900/60 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out of Account</span>
              </button>
            </div>
          </div>

          {/* Submission Status Card */}
          <div className="bg-white dark:bg-[#101a2b] rounded-[2px] border border-slate-200 dark:border-[#1e293b] p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <FileCode2 size={16} className="text-blue-600 dark:text-blue-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Project Submission</h3>
            </div>

            {submission ? (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-[2px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold">
                  <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Code Submitted Successfully</span>
                </div>

                {submission.github_url && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 dark:text-slate-400">Repository</span>
                    <a
                      href={submission.github_url}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      View GitHub <ExternalLink size={11} />
                    </a>
                  </div>
                )}

                {submission.storage_archive_url && (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-slate-500 dark:text-slate-400">Source Zip</span>
                    <a
                      href={submission.storage_archive_url}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="font-semibold text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
                    >
                      Download Archive <Download size={11} />
                    </a>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/dashboard/task"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-[2px] bg-slate-900 dark:bg-blue-600 text-white font-semibold text-xs hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors"
                  >
                    Open Task Workspace
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  You have not submitted your final code yet. Head to your task page to review instructions and upload your source code.
                </p>
                <Link
                  href="/dashboard/task"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-[2px] bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors"
                >
                  Go to Task & Submission
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Password Change Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#101a2b] rounded-[2px] border border-slate-200 dark:border-[#1e293b] p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-[2px] bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center justify-center border border-amber-100 dark:border-amber-900/50">
                <KeyRound size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Change Password</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update your secret credentials to keep your student account protected.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-[2px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 rounded-[2px] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOld ? "text" : "password"}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-slate-300 dark:border-[#29364b] bg-white dark:bg-[#0d1527] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer z-10"
                    aria-label={showOld ? "Hide current password" : "Show current password"}
                  >
                    {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Password <span className="text-slate-400 dark:text-slate-500 font-normal">(Min 6 characters)</span>
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-slate-300 dark:border-[#29364b] bg-white dark:bg-[#0d1527] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer z-10"
                    aria-label={showNew ? "Hide new password" : "Show new password"}
                  >
                    {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full px-3.5 py-2.5 rounded-[2px] border border-slate-300 dark:border-[#29364b] bg-white dark:bg-[#0d1527] text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer z-10"
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="px-5 py-2.5 rounded-[2px] bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {busy ? <RefreshCw size={13} className="animate-spin" /> : <Check size={14} />}
                  <span>{busy ? "Updating Password…" : "Update Password"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Workspace>
  );
}
