import { JWT } from "google-auth-library";
import { getDriveConnectionStatus, personalDriveToken } from "./drive-oauth";
const BASE = "https://www.googleapis.com/drive/v3/files";
async function token() {
  const personal = await personalDriveToken();
  if (personal) return personal;
  if (
    !process.env.GOOGLE_DRIVE_CLIENT_EMAIL ||
    !process.env.GOOGLE_DRIVE_PRIVATE_KEY
  )
    throw new Error(
      "Google Drive is not connected. Ask an organizer to connect Google Drive in competition settings.",
    );
  const jwt = new JWT({
    email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
    key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  return (await jwt.getAccessToken()).token!;
}
export function driveCredentialsConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL &&
    process.env.GOOGLE_DRIVE_PRIVATE_KEY,
  );
}

export async function verifyDriveFolder(id: string): Promise<{ name: string }> {
  const folder = await driveFetch(
    `${BASE}/${encodeURIComponent(id)}?supportsAllDrives=true&fields=id,name,mimeType,driveId,trashed,capabilities(canAddChildren)`,
  );
  if (
    folder.trashed ||
    folder.mimeType !== "application/vnd.google-apps.folder"
  )
    throw new Error("This link must point to an existing Google Drive folder.");
  if (!folder.capabilities?.canAddChildren)
    throw new Error(
      "The connected account needs permission to add files to this folder.",
    );
  return { name: folder.name };
}
async function driveFetch(url: string, init: RequestInit = {}) {
  const result = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${await token()}`, ...init.headers },
    signal: AbortSignal.timeout(18000),
  });
  if (!result.ok) {
    console.error("Drive request failed with status", result.status);
    throw new Error(
      "Google Drive could not access this folder. Use the VSpark folder created by Connect Google Drive, or check Shared Drive permissions.",
    );
  }
  return result.json();
}
export async function createFolder(name: string, parent: string, key: string) {
  return ensureDriveFile(name, parent, key, undefined);
}

export async function clearFolderContents(folderId: string) {
  try {
    const q = `'${folderId.replaceAll("'", "\\'")}' in parents and trashed = false`;
    const found = await driveFetch(
      `${BASE}?supportsAllDrives=true&includeItemsFromAllDrives=true&q=${encodeURIComponent(q)}&fields=files(id)&pageSize=100`,
    );
    if (found.files?.length) {
      for (const item of found.files) {
        try {
          await driveFetch(`${BASE}/${item.id}?supportsAllDrives=true`, { method: "DELETE" });
        } catch (e) {
          console.warn("Could not delete old file in Drive folder:", item.id, e);
        }
      }
    }
  } catch (err) {
    console.warn("Could not clear old folder contents in Drive:", err);
  }
}

export async function findOrCreateStudentFolder(
  name: string,
  parent: string,
  studentId: string,
): Promise<{ id: string; isExisting: boolean }> {
  try {
    const safeParent = parent.replaceAll("'", "\\'");
    const safeName = name.replaceAll("'", "\\'");
    const q = `'${safeParent}' in parents and trashed = false and (name = '${safeName}' or appProperties has { key='studentId' and value='${studentId}' }) and mimeType = 'application/vnd.google-apps.folder'`;
    const found = await driveFetch(
      `${BASE}?supportsAllDrives=true&includeItemsFromAllDrives=true&q=${encodeURIComponent(q)}&fields=files(id,name)&pageSize=1`,
    );
    if (found.files?.length) {
      const existingId = found.files[0].id;
      await clearFolderContents(existingId);
      return { id: existingId, isExisting: true };
    }
  } catch (searchErr) {
    console.warn("Folder search notice, creating new folder:", searchErr);
  }

  const metadata = {
    name,
    parents: [parent],
    appProperties: { studentId },
    mimeType: "application/vnd.google-apps.folder",
  };
  const result = await driveFetch(
    `${BASE}?supportsAllDrives=true&fields=id`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(metadata),
    },
  );
  return { id: result.id, isExisting: false };
}
export async function ensureDriveFile(
  name: string,
  parent: string,
  key: string,
  file?: File,
): Promise<string> {
  // An appProperties key makes retried file requests idempotent, even after a database timeout.
  const q = `'${parent.replaceAll("'", "\\'")}' in parents and trashed = false and appProperties has { key='uploadKey' and value='${key}' }`;
  const found = await driveFetch(
    `${BASE}?supportsAllDrives=true&includeItemsFromAllDrives=true&q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`,
  );
  if (found.files?.length) return found.files[0].id;
  const metadata = {
    name,
    parents: [parent],
    appProperties: { uploadKey: key },
    ...(!file ? { mimeType: "application/vnd.google-apps.folder" } : {}),
  };
  if (!file) {
    const result = await driveFetch(
      `${BASE}?supportsAllDrives=true&fields=id`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      },
    );
    return result.id;
  }
  const boundary = `vspark_${crypto.randomUUID()}`;
  const head = `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: application/octet-stream\r\n\r\n`;
  const body = Buffer.concat([
    Buffer.from(head),
    Buffer.from(await file.arrayBuffer()),
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const result = await driveFetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true&fields=id`,
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body,
    },
  );
  return result.id;
}
