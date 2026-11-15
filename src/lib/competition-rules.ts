import React from "react";

export type EmbeddedConfig = {
  accountTitle?: string;
  accountNumber?: string;
  bankName?: string;
  feeAmount?: string;
  allowedTechStack?: string;
  competitionGuidelines?: string;
  gradingCriteria?: string;
  checklist?: string[];
  approvals?: Record<string, string>;
  unlockedSubmissions?: Record<string, boolean>;
  allowAllResubmissions?: boolean;
  announcement?: string | { enabled?: boolean; text?: string };
  evaluatorEmail?: string;
};

export const DEFAULT_CONFIG: EmbeddedConfig = {
  accountTitle: "COMSATS Web Society",
  accountNumber: "0123 4567 8901 23",
  bankName: "Easypaisa / HBL",
  feeAmount: "Rs. 500",
  evaluatorEmail: "aliblogspot769@gmail.com",
  allowedTechStack: "Next.js 15/16, React 19, Tailwind CSS, TypeScript / JavaScript, Supabase / PostgreSQL, Node.js, Vercel",
  competitionGuidelines: `**Competition Guidelines (120 Mins):**
1. **Full-Stack Implementation**: Build a functional web application with frontend, backend, and database.
2. **Public GitHub Repository**: Provide a publicly accessible repository link.
3. **Clean Code Upload**: Upload clean source code to Google Drive without node_modules, .next, or .git.
4. **Time Limit & Auto-Freeze**: Complete and submit your project within 120 minutes.
5. **No AI Plagiarism**: AI tools are allowed for guidance, but original code structure and logic defense is required.
6. **Code Defense**: Demonstrate and defend your project during live evaluation with the jury.`,
  gradingCriteria: `**Official 100-Point Evaluation Rubric:**
1. **UI/UX & Responsiveness** (10 Marks): Modern mobile/desktop design, accessibility.
2. **Authentication & Security** (15 Marks): Secure login/signup and role gatekeepers.
3. **Database & Full CRUD** (20 Marks): Clean schema with relational CRUD operations.
4. **Cloud Storage File Uploads** (10 Marks): Clean file upload handling.
5. **External API Integration** (15 Marks): Third-party APIs & SMTP emails.
6. **Live Public Deployment** (15 Marks): Functional live deployment on Vercel/Netlify.
7. **Code Quality & Validation** (5 Marks): Clean, modular TypeScript structure.
8. **Documentation & README** (5 Marks): Clear README with screenshots & steps.
9. **Live Demo & Code Defense** (5 Marks): Confident defense before jury.`,
  checklist: [
    "Public GitHub repository URL provided and verified accessible",
    "Source code folder uploaded to Google Drive without node_modules",
    "Responsive design verified across mobile and desktop screens",
    "Authentication and database CRUD operations tested and working",
    "Project README contains overview, architecture, and live links"
  ],
  approvals: {},
  unlockedSubmissions: {},
  allowAllResubmissions: false,
};

const CONFIG_REGEX = /<!-- VSPARK_CONFIG_START -->([\s\S]*?)<!-- VSPARK_CONFIG_END -->/;

export function extractConfigFromDescription(desc: string | null | undefined): EmbeddedConfig {
  if (!desc) return { ...DEFAULT_CONFIG };
  const match = desc.match(CONFIG_REGEX);
  if (!match) return { ...DEFAULT_CONFIG };
  try {
    const parsed = JSON.parse(match[1]);
    return { ...DEFAULT_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function embedConfigInDescription(cleanDescription: string, config: EmbeddedConfig): string {
  const clean = (cleanDescription || "").replace(CONFIG_REGEX, "").trim();
  const configJson = JSON.stringify(config, null, 2);
  return `${clean}\n\n<!-- VSPARK_CONFIG_START -->\n${configJson}\n<!-- VSPARK_CONFIG_END -->`;
}

export function cleanDescriptionText(desc: string | null | undefined): string {
  if (!desc) return "";
  return desc.replace(CONFIG_REGEX, "").trim();
}

/**
 * Robust inline formatter for Markdown **bold**, *italic*, code, and HTML tags
 */
export function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  // Split by line breaks
  const lines = text.split("\n");

  return lines.map((line, lineIdx) => {
    // Regex matches **bold**, *italic*, <b>, <strong>, <code>
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.*?)\*\*|\*(.*?)\*|<b>(.*?)<\/b>|<strong>(.*?)<\/strong>|<code>(.*?)<\/code>)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(line.substring(lastIndex, match.index));
      }

      if (match[2] !== undefined) {
        // **bold**
        parts.push(
          React.createElement("strong", { key: `b-${match.index}`, className: "font-bold text-slate-900" }, match[2])
        );
      } else if (match[3] !== undefined) {
        // *italic*
        parts.push(
          React.createElement("em", { key: `i-${match.index}`, className: "italic text-slate-800" }, match[3])
        );
      } else if (match[4] !== undefined || match[5] !== undefined) {
        // <b> or <strong>
        const boldText = match[4] !== undefined ? match[4] : match[5];
        parts.push(
          React.createElement("strong", { key: `html-b-${match.index}`, className: "font-bold text-slate-900" }, boldText)
        );
      } else if (match[6] !== undefined) {
        // <code>
        parts.push(
          React.createElement(
            "code",
            { key: `code-${match.index}`, className: "px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-blue-700" },
            match[6]
          )
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(line.substring(lastIndex));
    }

    return React.createElement(
      "span",
      { key: `line-${lineIdx}`, className: "block mb-1 text-[13px] leading-relaxed text-slate-700" },
      parts.length > 0 ? parts : line
    );
  });
}
