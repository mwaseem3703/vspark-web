"use client";
import {
  allowedPath,
  eventState,
  MAX_FILE_SIZE,
  MAX_FILES,
  MAX_TOTAL_SIZE,
  validGithub,
} from "@/lib/competition";
import {
  cleanDescriptionText,
  extractConfigFromDescription,
} from "@/lib/competition-rules";
import type { Submission } from "@/lib/types";
import { dateLabel } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleCheck,
  Clock3,
  Code2,
  Copy,
  Download,
  ExternalLink,
  FileText,
  FolderUp,
  GitBranch,
  Github,
  Info,
  LockKeyhole,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Trophy,
  Upload,
  X,
  Users,
  Award,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import JSZip from "jszip";
import { request, useApp } from "./provider";
import { FigmaSuccessModal } from "./ScallopedBadge";
import { EmptyState, PageHeading, StatusBadge, Workspace } from "./shell";
import { Button } from "./ui/button";

export function useNow() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export function Countdown({ target }: { target: string }) {
  const now = useNow();
  const seconds = Math.max(
    0,
    Math.floor((Date.parse(target) - (now || Date.parse(target))) / 1000),
  );
  return (
    <div className="countdown">
      {[
        { v: Math.floor(seconds / 86400), l: "DAYS" },
        { v: Math.floor(seconds / 3600) % 24, l: "HOURS" },
        { v: Math.floor(seconds / 60) % 60, l: "MINUTES" },
        { v: seconds % 60, l: "SECONDS" },
      ].map((x) => (
        <div key={x.l}>
          <strong>{now ? String(x.v).padStart(2, "0") : "--"}</strong>
          <span>{x.l}</span>
        </div>
      ))}
    </div>
  );
}

export function StudentDashboard() {
  const { data, demo } = useApp();
  const now = useNow();
  const s = data.settings;
  const state = eventState(s, now || Date.now());
  const submission = data.submissions.find(
    (x) => x.profile_id === data.profile?.id || (data.profile?.team_id && data.submissions.length > 0),
  );

  // 120-minute timer calculation
  const startMs = Date.parse(s.start_time) || Date.now();
  const durationMs = (s.duration_minutes || 120) * 60 * 1000;
  const endMs = Date.parse(s.end_time) || startMs + durationMs;
  const remainingSecs = Math.max(
    0,
    Math.floor((endMs - (now || Date.now())) / 1000),
  );
  const isAutoFrozen = state !== "open" || remainingSecs <= 0;

  return (
    <Workspace>
      <PageHeading
        eyebrow="YOUR NEXT BIG THING STARTS HERE"
        title={
          data.profile?.participation_type === "team" && data.profile.team_name
            ? `Welcome, Team ${data.profile.team_name}`
            : `Welcome back, ${data.profile?.full_name.split(" ")[0] || "builder"}`
        }
        description={
          data.profile?.participation_type === "team" && data.profile.team_name
            ? `Team: ${data.profile.team_name} · ${data.profile.team_role === "leader" ? "Team Leader (Submitter)" : "Team Member"}`
            : "A little curiosity. A lot of potential. Let’s make something great."
        }
        action={
          <span className="date-chip">
            <CalendarDays size={15} />
            {demo ? "Demo workspace" : dateLabel(new Date().toISOString())}
          </span>
        }
      />

      {/* TEAM PROFILE STATUS BANNER */}
      {data.profile?.participation_type === "team" && (
        <div className="p-4 mb-6 rounded-lg bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              <Users size={16} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <strong className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Team: {data.profile.team_name}
                </strong>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                  data.profile.team_role === "leader"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                }`}>
                  {data.profile.team_role === "leader" ? <Award size={10} /> : <Users size={10} />}
                  {data.profile.team_role === "leader" ? "Team Leader (Submitter)" : "Team Member"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                Teammate: <strong className="text-slate-800 dark:text-slate-200">{data.profile.teammate_name}</strong> ({data.profile.teammate_email}) · {data.profile.department || "CS"} {data.profile.semester ? `· ${data.profile.semester}` : ""}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-[#0b1325] px-2.5 py-1 rounded border border-blue-100 dark:border-blue-900/50">
            {data.profile.team_role === "leader" ? (
              <>
                <Award size={12} className="text-blue-600 dark:text-blue-400" />
                <span>You have submitter authority</span>
              </>
            ) : (
              <>
                <Eye size={12} className="text-slate-500" />
                <span>Member view (Leader submits files)</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* FACULTY LIVE BROADCAST ANNOUNCEMENT BANNER */}
      {s.announcement ? (
        <div className="p-4 mb-6 rounded-[2px] bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-900 shadow-sm animate-in fade-in">
          <Megaphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Live Faculty Announcement
              </strong>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-800">
                Notice
              </span>
            </div>
            <p className="text-xs mt-1 text-slate-800 leading-relaxed font-medium">
              {s.announcement}
            </p>
          </div>
        </div>
      ) : (
        <div className="notice-banner">
          <Megaphone size={20} />
          <div>
            <strong>120-Minute University Web Challenge</strong>
            <p>
              Build your responsive application, keep source code clean, and
              submit before the automated freeze clock.
            </p>
          </div>
          <span className="notice-tag">ANNOUNCEMENT</span>
        </div>
      )}

      {/* STATS GRID */}
      <div className="student-stat-grid">
        <div className="stat-card">
          <span className="stat-icon mint">
            <ShieldCheck size={20} />
          </span>
          <div>
            <span>Registration status</span>
            <strong>
              You’re approved{" "}
              <span className="tiny-check">
                <Check size={12} />
              </span>
            </strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <Code2 size={20} />
          </span>
          <div>
            <span>Competition</span>
            <strong>Web development</strong>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icon violet">
            <Upload size={20} />
          </span>
          <div>
            <span>Your submission</span>
            <strong>
              {submission ? "Submitted successfully" : "Not submitted yet"}
            </strong>
          </div>
        </div>
      </div>

      <div className="student-main-grid">
        <section className="card event-card">
          <div className="card-topline">
            <span className="eyebrow">THE MAIN EVENT</span>
            <StatusBadge status={state} />
          </div>
          <h2>{s.title}</h2>
          <p>
            Your canvas is waiting. Put your ideas, design skills, and code to
            the test.
          </p>

          <div className="event-details">
            <span>
              <CalendarDays size={16} />
              {demo
                ? "Sample event schedule"
                : s.submission_mode === "closed"
                  ? "Schedule to be announced"
                  : dateLabel(s.start_time)}
            </span>
            <span>
              <Clock3 size={16} />
              {s.duration_minutes || 120}-minute timed challenge
            </span>
          </div>

          {state === "upcoming" ? (
            <div className="countdown-wrap">
              <div className="eyebrow">YOUR MOMENT BEGINS IN</div>
              <Countdown target={s.start_time} />
            </div>
          ) : state === "open" ? (
            <div className="event-live">
              <span className="pulse-dot" />
              <div>
                <strong>Your challenge is live.</strong>
                <p>
                  Time remaining:{" "}
                  <span className="font-mono font-bold text-blue-600">
                    {Math.floor(remainingSecs / 3600)}h{" "}
                    {Math.floor((remainingSecs % 3600) / 60)}m{" "}
                    {remainingSecs % 60}s
                  </span>
                </p>
              </div>
              <span>Auto-freezes at 00:00</span>
            </div>
          ) : (
            <div className="event-closed">
              <Clock3 size={23} />
              <strong>
                {(now || Date.now()) < Date.parse(s.end_time)
                  ? "Submissions are not open yet."
                  : "Event has ended."}
              </strong>
              <p>
                {submission
                  ? "Your work is in. Results will appear when published."
                  : "The submission window is currently closed."}
              </p>
            </div>
          )}

          <div className="event-card-bottom">
            {state === "open" && !isAutoFrozen ? (
              <Button asChild>
                <Link href="/dashboard/task">
                  {submission ? "View your submission" : "Start task"}
                  <ArrowUpRight size={17} />
                </Link>
              </Button>
            ) : submission ? (
              <Button asChild variant="outline">
                <Link href="/dashboard/task">
                  View submitted project <ArrowUpRight size={16} />
                </Link>
              </Button>
            ) : (
              <Button disabled variant="outline">
                <LockKeyhole size={15} />
                {state === "upcoming"
                  ? "Task unlocks when event starts"
                  : "Submission portal locked"}
              </Button>
            )}
            <span>
              <ShieldCheck size={14} />
              {state === "open" && !isAutoFrozen
                ? "You’re ready to go"
                : "We’ll keep you posted"}
            </span>
          </div>
        </section>

        <aside className="card preparation-card">
          <span className="feature-icon">
            <FileText size={23} />
          </span>
          <h3>A little prep goes a long way.</h3>
          <p>Get set for a great competition.</p>
          <ul className="check-list">
            <li>
              <CheckCircle2 size={17} />
              <div>
                <strong>Check your toolkit</strong>
                <span>Next.js, React 19, Tailwind CSS, Supabase ready.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 size={17} />
              <div>
                <strong>GitHub Public Repo</strong>
                <span>Ensure repo is public for jury review.</span>
              </div>
            </li>
            <li>
              <CheckCircle2 size={17} />
              <div>
                <strong>Clean Folder Upload</strong>
                <span>
                  Node_modules, .next, and .git are automatically removed.
                </span>
              </div>
            </li>
            <li>
              <CheckCircle2 size={17} />
              <div>
                <strong>Mind the 120-min clock</strong>
                <span>Submit before the portal freezes.</span>
              </div>
            </li>
          </ul>
        </aside>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="card profile-card">
          <div className="card-heading">
            <h3>Your participant card</h3>
            <ShieldCheck size={18} className="text-blue" />
          </div>
          <div className="participant-info">
            <span className="avatar avatar-lg">
              {data.profile?.full_name
                .split(" ")
                .map((x) => x[0])
                .slice(0, 2)
                .join("")}
            </span>
            <div>
              <strong>{data.profile?.full_name}</strong>
              <span>{data.profile?.university_name}</span>
              <span>{data.profile?.email}</span>
            </div>
            <StatusBadge status="approved" />
          </div>
        </section>

        <section className="leaderboard-teaser">
          <div>
            <span className="eyebrow">AIM HIGH</span>
            <h3>Your name could be up here.</h3>
            <p>The leaderboard is where great work gets its moment.</p>
            <Link href="/results" className="text-link">
              {s.results_published
                ? "See the leaderboard"
                : "View results status"}
              <ArrowRight size={15} />
            </Link>
          </div>
          <Trophy size={64} strokeWidth={1.1} />
        </section>
      </div>
    </Workspace>
  );
}

export function TaskPage() {
  const { data, demo, update, refresh, notify } = useApp();
  const now = useNow();
  const s = data.settings;
  const state = eventState(s, now || Date.now());
  const submission = data.submissions.find(
    (x) => x.profile_id === data.profile?.id || (data.profile?.team_id && data.submissions.length > 0),
  );

  // 120-min countdown timer
  const startMs = Date.parse(s.start_time) || Date.now();
  const durationMs = (s.duration_minutes || 120) * 60 * 1000;
  const endMs = Date.parse(s.end_time) || startMs + durationMs;
  const remainingSecs = Math.max(
    0,
    Math.floor((endMs - (now || Date.now())) / 1000),
  );
  const isTimeExpired = remainingSecs <= 0 && s.submission_mode !== "open";
  const config = extractConfigFromDescription(s.task_description);

  const [files, setFiles] = useState<File[]>([]);
  const [excluded, setExcluded] = useState(0);
  const [github, setGithub] = useState(submission?.github_url || "");
  const [driveUrl, setDriveUrl] = useState(submission?.drive_folder_url || "");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [done, setDone] = useState(false);
  const picker = useRef<HTMLInputElement>(null);

  // Confirmation Modal and Evaluator Collaborator State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [hasConfirmedRules, setHasConfirmedRules] = useState(false);
  const [copiedEvaluatorEmail, setCopiedEvaluatorEmail] = useState(false);
  const EVALUATOR_GITHUB_EMAIL =
    config.evaluatorEmail || "aliblogspot769@gmail.com";

  function selectFiles(list: FileList | null) {
    const all = Array.from(list || []);
    // Auto-filter: excludes node_modules, .next, .git, .env*, build artifacts
    const good = all.filter((f) => allowedPath(f.webkitRelativePath || f.name));
    setExcluded(all.length - good.length);
    setError("");
    setFiles([]);

    if (good.length > MAX_FILES) {
      return setError(
        `Choose at most ${MAX_FILES} source files after filtering.`,
      );
    }
    if (good.some((f) => f.size > MAX_FILE_SIZE)) {
      return setError(
        "Each source file must be smaller than 3 MB. Remove large media assets.",
      );
    }
    if (good.reduce((n, f) => n + f.size, 0) > MAX_TOTAL_SIZE) {
      return setError(
        "Your source folder must be smaller than 100 MB after filtering.",
      );
    }
    setFiles(good);
  }

  function handleInitiateSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!validGithub(github)) {
      return setError(
        "Enter a valid public GitHub repository URL (e.g. https://github.com/you/project).",
      );
    }
    if (!files.length && !driveUrl) {
      return setError(
        "Please select your clean project folder or provide your Google Drive link.",
      );
    }
    if (!accepted) {
      return setError("Please confirm that this is your own original work.");
    }

    setHasConfirmedRules(false);
    setShowConfirmModal(true);
  }

  async function executeFinalSubmission() {
    setBusy(true);
    setProgress(0);
    setError("");

    try {
      if (demo) {
        const entry: Submission = {
          id: crypto.randomUUID(),
          profile_id: data.profile!.id,
          github_url: github,
          drive_folder_url: driveUrl || s.google_drive_folder_url || "",
          total_marks: 0,
          graded: false,
          admin_feedback: "",
          submitted_at: new Date().toISOString(),
          student_name: data.profile!.full_name,
          university_name: data.profile!.university_name,
        };
        update((d) => ({ ...d, submissions: [...d.submissions, entry] }));
        setProgress(100);
        notify(
          "Demo submission saved in this browser. Files were not uploaded.",
        );
      } else {
        // Direct Folder Submission with Google Drive destination
        let finalDriveUrl = driveUrl || s.google_drive_folder_url || "";

        // Start upload session
        const session = await request("upload/start", {
          method: "POST",
          body: JSON.stringify({
            files: files.map((f) => ({
              path: f.webkitRelativePath || f.name,
              size: f.size,
            })),
            github_url: github,
            drive_folder_url: finalDriveUrl,
          }),
        });

        if (files.length > 0) {
          // Upload files in parallel batches of 5
          const batchSize = 5;
          for (let i = 0; i < files.length; i += batchSize) {
            const batch = files.slice(i, i + batchSize);
            await Promise.all(
              batch.map(async (file) => {
                const form = new FormData();
                form.set("session_id", session.id);
                form.set("path", file.webkitRelativePath || file.name);
                form.set("file", file);
                return request("upload/file", { method: "POST", body: form });
              }),
            );
            setProgress(Math.round(((i + batch.length) / files.length) * 95));
          }
        }

        // Package ZIP archive in client memory to avoid server 504 timeouts
        let clientArchiveBlob: Blob | null = null;
        if (files.length > 0) {
          try {
            const zip = new JSZip();
            for (const f of files) {
              const relPath = f.webkitRelativePath || f.name;
              zip.file(relPath, f);
            }
            clientArchiveBlob = await zip.generateAsync({
              type: "blob",
              compression: "DEFLATE",
              compressionOptions: { level: 4 },
            });
          } catch (zipErr) {
            console.warn("Client-side zip packaging notice:", zipErr);
          }
        }

        // Finalize submission with pre-packaged ZIP
        const completeForm = new FormData();
        completeForm.set("session_id", session.id);
        completeForm.set("github_url", github);
        completeForm.set("drive_folder_url", finalDriveUrl);
        if (clientArchiveBlob) {
          const safeName = (data.profile?.full_name || "student").replace(/[^a-zA-Z0-9_-]/g, "_");
          const safeEmail = (data.profile?.email || "user").replace(/[^a-zA-Z0-9_@-]/g, "_");
          const zipFileName = `${safeName}_${safeEmail}_vspark_project.zip`;
          completeForm.set("archive", clientArchiveBlob, zipFileName);
        }

        await request("upload/complete", {
          method: "POST",
          body: completeForm,
        });

        setProgress(100);
        await refresh();
        notify("Your project was submitted successfully!");
      }
      setShowConfirmModal(false);
      setShowSuccessModal(true);
      setDone(true);
      setFiles([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const isFrozen = state !== "open" || isTimeExpired;

  return (
    <Workspace>
      <PageHeading
        eyebrow="IMAGINE. BUILD. GO BEYOND."
        title="Your challenge. Your canvas."
        description="Read the brief, make it yours, and submit clean code before the clock freezes."
        action={
          <StatusBadge
            status={state === "open" && !isFrozen ? "open" : "closed"}
          />
        }
      />

      {/* AUTO-FREEZE ALERT WHEN TIME EXPIRED */}
      {isFrozen && !submission && (
        <div className="p-4 mb-6 rounded-[2px] bg-red-50 border border-red-200 flex items-start gap-3 text-red-900 shadow-sm animate-in fade-in">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-xs font-bold uppercase tracking-wider text-red-800">
              120-Minute Competition Window Ended
            </strong>
            <p className="text-xs mt-1 text-red-700 leading-relaxed">
              The submission portal has automatically frozen. Submissions are no
              longer accepted.
            </p>
          </div>
        </div>
      )}

      {submission || done ? (
        <section className="card submission-success">
          <span className="success-icon">
            <CircleCheck size={37} />
          </span>
          <div className="eyebrow">NICE WORK, BUILDER</div>
          <h2>Your work is in.</h2>
          <p>
            {demo
              ? "Your demo submission is saved locally. No files have been sent to Google Drive."
              : "Your project was received. The faculty jury will evaluate your work and publish the results."}
          </p>

          {submission && (
            <>
              <div className="submission-receipt">
                <span>
                  <Check size={16} />
                  Submitted {new Date(submission.submitted_at).toLocaleString()}
                </span>
                <a
                  className="text-link"
                  href={submission.github_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github size={17} /> GitHub repository{" "}
                  <ArrowUpRight size={14} />
                </a>
                {submission.storage_archive_url && (
                  <a
                    className="text-link"
                    href={submission.storage_archive_url}
                    target="_blank"
                    rel="noreferrer"
                    download
                  >
                    <Download size={17} /> Project Code Archive (ZIP){" "}
                    <ArrowUpRight size={14} />
                  </a>
                )}
              </div>

              {s.results_published && submission.graded && (
                <div className="your-score">
                  <span>Your score</span>
                  <strong>
                    {submission.total_marks}
                    <small>/100</small>
                  </strong>
                  {submission.admin_feedback && (
                    <p>{submission.admin_feedback}</p>
                  )}
                </div>
              )}
            </>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/results">
                View leaderboard <ArrowUpRight size={16} />
              </Link>
            </Button>
          </div>
        </section>
      ) : isFrozen ? (
        <section className="card">
          <EmptyState
            icon={LockKeyhole}
            title="The submission window is frozen."
            description="The 120-minute countdown has expired and submissions are permanently locked."
          >
            <Button asChild variant="outline">
              <Link href="/dashboard">
                Back to dashboard <ArrowRight size={16} />
              </Link>
            </Button>
          </EmptyState>
        </section>
      ) : (
        <div className="task-grid">
          {/* LEFT: THE BRIEF */}
          <section className="card task-brief">
            <div className="card-topline">
              <span className="eyebrow">THE BRIEF</span>
              <FileText size={19} />
            </div>
            <h2>{s.title}</h2>
            <div className="task-description whitespace-pre-wrap leading-relaxed text-slate-700 text-sm">
              {cleanDescriptionText(s.task_description)}
            </div>

            {s.task_pdf_url && (
              <Button asChild variant="outline">
                <a href={s.task_pdf_url} target="_blank" rel="noreferrer">
                  <Download size={16} /> Download task PDF
                </a>
              </Button>
            )}

            <div className="info-note">
              <Info size={17} />
              <p>
                Focus on a complete, working experience. Include setup
                instructions in your README so the reviewers can test your
                project.
              </p>
            </div>
          </section>

          {/* RIGHT: THE SUBMISSION FORM OR TEAM MEMBER RESTRICTED VIEW */}
          {data.profile?.participation_type === "team" && data.profile?.team_role === "member" ? (
            <section className="card submission-form">
              <div className="eyebrow">TEAM WORKSPACE</div>
              <h2>Member View</h2>
              <div className="p-6 rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center space-y-3.5 my-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center mx-auto font-bold">
                  <Users size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-1">
                    Team Member: Submission View Only
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                    You are registered as a Team Member under <strong className="text-blue-600 dark:text-blue-400">{data.profile.team_name}</strong>.
                    Per competition guidelines, only your Team Leader (<strong className="text-slate-800 dark:text-slate-200">{data.profile.teammate_name || "Team Leader"}</strong>) has the authority to upload source files and provide the GitHub repository link.
                  </p>
                </div>
                <div className="p-3 bg-white dark:bg-[#0b1325] rounded border border-blue-100 dark:border-blue-900/50 text-xs text-slate-700 dark:text-slate-300 text-left space-y-1">
                  <div>• <strong>Team:</strong> {data.profile.team_name}</div>
                  <div>• <strong>Team Leader:</strong> {data.profile.teammate_name} ({data.profile.teammate_email})</div>
                  <div>• <strong>Submission Status:</strong> Awaiting submission from {data.profile.teammate_name?.split(" ")[0] || "leader"}</div>
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Once your leader submits the project, your dashboard will automatically refresh with the submission receipt, GitHub repo link, and jury marks.
                </p>
              </div>
            </section>
          ) : (
            <section className="card submission-form">
              <div className="eyebrow">THE FINISH LINE</div>
              <h2>Make it official.</h2>
              <p>Your public GitHub repository + clean source files.</p>

              <form className="form-stack" onSubmit={handleInitiateSubmit}>
                {/* Faculty Evaluator Access Info Box */}
                <div className="p-3 mb-1.5 rounded-[4px] bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                      <GitBranch
                        size={13}
                        className="text-blue-600 dark:text-blue-400"
                      />
                      Faculty Evaluator GitHub Access
                    </span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-300 font-semibold px-1.5 py-0.5 rounded">
                      Collaborator
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 m-0 mb-2 leading-relaxed">
                    Add this as a collaborator to your GitHub repository
                  </p>
                  <div className="flex items-center justify-between p-2 rounded bg-white dark:bg-[#0b1325] border border-blue-200/90 dark:border-blue-900/50">
                    <span className="font-mono font-bold text-xs text-blue-700 dark:text-blue-300 select-all">
                      {EVALUATOR_GITHUB_EMAIL}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(EVALUATOR_GITHUB_EMAIL);
                        setCopiedEvaluatorEmail(true);
                        setTimeout(() => setCopiedEvaluatorEmail(false), 2000);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border border-blue-200 dark:border-blue-800 cursor-pointer"
                    >
                      {copiedEvaluatorEmail ? (
                        <Check size={11} className="text-emerald-600" />
                      ) : (
                        <Copy size={11} />
                      )}
                      {copiedEvaluatorEmail ? "Copied" : "Copy Email"}
                    </button>
                  </div>
                </div>

                {/* GitHub Repo */}
                <label>
                  GitHub repository URL <span className="text-red-500">*</span>
                  <div className="input-with-icon">
                    <Github size={17} />
                    <input
                      type="url"
                      placeholder="https://github.com/your-username/vspark-project"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      required
                      disabled={busy}
                    />
                  </div>
                </label>

                {/* Folder Selector */}
                <label>
                  Source code folder
                  <span className="file-drop folder-drop">
                    <FolderUp size={30} />
                    <strong>
                      {files.length
                        ? `${files.length} clean source files ready`
                        : "Choose your project folder"}
                    </strong>
                    <span>
                      {files.length
                        ? `${(files.reduce((n, f) => n + f.size, 0) / 1024 / 1024).toFixed(2)} MB · ${excluded} files (node_modules, .next, .git) excluded automatically`
                        : "Click to select your source directory · Clean files only"}
                    </span>
                    <input
                      ref={picker}
                      type="file"
                      {...({
                        webkitdirectory: "",
                        directory: "",
                      } as InputHTMLAttributes<HTMLInputElement>)}
                      multiple
                      onChange={(e) => selectFiles(e.target.files)}
                      aria-label="Choose project folder"
                      disabled={busy}
                    />
                  </span>
                </label>

                {/* Selected Files Badge */}
                {files.length > 0 && (
                  <div className="selected-files">
                    <div>
                      <strong>Ready for Google Drive upload</strong>
                      <button
                        type="button"
                        aria-label="Remove selected folder"
                        disabled={busy}
                        onClick={() => {
                          setFiles([]);
                          if (picker.current) picker.current.value = "";
                        }}
                      >
                        <X size={15} />
                      </button>
                    </div>
                    {files.slice(0, 4).map((f) => (
                      <span key={f.webkitRelativePath || f.name}>
                        <FileText size={13} />
                        {f.webkitRelativePath || f.name}
                        <Check size={13} />
                      </span>
                    ))}
                    {files.length > 4 && (
                      <small>+ {files.length - 4} more files</small>
                    )}
                  </div>
                )}

                {/* Optional Direct Drive Link */}
                <label>
                  Google Drive Link{" "}
                  <span className="label-hint">Optional backup</span>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/drive/folders/..."
                    value={driveUrl}
                    onChange={(e) => setDriveUrl(e.target.value)}
                    disabled={busy}
                  />
                </label>

                <div className="upload-note">
                  <ShieldCheck size={16} />
                  <span>
                    Dependencies, build outputs, environment files, and private
                    keys are automatically stripped.
                  </span>
                </div>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    required
                    disabled={busy}
                  />
                  <span>
                    I confirm that this submission is my own original work.
                  </span>
                </label>

                {busy && (
                  <div
                    className="upload-progress"
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div>
                      <span>Uploading your project files…</span>
                      <strong>{progress}%</strong>
                    </div>
                    <span>
                      <i style={{ width: `${progress}%` }} />
                    </span>
                    <small>Keep this tab open until the upload completes.</small>
                  </div>
                )}

                {error && (
                  <p className="error-message" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" size="lg" disabled={busy}>
                  {busy ? (
                    <>
                      <span className="spinner" /> Uploading…
                    </>
                  ) : (
                    <>
                      Review & submit project <ArrowUpRight size={17} />
                    </>
                  )}
                </Button>

                <p className="form-footnote">
                  One final submission per participant. Review before submitting.
                </p>
              </form>
            </section>
          )}
        </div>
      )}

      {/* Submission Confirmation & Collaborator Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[2px] max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-[2px] border border-amber-200 dark:border-amber-900/50">
                  {submission ? "Resubmission Check" : "Final Submission Check"}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {submission
                    ? "Confirm Project Resubmission"
                    : "Confirm Project Submission"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-[2px] transition-colors cursor-pointer"
                disabled={busy}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body: Submission Details */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 dark:bg-[#0d1527] border border-slate-200 dark:border-[#1e293b] rounded-[2px] space-y-2">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                  <span>Participant:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {data.profile?.participation_type === "team" && data.profile.team_name ? (
                      <>
                        <Users size={12} className="inline mr-1 text-blue-600" /> Team {data.profile.team_name} ({data.profile.full_name})
                      </>
                    ) : (
                      <>
                        {data.profile?.full_name || "Participant"} ({data.profile?.email})
                      </>
                    )}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 border-t border-slate-200/60 dark:border-slate-800/80 pt-2">
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    GitHub Repository to be evaluated:
                  </span>
                  <a
                    href={github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 truncate"
                  >
                    <GitBranch
                      size={13}
                      className="shrink-0 text-slate-400 dark:text-slate-500"
                    />
                    <span className="truncate">{github}</span>
                    <ExternalLink size={11} className="shrink-0" />
                  </a>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200/60 dark:border-slate-800/80 pt-2 text-slate-600 dark:text-slate-300">
                  <span>Code Archive:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {files.length > 0
                      ? `${files.length} clean source files staged (${(files.reduce((n, f) => n + f.size, 0) / 1024 / 1024).toFixed(2)} MB)`
                      : driveUrl
                        ? "Google Drive Link backup provided"
                        : "Repository link only"}
                  </span>
                </div>
              </div>

              {/* Evaluator Collaborator Box */}
              <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-[2px] space-y-2">
                <div className="flex items-center justify-between text-blue-900 dark:text-blue-200 font-bold">
                  <span className="flex items-center gap-1.5">
                    <GitBranch
                      size={13}
                      className="text-blue-600 dark:text-blue-400"
                    />
                    Faculty Evaluator GitHub Access
                  </span>
                </div>
                <p className="text-[11px] text-blue-900 dark:text-blue-200 leading-relaxed">
                  Please verify that your GitHub repo is <strong>Public</strong>
                  , OR you have added the faculty evaluator email as a
                  collaborator:
                </p>
                <div className="flex items-center justify-between bg-white dark:bg-[#0b1325] border border-blue-200 dark:border-blue-900/60 rounded-[2px] p-2 font-mono text-xs">
                  <span className="text-blue-900 dark:text-blue-200 font-semibold truncate select-all">
                    {EVALUATOR_GITHUB_EMAIL}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(EVALUATOR_GITHUB_EMAIL);
                      setCopiedEvaluatorEmail(true);
                      setTimeout(() => setCopiedEvaluatorEmail(false), 2000);
                    }}
                    className="h-6 px-2 inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-[2px] transition-colors cursor-pointer"
                  >
                    {copiedEvaluatorEmail ? (
                      <>
                        <Check
                          size={12}
                          className="text-emerald-600 dark:text-emerald-400"
                        />{" "}
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy size={12} /> Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mandatory Confirmation Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-[2px] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 cursor-pointer select-none">
                <input
                  type="checkbox"
                  disabled={busy}
                  checked={hasConfirmedRules}
                  onChange={(e) => setHasConfirmedRules(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded-[2px] text-blue-600 border-slate-300 dark:border-[#29364b] focus:ring-blue-500 cursor-pointer shrink-0 disabled:opacity-50"
                />
                <span className="text-[11px] text-amber-950 dark:text-amber-200 leading-relaxed">
                  {submission
                    ? "I confirm that evaluator access is granted to my repository, and I understand that submitting this update will replace my previous project submission for faculty evaluation."
                    : "I confirm that evaluator access is granted to my repository, and I understand that after submitting, this project is permanently finalized and cannot be modified or re-uploaded without admin permission."}
                </span>
              </label>

              {/* In-Modal Upload Progress Indicator */}
              {busy && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-[2px] flex items-center gap-2.5 text-xs text-blue-900 dark:text-blue-200 animate-pulse">
                  <RefreshCw
                    size={14}
                    className="animate-spin text-blue-600 dark:text-blue-400 shrink-0"
                  />
                  <span>
                    Uploading files to storage and recording submission (
                    {progress}%)…
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={busy}
                className="flex-1 h-10 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-[2px] transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeFinalSubmission}
                disabled={!hasConfirmedRules || busy}
                style={{
                  backgroundColor:
                    !hasConfirmedRules || busy ? "#94a3b8" : "#2563eb",
                  color: "#ffffff",
                  borderRadius: "2px",
                }}
                className="flex-1 h-10 inline-flex items-center justify-center gap-2 text-xs font-bold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {busy ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Finalizing & Uploading…</span>
                  </>
                ) : submission ? (
                  <span>Update & Submit Project</span>
                ) : (
                  <span>Final Submit Project</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Figma Success Modal */}
      <FigmaSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Project Submitted Successfully!"
        message="Your GitHub repository and source code have been safely recorded for faculty evaluation. Good luck!"
        buttonLabel="Done"
      />
    </Workspace>
  );
}
