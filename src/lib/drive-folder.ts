/** Accept folder links only; never fetch an administrator-supplied URL. */
export function driveFolderId(value: string): string | null {
  try {
    const url = new URL(value.trim());
    if (
      url.protocol !== "https:" ||
      url.hostname !== "drive.google.com" ||
      url.port ||
      url.username ||
      url.password
    )
      return null;
    const match = url.pathname.match(
      /^\/(?:drive\/(?:u\/\d+\/)?)?folders\/([\w-]{10,200})\/?$/,
    );
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export function canonicalDriveFolder(value: string): string {
  const id = driveFolderId(value);
  if (!id)
    throw new Error(
      "Use a Google Drive folder link, such as https://drive.google.com/drive/folders/your-folder-id.",
    );
  return `https://drive.google.com/drive/folders/${id}`;
}
