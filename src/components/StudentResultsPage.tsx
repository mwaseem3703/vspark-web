"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Award,
  Trophy,
  Sparkles,
  Clock,
  CheckCircle2,
  Github,
  Download,
  ExternalLink,
  ShieldCheck,
  FileCheck,
  AlertCircle,
  Printer,
  BookOpen,
  Check,
} from "lucide-react";
import { useApp } from "./provider";
import { Workspace, PageHeading, EmptyState } from "./shell";
import { OFFICIAL_RUBRIC } from "@/lib/types";

function GoogleDriveIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 87.3 78" style={{ display: "inline-block" }}>
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
      <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47" />
      <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335" />
      <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.4-4.5 1.2z" fill="#00832d" />
      <path d="m59.8 53h27.5c0-1.55-.4-3.1-1.2-4.5l-13.75-23.8c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8c.8 1.4 1.2 2.95 1.2 4.5z" fill="#ffba00" />
      <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.2 28h27.5c0-1.55-.4-3.1-1.2-4.5z" fill="#2684fc" />
    </svg>
  );
}

function getGrade(marks: number) {
  if (marks >= 90) return { label: "Grade A+", detail: "Exceptional Distinction", bg: "#f0fdf4", color: "#166534", border: "#86efac" };
  if (marks >= 80) return { label: "Grade A", detail: "Excellent Performance", bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" };
  if (marks >= 70) return { label: "Grade B+", detail: "Very Good", bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" };
  if (marks >= 60) return { label: "Grade B", detail: "Good Work", bg: "#f8fafc", color: "#334155", border: "#cbd5e1" };
  if (marks >= 50) return { label: "Grade C", detail: "Satisfactory", bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
  return { label: "Participation", detail: "Under Evaluation / Completed", bg: "#f8fafc", color: "#475569", border: "#e2e8f0" };
}

export function StudentResultsPage() {
  const { data, demo } = useApp();
  const profile = data.profile;
  const settings = data.settings;
  const isPublished = Boolean(settings.results_published);

  // Find student's submission
  const submission =
    data.submissions.find((s) => s.profile_id === profile?.id) ||
    (demo ? data.submissions[0] : null);

  const evaluation = submission?.evaluation;
  const totalScore = isPublished
    ? (typeof submission?.total_marks === "number" ? submission.total_marks : (evaluation?.total_score || 0))
    : 0;

  // Leaderboard ranking
  const leaderIndex = data.leaderboard.findIndex(
    (e) => e.id === submission?.id || e.full_name === profile?.full_name,
  );
  const rank = leaderIndex >= 0 ? leaderIndex + 1 : null;

  // Rubric scores
  const rawScores: Record<string, number> = evaluation?.scores || {};
  const grade = getGrade(totalScore);

  const handlePrintCertificate = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <Workspace>
      <PageHeading
        eyebrow="OFFICIAL EVALUATION & SCORECARD"
        title="My Competition Result"
        description="Transparent 100-mark evaluation breakdown verified by the faculty jury panel."
        action={
          isPublished && submission?.graded ? (
            <button
              onClick={handlePrintCertificate}
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#29364b] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#1e2e4e] dark:hover:text-[#60a5fa] transition-colors cursor-pointer shadow-2xs"
            >
              <Printer size={14} />
              Print Scorecard
            </button>
          ) : (
            <Link
              href="/guidelines"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-[6px] bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 dark:hover:text-blue-100 border border-blue-200 dark:border-blue-800 transition-colors"
            >
              <BookOpen size={14} />
              View 100-Mark Rubric
            </Link>
          )
        }
      />

      {/* Case 1: Results are NOT published yet */}
      {!isPublished ? (
        <div className="space-y-6">
          <div
            className="rounded-[10px] p-6 sm:p-8 shadow-xs border bg-linear-to-br from-slate-50 to-blue-50/50 border-blue-100 dark:from-[#101a2b] dark:to-[#0d1527] dark:border-[#1e293b]"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-[10px] bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-800"
                >
                  <Clock size={24} className="animate-pulse" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-2">
                    <Sparkles size={12} />
                    Evaluation In Progress
                  </div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    Jury is scoring submissions
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    Faculty evaluators are currently examining submitted source code, database architectures, and live deployments using the official 9-category 100-mark rubric. Your detailed marks and personalized feedback will appear here as soon as results are officially released.
                  </p>
                </div>
              </div>

              <Link
                href="/guidelines"
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-[6px] bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-xs shrink-0"
              >
                <BookOpen size={14} />
                Competition Guidelines
              </Link>
            </div>
          </div>

          {/* Submission status verification card */}
          <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[8px] p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldCheck size={18} className="text-emerald-600" />
              Your Project Submission Snapshot
            </h3>

            {submission ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-[#0d1527] border border-slate-200 dark:border-[#1e293b] space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium block">Submission Status</span>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 size={13} />
                      Received &amp; Locked
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-[#0d1527] border border-slate-200 dark:border-[#1e293b] space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium block">GitHub Repository</span>
                  <a
                    href={submission.github_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-bold hover:underline truncate max-w-full pt-1"
                  >
                    <Github size={14} />
                    <span className="truncate">{submission.github_url}</span>
                    <ExternalLink size={12} className="shrink-0" />
                  </a>
                </div>

                <div className="p-4 rounded-[6px] bg-slate-50 dark:bg-[#0d1527] border border-slate-200 dark:border-[#1e293b] space-y-1">
                  <span className="text-slate-500 dark:text-slate-400 font-medium block">Backup Code Archive</span>
                  <div className="pt-1 flex items-center gap-2">
                    {submission.storage_archive_url && (
                      <a
                        href={submission.storage_archive_url}
                        target="_blank"
                        rel="noreferrer"
                        download
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-white dark:bg-[#101a2b] border border-slate-300 dark:border-[#29364b] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1e2e4e] dark:hover:text-[#60a5fa]"
                        title="Download ZIP"
                      >
                        <Download size={14} />
                        Source ZIP
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                No submission was recorded for this account before the deadline.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Case 2: Results ARE published */
        <div className="space-y-6">
          {/* Hero Scorecard Banner */}
          <div
            className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[10px] p-6 sm:p-7 shadow-xs"
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    style={{
                      backgroundColor: grade.bg,
                      color: grade.color,
                      border: `1px solid ${grade.border}`,
                      padding: "4px 12px",
                      borderRadius: "9999px",
                      fontSize: "12px",
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    {grade.label}
                  </span>

                  {rank && rank <= 3 && (
                    <span
                      style={{
                        backgroundColor: "#fef3c7",
                        color: "#92400e",
                        border: "1px solid #fde68a",
                        padding: "4px 12px",
                        borderRadius: "9999px",
                        fontSize: "12px",
                        fontWeight: 800,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <Trophy size={13} />
                      Podium Winner · Rank #{rank}
                    </span>
                  )}

                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {grade.detail}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  {profile?.full_name || "Participant"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  {profile?.university_name || "Participant Institution"} · Official Scorecard
                </p>
              </div>

              {/* Big Score Display */}
              <div
                className="flex items-center gap-5 bg-slate-50 dark:bg-[#0d1527] p-4 sm:px-6 sm:py-4 rounded-[10px] border border-slate-200 dark:border-[#1e293b]"
              >
                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    TOTAL MARKS
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 font-mono tracking-tight mt-0.5">
                    {totalScore}
                    <span className="text-slate-400 text-lg font-normal"> / 100</span>
                  </div>
                </div>

                <div
                  className="w-px h-11 bg-slate-200 dark:bg-slate-700"
                />

                <div className="text-center">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    PERCENTAGE
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-blue-600 dark:text-blue-400 font-mono tracking-tight mt-0.5">
                    {Math.round((totalScore / 100) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 9-Criteria Marks Breakdown Table */}
          <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[8px] overflow-hidden shadow-2xs">
            <div className="p-5 border-b border-slate-200 dark:border-[#1e293b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileCheck size={18} className="text-blue-600 dark:text-blue-400" />
                  Official 9-Category Evaluation Rubric
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Breakdown based on the university standard PDF evaluation specification.
                </p>
              </div>

              <Link
                href="/guidelines"
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1"
              >
                View Full Guidelines <ExternalLink size={12} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#0d1527] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#1e293b] uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3 px-4 w-12 text-center">No.</th>
                    <th className="py-3 px-4 w-60">Criterion</th>
                    <th className="py-3 px-4">Rubric Description</th>
                    <th className="py-3 px-4 w-32 text-center">Score Progress</th>
                    <th className="py-3 px-4 w-24 text-right">Awarded</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e293b]">
                  {OFFICIAL_RUBRIC.map((crit, idx) => {
                    // Score for this criterion: from rawScores or calculated proportionally
                    const critScore =
                      typeof rawScores[crit.id] === "number"
                        ? rawScores[crit.id]
                        : totalScore > 0
                        ? Math.min(crit.max, Math.round((totalScore / 100) * crit.max))
                        : 0;

                    const percent = Math.min(100, Math.round((critScore / crit.max) * 100));

                    return (
                      <tr key={crit.id} className="hover:bg-slate-50/70 dark:hover:bg-[#17243a] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-400 text-center">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                          {crit.label}
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-300 leading-relaxed">
                          {crit.description}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-200 dark:border-slate-700">
                            <div
                              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1 inline-block">
                            {percent}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-[#0d1527] text-slate-900 dark:text-slate-100 px-2.5 py-1 rounded-[4px] border border-slate-200 dark:border-[#29364b] inline-block">
                            {critScore} / {crit.max}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50/90 dark:bg-[#0d1527] font-bold text-slate-900 dark:text-slate-100 border-t border-slate-200 dark:border-[#1e293b]">
                    <td colSpan={4} className="py-3.5 px-4 text-right uppercase text-xs tracking-wider">
                      Total Awarded Score
                    </td>
                    <td className="py-3.5 px-4 text-right text-blue-700 dark:text-blue-400 font-mono text-base font-extrabold">
                      {totalScore} / 100
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Faculty Jury Feedback Card */}
          <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[8px] p-6 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Sparkles size={18} className="text-amber-500" />
              Faculty Evaluation Remarks &amp; Feedback
            </h3>

            {submission?.admin_feedback || evaluation?.feedback ? (
              <div
                className="bg-slate-50 dark:bg-[#0d1527] border-l-4 border-blue-500 p-4 sm:p-5 rounded-r-[8px] text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed"
              >
                <p className="italic">
                  &ldquo;{submission?.admin_feedback || evaluation?.feedback}&rdquo;
                </p>
                <div className="mt-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  — {evaluation?.evaluator_name || "Faculty Jury Panel"}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                No personalized written remarks attached. Overall marks recorded above.
              </p>
            )}
          </div>

          {/* Official Certificate Card */}
          <div
            style={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              borderRadius: "10px",
              padding: "28px",
              color: "#ffffff",
              boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Award size={12} />
                  Verified Credential
                </div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Certificate of Participation &amp; Completion
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Issued to {profile?.full_name} for completing the VSpark University Web Development Competition 2026.
                </p>
              </div>

              <button
                onClick={handlePrintCertificate}
                type="button"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors shadow-sm cursor-pointer shrink-0"
              >
                <Printer size={15} />
                Print Certificate / Card
              </button>
            </div>
          </div>
        </div>
      )}
    </Workspace>
  );
}
