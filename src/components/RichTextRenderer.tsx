"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  Check,
  CheckSquare,
  ChevronRight,
  Copy,
  ExternalLink,
  FileCode2,
  Info,
  Lightbulb,
  ShieldAlert,
  Square,
} from "lucide-react";

// Code block with interactive Copy button
function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 shadow-sm text-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-slate-300">
          <FileCode2 size={13} className="text-blue-400" />
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="hover:text-white transition-colors flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800 text-[10px]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 overflow-x-auto font-mono text-[11px] sm:text-xs leading-relaxed text-emerald-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

// Inline formatting parser (bold, italic, underline, strike, inline code, links)
export function parseInline(text: string): React.ReactNode[] {
  if (!text) return [];

  const elements: React.ReactNode[] = [];
  let remaining = text;
  let keyIdx = 0;

  const tokenRegex =
    /(\[[^\]]+\]\([^)]+\)|`[^`]+`|\*\*\s*[\s\S]*?\s*\*\*|\*[^*]+\*|<(?:strong|b)>.*?<\/(?:strong|b)>|<(?:em|i)>.*?<\/(?:em|i)>|<u>.*?<\/u>|~~[^~]+~~)/i;

  while (remaining.length > 0) {
    const match = remaining.match(tokenRegex);
    if (!match || match.index === undefined) {
      elements.push(remaining);
      break;
    }

    const matchIndex = match.index;
    if (matchIndex > 0) {
      elements.push(remaining.slice(0, matchIndex));
    }

    const token = match[0];
    keyIdx++;

    if (token.startsWith("[") && token.includes("](")) {
      const linkMatch = token.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        elements.push(
          <a
            key={`link-${keyIdx}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-0.5 font-medium transition-colors"
          >
            {linkMatch[1]}
            <ExternalLink size={10} className="inline ml-0.5 shrink-0 opacity-70" />
          </a>
        );
      } else {
        elements.push(token);
      }
    } else if (token.startsWith("`") && token.endsWith("`")) {
      elements.push(
        <code
          key={`code-${keyIdx}`}
          className="font-mono text-[11px] sm:text-xs bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      elements.push(
        <strong key={`bold-${keyIdx}`} className="font-bold text-slate-900 dark:text-slate-100">
          {token.slice(2, -2).trim()}
        </strong>
      );
    } else if (/^<(?:strong|b)>.*?<\/(?:strong|b)>$/i.test(token)) {
      const inner = token
        .replace(/^<(?:strong|b)>/i, "")
        .replace(/<\/(?:strong|b)>$/i, "")
        .trim();
      elements.push(
        <strong key={`bold-${keyIdx}`} className="font-bold text-slate-900 dark:text-slate-100">
          {inner}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      elements.push(
        <em key={`em-${keyIdx}`} className="italic text-slate-800 dark:text-slate-200">
          {token.slice(1, -1)}
        </em>
      );
    } else if (/^<(?:em|i)>.*?<\/(?:em|i)>$/i.test(token)) {
      const inner = token
        .replace(/^<(?:em|i)>/i, "")
        .replace(/<\/(?:em|i)>$/i, "");
      elements.push(
        <em key={`em-${keyIdx}`} className="italic text-slate-800 dark:text-slate-200">
          {inner}
        </em>
      );
    } else if (token.startsWith("<u>") && token.endsWith("</u>")) {
      elements.push(
        <span key={`u-${keyIdx}`} className="underline underline-offset-2 decoration-slate-400 dark:decoration-slate-500">
          {token.slice(3, -4)}
        </span>
      );
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      elements.push(
        <span key={`s-${keyIdx}`} className="line-through text-slate-400 dark:text-slate-500">
          {token.slice(2, -2)}
        </span>
      );
    } else {
      elements.push(token);
    }

    remaining = remaining.slice(matchIndex + token.length);
  }

  return elements;
}

export default function RichTextRenderer({
  content,
  className = "",
}: {
  content?: string | null;
  className?: string;
}) {
  const sanitizedContent = (content || "")
    .replace(/<!-- VSPARK_CONFIG_START -->[\s\S]*?<!-- VSPARK_CONFIG_END -->/g, "")
    .trim();

  if (!sanitizedContent) {
    return (
      <div className={`p-4 bg-slate-50 dark:bg-[#101a2b] border border-slate-200 dark:border-[#1e293b] rounded-lg text-xs text-slate-400 dark:text-slate-500 italic ${className}`}>
        No guidelines or specifications provided.
      </div>
    );
  }

  const rawLines = sanitizedContent.split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;

  while (i < rawLines.length) {
    const line = rawLines[i];
    const trimmed = line.trim();

    // 1. Code Block (```lang)
    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < rawLines.length && !rawLines[i].trim().startsWith("```")) {
        codeLines.push(rawLines[i]);
        i++;
      }
      blocks.push(
        <CodeBlock
          key={`code-block-${i}`}
          code={codeLines.join("\n")}
          language={language}
        />
      );
      i++;
      continue;
    }

    // 2. Headings (#, ##, ###, ####)
    if (trimmed.startsWith("# ")) {
      blocks.push(
        <h1
          key={`h1-${i}`}
          className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-5 mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-800 tracking-tight flex items-center gap-2 first:mt-0"
        >
          <span className="w-1.5 h-4 bg-blue-600 rounded-full inline-block shrink-0" />
          {parseInline(trimmed.slice(2))}
        </h1>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("## ")) {
      blocks.push(
        <h2
          key={`h2-${i}`}
          className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-4 mb-1.5 flex items-center gap-2 tracking-tight first:mt-0"
        >
          <span className="w-1.5 h-3 bg-indigo-500 rounded-full inline-block shrink-0" />
          {parseInline(trimmed.slice(3))}
        </h2>
      );
      i++;
      continue;
    }

    if (trimmed.startsWith("### ")) {
      blocks.push(
        <h3
          key={`h3-${i}`}
          className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1 first:mt-0 flex items-center gap-1.5"
        >
          <ChevronRight size={13} className="text-blue-500 shrink-0" />
          {parseInline(trimmed.slice(4))}
        </h3>
      );
      i++;
      continue;
    }

    // 3. Horizontal Rule
    if (trimmed === "---" || trimmed === "***" || trimmed === "___") {
      blocks.push(
        <hr key={`hr-${i}`} className="my-4 border-slate-200 dark:border-slate-800" />
      );
      i++;
      continue;
    }

    // 4. Blockquotes & Callout alerts (> Note, > Warning, > Tip, etc.)
    if (trimmed.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith(">")) {
        quoteLines.push(rawLines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      const quoteText = quoteLines.join(" ");

      const isWarning =
        quoteText.toLowerCase().includes("warning") ||
        quoteText.toLowerCase().includes("alert") ||
        quoteText.toLowerCase().includes("caution") ||
        quoteText.includes("⚠️");
      const isTip =
        quoteText.toLowerCase().includes("tip") ||
        quoteText.toLowerCase().includes("bonus") ||
        quoteText.includes("💡");
      const isImportant =
        quoteText.toLowerCase().includes("important") ||
        quoteText.toLowerCase().includes("critical") ||
        quoteText.includes("🔒");

      let calloutClass =
        "bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200 border-l-4 border-l-blue-600";
      let Icon = Info;

      if (isWarning) {
        calloutClass =
          "bg-amber-50/70 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200 border-l-4 border-l-amber-500";
        Icon = AlertTriangle;
      } else if (isTip) {
        calloutClass =
          "bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 border-l-4 border-l-emerald-500";
        Icon = Lightbulb;
      } else if (isImportant) {
        calloutClass =
          "bg-purple-50/70 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/60 text-purple-900 dark:text-purple-200 border-l-4 border-l-purple-600";
        Icon = ShieldAlert;
      }

      blocks.push(
        <div
          key={`callout-${i}`}
          className={`my-3 p-3 sm:p-3.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 shadow-2xs ${calloutClass}`}
        >
          <Icon size={16} className="shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{parseInline(quoteText)}</div>
        </div>
      );
      continue;
    }

    // 5. Checklist items (- [ ] or - [x])
    if (/^[-*]\s*\[([ xX])\]\s*/.test(trimmed)) {
      const checkLines: { isChecked: boolean; text: string }[] = [];
      while (
        i < rawLines.length &&
        /^[-*]\s*\[([ xX])\]\s*/.test(rawLines[i].trim())
      ) {
        const itemLine = rawLines[i].trim();
        const isChecked = /^[-*]\s*\[[xX]\]/.test(itemLine);
        const itemText = itemLine.replace(/^[-*]\s*\[([ xX])\]\s*/, "");
        checkLines.push({ isChecked, text: itemText });
        i++;
      }

      blocks.push(
        <ul key={`checklist-${i}`} className="my-2 space-y-1.5 pl-1">
          {checkLines.map((chk, cIdx) => (
            <li
              key={`chk-${cIdx}`}
              className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300"
            >
              {chk.isChecked ? (
                <CheckSquare
                  size={14}
                  className="text-emerald-600 shrink-0 mt-0.5"
                />
              ) : (
                <Square
                  size={14}
                  className="text-slate-400 dark:text-slate-500 shrink-0 mt-0.5"
                />
              )}
              <span
                className={
                  chk.isChecked
                    ? "line-through text-slate-400 dark:text-slate-500"
                    : "text-slate-700 dark:text-slate-300"
                }
              >
                {parseInline(chk.text)}
              </span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 6. Bullet lists (- or * or •)
    if (/^([-*•]|\+)\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (i < rawLines.length && /^([-*•]|\+)\s+/.test(rawLines[i].trim())) {
        listItems.push(rawLines[i].trim().replace(/^([-*•]|\+)\s+/, ""));
        i++;
      }

      blocks.push(
        <ul key={`ul-${i}`} className="my-2.5 space-y-1.5 pl-2">
          {listItems.map((item, lIdx) => (
            <li
              key={`li-${lIdx}`}
              className="flex items-start gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
              <span className="flex-1">{parseInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Numbered lists (1. or 2.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const numItems: { num: string; text: string }[] = [];
      while (i < rawLines.length && /^\d+\.\s+/.test(rawLines[i].trim())) {
        const match = rawLines[i].trim().match(/^(\d+)\.\s+(.*)$/);
        if (match) {
          numItems.push({ num: match[1], text: match[2] });
        }
        i++;
      }

      blocks.push(
        <ol key={`ol-${i}`} className="my-2.5 space-y-2 pl-1">
          {numItems.map((item, nIdx) => (
            <li
              key={`num-${nIdx}`}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
            >
              <span className="w-5 h-5 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-center shrink-0 border border-blue-200 dark:border-blue-900/60 mt-0.5">
                {item.num}
              </span>
              <span className="flex-1 pt-0.5">{parseInline(item.text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Markdown Table (| Col 1 | Col 2 |)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = [];
      while (
        i < rawLines.length &&
        rawLines[i].trim().startsWith("|") &&
        rawLines[i].trim().endsWith("|")
      ) {
        tableLines.push(rawLines[i].trim());
        i++;
      }

      if (tableLines.length >= 2) {
        const parseRow = (r: string) =>
          r
            .split("|")
            .slice(1, -1)
            .map((c) => c.trim());

        const headers = parseRow(tableLines[0]);
        const rows = tableLines.slice(2).map(parseRow);

        blocks.push(
          <div
            key={`table-${i}`}
            className="my-3 overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs"
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                <tr>
                  {headers.map((h, hIdx) => (
                    <th key={`th-${hIdx}`} className="p-2.5">
                      {parseInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {rows.map((row, rIdx) => (
                  <tr
                    key={`tr-${rIdx}`}
                    className={rIdx % 2 === 0 ? "bg-white dark:bg-[#101a2b]" : "bg-slate-50/50 dark:bg-[#0d1527]"}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={`td-${cIdx}`} className="p-2.5">
                        {parseInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 9. Empty line
    if (!trimmed) {
      blocks.push(<div key={`blank-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // 10. Standard Paragraph
    blocks.push(
      <p
        key={`p-${i}`}
        className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed my-1.5"
      >
        {parseInline(line)}
      </p>
    );
    i++;
  }

  return (
    <div
      className={`prose prose-slate max-w-none font-sans text-slate-800 dark:text-slate-200 ${className}`}
    >
      {blocks}
    </div>
  );
}
