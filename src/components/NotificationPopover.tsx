"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCircle2,
  Clock,
  Megaphone,
  Award,
  Users,
  ClipboardCheck,
  Zap,
  X,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "success" | "warning" | "info" | "purple";
  link?: string;
}

export function NotificationPopover({
  admin,
  profile,
  settings,
  students = [],
  submissions = [],
}: {
  admin?: boolean;
  profile?: any;
  settings?: any;
  students?: any[];
  submissions?: any[];
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Build real notifications list
  const notifications: NotificationItem[] = [];

  if (admin) {
    const pendingStudents = students.filter((s) => s.status === "pending");
    const unreviewed = submissions.filter((s) => !s.graded);

    if (pendingStudents.length > 0) {
      notifications.push({
        id: "pending-students",
        title: `${pendingStudents.length} Pending Registration${pendingStudents.length > 1 ? "s" : ""}`,
        message: `${pendingStudents[0]?.full_name || "A participant"} and others are awaiting your fee slip verification.`,
        time: "Action required",
        type: "warning",
        link: "/admin/students",
      });
    }

    if (unreviewed.length > 0) {
      notifications.push({
        id: "unreviewed-submissions",
        title: `${unreviewed.length} Submission${unreviewed.length > 1 ? "s" : ""} to Evaluate`,
        message: "New student projects are submitted and ready for 100-mark rubric grading.",
        time: "Jury review",
        type: "purple",
        link: "/admin/evaluations",
      });
    }

    if (settings?.announcement) {
      notifications.push({
        id: "admin-announcement",
        title: "Active Broadcast Notice",
        message: settings.announcement,
        time: "Live on Dashboards",
        type: "info",
        link: "/admin/settings",
      });
    }

    notifications.push({
      id: "admin-status",
      title: "Competition Engine",
      message: `${settings?.title || "VSpark 2026"} · ${settings?.duration_minutes || 120} Min Window.`,
      time: settings?.is_active ? "Live" : "Paused",
      type: "success",
      link: "/admin/settings",
    });
  } else {
    // Student Notifications
    const mySubmission = submissions.find((s) => s.profile_id === profile?.id);

    if (profile?.status === "approved") {
      notifications.push({
        id: "student-approved",
        title: "Account Verified & Approved",
        message: "Your registration fee slip has been verified by faculty. You have full access to the competition workspace.",
        time: "Active",
        type: "success",
        link: "/dashboard/task",
      });
    } else if (profile?.status === "pending") {
      notifications.push({
        id: "student-pending",
        title: "Registration Under Review",
        message: "Faculty is reviewing your fee receipt. Once approved, your workspace unlocks automatically.",
        time: "In Review",
        type: "warning",
      });
    }

    if (settings?.announcement) {
      notifications.push({
        id: "student-announcement",
        title: "Faculty Announcement",
        message: settings.announcement,
        time: "Broadcast",
        type: "info",
        link: "/dashboard/task",
      });
    }

    if (mySubmission?.graded && settings?.results_published) {
      notifications.push({
        id: "student-score",
        title: "Official Score Published",
        message: `Your project scored ${mySubmission.total_marks}/100. Review the leaderboard for jury standings.`,
        time: "Results Live",
        type: "purple",
        link: "/results",
      });
    } else if (mySubmission) {
      notifications.push({
        id: "student-submitted",
        title: "Project Submitted",
        message: "Your GitHub repository and clean source code have been safely recorded.",
        time: "Recorded",
        type: "success",
        link: "/dashboard/task",
      });
    } else if (profile?.status === "approved") {
      notifications.push({
        id: "student-submit-reminder",
        title: "Submission Window Open",
        message: "Please prepare your GitHub repository and clean source code before the 120-minute countdown ends.",
        time: "Deadline sprint",
        type: "info",
        link: "/dashboard/task",
      });
    }
  }

  const badgeCount = admin
    ? students.filter((s) => s.status === "pending").length +
      submissions.filter((s) => !s.graded).length
    : profile?.status === "approved" &&
        !submissions.some((s) => s.profile_id === profile?.id)
      ? 1
      : 0;

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        aria-label="View notifications"
        title="View notifications"
      >
        <Bell size={20} />
        {badgeCount > 0 && (
          <span
            className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white dark:border-[#0d1527]"
          >
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notification-popover absolute right-[-45px] sm:right-0 top-[calc(100%+8px)] w-[330px] max-w-[calc(100vw-20px)] bg-white dark:bg-[#0f172a] rounded-[12px] shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in duration-150"
        >
          {/* Header */}
          <div className="notification-popover-header px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-[#162032]">
            <div className="flex items-center gap-2">
              <strong className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Notifications
              </strong>
              {notifications.length > 0 && (
                <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800/60">
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer transition-colors"
              aria-label="Close notifications"
            >
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/70">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <CheckCircle2
                  size={32}
                  className="text-slate-300 dark:text-slate-600 mx-auto mb-2"
                />
                <p className="m-0 text-xs text-slate-500 dark:text-slate-400">
                  All caught up! No new notifications.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  className="p-3 sm:px-4 flex gap-3 items-start transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="mt-0.5 shrink-0">
                    {item.type === "success" && (
                      <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center">
                        <CheckCircle2 size={15} />
                      </div>
                    )}
                    {item.type === "warning" && (
                      <div className="w-7 h-7 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center">
                        <Clock size={15} />
                      </div>
                    )}
                    {item.type === "purple" && (
                      <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60 flex items-center justify-center">
                        <Award size={15} />
                      </div>
                    )}
                    {item.type === "info" && (
                      <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center">
                        <Megaphone size={15} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <h4 className="m-0 text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium shrink-0 whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>
                    <p className="mt-1 mb-0 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.message}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline mt-1.5"
                      >
                        <span>View details</span>
                        <ArrowRight size={11} />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
