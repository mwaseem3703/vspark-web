"use client";

import { useState } from "react";
import { BookOpen, CheckCircle2, Award, Clock, X, ShieldAlert } from "lucide-react";
import { OFFICIAL_RUBRIC } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  allowedTechStack?: string;
  guidelines?: string;
  checklist?: string[];
}

export function CompetitionRulesModal({
  isOpen,
  onClose,
  allowedTechStack,
  guidelines,
  checklist: customChecklist,
}: Props) {
  const [activeTab, setActiveTab] = useState<"rubric" | "rules" | "checklist">("rubric");
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  if (!isOpen) return null;

  const defaultRules = [
    { title: "Timed 120-Minute Challenge", desc: "The platform automatically freezes submission intake at the 120-minute mark. Late submissions are blocked." },
    { title: "Public GitHub Repository", desc: "A valid, publicly accessible GitHub repository link must be provided. Private repos will not be graded." },
    { title: "Clean Google Drive Folder Upload", desc: "Upload your clean source code folder. Exclude node_modules, .next, .git, and .env files before uploading." },
    { title: "Zero Pre-built Boilerplates", desc: "External complete templates or cloned projects are strictly forbidden. Original project architecture required." },
    { title: "Permitted Tech Stack Only", desc: "Next.js, React, Tailwind CSS, TypeScript, Supabase/PostgreSQL, and Node.js. Third-party UI components are allowed." },
    { title: "Live Code Defense", desc: "Participants must present and defend their code structure and live deployment before the jury panel." },
  ];

  const defaultChecklist = customChecklist && customChecklist.length > 0 ? customChecklist : [
    "Public GitHub repository URL provided and verified accessible",
    "Clean project folder uploaded to Google Drive without node_modules",
    "Application runs error-free with working authentication and CRUD operations",
    "Mobile and desktop responsiveness verified across all views",
    "README.md file includes project overview, architecture, and live deployment link",
    "All environment variables and database connections tested"
  ];

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#101a2b] rounded-[6px] shadow-2xl border border-slate-200 dark:border-[#1e293b] flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0d1527]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">VSpark 2026 Guidelines & Rules</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Official evaluation rubric and pre-submission checklist</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-[6px] hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Linear/Apple Style Segmented Pill Controller */}
        <div className="px-6 pt-4 pb-2 bg-white dark:bg-[#101a2b]">
          <div className="flex p-1 bg-slate-100 dark:bg-[#0d1527] rounded-[6px] border border-slate-200/60 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("rubric")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
                activeTab === "rubric"
                  ? "bg-white dark:bg-[#1e2e4e] text-blue-700 dark:text-blue-300 shadow-sm border border-slate-200/50 dark:border-blue-700 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Award className="w-4 h-4" />
              100-Marks Rubric
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px]">100 Pts</span>
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
                activeTab === "rules"
                  ? "bg-white dark:bg-[#1e2e4e] text-purple-700 dark:text-purple-300 shadow-sm border border-slate-200/50 dark:border-purple-700 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Clock className="w-4 h-4" />
              Rules & Limits
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px]">120 Mins</span>
            </button>
            <button
              onClick={() => setActiveTab("checklist")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
                activeTab === "checklist"
                  ? "bg-white dark:bg-[#1e2e4e] text-emerald-700 dark:text-emerald-300 shadow-sm border border-slate-200/50 dark:border-emerald-700 font-bold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Pre-Submission Checklist
            </button>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* TAB 1: 100-MARKS RUBRIC */}
          {activeTab === "rubric" && (
            <div className="space-y-3">
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-[6px] border border-blue-100 dark:border-blue-900/50 flex items-start gap-3">
                <Award className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 dark:text-blue-200 leading-relaxed">
                  <span className="font-bold">Official Faculty Evaluation Rubric:</span> Submissions are evaluated strictly across 9 criteria totaling 100 marks. Maintain clean code structure and prepare for code defense.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {OFFICIAL_RUBRIC.map((item, idx) => (
                  <div key={item.id} className="p-3 rounded-[6px] border border-slate-200/80 dark:border-[#1e293b] bg-slate-50/50 dark:bg-[#0d1527] hover:bg-slate-50 dark:hover:bg-[#17243a] transition-colors">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.label}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-[4px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[11px] border border-blue-200 dark:border-blue-800">
                        {item.max} Marks
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-8 leading-snug">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: RULES & LIMITS */}
          {activeTab === "rules" && (
            <div className="space-y-3">
              <div className="p-3 bg-purple-50/60 dark:bg-purple-950/40 rounded-[6px] border border-purple-100 dark:border-purple-900/50 flex items-start gap-3">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div className="text-xs text-purple-900 dark:text-purple-200 leading-relaxed">
                  <span className="font-bold">Strict 120-Minute Competition Rules:</span> The competition portal runs on an automated countdown timer. Once the clock reaches zero, the workspace freezes automatically.
                </div>
              </div>

              <div className="space-y-2">
                {defaultRules.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-[6px] border border-slate-200/80 dark:border-[#1e293b] bg-white dark:bg-[#0d1527] hover:bg-slate-50/60 dark:hover:bg-[#17243a] transition-colors flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-0.5">{rule.title}</h4>
                      <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {allowedTechStack && (
                <div className="mt-4 p-3 rounded-[6px] bg-slate-50 dark:bg-[#0d1527] border border-slate-200 dark:border-[#1e293b]">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">Permitted Tech Stack:</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{allowedTechStack}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHECKLIST */}
          {activeTab === "checklist" && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-[6px] border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                  <span className="font-bold">Pre-Submission Verification:</span> Use this checklist to verify your application before submitting your GitHub link and source code folder.
                </div>
              </div>

              <div className="space-y-2">
                {defaultChecklist.map((item, idx) => {
                  const isChecked = checkedItems[idx] || false;
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCheck(idx)}
                      className={`p-3 rounded-[6px] border cursor-pointer transition-all flex items-start gap-3 ${
                        isChecked
                          ? "bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-sm"
                          : "bg-white dark:bg-[#0d1527] border-slate-200 dark:border-[#1e293b] hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-[3px] border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                        }`}
                      >
                        {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <span className={`text-xs leading-relaxed ${isChecked ? "line-through text-slate-400 font-normal" : "text-slate-800 dark:text-slate-200 font-medium"}`}>
                        {item}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0d1527] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Strict zero-tolerance policy for pre-built template clones</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-[4px] text-xs font-semibold transition-colors cursor-pointer"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}
