"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Users,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Megaphone,
  Award,
  Calendar,
  Clock,
  FileText,
} from "lucide-react";
import { Workspace, PageHeading } from "./shell";
import { useApp } from "./provider";
import { FigmaSuccessModal } from "./ScallopedBadge";

function formatEventDate(dateStr?: string) {
  if (!dateStr) return "Not Scheduled";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "Not Scheduled";
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return dateStr;
  }
}

export function AdminEmailsPage() {
  const { data, refresh, notify } = useApp();
  const [initialLoading, setInitialLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Figma Success Modal State
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  // 1. Task Announcement Email State
  const [taskAudience, setTaskAudience] = useState<"verified" | "all">("verified");
  const [sendingTask, setSendingTask] = useState(false);

  // 2. Custom Notice Email State
  const [noticeSubject, setNoticeSubject] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");
  const [noticeAudience, setNoticeAudience] = useState<"verified" | "all">("verified");
  const [sendingNotice, setSendingNotice] = useState(false);

  // 3. Results Email State
  const [sendingResults, setSendingResults] = useState(false);

  useEffect(() => {
    refresh().finally(() => setInitialLoading(false));
  }, [refresh]);

  const showNotification = (type: "success" | "error", text: string) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 7000);
  };

  const students = data.students || [];
  const verifiedCount = students.filter((s) => s.status === "approved").length;
  const settings = data.settings;

  // Handler: Send Task Announcement Email
  const handleSendTaskAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const count = taskAudience === "verified" ? verifiedCount : students.length;
    if (count === 0) {
      showNotification(
        "error",
        `No recipients available for audience: '${taskAudience}'. Total registered: ${students.length}, Approved: ${verifiedCount}.`
      );
      return;
    }

    const audienceLabel = taskAudience === "verified" ? "approved students" : "all registered students";
    const confirmed = window.confirm(
      `Send official Task Announcement email to ${count} ${audienceLabel}?\n\nThis will email the competition challenge brief, timeline, and dashboard link.`
    );
    if (!confirmed) return;

    setSendingTask(true);
    try {
      const res = await fetch("/api/admin/send-task-announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetAudience: taskAudience }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to dispatch task announcement email.");
      }

      showNotification(
        "success",
        `🎉 Task Announcement email successfully sent to ${resData.count} student(s)!`
      );
      setSuccessModal({
        isOpen: true,
        title: "Invitation Sent Successfully!",
        message: `The Task Announcement has been dispatched successfully to ${resData.count} students.`,
      });
      notify(`Task Announcement dispatched to ${resData.count} students.`);
    } catch (err) {
      showNotification("error", (err as Error).message || "Failed to dispatch email.");
    } finally {
      setSendingTask(false);
    }
  };

  // Handler: Send Custom Notice Email
  const handleSendCustomNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noticeSubject.trim() || !noticeMessage.trim()) {
      showNotification("error", "Please provide both an email subject line and message body.");
      return;
    }

    const count = noticeAudience === "verified" ? verifiedCount : students.length;
    if (count === 0) {
      showNotification(
        "error",
        `No recipients available for audience: '${noticeAudience}'. Total registered: ${students.length}, Approved: ${verifiedCount}.`
      );
      return;
    }

    const audienceLabel = noticeAudience === "verified" ? "approved students" : "all registered students";
    const confirmed = window.confirm(
      `Broadcast notice "${noticeSubject}" to ${count} ${audienceLabel}?`
    );
    if (!confirmed) return;

    setSendingNotice(true);
    try {
      const res = await fetch("/api/admin/send-notice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: noticeSubject,
          message: noticeMessage,
          targetAudience: noticeAudience,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to send broadcast notice.");
      }

      showNotification(
        "success",
        `📢 Custom Announcement successfully sent to ${resData.count} student(s)!`
      );
      setSuccessModal({
        isOpen: true,
        title: "Announcement Sent Successfully!",
        message: `The broadcast notice "${noticeSubject}" has been sent successfully to ${resData.count} participants.`,
      });
      notify(`Notice broadcast sent to ${resData.count} students.`);
      setNoticeSubject("");
      setNoticeMessage("");
    } catch (err) {
      showNotification("error", (err as Error).message || "Failed to send broadcast.");
    } finally {
      setSendingNotice(false);
    }
  };

  // Handler: Send Results & Rankings Email
  const handleSendResults = async () => {
    if (!settings.results_published) {
      showNotification(
        "error",
        "Results are currently locked / hidden. Turn ON 'Publish Public Results' in Settings first."
      );
      return;
    }

    const confirmed = window.confirm(
      "Dispatch official Results & Leaderboard emails to participants?\n\nThis will send custom podium champion emails to the Top 3 winners and general results notification to all other participants."
    );
    if (!confirmed) return;

    setSendingResults(true);
    try {
      const res = await fetch("/api/admin/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "Failed to dispatch results email.");
      }

      showNotification(
        "success",
        `🏆 ${resData.message || "Results emails dispatched successfully!"}`
      );
      setSuccessModal({
        isOpen: true,
        title: "Results Dispatched Successfully!",
        message: "Final scores and winner congratulations have been dispatched to participants.",
      });
      notify("Results emails dispatched.");
    } catch (err) {
      showNotification("error", (err as Error).message || "Failed to dispatch results email.");
    } finally {
      setSendingResults(false);
    }
  };

  return (
    <Workspace admin>
      <PageHeading
        eyebrow="STUDENT BROADCAST & EMAIL DISPATCH"
        title="Email Broadcast Center"
        description="Dispatch official challenge announcements, custom broadcasts, and results notifications to registered participants."
        action={
          <div className="flex items-center gap-3 bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[6px] px-3.5 py-2 shadow-2xs">
            <div className="flex items-center gap-1.5 text-xs">
              <Users size={14} className="text-slate-500 dark:text-slate-400" />
              <span className="font-bold text-slate-900 dark:text-slate-100">{students.length}</span>
              <span className="text-slate-500 dark:text-slate-400">Students</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <div className="flex items-center gap-1.5 text-xs">
              <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-emerald-700 dark:text-emerald-400">{verifiedCount}</span>
              <span className="text-slate-500 dark:text-slate-400">Approved</span>
            </div>
          </div>
        }
      />

      <div className="space-y-6 max-w-5xl">
        {/* Global Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-[6px] border flex items-center justify-between shadow-2xs text-xs font-medium animate-in fade-in ${
              notification.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {notification.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 shrink-0" />
              )}
              <span>{notification.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs px-2 py-0.5 rounded cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* SECTION 1: Manual Task Release Announcement Email */}
        <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[8px] p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[6px] bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    Task &amp; Problem Brief Release Email
                  </h2>
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                    Manual Dispatch
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Send official challenge release notification containing the competition title, start time, code freeze deadline, and portal link.
                </p>
              </div>
            </div>
            <Link
              href="/admin/settings"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 inline-flex items-center gap-1 hover:underline self-end sm:self-auto shrink-0"
            >
              Edit Timeline &rarr;
            </Link>
          </div>

          {/* Event Data Snapshot Preview */}
          <div className="bg-slate-50/80 dark:bg-[#0d1527] border border-slate-200/90 dark:border-[#1e293b] rounded-[6px] p-4 space-y-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={12} className="text-indigo-500" />
              <span>Task Data To Be Included:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[6px] p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Challenge Title</span>
                <p className="font-bold text-slate-900 dark:text-slate-100 truncate">
                  {settings.title || "VSpark 2026 Web Development Hackathon"}
                </p>
              </div>

              <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[6px] p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Calendar size={11} className="text-blue-500" /> Start Time
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatEventDate(settings.start_time)}
                </p>
              </div>

              <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[6px] p-3 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1">
                  <Clock size={11} className="text-amber-500" /> Code Freeze Deadline
                </span>
                <p className="font-bold text-amber-900 dark:text-amber-300">
                  {formatEventDate(settings.end_time)}
                </p>
              </div>
            </div>
          </div>

          {/* Audience Selector & Send */}
          <form onSubmit={handleSendTaskAnnouncement} className="space-y-4 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Recipient Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-[6px] border text-xs cursor-pointer transition-all ${
                    taskAudience === "verified"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium ring-1 ring-indigo-600"
                      : "border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0d1527] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#17243a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="taskAudience"
                    value="verified"
                    checked={taskAudience === "verified"}
                    onChange={() => setTaskAudience("verified")}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      Approved Students Only ({verifiedCount})
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Sends to all {verifiedCount} verified participants.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-[6px] border text-xs cursor-pointer transition-all ${
                    taskAudience === "all"
                      ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-medium ring-1 ring-indigo-600"
                      : "border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0d1527] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#17243a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="taskAudience"
                    value="all"
                    checked={taskAudience === "all"}
                    onChange={() => setTaskAudience("all")}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      All Registered Students ({students.length})
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Sends to all {students.length} accounts, including pending.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                disabled={sendingTask}
                className="w-full sm:w-auto h-11 px-6 inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-[6px] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {sendingTask ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Dispatching Task Announcement...</span>
                  </>
                ) : (
                  <>
                    <Send size={15} />
                    <span>
                      Send Task Announcement Email (
                      {taskAudience === "verified" ? verifiedCount : students.length} Students)
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: Custom Notice & Announcement Broadcast */}
        <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[8px] p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-[6px] bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Megaphone size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Broadcast Custom Notice or Announcement
                </h2>
                <span className="text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800 uppercase tracking-wider">
                  Custom Notice
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Send ad-hoc announcements such as countdown alerts, meeting links, or venue updates.
              </p>
            </div>
          </div>

          {/* Quick Subject Presets */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Quick Subject Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                "🚨 Final 30 Minutes: Complete Your GitHub Repository Submission!",
                "🚀 VSpark 2026 Web Hackathon is Officially Starting!",
                "💡 Submission Guidelines Reminder & Code Freeze Deadline",
                "🏆 Submissions Closed: Evaluation Process Underway",
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNoticeSubject(preset)}
                  className="text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-[#0d1527] hover:bg-blue-50 dark:hover:bg-[#1e2e4e] hover:text-blue-700 dark:hover:text-[#60a5fa] border border-slate-200 dark:border-[#29364b] rounded-[4px] px-2.5 py-1 transition-colors text-left cursor-pointer"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendCustomNotice} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Email Subject Line <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={noticeSubject}
                onChange={(e) => setNoticeSubject(e.target.value)}
                placeholder="e.g. Urgent Update: Final 30 Minutes Remaining"
                className="w-full h-10 px-3 text-xs bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] rounded-[4px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors shadow-2xs font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Notice Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={5}
                value={noticeMessage}
                onChange={(e) => setNoticeMessage(e.target.value)}
                placeholder="Write your announcement details here. Line breaks are formatted cleanly in the email."
                className="w-full p-3 text-xs bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] rounded-[4px] text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-600 transition-colors shadow-2xs font-sans leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Audience
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`flex items-start gap-3 p-3.5 rounded-[6px] border text-xs cursor-pointer transition-all ${
                    noticeAudience === "verified"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-medium ring-1 ring-blue-600"
                      : "border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0d1527] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#17243a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="noticeAudience"
                    value="verified"
                    checked={noticeAudience === "verified"}
                    onChange={() => setNoticeAudience("verified")}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      Approved Students Only ({verifiedCount})
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Sends to all {verifiedCount} verified participants.
                    </div>
                  </div>
                </label>

                <label
                  className={`flex items-start gap-3 p-3.5 rounded-[6px] border text-xs cursor-pointer transition-all ${
                    noticeAudience === "all"
                      ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-medium ring-1 ring-blue-600"
                      : "border-slate-200 dark:border-[#1e293b] bg-white dark:bg-[#0d1527] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#17243a]"
                  }`}
                >
                  <input
                    type="radio"
                    name="noticeAudience"
                    value="all"
                    checked={noticeAudience === "all"}
                    onChange={() => setNoticeAudience("all")}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      All Registered Students ({students.length})
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Sends to all {students.length} student accounts.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={sendingNotice}
                className="h-10 px-6 inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-[6px] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
              >
                {sendingNotice ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Broadcasting Notice...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>
                      Dispatch Broadcast (
                      {noticeAudience === "verified" ? verifiedCount : students.length} Students)
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 3: Official Results & Standings Notification */}
        <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[8px] p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-[6px] bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Award size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Official Results &amp; Rankings Announcement
                </h2>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
                  Podium + All
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Emails Top 3 podium champion honors and general completion notices with leaderboard link to participants.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 dark:bg-[#0d1527] p-4 rounded-[6px] border border-slate-200 dark:border-[#1e293b]">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Current Status:{" "}
                {settings.results_published ? (
                  <strong className="text-emerald-600 dark:text-emerald-400">Results are Published</strong>
                ) : (
                  <strong className="text-amber-600 dark:text-amber-400">Results are Locked / Hidden</strong>
                )}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {settings.results_published
                  ? "Leaderboard is public. You can dispatch final scores and winner congratulations now."
                  : "Turn on 'Publish Public Results' in Competition Settings to enable results dispatch."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendResults}
              disabled={sendingResults || !settings.results_published}
              className="h-10 px-5 inline-flex items-center gap-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-[6px] shadow-xs transition-colors disabled:opacity-50 cursor-pointer shrink-0"
            >
              {sendingResults ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Dispatching Results...</span>
                </>
              ) : (
                <>
                  <Award size={14} />
                  <span>Dispatch Results Emails</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Figma Success Modal */}
      <FigmaSuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
    </Workspace>
  );
}
