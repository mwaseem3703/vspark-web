"use client";

import { useEffect, useState } from "react";
import { CreditCard, Save, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Workspace, PageHeading } from "./shell";
import { useApp, request } from "./provider";
import { FigmaSuccessModal } from "./ScallopedBadge";

export function AdminBankPage() {
  const { data, refresh, notify } = useApp();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: "",
    message: "",
  });

  const [bankInfo, setBankInfo] = useState({
    accountTitle: "COMSATS Web Society",
    accountNumber: "0123 4567 8901 23",
    bankName: "Easypaisa / HBL",
    feeAmount: "Rs. 500",
  });

  useEffect(() => {
    request("bank")
      .then((resData) => {
        if (resData) {
          setBankInfo({
            accountTitle: resData.accountTitle || "COMSATS Web Society",
            accountNumber: resData.accountNumber || "0123 4567 8901 23",
            bankName: resData.bankName || "Easypaisa / HBL",
            feeAmount: resData.feeAmount || "Rs. 500",
          });
        }
      })
      .catch((err) => console.error("Failed to load bank settings:", err))
      .finally(() => setInitialLoading(false));
  }, []);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await request("bank", {
        method: "POST",
        body: JSON.stringify(bankInfo),
      });

      setMessage({
        text: "Registration Fee & Banking Deposit Details updated successfully.",
        type: "success",
      });
      setSuccessModal({
        isOpen: true,
        title: "Bank Details Updated!",
        message: "Registration fee and deposit accounts have been saved and updated for all student registrations.",
      });
      notify("Registration Fee & Banking Deposit Details updated.");
      await refresh();
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      setMessage({
        text: (err as Error).message || "Failed to update Bank Details.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Workspace admin>
      <PageHeading
        eyebrow="FINANCIAL DEPOSIT & REGISTRATION FEE"
        title="Banking & Deposit Details"
        description="Configure the bank account, mobile wallet number, and registration fee shown to students during sign up."
        action={
          <button
            type="button"
            onClick={handleSaveBank}
            disabled={loading || initialLoading}
            style={{ backgroundColor: "#059669", color: "#ffffff" }}
            className="h-9 px-4 inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[2px] shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{loading ? "Saving..." : "Save Bank Details"}</span>
          </button>
        }
      />

      <form onSubmit={handleSaveBank} className="space-y-6 max-w-4xl">
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

        {/* Main Bank Card */}
        <div className="bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[2px] p-6 space-y-5 shadow-2xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Account Title
              </label>
              <input
                type="text"
                value={bankInfo.accountTitle}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, accountTitle: e.target.value })
                }
                placeholder="e.g. COMSATS Web Development Society"
                className="w-full h-11 px-3.5 text-xs bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] rounded-[2px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Account Number / IBAN
              </label>
              <input
                type="text"
                value={bankInfo.accountNumber}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, accountNumber: e.target.value })
                }
                placeholder="e.g. 0123 4567 8901 23"
                className="w-full h-11 px-3.5 text-xs bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] rounded-[2px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 font-mono shadow-2xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Bank / Mobile Wallet Name
              </label>
              <input
                type="text"
                value={bankInfo.bankName}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, bankName: e.target.value })
                }
                placeholder="e.g. Habib Bank Limited / Easypaisa / JazzCash"
                className="w-full h-11 px-3.5 text-xs bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] rounded-[2px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                Registration Fee per Team / Participant
              </label>
              <input
                type="text"
                value={bankInfo.feeAmount}
                onChange={(e) =>
                  setBankInfo({ ...bankInfo, feeAmount: e.target.value })
                }
                placeholder="e.g. Rs. 500"
                className="w-full h-11 px-3.5 text-xs bg-white dark:bg-[#0d1527] border border-slate-300 dark:border-[#29364b] rounded-[2px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-600 shadow-2xs font-extrabold text-emerald-800 dark:text-emerald-400"
              />
            </div>
          </div>

          {/* Live Student Preview Card */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">
              Live Student Registration Preview
            </span>
            <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-[2px] max-w-lg space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-emerald-200/70 dark:border-emerald-800/60 pb-2">
                <span className="font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-emerald-700 dark:text-emerald-400" />
                  {bankInfo.bankName || "Bank / Mobile Wallet"}
                </span>
                <span className="font-extrabold text-emerald-800 dark:text-emerald-300 text-xs bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full">
                  {bankInfo.feeAmount || "Rs. 500"}
                </span>
              </div>
              <div className="space-y-1 text-slate-700 dark:text-slate-300 text-[11px]">
                <p>
                  Account Title: <strong className="text-slate-900 dark:text-slate-100">{bankInfo.accountTitle}</strong>
                </p>
                <p className="font-mono">
                  Account / IBAN: <strong className="text-slate-900 dark:text-slate-100">{bankInfo.accountNumber}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Save Button Footer */}
        <div className="flex items-center justify-between bg-white dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-[2px] p-4 shadow-2xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Instantly updates the bank account &amp; fee amount for all new student registrations.
          </span>
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: "#059669", color: "#ffffff" }}
            className="h-10 px-6 inline-flex items-center gap-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-[2px] shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
            <span>{loading ? "Saving Bank Details..." : "Save Bank Details"}</span>
          </button>
        </div>
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
