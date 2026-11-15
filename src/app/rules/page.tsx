"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Check,
  Clock,
  Printer,
  Scale,
  ShieldCheck,
  Sparkles,
  Users,
  AlertTriangle,
  FileCheck2,
} from "lucide-react";
import { PublicShell } from "@/components/shell";
import {
  COMPETITION_OVERVIEW,
  COMPETITION_RULES_SECTIONS,
  EVALUATION_PROCESS,
  MARKS_DISTRIBUTION,
  PARTICIPANT_CHECKLIST,
} from "@/lib/competitionRulesData";

export default function RulesPage() {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <PublicShell>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Portal
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="h-9 px-3.5 inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#101a2b] hover:bg-slate-50 dark:hover:bg-[#1e2e4e] dark:hover:text-[#60a5fa] rounded-[6px] border border-slate-200 dark:border-[#29364b] transition-colors cursor-pointer shadow-2xs"
              title="Print Rules Document"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print Guidelines</span>
            </button>

            <Link
              href="/register"
              className="h-9 px-4 inline-flex items-center text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-[6px] shadow-xs transition-colors"
            >
              Register to Compete
            </Link>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[10px] p-6 sm:p-8 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <Clock size={15} /> Time: {COMPETITION_OVERVIEW.durationMinutes} Minutes (2 Hours)
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <Award size={15} /> Total: {COMPETITION_OVERVIEW.totalMarks} Marks
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
              <Users size={15} /> Max {COMPETITION_OVERVIEW.maxTeamMembers} Members Per Group
            </span>
          </div>

          <div className="space-y-2 pt-1">
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
              {COMPETITION_OVERVIEW.title}
            </h1>
            <p className="text-sm sm:text-base font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              {COMPETITION_OVERVIEW.subtitle}
            </p>
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl pt-1 break-words">
              {COMPETITION_OVERVIEW.description}
            </p>
          </div>
        </div>

        {/* Section 1: Overview */}
        <section className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[10px] p-6 sm:p-7 shadow-2xs space-y-4">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BookOpen size={20} className="text-blue-600 dark:text-blue-400" />
            <span>1. Overview</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">
            Build a working web application and submit it with your source code and a live deployment link. Please review all rules and technical constraints carefully before starting development.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-[8px] bg-slate-50 dark:bg-[#0d1527] border border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-semibold text-sm">Total Evaluation Marks</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg font-mono">100 Marks</span>
            </div>
            <div className="p-4 rounded-[8px] bg-slate-50 dark:bg-[#0d1527] border border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400 font-semibold text-sm">Allowed Time Window</span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 text-base sm:text-lg font-mono">120 Minutes (2 hours)</span>
            </div>
          </div>
        </section>

        {/* Section 2: Rules and Regulations (Div-based, No scrollbars, Natural text wrap) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <ShieldCheck size={22} className="text-blue-600 dark:text-blue-400" />
              <span>2. Rules and Regulations</span>
            </h2>
            <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              20 Essential Guidelines
            </span>
          </div>

          <div className="space-y-5">
            {COMPETITION_RULES_SECTIONS.map((sec) => (
              <div
                key={sec.categoryNumber}
                className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[10px] overflow-hidden shadow-2xs"
              >
                <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#0d1527] border-b border-slate-200 dark:border-[#1e293b] flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
                    <span className="font-mono text-xs sm:text-sm bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded font-bold border border-blue-200 dark:border-blue-800">
                      {sec.categoryNumber}
                    </span>
                    <span>{sec.categoryTitle}</span>
                  </h3>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-[#1e293b]">
                  {sec.rules.map((rule) => (
                    <div
                      key={rule.number}
                      className="p-4 sm:p-5 hover:bg-slate-50/60 dark:hover:bg-[#17243a] transition-colors space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-[#0d1527] text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded border border-slate-200 dark:border-[#29364b]">
                            Rule {rule.number}
                          </span>
                          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                            {rule.title}
                          </h4>
                        </div>

                        {rule.badge && (
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-800">
                            {rule.badge}
                          </span>
                        )}
                      </div>

                      <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words">
                        {rule.details}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Marks Distribution (100 Points Total - Div-based, No scrollbars) */}
        <section className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[10px] overflow-hidden shadow-xs space-y-0">
          <div className="p-6 border-b border-slate-200 dark:border-[#1e293b] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
                <Scale size={22} className="text-emerald-600 dark:text-emerald-400" />
                <span>3. Marks Distribution (100 Points Total)</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Evaluation rubrics are transparent and applied identically to every participant team.
              </p>
            </div>
            <span className="text-sm font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-3.5 py-1.5 rounded-[6px] border border-emerald-200 dark:border-emerald-800 font-mono">
              Max Score: 100 Marks
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-[#1e293b]">
            {MARKS_DISTRIBUTION.map((item) => (
              <div
                key={item.no}
                className="p-4 sm:p-5 hover:bg-slate-50/70 dark:hover:bg-[#17243a] transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center font-mono shrink-0 border border-emerald-200 dark:border-emerald-800">
                      {item.no}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                      {item.criterion}
                    </h4>
                  </div>
                  <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed break-words pl-0 sm:pl-8">
                    {item.whatIsChecked}
                  </p>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  <span className="font-mono font-extrabold text-sm sm:text-base bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 px-4 py-2 rounded-[6px] border border-emerald-200 dark:border-emerald-800 shadow-2xs inline-block">
                    {item.marks} Points
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-slate-50 dark:bg-[#0d1527] border-t border-slate-200 dark:border-[#1e293b] flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              Total Maximum Possible Marks
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
              100 / 100 Marks (100%)
            </span>
          </div>
        </section>

        {/* Section 4: How Your Work Is Checked */}
        <section className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[10px] p-6 sm:p-7 shadow-xs space-y-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
              <Sparkles size={22} className="text-amber-500" />
              <span>4. How Your Work Is Checked</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Faculty jury verifies features systematically during evaluation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {EVALUATION_PROCESS.map((proc, i) => (
              <div
                key={i}
                className="p-4 sm:p-5 rounded-[8px] bg-slate-50 dark:bg-[#0d1527] border border-slate-200 dark:border-[#1e293b] space-y-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center font-mono border border-blue-200 dark:border-blue-800">
                    {i + 1}
                  </span>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                    {proc.title}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-8 break-words">
                  {proc.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Participant Checklist */}
        <section className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[10px] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
                <FileCheck2 size={22} className="text-emerald-600 dark:text-emerald-400" />
                <span>5. Participant Checklist</span>
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Tick each requirement before your final project submission.
              </p>
            </div>
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3.5 py-1.5 rounded-[6px] border border-slate-200 dark:border-slate-700">
              {Object.values(checkedItems).filter(Boolean).length} / {PARTICIPANT_CHECKLIST.length} completed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PARTICIPANT_CHECKLIST.map((item, idx) => {
              const isChecked = Boolean(checkedItems[idx]);
              return (
                <div
                  key={idx}
                  onClick={() => toggleCheck(idx)}
                  className={`p-3.5 sm:p-4 rounded-[8px] border transition-all cursor-pointer flex items-start gap-3 select-none ${
                    isChecked
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 shadow-2xs"
                      : "bg-slate-50 dark:bg-[#0d1527] border-slate-200 dark:border-[#1e293b] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#17243a]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-[4px] flex items-center justify-center shrink-0 mt-0.5 border transition-colors ${
                      isChecked
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    }`}
                  >
                    {isChecked && <Check size={14} strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-sm sm:text-base leading-relaxed font-medium break-words ${
                      isChecked ? "line-through opacity-85" : ""
                    }`}
                  >
                    {item}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="p-4 sm:p-5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-[8px] text-sm text-amber-900 dark:text-amber-200 flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm sm:text-base">Mandatory Security Rule:</p>
              <p className="leading-relaxed break-words text-xs sm:text-sm">
                Never commit real API keys, Supabase service roles, or database passwords in public GitHub repositories. Use <code>.env.example</code> with dummy placeholders. Submissions lock permanently when the timer hits zero.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Bar */}
        <div className="bg-slate-900 text-white rounded-[10px] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 print:hidden shadow-lg">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold">
              Ready to Join VSpark 2026?
            </h3>
            <p className="text-sm text-slate-300">
              Register your team, review problem statements, and submit your project before the code freeze.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="h-10 px-4 inline-flex items-center text-xs sm:text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-[6px] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="h-10 px-5 inline-flex items-center text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-[6px] transition-colors shadow-xs"
            >
              Participant Registration
            </Link>
          </div>
        </div>
      </div>
    </PublicShell>
  );
}
