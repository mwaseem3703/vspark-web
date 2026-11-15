import test from "node:test";
import assert from "node:assert/strict";
import { canonicalDriveFolder, driveFolderId } from "../src/lib/drive-folder";

test("Google Drive folder links normalize account paths and sharing parameters", () => {
  for (const url of [
    "https://drive.google.com/drive/folders/1Folder_Abc-123?usp=sharing",
    "https://drive.google.com/drive/u/2/folders/1Folder_Abc-123/",
    " https://drive.google.com/folders/1Folder_Abc-123 ",
  ]) {
    assert.equal(driveFolderId(url), "1Folder_Abc-123");
    assert.equal(
      canonicalDriveFolder(url),
      "https://drive.google.com/drive/folders/1Folder_Abc-123",
    );
  }
});

test("Drive destinations reject file links, lookalike hosts, credentials, and unsafe IDs", () => {
  for (const url of [
    "",
    "javascript:alert(1)",
    "http://drive.google.com/drive/folders/1Folder_Abc-123",
    "https://drive.google.com.evil.test/drive/folders/1Folder_Abc-123",
    "https://drive.google.com@evil.test/drive/folders/1Folder_Abc-123",
    "https://user:pass@drive.google.com/drive/folders/1Folder_Abc-123",
    "https://drive.google.com:444/drive/folders/1Folder_Abc-123",
    "https://drive.google.com/file/d/1Folder_Abc-123/view",
    "https://drive.google.com/drive/folders/short",
    "https://drive.google.com/drive/folders/1Folder_Abc-123/other",
    "https://drive.google.com/drive/folders/1Folder_Abc-123%2Fevil",
  ]) {
    assert.equal(driveFolderId(url), null, url);
    assert.throws(() => canonicalDriveFolder(url));
  }
});
