import test from "node:test";
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { encryptDriveToken, decryptDriveToken } from "../src/lib/drive-crypto";
import {
  driveAuthorization,
  validDriveFlow,
  DRIVE_SCOPE,
  finishDriveAuthorization,
} from "../src/lib/drive-oauth";

test("Drive refresh tokens are authenticated-encrypted, with fresh IVs and tamper rejection", () => {
  process.env.GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY =
    randomBytes(32).toString("base64");
  const first = encryptDriveToken("synthetic-refresh-token");
  const second = encryptDriveToken("synthetic-refresh-token");
  assert.notEqual(first, second);
  assert.ok(!first.includes("synthetic-refresh-token"));
  assert.equal(decryptDriveToken(first), "synthetic-refresh-token");
  const parts = first.split(".");
  parts[2] = randomBytes(16).toString("base64url");
  assert.throws(() => decryptDriveToken(parts.join(".")));
  process.env.GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY =
    randomBytes(32).toString("base64");
  assert.throws(() => decryptDriveToken(first));
});

test("personal Drive connection creates a private app folder and persists only encrypted credentials atomically", async () => {
  process.env.GOOGLE_DRIVE_TOKEN_ENCRYPTION_KEY =
    randomBytes(32).toString("base64");
  process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID = "test-client";
  process.env.GOOGLE_DRIVE_OAUTH_CLIENT_SECRET = "test-client-secret";
  process.env.NEXT_PUBLIC_SITE_URL = "https://vspark-competition.vercel.app";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "synthetic-service-key";
  const originalFetch = globalThis.fetch;
  let persisted = false;
  let folderCreated = false;
  globalThis.fetch = async (input, init) => {
    const url = String(input);
    const response = (body: unknown) =>
      new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    if (url === "https://oauth2.googleapis.com/token") {
      assert.equal(
        new URLSearchParams(String(init?.body)).get("code_verifier"),
        "synthetic-verifier",
      );
      return response({
        access_token: "synthetic-access",
        refresh_token: "synthetic-refresh",
        expires_in: 3600,
        scope: DRIVE_SCOPE,
      });
    }
    if (url.includes("/drive/v3/about"))
      return response({ user: { emailAddress: "organizer@example.invalid" } });
    if (url.includes("/drive/v3/files?q=")) return response({ files: [] });
    if (url === "https://www.googleapis.com/drive/v3/files?fields=id") {
      const metadata = JSON.parse(String(init?.body));
      assert.equal(metadata.name, "VSpark Submissions");
      assert.equal(metadata.mimeType, "application/vnd.google-apps.folder");
      assert.equal(metadata.permissions, undefined);
      folderCreated = true;
      return response({ id: "1SyntheticFolder123" });
    }
    if (url.includes("/rest/v1/rpc/connect_personal_drive")) {
      const saved = JSON.parse(String(init?.body));
      assert.equal(
        saved.destination_url,
        "https://drive.google.com/drive/folders/1SyntheticFolder123",
      );
      assert.equal(saved.connected_email, "organizer@example.invalid");
      assert.equal(
        decryptDriveToken(saved.encrypted_refresh_token),
        "synthetic-refresh",
      );
      assert.notEqual(saved.encrypted_refresh_token, "synthetic-refresh");
      persisted = true;
      return response(null);
    }
    throw new Error("Unexpected external request in OAuth verification");
  };
  try {
    await finishDriveAuthorization("synthetic-code", "synthetic-verifier");
    assert.equal(folderCreated, true);
    assert.equal(persisted, true);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
test("Google authorization uses narrow file access, offline access, random state, and S256 PKCE", () => {
  process.env.GOOGLE_DRIVE_OAUTH_CLIENT_ID = "test-client";
  process.env.NEXT_PUBLIC_SITE_URL = "https://vspark-competition.vercel.app";
  const flow = driveAuthorization();
  const url = new URL(flow.url);
  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(url.searchParams.get("scope"), DRIVE_SCOPE);
  assert.equal(url.searchParams.get("access_type"), "offline");
  assert.equal(
    url.searchParams.get("redirect_uri"),
    "https://vspark-competition.vercel.app/auth/drive/callback",
  );
  assert.equal(
    url.searchParams.get("code_challenge"),
    createHash("sha256").update(flow.verifier).digest("base64url"),
  );
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
  assert.notEqual(driveAuthorization().state, flow.state);
});
test("OAuth callbacks must match the initiating admin and state, within ten minutes", () => {
  const flow = { ...driveAuthorization(), owner: "admin-a", issuedAt: 1000 };
  assert.equal(validDriveFlow(flow, flow.state, "admin-a", 1001), true);
  assert.equal(validDriveFlow(flow, "wrong-state", "admin-a", 1001), false);
  assert.equal(validDriveFlow(flow, flow.state, "admin-b", 1001), false);
  assert.equal(validDriveFlow(flow, flow.state, "admin-a", 601001), false);
  assert.equal(validDriveFlow(flow, flow.state, "admin-a", 999), false);
  assert.equal(
    validDriveFlow({ ...flow, verifier: "short" }, flow.state, "admin-a", 1001),
    false,
  );
});
