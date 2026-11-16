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
  Lock,
  RefreshCw,
  Mail,
  KeyRound,
  Download,
  Award,
  Landmark,
  BookOpen,
  CreditCard,
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
import { extractConfigFromDescription, embedConfigInDescription, DEFAULT_CONFIG } from "@/lib/competition-rules";
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
      {!demo && data.services?.drive_mode !== "personal" && (
        <div className="p-4 mb-6 rounded-lg bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-400 dark:border-amber-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-full bg-amber-500 text-white shrink-0 mt-0.5">
              <GoogleDriveIcon size={20} />
            </span>
            <div>
              <strong className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Action Required: Connect Personal Google Drive (OAuth 2.0)
              </strong>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5 m-0 leading-relaxed">
                To upload student code files and folders into your Google Drive (15 GB quota), please authorize your Google account once.
              </p>
            </div>
          </div>
          <Button
            asChild
            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
            className="h-9 px-4 text-xs font-bold shrink-0 hover:bg-blue-700 cursor-pointer shadow-sm"
          >
            <a href="/auth/drive/start">
              <GoogleDriveIcon size={14} /> Connect Google Drive
            </a>
          </Button>
        </div>
      )}
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
                              download={`${(s.student_name || "student").replace(/[^a-zA-Z0-9_-]/g, "_")}_vspark_project.zip`}
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

  const students = data.students.filter(
    (s) =>
      (filter === "all" || s.status === filter) &&
      `${s.full_name} ${s.email} ${s.university_name}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  const totalPages = Math.max(1, Math.ceil(students.length / perPage));
  const paginatedStudents = students.slice((page - 1) * perPage, page * perPage);

  async function review(id: string, status: "approved" | "rejected") {
    setBusy(id);
    setError("");
    let notice = "";
    try {
      if (demo) {
        update((d) => ({
          ...d,
          students: d.students.map((s) => (s.id === id ? { ...s, status } : s)),
          profile: d.profile?.id === id ? { ...d.profile, status } : d.profile,
        }));
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
                              download={`${(s.full_name || "student").replace(/[^a-zA-Z0-9_-]/g, "_")}_${(s.email || "user").replace(/[^a-zA-Z0-9_@-]/g, "_")}_vspark_project.zip`}
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
  const [sendingResults, setSendingResults] = useState(false);
  const [resultsModal, setResultsModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });
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

  const handleSendResults = async () => {
    if (!data.settings.results_published) {
      notify("Please turn ON 'Publish results' in Competition Settings first.");
      return;
    }
    const confirmed = window.confirm(
      "Dispatch official Results & Leaderboard emails to all participants?\n\nThis will send custom podium champion emails to the Top 3 winners and general results notification to all other participants."
    );
    if (!confirmed) return;

    setSendingResults(true);
    try {
      const res = await fetch("/api/admin/send-results-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || "Failed to dispatch results email.");
      setResultsModal({
        isOpen: true,
        title: "Results Dispatched Successfully!",
        message: "Final scores and winner congratulations have been emailed to participants.",
      });
      notify("Results emails dispatched.");
    } catch (err) {
      notify((err as Error).message);
    } finally {
      setSendingResults(false);
    }
  };

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
          <div className="flex items-center gap-2">
            <Button
              type="button"
              disabled={sendingResults || !data.settings.results_published}
              onClick={handleSendResults}
              className={`h-9 px-4 inline-flex items-center gap-2 text-xs font-bold rounded-[2px] shadow-xs cursor-pointer ${
                data.settings.results_published
                  ? "bg-amber-600 hover:bg-amber-700 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
              }`}
              title={
                data.settings.results_published
                  ? "Email results and leaderboard links to all participants"
                  : "Publish results in Settings first to enable results emailing"
              }
            >
              {sendingResults ? <RefreshCw size={14} className="animate-spin" /> : <Award size={14} />}
              <span>{sendingResults ? "Sending..." : "Send Results Email"}</span>
            </Button>
            <Button asChild variant="outline" className="h-9 text-xs">
              <Link href="/admin/settings">
                <Trophy size={14} />
                {data.settings.results_published ? "Results Published" : "Publish Results"}
              </Link>
            </Button>
          </div>
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
                  download={`${(selected.student_name || "student").replace(/[^a-zA-Z0-9_-]/g, "_")}_vspark_project.zip`}
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
      <FigmaSuccessModal
        isOpen={resultsModal.isOpen}
        onClose={() => setResultsModal((prev) => ({ ...prev, isOpen: false }))}
        title={resultsModal.title}
        message={resultsModal.message}
      />
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
  const formRef = useRef<HTMLFormElement>(null);
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
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

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

      const rawEvaluatorEmail = String(form.get("evaluator_email") || "").trim();
      const rawBankName = String(form.get("bank_name") || "").trim();
      const rawBankTitle = String(form.get("bank_title") || "").trim();
      const rawBankAccount = String(form.get("bank_account") || "").trim();
      const rawBankIban = String(form.get("bank_iban") || "").trim();
      const rawFeeAmount = String(form.get("fee_amount") || "").trim();
      const rawTechStack = String(form.get("allowed_tech_stack") || "").trim();

      let updatedTaskDesc = String(form.get("task_description")).trim();
      const existingCfg = extractConfigFromDescription(data.settings.task_description) || DEFAULT_CONFIG;
      const newCfg = extractConfigFromDescription(updatedTaskDesc);
      const mergedCfg = {
        ...existingCfg,
        ...newCfg,
        ...(rawEvaluatorEmail ? { evaluatorEmail: rawEvaluatorEmail } : {}),
        ...(rawBankName ? { bankName: rawBankName } : {}),
        ...(rawBankTitle ? { accountTitle: rawBankTitle } : {}),
        ...(rawBankAccount ? { accountNumber: rawBankAccount } : {}),
        ...(rawFeeAmount ? { feeAmount: rawFeeAmount } : {}),
        ...(rawTechStack ? { allowedTechStack: rawTechStack } : {}),
      };
      updatedTaskDesc = embedConfigInDescription(updatedTaskDesc, mergedCfg);

      const next: Settings = {
        ...data.settings,
        title: String(form.get("title")).trim(),
        task_description: updatedTaskDesc,
        start_time: start,
        end_time: end,
        submission_mode: mode,
        results_published: published,
        event_location: String(form.get("event_location")).trim(),
        bank_name: rawBankName || data.settings.bank_name || "Easypaisa / HBL",
        bank_title: rawBankTitle || data.settings.bank_title || "COMSATS Web Society",
        bank_account: rawBankAccount || data.settings.bank_account || "0123 4567 8901 23",
        bank_iban: rawBankIban || data.settings.bank_iban || "PK00HBLB01234567890123",
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
        form.set("evaluator_email", rawEvaluatorEmail || mergedCfg.evaluatorEmail || "");
        form.set("fee_amount", rawFeeAmount || mergedCfg.feeAmount || "");
        form.set("allowed_tech_stack", rawTechStack || mergedCfg.allowedTechStack || "");
        form.set("bank_name", next.bank_name);
        form.set("bank_title", next.bank_title);
        form.set("bank_account", next.bank_account);
        form.set("bank_iban", next.bank_iban);

        await request("admin/settings", { method: "POST", body: form });

        // Atomic sync with bank and rules endpoint
        try {
          await request("bank", {
            method: "POST",
            body: JSON.stringify({
              accountTitle: next.bank_title,
              accountNumber: next.bank_account,
              bankName: next.bank_name,
              feeAmount: rawFeeAmount || mergedCfg.feeAmount || "Rs. 500",
              allowedTechStack: rawTechStack || mergedCfg.allowedTechStack,
              evaluatorEmail: rawEvaluatorEmail || mergedCfg.evaluatorEmail || "aliblogspot769@gmail.com",
            }),
          });
        } catch (syncErr) {
          console.warn("Bank sync fallback warning:", syncErr);
        }

        await refresh();
      }

      setSuccessModal({
        isOpen: true,
        title: "Competition Settings Saved!",
        message: demo && filename
          ? "Demo settings saved successfully. The PDF was not uploaded."
          : "Competition settings, evaluator email, banking details, and rules updated successfully.",
      });
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
        action={
          <Button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={busy}
            style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
            className="h-10 px-5 inline-flex items-center gap-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-[2px] shadow-sm cursor-pointer"
          >
            {busy ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{busy ? "Saving Settings..." : "Save Settings"}</span>
          </Button>
        }
      />
      <form ref={formRef} className="settings-layout" onSubmit={save}>
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

          {/* Faculty Evaluator Data Access Email */}
          <section className="card settings-card">
            <div className="settings-section-title">
              <span className="stat-icon violet">
                <Mail size={20} />
              </span>
              <div>
                <h3>Faculty Evaluator Data Access Email</h3>
                <p>Collaborator access email for private student GitHub repositories.</p>
              </div>
            </div>
            <div className="form-stack">
              <label>
                Faculty Evaluator / Collaborator Email
                <input
                  type="email"
                  name="evaluator_email"
                  defaultValue={currentConfig.evaluatorEmail || "aliblogspot769@gmail.com"}
                  placeholder="faculty@university.edu or aliblogspot769@gmail.com"
                />
              </label>
              <p className="control-explanation">
                Students will be instructed to invite this email as a collaborator to their private GitHub repository during code submission.
              </p>
            </div>
          </section>

          {/* Banking & Registration Fee Details */}
          <section className="card settings-card">
            <div className="settings-section-title">
              <span className="stat-icon green">
                <Landmark size={20} />
              </span>
              <div>
                <h3>Bank Transfer &amp; Registration Fee Details</h3>
                <p>
                  Published on the public portal and shown during student registration fee deposit.
                </p>
              </div>
            </div>
            <div className="form-grid">
              <label>
                Bank / Mobile Wallet Name
                <input
                  name="bank_name"
                  maxLength={100}
                  defaultValue={currentConfig.bankName || data.settings.bank_name || "Easypaisa / HBL"}
                  placeholder="Easypaisa / HBL / JazzCash"
                />
              </label>
              <label>
                Account Title
                <input
                  name="bank_title"
                  maxLength={150}
                  defaultValue={currentConfig.accountTitle || data.settings.bank_title || "COMSATS Web Society"}
                  placeholder="e.g. COMSATS Web Society"
                />
              </label>
              <label>
                Account Number
                <input
                  name="bank_account"
                  maxLength={80}
                  defaultValue={currentConfig.accountNumber || data.settings.bank_account || "0123 4567 8901 23"}
                  placeholder="e.g. 0123 4567 8901 23"
                />
              </label>
              <label>
                Account IBAN
                <input
                  name="bank_iban"
                  maxLength={80}
                  defaultValue={data.settings.bank_iban || currentConfig.accountNumber || "PK00HBLB01234567890123"}
                  placeholder="e.g. PK00HBLB01234567890123"
                />
              </label>
              <label>
                Registration Fee Amount
                <input
                  name="fee_amount"
                  maxLength={50}
                  defaultValue={currentConfig.feeAmount || "Rs. 500"}
                  placeholder="e.g. Rs. 500"
                />
              </label>
            </div>
          </section>

          {/* Approved Tech Stack & Code Rules (Roles) */}
          <section className="card settings-card">
            <div className="settings-section-title">
              <span className="stat-icon purple">
                <BookOpen size={20} />
              </span>
              <div>
                <h3>Approved Frameworks &amp; Rules</h3>
                <p>Permitted technologies and frameworks allowed for competition projects.</p>
              </div>
            </div>
            <div className="form-stack">
              <label>
                Permitted Tech Stack &amp; Libraries
                <input
                  name="allowed_tech_stack"
                  maxLength={250}
                  defaultValue={currentConfig.allowedTechStack || "Next.js 15/16, React 19, Tailwind CSS, TypeScript / JavaScript, Supabase / PostgreSQL, Node.js, Vercel"}
                  placeholder="e.g. Next.js 15/16, React 19, Tailwind CSS..."
                />
              </label>
            </div>
          </section>

          {/* Google Drive Integration & OAuth Connect Section */}
          <section className="card settings-card">
            <div className="settings-section-title">
              <span className="stat-icon emerald">
                <GoogleDriveIcon size={20} />
              </span>
              <div>
                <h3>Google Drive Integration &amp; Storage</h3>
                <p>Connect your personal Google Drive (15 GB) to automatically store student code and folders.</p>
              </div>
            </div>

            <div className="form-stack">
              {/* Status and 1-Click Connect Button */}
              <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-[#0d1527] border border-slate-200 dark:border-[#1e293b] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                      OAuth 2.0 Connection Status
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          data.services?.drive_mode === "personal"
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-amber-500"
                        }`}
                      />
                      <strong className="text-sm text-slate-900 dark:text-slate-100">
                        {data.services?.drive_mode === "personal"
                          ? `Connected: ${data.services?.drive_account_email || "Personal Google Drive (15 GB)"}`
                          : "Personal Google Drive Not Authorized (Action Needed)"}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={connectDrive}
                      disabled={connectingDrive}
                      style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
                      className="h-10 px-5 text-xs font-bold inline-flex items-center gap-2 rounded-[4px] shadow-sm hover:bg-blue-700 cursor-pointer"
                    >
                      {connectingDrive ? (
                        <RefreshCw size={14} className="animate-spin" />
                      ) : (
                        <GoogleDriveIcon size={16} />
                      )}
                      <span>
                        {connectingDrive
                          ? "Starting Google Sign-In…"
                          : data.services?.drive_mode === "personal"
                            ? "Reconnect / Switch Google Account"
                            : "Connect Google Drive"}
                      </span>
                    </Button>
                    <a
                      href="/auth/drive/start"
                      className="text-xs text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-800"
                      title="Direct authorization link"
                    >
                      (Direct Link)
                    </a>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 m-0 leading-relaxed">
                  {data.services?.drive_mode === "personal" ? (
                    <>
                      ✅ <strong>OAuth 2.0 Active:</strong> Student submissions and source code files are automatically stored using your 15 GB personal Google Drive quota.
                    </>
                  ) : (
                    <>
                      ⚠️ <strong>OAuth Required:</strong> Google prohibits Service Accounts from uploading files into personal Google Drives (0 bytes quota). Authorize your Google account with OAuth 2.0 so student folders and all project code files upload directly into your Google Drive.
                    </>
                  )}
                </p>

                {driveCheck && (
                  <div className="p-3 rounded-[4px] bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 font-medium">
                    {driveCheck}
                  </div>
                )}
              </div>

              {/* Custom Google Drive Folder URL Input */}
              <label>
                Google Drive Destination Folder URL
                <div className="input-with-button flex items-center gap-2">
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={checkDrive}
                    disabled={checkingDrive || !driveUrl.trim()}
                  >
                    {checkingDrive ? "Verifying…" : "Verify Access"}
                  </Button>
                </div>
              </label>
              <p className="control-explanation">
                All submitted student code folders and zip packages will automatically sync to this folder.
              </p>
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

          {/* Big Prominent Save Button at Bottom of Main Column */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[6px] shadow-sm">
            <span className="text-xs text-slate-600 dark:text-slate-300">
              Save challenge brief, evaluator access email, banking fee details, and event timeline.
            </span>
            <Button
              type="submit"
              disabled={busy}
              style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
              className="w-full sm:w-auto h-11 px-8 text-xs font-bold inline-flex items-center justify-center gap-2 rounded-[2px] shadow-sm hover:bg-blue-700 cursor-pointer"
            >
              {busy ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
              <span>{busy ? "Saving Changes…" : "Save All Changes"}</span>
            </Button>
          </div>
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
            <div className="control-divider" />
            <div className="toggle-row">
              <div>
                <strong>Publish results</strong>
                <span>Reveal public leaderboard</span>
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
            {error && (
              <p className="error-message" role="alert">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={busy}
              style={{ backgroundColor: "#2563eb", color: "#ffffff" }}
              className="h-10 text-xs font-bold w-full mt-2 inline-flex items-center justify-center gap-2"
            >
              <Save size={16} />
              {busy ? "Saving changes…" : "Save changes"}
            </Button>
            <Link className="text-link" href="/results" target="_blank">
              Preview leaderboard <ArrowUpRight size={13} />
            </Link>
          </section>
        </aside>
      </form>
      <FigmaSuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
    </Workspace>
  );
}
