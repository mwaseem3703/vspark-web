"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Save,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  FileCheck2,
  RefreshCw,
} from "lucide-react";
import { Workspace, PageHeading } from "./shell";
import { CompetitionRulesModal } from "./CompetitionRulesModal";
import RichTextEditor from "./RichTextEditor";
import { useApp, request } from "./provider";
import { FigmaSuccessModal } from "./ScallopedBadge";

const DEFAULT_CHECKLIST_TEXT = `Registration, login, logout, and protected routes work.
Database is connected and full CRUD works.
File upload and retrieval work securely.
At least one external API works, with proper error handling.
App is deployed on public URL (Vercel preferred).
GitHub repository has complete source code.
Full project folder is uploaded (excluding node_modules).
README includes setup steps, env names, and process screenshots.
No real secrets or .env files committed.
Team details and links are ready for jury review.
Everything submitted before the 120-minute deadline.`;

export function AdminRulesPage() {
  const { refresh, notify } = useApp();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const [guidelinesInfo, setGuidelinesInfo] = useState({
    allowedTechStack: "Next.js 15/16, React 19, Tailwind CSS, TypeScript / JavaScript, Supabase / PostgreSQL, Node.js, Vercel",
    competitionGuidelines: "",
    gradingCriteria: "",
    checklist: DEFAULT_CHECKLIST_TEXT,
    evaluatorEmail: "aliblogspot769@gmail.com",
  });

  const fetchRules = useCallback(async () => {
    try {
      const data = await request("bank");
      if (data) {
        let checklistStr = DEFAULT_CHECKLIST_TEXT;
        if (Array.isArray(data.checklist)) {
          checklistStr = data.checklist.join("\n");
        } else if (typeof data.checklist === "string" && data.checklist.trim()) {
          checklistStr = data.checklist;
        }

        setGuidelinesInfo({
          allowedTechStack:
            data.allowedTechStack ||
            "Next.js 15/16, React 19, Tailwind CSS, TypeScript / JavaScript, Supabase / PostgreSQL, Node.js, Vercel",
          competitionGuidelines: data.competitionGuidelines || "",
          gradingCriteria: data.gradingCriteria || "",
          checklist: checklistStr,
          evaluatorEmail: data.evaluatorEmail || "aliblogspot769@gmail.com",
        });
      }
    } catch (err) {
      console.error("Failed to load rules & guidelines:", err);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleLoadPdfDefaults = () => {
    setGuidelinesInfo({
      allowedTechStack:
        "MERN Stack, React, Next.js, Django, Node.js, Tailwind CSS, Supabase, Firebase",
      competitionGuidelines: `**Duration**: Exactly 120 minutes (strict auto-freeze).
**Group Work**: Maximum 2 members per team.
**Submissions**: GitHub repository URL + Project folder upload.
**README**: Setup steps, env variable names & process screenshots required.
**Security**: Never upload real .env keys or passwords.
**Live Verification**: Judges test features and evaluate code live.`,
      gradingCriteria: `1. UI/UX and Responsiveness (10 Marks)
2. Authentication: Register, Login, Protected Routes (15 Marks)
3. Database & Full CRUD Operations (20 Marks)
4. Cloud Storage File Uploads (10 Marks)
5. External API Integration & Real Data (15 Marks)
6. Live Public Deployment: Vercel Preferred (15 Marks)
7. Code Quality, Structure & Validation (5 Marks)
8. Documentation: README & Screenshots (5 Marks)
9. Live Demo & Code Defense with Judges (5 Marks)
Total: 100 Marks`,
      checklist: DEFAULT_CHECKLIST_TEXT,
      evaluatorEmail: guidelinesInfo.evaluatorEmail || "aliblogspot769@gmail.com",
    });
    setMessage({
      text: "Loaded official Web Development Competition PDF guidelines into the editor. Review and click 'Save Rules & Guidelines' to publish.",
      type: "success",
    });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveRules = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const checklistArray = guidelinesInfo.checklist
        ? guidelinesInfo.checklist
            .split("\n")
            .map((item) => item.replace(/^[-*•\d+.]\s*/, "").trim())
            .filter(Boolean)
        : [];

      await request("bank", {
        method: "POST",
        body: JSON.stringify({
          allowedTechStack: guidelinesInfo.allowedTechStack,
          competitionGuidelines: guidelinesInfo.competitionGuidelines,
          gradingCriteria: guidelinesInfo.gradingCriteria,
          checklist: checklistArray,
          evaluatorEmail: guidelinesInfo.evaluatorEmail,
        }),
      });

      setMessage({
        text: "Competition Guidelines, Evaluation Rubric & Popup Checklist saved successfully.",
        type: "success",
      });
      setSuccessModal({
        isOpen: true,
        title: "Rules & Guidelines Saved!",
        message: "Frameworks, evaluation rubric, and popup checklist have been updated across the platform.",
      });
      notify("Rules & Evaluation Rubric saved successfully.");
      await refresh();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({
        text: (err as Error).message || "Failed to update Guidelines.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const checklistArray = guidelinesInfo.checklist
    ? guidelinesInfo.checklist
        .split("\n")
        .map((item) => item.replace(/^[-*•\d+.]\s*/, "").trim())
        .filter(Boolean)
    : [];

  return (
    <Workspace admin>
      <PageHeading
        eyebrow="EVALUATION CRITERIA & CODE LIMITS"
        title="Rules & Guidelines Management"
        description="Configure permitted frameworks, rules, 100-mark scoring rubric, and participant checklist displayed on the registration page & modal popup."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPreviewModal(true)}
              className="h-9 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-[2px] transition-colors cursor-pointer"
              title="Preview Rules Popup as Seen by Students"
            >
              <BookOpen size={14} className="text-purple-600 dark:text-purple-400" />
              <span>Preview Rules Popup</span>
            </button>

            <button
              type="button"
              onClick={handleLoadPdfDefaults}
              className="h-9 px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 rounded-[2px] border border-purple-200 dark:border-purple-800/60 transition-colors cursor-pointer"
              title="Load Official PDF Rules Template"
            >
              <Sparkles size={14} className="text-purple-600 dark:text-purple-400" />
              <span>Load PDF Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveRules()}
              disabled={loading}
              style={{ backgroundColor: "#9333ea", color: "#ffffff" }}
              className="h-9 px-4 inline-flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-[2px] shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{loading ? "Saving..." : "Save Rules & Guidelines"}</span>
            </button>
          </div>
        }
      />

      <form onSubmit={handleSaveRules} className="space-y-6 max-w-5xl">
        {/* Top Banner Alert Message */}
        {message && (
          <div
            className={`p-4 rounded-[2px] text-xs font-medium border flex items-center justify-between shadow-2xs animate-in fade-in ${
              message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
                : "bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-200 border-red-200 dark:border-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle size={16} className="text-red-600 dark:text-red-400 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-xs px-2 py-0.5 rounded cursor-pointer"
            >
              &times;
            </button>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[2px] p-6 space-y-6 shadow-2xs">
          {/* 1. Tech Stack */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              1. Approved Frameworks &amp; Permitted Tech Stack
            </label>
            <input
              type="text"
              value={guidelinesInfo.allowedTechStack}
              onChange={(e) =>
                setGuidelinesInfo({ ...guidelinesInfo, allowedTechStack: e.target.value })
              }
              placeholder="Next.js 15/16, React 19, Tailwind CSS, TypeScript / JavaScript, Supabase / PostgreSQL, Node.js, Vercel"
              className="w-full h-11 px-3.5 text-xs bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] rounded-[2px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600 shadow-2xs font-sans"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Comma-separated list of approved frontend, backend, and database technologies.
            </span>
          </div>

          {/* Faculty Evaluator Access Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
              Faculty Evaluator Access Email (GitHub Collaborator Access)
            </label>
            <input
              type="email"
              value={guidelinesInfo.evaluatorEmail}
              onChange={(e) =>
                setGuidelinesInfo({ ...guidelinesInfo, evaluatorEmail: e.target.value })
              }
              placeholder="faculty@university.edu or evaluator@gmail.com"
              className="w-full h-11 px-3.5 text-xs bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] rounded-[2px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-purple-600 shadow-2xs font-sans"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Students will be instructed to add this email as a collaborator to their private GitHub repositories during project submission.
            </span>
          </div>

          {/* 2. Guidelines & Code Rules */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                2. Competition Guidelines &amp; Code Rules
              </label>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Word-Style Toolbar (Bold, Lists, Callouts, Code)
              </span>
            </div>
            <RichTextEditor
              value={guidelinesInfo.competitionGuidelines}
              onChange={(val) =>
                setGuidelinesInfo({ ...guidelinesInfo, competitionGuidelines: val })
              }
              placeholder="Enter code packaging rules, duration, GitHub repo requirements, plagiarism policy..."
              minHeight="220px"
              helperText="Presented on the student registration page box and inside the Rules & Limits tab of the popup."
            />
          </div>

          {/* 3. Grading Criteria / 100-Marks Rubric */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100">
                3. Evaluation &amp; Grading Rubric (100 Marks Total)
              </label>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                Word-Style Toolbar (Numbered Lists, Mark Weightages)
              </span>
            </div>
            <RichTextEditor
              value={guidelinesInfo.gradingCriteria}
              onChange={(val) =>
                setGuidelinesInfo({ ...guidelinesInfo, gradingCriteria: val })
              }
              placeholder="e.g. 1. UI/UX and Responsiveness (10 Marks)\n2. Authentication (15 Marks)..."
              minHeight="220px"
              helperText="Presented on the student registration page box and inside the 100-Marks Rubric tab of the popup."
            />
          </div>

          {/* 4. Pre-Submission Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <FileCheck2 size={15} className="text-purple-600 dark:text-purple-400" />
                <span>4. Pre-Submission Checklist Items (Popup Modal - Checklist Tab)</span>
              </label>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                One requirement per line
              </span>
            </div>
            <textarea
              value={guidelinesInfo.checklist}
              onChange={(e) =>
                setGuidelinesInfo({ ...guidelinesInfo, checklist: e.target.value })
              }
              rows={8}
              placeholder="Enter checklist items, one per line..."
              className="w-full p-3.5 text-xs bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] rounded-[2px] text-slate-800 dark:text-slate-200 leading-relaxed focus:outline-none focus:border-purple-600 shadow-2xs font-mono"
            />
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
              Each line becomes an interactive checklist item with a verified green tick in the student Rules popup.
            </span>
          </div>
        </div>

        {/* Action Save Button Footer */}
        <div className="flex items-center justify-between bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[2px] p-4 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Saves and synchronizes rules, 100-marks rubric, and popup checklist across student registration &amp; modal.
          </span>
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: "#9333ea", color: "#ffffff" }}
            className="h-10 px-6 inline-flex items-center gap-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-[2px] shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{loading ? "Saving Rules..." : "Save Rules & Guidelines"}</span>
          </button>
        </div>
      </form>

      {/* Rules Modal Live Preview */}
      <CompetitionRulesModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        allowedTechStack={guidelinesInfo.allowedTechStack}
        guidelines={guidelinesInfo.competitionGuidelines}
        checklist={checklistArray}
      />
      <FigmaSuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal((prev) => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
    </Workspace>
  );
}
