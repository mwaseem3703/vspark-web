"use client";
import Link from "next/link";
import { useEffect, useState, useRef, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Users,
  UserCheck,
  ClipboardCheck,
  Trophy,
  Search,
  Check,
  X,
  MessageCircle,
  FileText,
  Settings2,
  CircleCheck,
  Clock3,
  Save,
  Upload,
  Github,
  ExternalLink,
  Eye,
  Megaphone,
  SlidersHorizontal,
  Info,
  ChevronRight,
  FolderOpen,
  Link2,
  Unlock,
  Lock,
  RefreshCw,
  Mail,
  KeyRound,
  Download,
} from "lucide-react";
import { useApp, request } from "./provider";
import { Workspace, PageHeading, StatusBadge, EmptyState } from "./shell";
import { Button } from "./ui/button";
import { dateLabel } from "@/lib/utils";
import { eventState, whatsapp } from "@/lib/competition";
import { OFFICIAL_RUBRIC, type Settings, type Submission } from "@/lib/types";
import { useNow } from "./student";
import { canonicalDriveFolder, driveFolderId } from "@/lib/drive-folder";
import { FigmaSuccessModal, ReceiptModal } from "./ScallopedBadge";
import { extractConfigFromDescription, embedConfigInDescription } from "@/lib/competition-rules";
function GoogleDriveIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" style={{ display: "inline-block" }}>
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335"/>
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
      <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
    </svg>
  );
}

export function AdminOverview() {
  const { data, demo } = useApp();
  const now = useNow();
  const pending = data.students.filter((s) => s.status === "pending");
  const approved = data.students.filter((s) => s.status === "approved");
  const graded = data.submissions.filter((s) => s.graded);
  const stats = [
    {
      label: "Total registrations",
      value: data.students.length,
      detail: "Builders ready to make their mark",
      icon: Users,
      style: "",
    },
    {
      label: "Approved participants",
      value: approved.length,
      detail: `${pending.length} awaiting your review`,
      icon: UserCheck,
      style: "mint",
    },
    {
      label: "Projects submitted",
      value: data.submissions.length,
      detail: `${data.submissions.length - graded.length} waiting for evaluation`,
      icon: ClipboardCheck,
      style: "violet",
    },
    {
      label: "Evaluated projects",
      value: graded.length,
      detail: "One step closer to the spotlight",
      icon: Trophy,
      style: "amber",
    },
  ];
  return (
    <Workspace admin>
      <PageHeading
        eyebrow="THE BIG PICTURE"
        title="Let’s make a great competition."
        description="Your participants, submissions, and event controls. All in one place."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/settings">
              <Settings2 size={16} /> Manage competition
            </Link>
          </Button>
        }
      />
      {!demo &&
        data.services &&
        (!data.services.email || !data.services.drive) && (
          <div className="info-note admin-setup-note">
            <Info size={19} />
            <div>
              <strong>Finish connecting your competition services</strong>
              <p>
                {!data.services.email &&
                  "Gmail SMTP is not connected. Public registration and notification emails are pending. "}
                {!data.services.drive &&
                  "Google Drive is not connected. Keep submissions closed until source uploads are ready."}
              </p>
            </div>
          </div>
        )}
      <div className="admin-stat-grid">
        {stats.map((s) => (
          <div className="admin-stat stat-card" key={s.label}>
            <div>
              <span>{s.label}</span>
              <span className={`stat-icon ${s.style}`}>
                <s.icon size={19} />
              </span>
            </div>
            <strong>{s.value.toString().padStart(2, "0")}</strong>
            <p>{s.detail}</p>
          </div>
        ))}
      </div>
      <div className="admin-grid">
        <section className="card">
          <div className="card-heading">
            <div>
              <h3>Ready for the green light</h3>
              <p>New registrations waiting for your approval.</p>
            </div>
            <span className="count-chip">{pending.length} pending</span>
          </div>
          {pending.length ? (
            <div className="pending-students">
              {pending.slice(0, 4).map((s) => (
                <div key={s.id}>
                  <span className="avatar">
                    {s.full_name
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <strong>{s.full_name}</strong>
                    <span>{s.university_name}</span>
                  </div>
                  <Link className="review-link" href="/admin/students">
                    Review <ArrowUpRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CircleCheck}
              title="All caught up."
              description="New registrations will appear here."
            />
          )}
          <Link className="card-footer-link" href="/admin/students">
            Manage all students <ArrowRight size={15} />
          </Link>
        </section>
        <section className="card event-control-card">
          <div className="card-heading">
            <h3>Competition at a glance</h3>
            <StatusBadge
              status={eventState(data.settings, now || Date.now())}
            />
          </div>
          <span className="feature-icon">
            <CodeIcon />
          </span>
          <h2>{data.settings.title}</h2>
          <dl className="detail-list">
            <div>
              <dt>Schedule</dt>
              <dd>
                {demo ? "Sample schedule" : dateLabel(data.settings.start_time)}
              </dd>
            </div>
            <div>
              <dt>Submission control</dt>
              <dd>
                {data.settings.submission_mode === "scheduled"
                  ? "Follow schedule"
                  : data.settings.submission_mode === "open"
                    ? "Manually open"
                    : "Manually closed"}
              </dd>
            </div>
            <div>
              <dt>Leaderboard</dt>
              <dd>
                <span
                  className={`subtle-dot ${data.settings.results_published ? "green" : ""}`}
                />
                {data.settings.results_published
                  ? "Published"
                  : "Not published"}
              </dd>
            </div>
          </dl>
          <Button asChild variant="outline">
            <Link href="/admin/settings">
              Edit event settings <ArrowUpRight size={15} />
            </Link>
          </Button>
        </section>
      </div>
      <section className="card">
        <div className="card-heading">
          <div>
            <h3>Latest submissions</h3>
            <p>Good ideas, ready for your attention.</p>
          </div>
          <Link className="text-link" href="/admin/evaluations">
            View all <ArrowRight size={15} />
          </Link>
        </div>
        {data.submissions.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>PARTICIPANT</th>
                  <th>SUBMITTED</th>
                  <th>STATUS</th>
                  <th>SCORE</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...data.submissions]
                  .sort((a, b) => b.submitted_at.localeCompare(a.submitted_at))
                  .slice(0, 4)
                  .map((s) => (
                    <tr key={s.id}>
                      <td>
                        <strong>
                          {s.student_name ||
                            data.students.find((p) => p.id === s.profile_id)
                              ?.full_name}
                        </strong>
                        <small>{s.university_name}</small>
                      </td>
                      <td>{dateLabel(s.submitted_at)}</td>
                      <td>
                        <StatusBadge
                          status={s.graded ? "evaluated" : "pending"}
                        />
                      </td>
                      <td>
                        <strong>{s.graded ? s.total_marks : "—"}</strong>
                        <span className="muted"> / 100</span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {s.github_url && (
                            <a
                              href={s.github_url}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-link"
                              title="Open GitHub Repo"
                            >
                              <Github size={15} />
                            </a>
                          )}
                          {s.drive_folder_url && (
                            <a
                              href={s.drive_folder_url}
                              target="_blank"
                              rel="noreferrer"
                              className="icon-link"
                              title="Open Google Drive Folder"
                            >
                              <GoogleDriveIcon size={15} />
                            </a>
                          )}
                          {s.storage_archive_url && (
                            <a
                              href={s.storage_archive_url}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="icon-link"
                              title="Download Code ZIP"
                            >
                              <Download size={15} />
                            </a>
                          )}
                          <Link
                            className="icon-link"
                            href="/admin/evaluations"
                            aria-label="Evaluate submission"
                            title="Evaluate with 100-Mark Rubric"
                          >
                            <ArrowUpRight size={17} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="The next big idea is on its way."
            description="Student projects will appear here once submitted."
          />
        )}
      </section>
    </Workspace>
  );
}
function CodeIcon() {
  return <span className="code-inline">&lt;/&gt;</span>;
}
export function StudentsPage() {
  const { data, demo, update, refresh, notify } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [togglingAll, setTogglingAll] = useState(false);
  const [allowAllResubmissions, setAllowAllResubmissions] = useState(false);

  // Direct student email state
  const [directStudent, setDirectStudent] = useState<any | null>(null);
  const [directSubject, setDirectSubject] = useState("");
  const [directMessage, setDirectMessage] = useState("");
  const [sendingDirect, setSendingDirect] = useState(false);

  // Figma Success & Action Popup Modal State
  const [popupModal, setPopupModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    buttonLabel?: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
    buttonLabel: "Close",
  });

  // Receipt Modal State
  const [receiptModal, setReceiptModal] = useState<{
    isOpen: boolean;
    studentName: string;
    receiptUrl: string | null;
  }>({
    isOpen: false,
    studentName: "",
    receiptUrl: null,
  });

  const handleSendPasswordReset = async (s: any) => {
    setBusy(`reset-${s.id}`);
    try {
      const res = await fetch("/api/admin/send-reset-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: s.email, studentName: s.full_name }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to send reset email.");
      setPopupModal({
        isOpen: true,
        title: "Reset Link Sent Successfully!",
        message: `Password reset instructions have been generated and dispatched to ${s.email}.`,
        buttonLabel: "Close",
      });
      notify(`Password reset email sent to ${s.email}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  };

  const handleSendDirectEmail = async (e: FormEvent) => {
    e.preventDefault();
    if (!directStudent || !directSubject.trim() || !directMessage.trim()) return;
    setSendingDirect(true);
    try {
      const res = await fetch("/api/admin/send-direct-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: directStudent.id,
          email: directStudent.email,
          studentName: directStudent.full_name,
          subject: directSubject.trim(),
          message: directMessage.trim(),
        }),
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to send email.");
      setPopupModal({
        isOpen: true,
        title: "Email Sent Successfully!",
        message: `Direct message has been delivered to ${directStudent.full_name} (${directStudent.email}).`,
        buttonLabel: "Close",
      });
      notify(`Email successfully sent to ${directStudent.email}.`);
      setDirectStudent(null);
      setDirectSubject("");
      setDirectMessage("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSendingDirect(false);
    }
  };

  const handleToggleAllResubmissions = async () => {
    setTogglingAll(true);
    try {
      const nextState = !allowAllResubmissions;
      const res = await fetch("/api/admin/toggle-resubmissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allowAll: nextState }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to toggle resubmission permissions.");
      }
      setAllowAllResubmissions(nextState);
      setPopupModal({
        isOpen: true,
        title: nextState ? "Submissions Unlocked!" : "Submissions Locked!",
        message: nextState
          ? "All student participants can now submit or update their projects in the workspace."
          : "Student submissions have been permanently frozen and locked.",
        buttonLabel: "Close",
      });
      notify(
        nextState
          ? "Resubmissions unlocked for all registered students!"
          : "Submissions locked permanently.",
      );
      await refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setTogglingAll(false);
    }
  };

  const students = data.students.filter(
    (s) =>
      (filter === "all" || s.status === filter) &&
      `${s.full_name} ${s.email} ${s.university_name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(students.length / perPage));
  const paginatedStudents = students.slice((page - 1) * perPage, page * perPage);

  async function review(id: string, status: "approved" | "rejected" | "unlocked") {
    setBusy(id);
    setError("");
    let notice = "";
    try {
      if (demo) {
        if (status === "unlocked") {
          update((d) => ({
            ...d,
            submissions: d.submissions.filter((sub) => sub.profile_id !== id),
          }));
          notice = "Submission unlocked in demo mode.";
        } else {
          update((d) => ({
            ...d,
            students: d.students.map((s) => (s.id === id ? { ...s, status } : s)),
            profile: d.profile?.id === id ? { ...d.profile, status } : d.profile,
          }));
        }
      } else {
        const result = await request("admin/students", {
          method: "POST",
          body: JSON.stringify({ id, status }),
        });
        if (result.notice) notice = result.notice;
        await refresh();
      }
      if (status === "approved") {
        setPopupModal({
          isOpen: true,
          title: "Student Approved Successfully!",
          message: "The student account has been approved and their competition workspace is unlocked.",
          buttonLabel: "Close",
        });
      } else if (status === "rejected") {
        setPopupModal({
          isOpen: true,
          title: "Student Rejected",
          message: "The participant's registration has been rejected.",
          buttonLabel: "Close",
        });
      } else if (status === "unlocked") {
        setPopupModal({
          isOpen: true,
          title: "Submission Unlocked!",
          message: "The student has been granted permission to resubmit their project.",
          buttonLabel: "Close",
        });
      }
      notify(
        notice ||
          (demo
            ? `Demo registration ${status}. No email was sent.`
            : `Registration ${status}.`),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy("");
    }
  }

  return (
    <Workspace admin>
      <PageHeading
        eyebrow="THE PEOPLE BEHIND THE POSSIBILITIES"
        title="Student & Participant Management"
        description="Review registrations, verify participant eligibility, and oversee competition submissions."
        action={
          <span className="count-chip">
            {data.students.length} total students
          </span>
        }
      />

      {/* Figma-Style Top Metric Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div
          className="students-stat-card"
          style={{
            borderRadius: "8px",
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            Total Students
          </span>
          <strong
            style={{
              fontSize: "32px",
              fontWeight: 800,
              marginTop: "8px",
              letterSpacing: "-0.03em",
              display: "block",
            }}
          >
            {data.students.length}
          </strong>
        </div>

        <div
          className="students-stat-card"
          style={{
            borderRadius: "8px",
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            Active Students
          </span>
          <strong
            style={{
              fontSize: "32px",
              fontWeight: 800,
              marginTop: "8px",
              letterSpacing: "-0.03em",
              display: "block",
            }}
          >
            {data.students.filter((s) => s.status === "approved").length}
          </strong>
        </div>

        <div
          className="students-stat-card"
          style={{
            borderRadius: "8px",
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(16, 24, 40, 0.05)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            Pending Verification
          </span>
          <strong
            style={{
              fontSize: "32px",
              fontWeight: 800,
              marginTop: "8px",
              letterSpacing: "-0.03em",
              display: "block",
            }}
          >
            {data.students.filter((s) => s.status === "pending").length}
          </strong>
        </div>
      </div>

      <section className="card students-card" style={{ padding: "20px", borderRadius: "8px" }}>
        {/* Figma-Style Underline Tab Controller */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            borderBottom: "1px solid #eaecf0",
            marginBottom: "18px",
            overflow: "visible",
            flexWrap: "wrap",
          }}
        >
          {[
            { key: "all", label: "All Students", count: data.students.length },
            { key: "approved", label: "Active Students", count: data.students.filter((s) => s.status === "approved").length },
            { key: "pending", label: "Pending Verification", count: data.students.filter((s) => s.status === "pending").length },
            { key: "rejected", label: "Rejected", count: data.students.filter((s) => s.status === "rejected").length },
          ].map((t) => {
            const isActive = filter === t.key;
            return (
              <button
                key={t.key}
                type="button"
                className={`students-tab-btn ${isActive ? "active" : ""}`}
                onClick={() => {
                  setFilter(t.key);
                  setPage(1);
                }}
                style={{
                  position: "relative",
                  padding: "10px 4px 14px",
                  fontSize: "13px",
                  fontWeight: isActive ? 700 : 500,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  borderBottom: isActive ? "2px solid #252d58" : "2px solid transparent",
                  marginBottom: "-1px",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                <span>{t.label}</span>
                <span
                  className="students-tab-badge"
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "1px 7px",
                    borderRadius: "9999px",
                  }}
                >
                  {t.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Figma-Style Search, Filter & Action Bar */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "260px", maxWidth: "460px" }}>
            <div
              style={{
                position: "relative",
                flex: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: "12px",
                  color: "#98a2b3",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                placeholder="Search students by name, email, university…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="students-search-input"
                style={{
                  width: "100%",
                  height: "38px",
                  paddingLeft: "36px",
                  paddingRight: "12px",
                  fontSize: "12px",
                  borderRadius: "8px",
                  border: "1px solid #d0d5dd",
                  outline: "none",
                }}
              />
            </div>
          </div>

          <button
            type="button"
            disabled={togglingAll}
            onClick={handleToggleAllResubmissions}
            className="unlock-all-btn"
            style={{
              height: "38px",
              padding: "0 16px",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              backgroundColor: allowAllResubmissions ? "#f59e0b" : undefined,
              color: allowAllResubmissions ? "#0f172a" : undefined,
              border: "none",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 1px 2px rgba(16, 24, 40, 0.05)",
            }}
          >
            {togglingAll ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : allowAllResubmissions ? (
              <Lock size={14} />
            ) : (
              <Unlock size={14} />
            )}
            <span>{allowAllResubmissions ? "Lock Submissions" : "+ Unlock All Submissions"}</span>
          </button>
        </div>

        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {students.length ? (
          <div>
            <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
              <div style={{ minWidth: "760px" }}>
                {/* Div-Based Student Table Header */}
            <div
              className="students-grid-header"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(200px, 1.8fr) minmax(130px, 1.2fr) minmax(100px, 0.9fr) minmax(150px, 1.3fr) minmax(160px, 1.4fr)",
                gap: "12px",
                padding: "10px 14px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                alignItems: "center",
              }}
            >
              <div>STUDENT</div>
              <div>UNIVERSITY</div>
              <div>STATUS</div>
              <div>SUBMISSION & CODE</div>
              <div style={{ textAlign: "right" }}>ACTIONS</div>
            </div>

            {/* Div-Based Student Rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginTop: "4px" }}>
              {paginatedStudents.map((s) => (
                <div
                  key={s.id}
                  className="students-grid-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(200px, 1.8fr) minmax(130px, 1.2fr) minmax(100px, 0.9fr) minmax(150px, 1.3fr) minmax(160px, 1.4fr)",
                    gap: "12px",
                    padding: "12px 14px",
                    alignItems: "center",
                    borderRadius: "4px",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span
                        className="students-avatar-circle"
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          fontWeight: 700,
                          fontSize: "12px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {s.full_name
                          .split(" ")
                          .map((w: string) => w[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: "13px", fontWeight: 700, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.full_name}
                        </strong>
                        <small style={{ fontSize: "11px", display: "block", marginTop: "1px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {s.email}
                        </small>
                      </div>
                    </div>
                  </div>

                  <div className="students-university-text" style={{ fontSize: "12px", fontWeight: 500 }}>
                    {s.university_name}
                  </div>

                  <div>
                    <StatusBadge status={s.status} />
                  </div>

                  <div>
                    {(() => {
                      const sub = data.submissions.find((item) => item.profile_id === s.id);
                      if (!sub) {
                        return <span className="text-xs text-slate-400 italic">Not submitted yet</span>;
                      }
                      return (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          {sub.github_url && (
                            <a
                              href={sub.github_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open GitHub Repository"
                              className="students-action-btn"
                              style={{
                                width: "28px",
                                height: "28px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                              }}
                            >
                              <Github size={14} />
                            </a>
                          )}
                          {sub.drive_folder_url && (
                            <a
                              href={sub.drive_folder_url}
                              target="_blank"
                              rel="noreferrer"
                              title="Open Student Google Drive Folder"
                              className="students-action-btn"
                              style={{
                                width: "28px",
                                height: "28px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                              }}
                            >
                              <GoogleDriveIcon size={14} />
                            </a>
                          )}
                          {sub.storage_archive_url && (
                            <a
                              href={sub.storage_archive_url}
                              target="_blank"
                              rel="noreferrer"
                              download
                              title="Download Project Source Code ZIP"
                              className="students-action-btn"
                              style={{
                                width: "28px",
                                height: "28px",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "6px",
                                borderColor: "#86efac",
                                color: "#16a34a",
                              }}
                            >
                              <Download size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            disabled={busy === s.id}
                            onClick={() => review(s.id, "unlocked")}
                            title="Unlock workspace / Allow student to resubmit"
                            className="students-action-btn"
                            style={{
                              width: "28px",
                              height: "28px",
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "6px",
                              cursor: "pointer",
                            }}
                          >
                            <Unlock size={13} />
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                      {/* WhatsApp Circular Button */}
                      {s.phone_no && (
                        <a
                          href={whatsapp(s.phone_no)}
                          target="_blank"
                          rel="noreferrer"
                          title={`Chat on WhatsApp (${s.phone_no})`}
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "6px",
                            background: "#25D366",
                            color: "#ffffff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            textDecoration: "none",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            flexShrink: 0,
                          }}
                        >
                          <svg style={{ width: "14px", height: "14px", fill: "currentColor" }} viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                          </svg>
                        </a>
                      )}

                      {/* Direct Email Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setDirectStudent(s);
                          setDirectSubject("Important Notice regarding your VSpark Participation");
                          setDirectMessage("");
                        }}
                        title={`Send direct email to ${s.full_name} (${s.email})`}
                        className="students-action-btn"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          color: "#2563eb",
                        }}
                      >
                        <Mail size={13} />
                      </button>

                      {/* Reset Password Button */}
                      <button
                        type="button"
                        disabled={busy === `reset-${s.id}`}
                        onClick={() => handleSendPasswordReset(s)}
                        title={`Send password reset email to ${s.email}`}
                        className="students-action-btn"
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          flexShrink: 0,
                          color: "#d97706",
                        }}
                      >
                        {busy === `reset-${s.id}` ? (
                          <RefreshCw size={12} className="animate-spin text-amber-600" />
                        ) : (
                          <KeyRound size={13} />
                        )}
                      </button>

                      {/* Payment Receipt Button */}
                      <button
                        type="button"
                        className="students-action-btn"
                        onClick={() => {
                          setReceiptModal({
                            isOpen: true,
                            studentName: s.full_name,
                            receiptUrl: s.payment_receipt_url
                              ? `/api/admin/receipt?id=${encodeURIComponent(s.id)}`
                              : null,
                          });
                        }}
                        title={s.payment_receipt_url ? "View student payment receipt" : "No receipt uploaded"}
                        style={{
                          width: "28px",
                          height: "28px",
                          borderRadius: "6px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          padding: 0,
                          cursor: "pointer",
                        }}
                      >
                        <FileText size={13} />
                      </button>

                      {/* Approval Controls */}
                      {s.status !== "approved" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === s.id}
                          onClick={() => review(s.id, "approved")}
                          style={{ padding: "4px 8px", fontSize: "11px", height: "28px", borderRadius: "6px" }}
                        >
                          <Check size={13} />
                          Approve
                        </Button>
                      )}
                      {s.status !== "rejected" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={busy === s.id}
                          aria-label={`Reject ${s.full_name}`}
                          onClick={() => review(s.id, "rejected")}
                          style={{ width: "28px", height: "28px", borderRadius: "6px" }}
                        >
                          <X size={14} />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

            {/* Figma-Style Pagination Bar */}
            <div
              className="students-pagination-bar"
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "16px 4px 6px",
                marginTop: "12px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="students-pagination-btn"
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    cursor: page <= 1 ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  &larr; Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | string)[]>((acc, p, idx, arr) => {
                    if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
                      acc.push("...");
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    typeof p === "string" ? (
                      <span key={`dots-${idx}`} style={{ padding: "0 4px", color: "#98a2b3" }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPage(p)}
                        className={`students-pagination-btn ${p === page ? "active" : ""}`}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {p}
                      </button>
                    ),
                  )}

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="students-pagination-btn"
                  style={{
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    borderRadius: "6px",
                    cursor: page >= totalPages ? "not-allowed" : "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  Next &rarr;
                </button>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", color: "#667085" }}>
                  Showing {students.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, students.length)} of {students.length}
                </span>
                <select
                  value={perPage}
                  onChange={(e) => {
                    setPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="students-per-page-select"
                  style={{
                    height: "30px",
                    padding: "0 8px",
                    fontSize: "11px",
                    borderRadius: "6px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value={10}>10 per page</option>
                  <option value={20}>20 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title="No students found."
            description="Try another search or registration filter."
          />
        )}

        {/* Direct Email Modal */}
        {directStudent && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[12px] max-w-[500px] w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="m-0 text-base font-bold text-slate-900 dark:text-slate-100">
                    Send Direct Email
                  </h3>
                  <p className="m-0 text-xs text-slate-500 dark:text-slate-400">
                    To: {directStudent.full_name} ({directStudent.email})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDirectStudent(null)}
                  className="bg-transparent border-0 cursor-pointer text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSendDirectEmail} className="flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject
                  <input
                    type="text"
                    required
                    value={directSubject}
                    onChange={(e) => setDirectSubject(e.target.value)}
                    className="px-3 py-2 rounded-md border border-slate-300 dark:border-[#29364b] bg-white dark:bg-[#0d1527] text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:border-blue-500"
                  />
                </label>

                <label className="flex flex-col gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Message
                  <textarea
                    required
                    rows={5}
                    value={directMessage}
                    onChange={(e) => setDirectMessage(e.target.value)}
                    placeholder="Write your email message here..."
                    className="px-3 py-2 rounded-md border border-slate-300 dark:border-[#29364b] bg-white dark:bg-[#0d1527] text-slate-900 dark:text-slate-100 text-xs resize-y focus:outline-none focus:border-blue-500"
                  />
                </label>

                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setDirectStudent(null)}
                    className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer border-0 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingDirect}
                    className="px-5 py-2 rounded-md bg-[#252d58] hover:bg-[#1e2448] dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-xs font-bold cursor-pointer border-0 inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
                  >
                    {sendingDirect ? <RefreshCw size={13} className="animate-spin" /> : <Mail size={13} />}
                    {sendingDirect ? "Sending..." : "Send Email"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>

      {/* Figma Success & Action Popup Modal */}
      <FigmaSuccessModal
        isOpen={popupModal.isOpen}
        onClose={() => setPopupModal((prev) => ({ ...prev, isOpen: false }))}
        title={popupModal.title}
        message={popupModal.message}
        buttonLabel={popupModal.buttonLabel}
      />

      {/* Payment Receipt Modal */}
      <ReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal((prev) => ({ ...prev, isOpen: false }))}
        studentName={receiptModal.studentName}
        receiptUrl={receiptModal.receiptUrl}
      />
    </Workspace>
  );
}
export function EvaluationsPage() {
  const { data, demo, update, refresh, notify } = useApp();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Submission | null>(null);
  const lastTrigger = useRef<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [rubricScores, setRubricScores] = useState<Record<string, number>>({
    ui_ux: 0,
    auth: 0,
    crud: 0,
    storage: 0,
    api: 0,
    deployment: 0,
    code_quality: 0,
    docs: 0,
    defense: 0,
  });

  const handleOpenEvaluation = (s: Submission, el: HTMLElement) => {
    lastTrigger.current = el;
    setSelected(s);
    setError("");
    const initial: Record<string, number> = {
      ui_ux: 0,
      auth: 0,
      crud: 0,
      storage: 0,
      api: 0,
      deployment: 0,
      code_quality: 0,
      docs: 0,
      defense: 0,
    };
    if (s.evaluation?.scores && Object.keys(s.evaluation.scores).length > 0) {
      Object.assign(initial, s.evaluation.scores);
    } else if (s.total_marks > 0) {
      for (const crit of OFFICIAL_RUBRIC) {
        initial[crit.id] = Math.min(
          crit.max,
          Math.round((s.total_marks / 100) * crit.max),
        );
      }
    }
    setRubricScores(initial);
  };

  const currentTotal = OFFICIAL_RUBRIC.reduce(
    (acc, c) => acc + (rubricScores[c.id] || 0),
    0,
  );

  const handleScoreChange = (id: string, val: number, max: number) => {
    const clamped = Math.max(0, Math.min(max, Math.round(val)));
    setRubricScores((prev) => ({
      ...prev,
      [id]: clamped,
    }));
  };
  const submissions = data.submissions
    .map((s) => ({
      ...s,
      student_name:
        s.student_name ||
        data.students.find((p) => p.id === s.profile_id)?.full_name ||
        "Participant",
    }))
    .filter(
      (s) =>
        (filter === "all" || (filter === "evaluated" ? s.graded : !s.graded)) &&
        s.student_name.toLowerCase().includes(search.toLowerCase()),
    );
  useEffect(() => {
    if (!selected) return;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) setSelected(null);
      if (e.key !== "Tab") return;
      const controls = Array.from(
        document.querySelectorAll<HTMLElement>(
          '[role="dialog"] a[href], [role="dialog"] button:not(:disabled), [role="dialog"] input, [role="dialog"] textarea',
        ),
      );
      const first = controls[0],
        last = controls.at(-1);
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
      document.body.style.overflow = oldOverflow;
      lastTrigger.current?.focus();
    };
  }, [selected, busy]);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const marks = Number(form.get("marks")) || currentTotal;
    const feedback = String(form.get("feedback"));
    try {
      if (!Number.isInteger(marks) || marks < 0 || marks > 100)
        throw new Error("Score must be a whole number from 0 to 100.");
      if (demo)
        update((d) => ({
          ...d,
          submissions: d.submissions.map((s) =>
            s.id === selected.id
              ? {
                  ...s,
                  total_marks: marks,
                  admin_feedback: feedback,
                  graded: true,
                  evaluation: {
                    submission_id: selected.id,
                    student_id: selected.profile_id,
                    scores: rubricScores,
                    total_score: marks,
                    feedback,
                    evaluator_name: "Faculty Jury Panel",
                    is_published: true,
                  },
                }
              : s,
          ),
        }));
      else {
        await request("admin/evaluations", {
          method: "POST",
          body: JSON.stringify({
            id: selected.id,
            total_marks: marks,
            admin_feedback: feedback,
            scores: rubricScores,
          }),
        });
        await refresh();
      }
      setSelected(null);
      notify("Evaluation saved.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace admin>
      <PageHeading
        eyebrow="GREAT WORK DESERVES A CLOSER LOOK"
        title="Ideas, ready for the spotlight."
        description="Review each project, share feedback, and recognize the work behind it."
        action={
          <Button asChild variant="outline">
            <Link href="/admin/settings">
              <Trophy size={16} />
              Publish results
            </Link>
          </Button>
        }
      />
      <section className="card">
        <div className="table-toolbar">
          <div className="tabs" role="group" aria-label="Filter evaluations">
            {["all", "pending", "evaluated"].map((f) => (
              <button
                className={filter === f ? "active" : ""}
                key={f}
                onClick={() => setFilter(f)}
              >
                {f === "all"
                  ? "All submissions"
                  : f === "pending"
                    ? "To evaluate"
                    : "Evaluated"}
              </button>
            ))}
          </div>
          <label className="search-input">
            <Search size={16} />
            <input
              placeholder="Search participants…"
              aria-label="Search submissions"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
        {submissions.length ? (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>PARTICIPANT</th>
                  <th>PROJECT FILES</th>
                  <th>SUBMITTED</th>
                  <th>SCORE</th>
                  <th>STATUS</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <strong>{s.student_name}</strong>
                      <small>{s.university_name}</small>
                    </td>
                    <td>
                      <div className="table-actions">
                        <a
                          className="small-link"
                          href={s.github_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Github size={15} />
                          GitHub <ArrowUpRight size={11} />
                        </a>
                        {s.drive_folder_url ? (
                          <a
                            className="small-link"
                            href={s.drive_folder_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Drive <ArrowUpRight size={11} />
                          </a>
                        ) : (
                          <span className="muted text-xs">Demo files</span>
                        )}
                      </div>
                    </td>
                    <td>{dateLabel(s.submitted_at)}</td>
                    <td>
                      <strong className={s.graded ? "score-number" : ""}>
                        {s.graded ? s.total_marks : "—"}
                      </strong>
                      <span className="muted"> /100</span>
                    </td>
                    <td>
                      <StatusBadge
                        status={s.graded ? "evaluated" : "pending"}
                      />
                    </td>
                    <td>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleOpenEvaluation(s, e.currentTarget)}
                      >
                        {s.graded ? "Edit score" : "Evaluate"}
                        <ArrowUpRight size={13} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={ClipboardCheck}
            title="No projects here yet."
            description="Submitted projects will appear here for evaluation."
          />
        )}
        <div className="table-footnote">
          {data.submissions.filter((s) => s.graded).length} of{" "}
          {data.submissions.length} projects evaluated
          <span>Scores stay private until results are published.</span>
        </div>
      </section>
      {selected && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget && !busy) setSelected(null);
          }}
        >
          <section
            className="evaluation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="evaluation-title"
            style={{
              width: "660px",
              maxWidth: "96vw",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "24px",
              borderRadius: "12px",
            }}
          >
            <div className="card-heading">
              <div>
                <div className="eyebrow">OFFICIAL 100-MARK RUBRIC EVALUATION</div>
                <h2 id="evaluation-title" style={{ fontSize: "20px", fontWeight: 800 }}>
                  {selected.student_name}
                </h2>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {selected.university_name || "Participant"}
                </span>
              </div>
              <button
                className="icon-link"
                disabled={busy}
                aria-label="Close evaluation"
                onClick={() => setSelected(null)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Artifacts Links Bar */}
            <div className="flex flex-wrap items-center gap-2 my-3.5 px-3 py-2 bg-slate-50 dark:bg-[#0b1325] border border-slate-200 dark:border-[#1e293b] rounded-md">
              {selected.github_url && (
                <a
                  className="small-link"
                  href={selected.github_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600 }}
                >
                  <Github size={13} /> GitHub Repo <ArrowUpRight size={10} />
                </a>
              )}
              {selected.drive_folder_url && (
                <a
                  className="small-link"
                  href={selected.drive_folder_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600 }}
                >
                  <GoogleDriveIcon size={13} /> Student Drive <ArrowUpRight size={10} />
                </a>
              )}
              {selected.storage_archive_url && (
                <a
                  className="small-link"
                  href={selected.storage_archive_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "11px", fontWeight: 600 }}
                >
                  <Download size={13} /> Source ZIP <ArrowUpRight size={10} />
                </a>
              )}
            </div>

            {/* Live Total Score Pill Banner */}
            <div className="flex items-center justify-between p-3.5 mb-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
              <div>
                <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                  Auto-Calculated Total Marks
                </span>
                <div className="text-[22px] font-extrabold text-emerald-950 dark:text-emerald-100 font-mono mt-0.5">
                  {currentTotal}{" "}
                  <span className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">
                    / 100 Marks
                  </span>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "11px",
                    fontWeight: 800,
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    background:
                      currentTotal >= 80 ? "#16a34a" : currentTotal >= 60 ? "#2563eb" : "#d97706",
                    color: "#ffffff",
                    letterSpacing: "0.03em",
                  }}
                >
                  {currentTotal >= 90
                    ? "Grade A+ (Distinction)"
                    : currentTotal >= 80
                    ? "Grade A"
                    : currentTotal >= 70
                    ? "Grade B+"
                    : currentTotal >= 60
                    ? "Grade B"
                    : currentTotal >= 50
                    ? "Grade C"
                    : "Needs Review"}
                </span>
              </div>
            </div>

            <form className="form-stack" onSubmit={save}>
              {/* 9 Rubric Criteria Sliders/Inputs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "10px",
                  marginBottom: "16px",
                }}
              >
                {OFFICIAL_RUBRIC.map((crit) => {
                  const val = rubricScores[crit.id] || 0;
                  return (
                    <div
                      key={crit.id}
                      className="evaluation-rubric-card"
                      style={{
                        padding: "10px 12px",
                        borderRadius: "6px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "3px",
                        }}
                      >
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {crit.label}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Max {crit.max}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 m-0 mb-2 leading-snug">
                        {crit.description}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="range"
                          min={0}
                          max={crit.max}
                          value={val}
                          onChange={(e) =>
                            handleScoreChange(crit.id, Number(e.target.value), crit.max)
                          }
                          style={{ flex: 1, height: "6px", cursor: "pointer" }}
                        />
                        <input
                          type="number"
                          min={0}
                          max={crit.max}
                          value={val}
                          onChange={(e) =>
                            handleScoreChange(crit.id, Number(e.target.value), crit.max)
                          }
                          className="w-12 h-7 text-center text-xs font-bold rounded border border-slate-300 dark:border-[#29364b] bg-white dark:bg-[#060b18] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total marks input (bound to currentTotal or manual override) */}
              <input type="hidden" name="marks" value={currentTotal} />

              <label>
                Jury Feedback &amp; Evaluation Remarks{" "}
                <span className="label-hint">Visible to student on scorecard</span>
                <textarea
                  name="feedback"
                  rows={4}
                  maxLength={3000}
                  defaultValue={selected.admin_feedback}
                  placeholder="Highlight key architectural strengths, responsiveness, code quality, or areas for improvement..."
                />
              </label>

              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" disabled={busy}>
                <Save size={16} />
                {busy ? "Saving…" : "Save Evaluation & Rubric Scores"}
              </Button>
            </form>
          </section>
        </div>
      )}
    </Workspace>
  );
}
function localTime(iso: string) {
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}
export function SettingsPage() {
  const { data, demo, update, refresh, notify } = useApp();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const [mode, setMode] = useState(data.settings.submission_mode);
  const [published, setPublished] = useState(data.settings.results_published);
  const [driveUrl, setDriveUrl] = useState(
    data.settings.google_drive_folder_url || "",
  );
  const [checkingDrive, setCheckingDrive] = useState(false);
  const [driveCheck, setDriveCheck] = useState("");
  const [connectingDrive, setConnectingDrive] = useState(false);
  useEffect(() => {
    const url = new URL(window.location.href);
    const state = url.searchParams.get("drive");
    if (!state) return;
    if (state === "connected")
      notify(
        "Google Drive connected. Your VSpark Submissions folder is ready. Submissions remain closed until you open them.",
      );
    else
      setDriveCheck(
        state === "invalid"
          ? "The Google authorization link expired or was cancelled. Start Connect Google Drive again."
          : "Google Drive could not connect. Check the Google Cloud setup, allow file access, and try again.",
      );
    url.searchParams.delete("drive");
    window.history.replaceState(null, "", url.pathname + url.search);
  }, [notify]);
  async function connectDrive() {
    setConnectingDrive(true);
    setDriveCheck("");
    try {
      const result = await request("admin/drive/connect", { method: "POST" });
      window.location.assign(result.url);
    } catch (error) {
      setDriveCheck(
        error instanceof Error
          ? error.message
          : "Could not start Google sign-in.",
      );
      setConnectingDrive(false);
    }
  }
  const driveChanged =
    driveUrl.trim() !== (data.settings.google_drive_folder_url || "");
  const currentConfig = extractConfigFromDescription(data.settings.task_description);
  useEffect(() => {
    setMode(data.settings.submission_mode);
    setPublished(data.settings.results_published);
    setDriveUrl(data.settings.google_drive_folder_url || "");
  }, [
    data.settings.submission_mode,
    data.settings.results_published,
    data.settings.google_drive_folder_url,
  ]);
  async function checkDrive() {
    setCheckingDrive(true);
    setDriveCheck("");
    try {
      const canonical = canonicalDriveFolder(driveUrl);
      if (demo)
        setDriveCheck(
          "Folder link is valid. Access checks are available on the live site.",
        );
      else {
        const result = await request("admin/drive/verify", {
          method: "POST",
          body: JSON.stringify({ url: canonical }),
        });
        setDriveCheck(
          `Access verified: ${result.name}. Save changes to use this folder.`,
        );
      }
    } catch (error) {
      setDriveCheck(
        error instanceof Error ? error.message : "Could not check this folder.",
      );
    } finally {
      setCheckingDrive(false);
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);
    try {
      const start = new Date(String(form.get("start_time"))).toISOString();
      const end = new Date(String(form.get("end_time"))).toISOString();
      if (Date.parse(end) <= Date.parse(start))
        throw new Error("The end time must be after the start time.");
      const evalEmail = String(form.get("evaluator_email") || "").trim();
      let updatedTaskDesc = String(form.get("task_description")).trim();
      if (evalEmail) {
        const cfg = extractConfigFromDescription(updatedTaskDesc);
        cfg.evaluatorEmail = evalEmail;
        updatedTaskDesc = embedConfigInDescription(updatedTaskDesc, cfg);
      }
      const next: Settings = {
        ...data.settings,
        title: String(form.get("title")).trim(),
        task_description: updatedTaskDesc,
        start_time: start,
        end_time: end,
        submission_mode: mode,
        results_published: published,
        event_location: String(form.get("event_location")).trim(),
        bank_name: String(form.get("bank_name")).trim(),
        bank_title: String(form.get("bank_title")).trim(),
        bank_account: String(form.get("bank_account")).trim(),
        bank_iban: String(form.get("bank_iban")).trim(),
        google_drive_folder_url: driveUrl.trim()
          ? canonicalDriveFolder(driveUrl)
          : (data.settings.google_drive_folder_url || ""),
        prizes: [
          String(form.get("prize_1")),
          String(form.get("prize_2")),
          String(form.get("prize_3")),
        ],
      };
      if (demo) update((d) => ({ ...d, settings: next }));
      else {
        form.set("settings", JSON.stringify(next));
        form.set("evaluator_email", evalEmail);
        await request("admin/settings", { method: "POST", body: form });
        await refresh();
      }
      notify(
        demo && filename
          ? "Demo settings saved. The PDF was not uploaded."
          : "Competition settings saved.",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace admin>
      <PageHeading
        eyebrow="YOU SET THE STAGE"
        title="Make it your competition."
        description="Shape the challenge, set the timing, and decide when the spotlight turns on."
      />
      <form className="settings-layout" onSubmit={save}>
        <div className="settings-main">
          <section className="card settings-card">
            <div className="settings-section-title">
              <span className="stat-icon">
                <FileText size={20} />
              </span>
              <div>
                <h3>The challenge</h3>
                <p>Give your participants a clear starting point.</p>
              </div>
            </div>
            <div className="form-stack">
              <label>
                Competition title
                <input
                  name="title"
                  required
                  maxLength={150}
                  defaultValue={data.settings.title}
                />
              </label>
              <label>
                Task description
                <textarea
                  name="task_description"
                  required
                  rows={10}
                  maxLength={20000}
                  defaultValue={data.settings.task_description}
                />
              </label>
              <label>
                Task PDF <span className="label-hint">Optional · 3 MB max</span>
                <span className="file-drop receipt-drop">
                  <Upload size={20} />
                  <strong>{filename || "Attach the full task brief"}</strong>
                  <span>PDF documents only</span>
                  <input
                    type="file"
                    name="task_pdf"
                    accept="application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f && f.size > 3 * 1024 * 1024) {
                        setError("Task PDF must be smaller than 3 MB.");
                        e.target.value = "";
                        setFilename("");
                      } else {
                        setFilename(f?.name || "");
                        setError("");
                      }
                    }}
                  />
                </span>
              </label>
              {data.settings.task_pdf_url && (
                <a
                  className="text-link"
                  href={data.settings.task_pdf_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  View current task PDF <ArrowUpRight size={13} />
                </a>
              )}
            </div>
          </section>
          <section className="card settings-card">
            <div className="settings-section-title">
              <span className="stat-icon violet">
                <Clock3 size={20} />
              </span>
              <div>
                <h3>The schedule</h3>
                <p>
                  Times use your device’s local timezone (
                  {Intl.DateTimeFormat().resolvedOptions().timeZone}).
                </p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Start date & time
                <input
                  type="datetime-local"
                  name="start_time"
                  required
                  defaultValue={localTime(data.settings.start_time)}
                />
              </label>
              <label>
                End date & time
                <input
                  type="datetime-local"
                  name="end_time"
                  required
                  defaultValue={localTime(data.settings.end_time)}
                />
              </label>
            </div>
            <label className="standalone-label">
              Event location
              <input
                name="event_location"
                maxLength={200}
                defaultValue={data.settings.event_location}
              />
            </label>
          </section>
          <section className="card settings-card">
            <div className="settings-section-title">
              <span className="stat-icon amber">
                <Trophy size={20} />
              </span>
              <div>
                <h3>Recognition & prizes</h3>
                <p>These labels appear on the landing page.</p>
              </div>
            </div>
            <div className="form-stack">
              {[1, 2, 3].map((n, i) => (
                <label key={n}>
                  Place {n}
                  <input
                    name={`prize_${n}`}
                    maxLength={100}
                    defaultValue={data.settings.prizes[i]}
                    required
                  />
                </label>
              ))}
            </div>
          </section>
          <section className="card settings-card">
            <div className="settings-section-title">
              <span className="stat-icon mint">
                <ClipboardCheck size={20} />
              </span>
              <div>
                <h3>Optional payment details</h3>
                <p>
                  Published on the landing page when an account number is
                  provided.
                </p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Bank name
                <input
                  name="bank_name"
                  maxLength={100}
                  defaultValue={data.settings.bank_name}
                />
              </label>
              <label>
                Account title
                <input
                  name="bank_title"
                  maxLength={150}
                  defaultValue={data.settings.bank_title}
                />
              </label>
              <label>
                Account number
                <input
                  name="bank_account"
                  maxLength={80}
                  defaultValue={data.settings.bank_account}
                />
              </label>
              <label>
                IBAN
                <input
                  name="bank_iban"
                  maxLength={80}
                  defaultValue={data.settings.bank_iban}
                />
              </label>
            </div>
          </section>
          <section className="card settings-card">
            <div className="settings-section-title">
              <span className="stat-icon violet">
                <Mail size={20} />
              </span>
              <div>
                <h3>Faculty Evaluator Access</h3>
                <p>Repository collaborator &amp; evaluation access email provided to participants.</p>
              </div>
            </div>
            <div className="form-stack">
              <label>
                Evaluator Collaborator Email
                <input
                  type="email"
                  name="evaluator_email"
                  defaultValue={currentConfig.evaluatorEmail || "aliblogspot769@gmail.com"}
                  placeholder="faculty@university.edu"
                />
              </label>
              <p className="control-explanation">
                Participants will see this email when prompted to invite faculty evaluators to their private GitHub repositories during project submission.
              </p>
            </div>
          </section>
        </div>
        <aside className="settings-controls">
          <section className="card settings-card">
            <div className="settings-section-title">
              <SlidersHorizontal size={20} />
              <h3>Event controls</h3>
            </div>
            <label>
              Submission portal
              <select
                value={mode}
                onChange={(e) =>
                  setMode(e.target.value as Settings["submission_mode"])
                }
              >
                <option value="scheduled">Follow schedule</option>
                <option value="open">Open now</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <p className="control-explanation">
              {mode === "scheduled"
                ? "The portal opens and closes automatically using your event schedule."
                : mode === "open"
                  ? "The portal stays open, regardless of the schedule."
                  : "The portal is closed. This overrides the schedule."}
            </p>
            <div className="control-divider" />
            <div className="toggle-row">
              <div>
                <strong>Publish results</strong>
                <span>Reveal the public leaderboard</span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={published}
                aria-label="Publish results"
                className={`toggle ${published ? "on" : ""}`}
                onClick={() => setPublished(!published)}
              >
                <span />
              </button>
            </div>
            <p className="control-explanation">
              Only evaluated projects appear in published results. Names,
              universities, and scores become public.
            </p>
            <div className="info-note">
              <Info size={17} />
              <p>
                Changes take effect when you save. Closing submissions
                immediately locks the task page.
              </p>
            </div>
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy}>
              <Save size={16} />
              {busy ? "Saving changes…" : "Save changes"}
            </Button>
            <Link className="text-link" href="/results" target="_blank">
              Preview leaderboard <ArrowUpRight size={13} />
            </Link>
          </section>
          <p className="settings-save-note">
            <Check size={13} />
            You’re in control. Make it a great experience.
          </p>
        </aside>
      </form>
    </Workspace>
  );
}
