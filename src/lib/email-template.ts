type EmailContent = {
  subject: string;
  heading: string;
  text: string;
  preheader?: string;
  actionLabel?: string;
  actionUrl?: string;
  siteUrl: string;
  category?: string;
  securityNote?: string;
  hasLogoCid?: boolean;
};
export function escapeEmail(value: string) {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );
}
function emailUrl(value: string) {
  if (value === "{{ .ConfirmationURL }}" || value === "{{ .SiteURL }}")
    return value;
  const url = new URL(value);
  if (
    (url.protocol !== "https:" &&
      !(
        url.protocol === "http:" &&
        ["localhost", "127.0.0.1"].includes(url.hostname)
      )) ||
    url.username ||
    url.password
  )
    throw new Error("Email links must use a trusted HTTP(S) address.");
  return escapeEmail(url.toString());
}
export function renderEmail(content: EmailContent) {
  const site = emailUrl(content.siteUrl);
  const action =
    content.actionLabel && content.actionUrl
      ? emailUrl(content.actionUrl)
      : null;
  const paragraphs = content.text
    .split(/\n\s*\n/)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#334155;">${escapeEmail(paragraph).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeEmail(content.subject)}</title></head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1e293b;-webkit-font-smoothing:antialiased;line-height:1.6;">
<div style="display:none;font-size:1px;line-height:1px;color:#f1f5f9;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${escapeEmail(content.preheader || content.heading)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;margin:0 auto;">
<!-- Branded Top Header Banner -->
<tr><td align="center" style="background:linear-gradient(135deg, #090d16 0%, #0f172a 100%);padding:36px 32px 28px;border-radius:16px 16px 0 0;border:1px solid #1e293b;border-bottom:none;text-align:center;">
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td align="center">
<a href="${site}" target="_blank" style="display:inline-block;text-decoration:none;">
<img src="${content.hasLogoCid ? "cid:vsparklogo" : `${site}/vspark.png`}" alt="VSPARK 2026" width="200" style="display:block;max-height:52px;width:auto;max-width:220px;object-fit:contain;margin:0 auto;" />
</a>
</td></tr></table>
<div style="margin-top:14px;">
<span style="display:inline-block;background:rgba(37,99,235,0.2);color:#93c5fd;border:1px solid rgba(96,165,250,0.35);font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:4px 14px;border-radius:9999px;">
Annual Web Sprint 2026
</span>
</div>
<p style="margin:8px 0 0;color:#94a3b8;font-size:12px;font-weight:500;letter-spacing:0.03em;">
COMSATS University Islamabad, Vehari Campus
</p>
</td></tr>
<!-- Main White Content Card -->
<tr><td style="background-color:#ffffff;padding:36px 32px;border-left:1px solid #e2e8f0;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;border-radius:0 0 16px 16px;box-shadow:0 10px 25px -5px rgba(0,0,0,0.05);">
<p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#2563eb;text-transform:uppercase;letter-spacing:0.05em;">${escapeEmail(content.category || "Your VSpark Account")}</p>
<h1 style="margin:0 0 20px;font-size:24px;line-height:1.3;letter-spacing:-0.5px;color:#0f172a;font-weight:700;">${escapeEmail(content.heading)}</h1>
${paragraphs}
${action ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:16px 0 24px;"><tr><td bgcolor="#2563eb" style="border-radius:6px;mso-padding-alt:13px 24px;"><a href="${action}" style="display:inline-block;padding:13px 24px;background:#2563eb;border:1px solid #2563eb;border-radius:6px;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;text-align:center;mso-padding-alt:0;">${escapeEmail(content.actionLabel!)}</a></td></tr></table><p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:#64748b;">Button not opening? Copy this link into your browser:</p><p style="margin:0 0 20px;font-size:12px;line-height:1.6;word-break:break-all;overflow-wrap:anywhere;"><a href="${action}" style="color:#2563eb;text-decoration:underline;">${action}</a></p>` : ""}
${content.securityNote ? `<div style="margin:0 0 16px;padding:14px 16px;background:#f8fafc;border-left:3px solid #3b82f6;border-radius:4px;font-size:12px;line-height:1.7;color:#475569;">${escapeEmail(content.securityNote)}</div>` : ""}
</td></tr>
<!-- Footer Information -->
<tr><td align="center" style="padding:24px 20px;text-align:center;">
<p style="margin:0;color:#64748b;font-size:12px;font-weight:500;">
Official Portal: <a href="${site}" target="_blank" style="color:#2563eb;text-decoration:underline;font-weight:600;">${site.replace(/^https?:\/\//, "")}</a>
</p>
<p style="margin:8px 0 0;color:#94a3b8;font-size:11px;line-height:1.5;">
VSPARK 2026 Web Engineering Competition &bull; COMSATS Web Society<br>
Department of Computer Science &bull; COMSATS University Islamabad, Vehari Campus
</p>
<p style="margin:10px 0 0;color:#cbd5e1;font-size:10px;">
You are receiving this communication as a registered participant or administrator of VSPARK 2026.
</p>
</td></tr>
</table></td></tr></table></body></html>`;
}
