import { createHash, randomBytes } from "node:crypto";
import { serviceClient } from "./supabase/server";
import { decryptDriveToken, encryptDriveToken } from "./drive-crypto";

export const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
export const DRIVE_STATE_COOKIE = "vspark-drive-authorization";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
export function driveOAuthConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET &&
    Buffer.from(process.env.GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY || "", "base64")
      .length === 32,
  );
}
export function driveRedirectUri() {
  return `${process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")}/auth/drive/callback`;
}
export function driveAuthorization() {
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(48).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({
    client_id: process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID!,
    redirect_uri: driveRedirectUri(),
    response_type: "code",
    scope: DRIVE_SCOPE,
    state,
    access_type: "offline",
    prompt: "consent select_account",
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
  }).toString();
  return { url: url.toString(), state, verifier };
}
export function validDriveFlow(
  flow: {
    state?: string;
    verifier?: string;
    owner?: string;
    issuedAt?: number;
  },
  state: string,
  owner: string,
  now = Date.now(),
) {
  return Boolean(
    flow.state &&
    flow.state === state &&
    flow.owner === owner &&
    typeof flow.verifier === "string" &&
    /^[A-Za-z0-9_-]{43,128}$/.test(flow.verifier) &&
    typeof flow.issuedAt === "number" &&
    now >= flow.issuedAt &&
    now - flow.issuedAt <= 600000,
  );
}
export async function getDriveConnectionStatus() {
  const { data, error } = await serviceClient()
    .from("drive_connections")
    .select("id,account_email")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error("Could not read the Drive connection.");
  const oauth = Boolean(data && driveOAuthConfigured());
  const service = Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL &&
    process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  );
  return {
    connected: oauth || service,
    mode: oauth ? ("personal" as const) : service ? ("shared" as const) : null,
    email: oauth
      ? data!.account_email
      : process.env.GOOGLE_DRIVE_CLIENT_EMAIL || "",
  };
}
async function exchange(params: Record<string, string>) {
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      ...params,
      client_id: process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID!,
      client_secret: process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET!,
    }),
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  if (!response.ok)
    throw new Error(
      "Google Drive authorization expired or was declined. Reconnect Google Drive.",
    );
  return response.json() as Promise<{
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    scope?: string;
  }>;
}
let cached: { ciphertext: string; token: string; until: number } | undefined;
export async function personalDriveToken() {
  if (!driveOAuthConfigured()) return null;
  const { data, error } = await serviceClient()
    .from("drive_connections")
    .select("refresh_token_ciphertext")
    .eq("id", 1)
    .maybeSingle();
  if (error) throw new Error("Could not read the Drive connection.");
  if (!data) return null;
  const ciphertext = data.refresh_token_ciphertext as string;
  if (cached?.ciphertext === ciphertext && cached.until > Date.now())
    return cached.token;
  const result = await exchange({
    grant_type: "refresh_token",
    refresh_token: decryptDriveToken(ciphertext),
  });
  cached = {
    ciphertext,
    token: result.access_token,
    until: Date.now() + Math.max(0, result.expires_in - 90) * 1000,
  };
  return cached.token;
}
export async function finishDriveAuthorization(code: string, verifier: string) {
  const result = await exchange({
    code,
    code_verifier: verifier,
    redirect_uri: driveRedirectUri(),
    grant_type: "authorization_code",
  });
  if (
    !result.refresh_token ||
    !result.access_token ||
    !result.scope?.split(" ").includes(DRIVE_SCOPE)
  )
    throw new Error(
      "Google did not provide offline Drive access. Reconnect and allow the requested file access.",
    );
  const google = async (url: string, init: RequestInit = {}) => {
    const response = await fetch(url, {
      ...init,
      headers: {
        ...init.headers,
        Authorization: `Bearer ${result.access_token}`,
      },
      signal: AbortSignal.timeout(15000),
      cache: "no-store",
    });
    if (!response.ok)
      throw new Error("Google Drive could not prepare your submission folder.");
    return response.json();
  };
  const account = await google(
    "https://www.googleapis.com/drive/v3/about?fields=user(emailAddress)",
  );
  // Reconnects reuse this app's folder rather than generating duplicates.
  const query = encodeURIComponent(
    "mimeType = 'application/vnd.google-apps.folder' and trashed = false and appProperties has { key='vsparkDestination' and value='competition' }",
  );
  const existing = await google(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id)&pageSize=1`,
  );
  const folder =
    existing.files?.[0] ||
    (await google("https://www.googleapis.com/drive/v3/files?fields=id", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "VSpark Submissions",
        mimeType: "application/vnd.google-apps.folder",
        appProperties: { vsparkDestination: "competition" },
      }),
    }));
  const saved = await serviceClient().rpc("connect_personal_drive", {
    encrypted_refresh_token: encryptDriveToken(result.refresh_token),
    connected_email: account.user.emailAddress,
    destination_url: `https://drive.google.com/drive/folders/${folder.id}`,
  });
  if (saved.error)
    throw new Error(
      "Could not save the Drive connection. Keep submissions closed and retry.",
    );
  cached = undefined;
}
