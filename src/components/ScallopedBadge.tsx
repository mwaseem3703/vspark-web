"use client";

import { useEffect, type ReactNode } from "react";
import { Check, X } from "lucide-react";

export function ScallopedCheckBadge({
  size = 56,
  color = "#252d58",
  icon,
}: {
  size?: number;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
      className="inline-flex items-center justify-center relative mx-auto drop-shadow-sm"
    >
      <svg
        viewBox="0 0 24 24"
        fill={color}
        className="w-full h-full"
      >
        {/* Scalloped / Rosette 12-lobed Starburst Badge */}
        <path d="M12 2l1.6 2.3c.5.7 1.3 1.1 2.2 1.1h2.7l.6 2.7c.2.9.8 1.6 1.6 1.9l2.5 1.1-1.1 2.5c-.4.8-.4 1.7 0 2.5l1.1 2.5-2.5 1.1c-.8.3-1.4 1-1.6 1.9l-.6 2.7h-2.7c-.9 0-1.7.4-2.2 1.1L12 22l-1.6-2.3c-.5-.7-1.3-1.1-2.2-1.1H5.5l-.6-2.7c-.2-.9-.8-1.6-1.6-1.9L.8 12.9l1.1-2.5c.4-.8.4-1.7 0-2.5L.8 5.4l2.5-1.1c.8-.3 1.4-1 1.6-1.9l.6-2.7h2.7c.9 0 1.7-.4 2.2-1.1L12 2z" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-white">
        {icon || <Check size={Math.round(size * 0.44)} strokeWidth={3} />}
      </div>
    </div>
  );
}

export function FigmaSuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonLabel = "Close",
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  buttonLabel?: string;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#101a2b] rounded-[16px] max-w-sm w-full p-8 pt-9 space-y-5 shadow-2xl text-center border border-slate-100 dark:border-[#1e293b] animate-in zoom-in-95 duration-150 cursor-default"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={17} />
        </button>
        <ScallopedCheckBadge size={60} />
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full h-11 px-6 font-bold text-xs rounded-[8px] bg-[#252d58] dark:bg-blue-600 hover:bg-[#1d2347] dark:hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}

export function ReceiptModal({
  isOpen,
  onClose,
  studentName,
  receiptUrl,
}: {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  receiptUrl?: string | null;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-[#101a2b] rounded-[16px] max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-100 dark:border-[#1e293b] animate-in zoom-in-95 duration-150 cursor-default"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Payment Receipt
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Uploaded by {studentName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>
        <div className="rounded-lg border border-slate-200 dark:border-[#1e293b] overflow-hidden max-h-[60vh] flex items-center justify-center bg-slate-50 dark:bg-[#0d1527] p-2">
          {receiptUrl ? (
            receiptUrl.toLowerCase().endsWith(".pdf") ? (
              <iframe src={receiptUrl} className="w-full h-96 border-none" title="Receipt PDF" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={receiptUrl}
                alt="Payment Receipt"
                className="max-h-[55vh] max-w-full object-contain mx-auto rounded"
              />
            )
          ) : (
            <div className="py-12 text-center text-xs text-slate-400">
              No receipt uploaded by participant.
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          {receiptUrl && (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 text-xs font-bold rounded-[8px] border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors inline-flex items-center"
            >
              Open Full Preview
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{ backgroundColor: "#252d58", color: "#ffffff" }}
            className="px-5 py-2 text-xs font-bold rounded-[8px] hover:bg-[#1d2347] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
