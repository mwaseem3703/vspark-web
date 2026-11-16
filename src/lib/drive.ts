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
    let errorDetail = "";
    try {
      const errJson = await result.json();
      errorDetail = errJson?.error?.message || "";
    } catch {}
    console.error("Drive request failed with status", result.status, errorDetail);
    if (result.status === 403 && errorDetail.includes("storage quota")) {
      throw new Error(
        "Service Accounts do not have storage quota in personal Google Drive. Move the folder to a Google Workspace Shared Drive or connect Google Drive via OAuth.",
      );
    }
    throw new Error(
      errorDetail ||
        "Google Drive could not access this folder. Use the VSpark folder created by Connect Google Drive, or check Shared Drive permissions.",
    );
  }
  return result.json();
}
export async function createFolder(name: string, parent: string, key: string) {
  return ensureDriveFile(name, parent, key, undefined);
}

export async function createDriveShortcutOrMetaFile(
  name: string,
  parent: string,
  linkUrl: string,
): Promise<string> {
  const metadata = {
    name,
    parents: [parent],
    description: `Complete Source Code Download Link: ${linkUrl}`,
    mimeType: "text/plain",
  };
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
  const safeParent = parent.replaceAll("'", "\\'");
  const safeName = name.replaceAll("'", "\\'");

  // 1. Search by folder name first under parent
  try {
    const qName = `'${safeParent}' in parents and trashed = false and name = '${safeName}' and mimeType = 'application/vnd.google-apps.folder'`;
    const found = await driveFetch(
      `${BASE}?supportsAllDrives=true&includeItemsFromAllDrives=true&q=${encodeURIComponent(qName)}&fields=files(id,name)&pageSize=1`,
    );
    if (found.files?.length) {
      const existingId = found.files[0].id;
      await clearFolderContents(existingId);
      return { id: existingId, isExisting: true };
    }
  } catch (searchErr) {
    console.warn("Folder search by name notice:", searchErr);
  }

  // 2. Fallback: Search by studentId appProperty
  try {
    const qProp = `'${safeParent}' in parents and trashed = false and appProperties has { key='studentId' and value='${studentId}' } and mimeType = 'application/vnd.google-apps.folder'`;
    const found = await driveFetch(
      `${BASE}?supportsAllDrives=true&includeItemsFromAllDrives=true&q=${encodeURIComponent(qProp)}&fields=files(id,name)&pageSize=1`,
    );
    if (found.files?.length) {
      const existingId = found.files[0].id;
      await clearFolderContents(existingId);
      return { id: existingId, isExisting: true };
    }
  } catch (searchErr2) {
    console.warn("Folder search by studentId notice:", searchErr2);
  }

  // 3. No existing folder found, create a new one
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
  const safeParent = parent.replaceAll("'", "\\'");
  const safeKey = key.replaceAll("'", "\\'");
  const safeName = name.replaceAll("'", "\\'");

  // 1. Search by uploadKey for idempotency
  try {
    const q = `'${safeParent}' in parents and trashed = false and appProperties has { key='uploadKey' and value='${safeKey}' }`;
    const found = await driveFetch(
      `${BASE}?supportsAllDrives=true&includeItemsFromAllDrives=true&q=${encodeURIComponent(q)}&fields=files(id)&pageSize=1`,
    );
    if (found.files?.length) return found.files[0].id;
  } catch (err) {
    console.warn("Search by uploadKey error:", err);
  }

  // 2. If it is a folder, check by name under parent to prevent duplicate subfolders from concurrent uploads
  if (!file) {
    try {
      const qFolder = `'${safeParent}' in parents and trashed = false and name = '${safeName}' and mimeType = 'application/vnd.google-apps.folder'`;
      const foundFolder = await driveFetch(
        `${BASE}?supportsAllDrives=true&includeItemsFromAllDrives=true&q=${encodeURIComponent(qFolder)}&fields=files(id)&pageSize=1`,
      );
      if (foundFolder.files?.length) return foundFolder.files[0].id;
    } catch (err) {
      console.warn("Search folder by name error:", err);
    }
  }

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
