import type { Settings } from "./types";
export function eventState(
  settings: Pick<Settings, "start_time" | "end_time" | "submission_mode">,
  now = Date.now(),
): "upcoming" | "open" | "closed" {
  if (settings.submission_mode === "closed") return "closed";
  if (settings.submission_mode === "open") return "open";
  if (now < Date.parse(settings.start_time)) return "upcoming";
  return now < Date.parse(settings.end_time) ? "open" : "closed";
}
export const MAX_FILE_SIZE = 3 * 1024 * 1024;
export const MAX_TOTAL_SIZE = 100 * 1024 * 1024;
export const MAX_FILES = 500;
export function allowedPath(path: string) {
  const parts = path.replaceAll("\\", "/").split("/");
  return (
    parts.length > 0 &&
    parts.length < 25 &&
    !parts.some(
      (p) =>
        !p ||
        p === "." ||
        p === ".." ||
        p.length > 200 ||
        /[\x00-\x1f]/.test(p) ||
        [
          "node_modules",
          ".next",
          ".git",
          ".vercel",
          "__proto__",
          "constructor",
          "prototype",
          ".npmrc",
          ".pypirc",
          "id_rsa",
          "id_ed25519",
        ].includes(p.toLowerCase()) ||
        p.toLowerCase() === ".env" ||
        p.toLowerCase().startsWith(".env.") ||
        /\.(pem|key)$/i.test(p),
    )
  );
}
export function validGithub(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      u.hostname === "github.com" &&
      /^\/[\w.-]+\/[\w.-]+\/?$/.test(u.pathname) &&
      !u.username &&
      !u.password &&
      !u.search &&
      !u.hash
    );
  } catch {
    return false;
  }
}
export function whatsapp(phone: string) {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "").replace(/^00/, "")}`;
}
