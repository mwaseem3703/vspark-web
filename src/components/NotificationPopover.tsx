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
            style={{
              position: "absolute",
              top: "2px",
              right: "2px",
              minWidth: "16px",
              height: "16px",
              padding: "0 4px",
              borderRadius: "9999px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontSize: "10px",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #ffffff",
            }}
          >
            {badgeCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notification-popover"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: "340px",
            maxWidth: "90vw",
            backgroundColor: "#ffffff",
            borderRadius: "12px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
            border: "1px solid #eaecf0",
            zIndex: 9999,
            overflow: "hidden",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {/* Header */}
          <div
            className="notification-popover-header"
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid #eaecf0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#fafbfd",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <strong style={{ fontSize: "14px", color: "#101828" }}>
                Notifications
              </strong>
              {notifications.length > 0 && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    backgroundColor: "#e0e7ff",
                    color: "#3730a3",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                  }}
                >
                  {notifications.length}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#98a2b3",
                cursor: "pointer",
                padding: "2px",
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* List */}
          <div style={{ maxHeight: "360px", overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <CheckCircle2
                  size={32}
                  className="text-slate-300 mx-auto mb-2"
                />
                <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                  All caught up! No new notifications.
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f2f4f7",
                    display: "flex",
                    gap: "12px",
                    alignItems: "flex-start",
                    transition: "background 0.1s ease",
                  }}
                  className="notification-item-card hover:bg-slate-50 dark:hover:bg-slate-800/60"
                >
                  <div style={{ marginTop: "2px", flexShrink: 0 }}>
                    {item.type === "success" && (
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "#ecfdf5",
                          color: "#059669",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckCircle2 size={15} />
                      </div>
                    )}
                    {item.type === "warning" && (
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "#fffbeb",
                          color: "#d97706",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Clock size={15} />
                      </div>
                    )}
                    {item.type === "purple" && (
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "#f5f3ff",
                          color: "#7c3aed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Award size={15} />
                      </div>
                    )}
                    {item.type === "info" && (
                      <div
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "50%",
                          backgroundColor: "#eff6ff",
                          color: "#2563eb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Megaphone size={15} />
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "baseline",
                        gap: "6px",
                      }}
                    >
                      <h4
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#101828",
                        }}
                      >
                        {item.title}
                      </h4>
                      <span
                        style={{
                          fontSize: "10px",
                          color: "#98a2b3",
                          fontWeight: 500,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.time}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "11px",
                        color: "#475467",
                        lineHeight: 1.5,
                      }}
                    >
                      {item.message}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link}
                        onClick={() => setOpen(false)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#2563eb",
                          marginTop: "6px",
                          textDecoration: "none",
                        }}
                        className="hover:underline"
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
