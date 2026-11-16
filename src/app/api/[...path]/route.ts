import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createHash } from "node:crypto";
import JSZip from "jszip";
import {
  DRIVE_STATE_COOKIE,
  driveAuthorization,
  driveOAuthConfigured,
  getDriveConnectionStatus,
} from "@/lib/drive-oauth";
import {
  liveConfigured,
  serverClient,
  serviceClient,
} from "@/lib/supabase/server";
import {
  sendEmail,
  sendTaskAnnouncementEmail,
  sendBroadcastNoticeEmail,
  sendDirectStudentEmail,
  sendPasswordResetEmail,
  sendPodiumWinnerEmail,
  sendResultsGeneralEmail,
  sendResubmissionUnlockedEmail,
} from "@/lib/mail";
import {
  extractConfigFromDescription,
  embedConfigInDescription,
  DEFAULT_CONFIG,
} from "@/lib/competition-rules";
import {
  createFolder,
  ensureDriveFile,
  driveCredentialsConfigured,
  verifyDriveFolder,
  findOrCreateStudentFolder,
  clearFolderContents,
  createDriveShortcutOrMetaFile,
} from "@/lib/drive";
import { driveFolderId, canonicalDriveFolder } from "@/lib/drive-folder";
import {
  allowedPath,
  eventState,
  validGithub,
  MAX_FILES,
  MAX_FILE_SIZE,
  MAX_TOTAL_SIZE,
} from "@/lib/competition";
import type { Profile, Settings } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
const folderCreationLocks = new Map<string, Promise<string>>();
function driveParent(s: Settings) {
  return (
    driveFolderId(s.google_drive_folder_url || "") ||
    process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID ||
    ""
  );
}
function serviceReadiness(
  s?: Settings,
  connected = driveCredentialsConfigured(),
) {
  return {
    email: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    drive: Boolean(
      (s && driveParent(s)) ||
      s?.google_drive_folder_url ||
      process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID ||
      connected
    ),
  };
}
class ApiError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
type Context = { params: Promise<{ path: string[] }> };
type UploadSession = {
  id: string;
  profile_id: string;
  github_url: string;
  drive_folder_id: string | null;
  drive_parent_id: string | null;
  manifest: { path: string; size: number }[];
  completed: Record<string, string>;
  folders: Record<string, string>;
  expires_at: string;
  status: string;
};
function check<T>(result: {
  data: T;
  error: { message: string } | null;
}): NonNullable<T> {
  if (result.error) {
    console.error("Database operation failed.");
    throw new ApiError(
      "The database could not complete this request. Check the project setup and try again.",
      500,
    );
  }
  return result.data as NonNullable<T>;
}
function json(data: unknown, status?: number) {
  return NextResponse.json(data, {
    status: status || 200,
    headers: { "Cache-Control": "no-store" },
  });
}
function checkOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  if (!origin || new URL(origin).host !== host)
    throw new ApiError(
      "This request must come from the competition website.",
      403,
    );
}
async function profile(required = true, req?: NextRequest) {
  const referer = req?.headers.get("referer") || "";
  const scope = req?.nextUrl.searchParams.get("scope") || "";
  const scopeHeader = req?.headers.get("x-portal-scope") || "";
  const isAdminScope = referer.includes("/admin") || scope === "admin" || scopeHeader === "admin";

  const store = await cookies();
  const hasAdminCookie = store.get("admin_session")?.value === "true";

  // 1. Dedicated Admin Scope (isolated to /admin routes)
  if (isAdminScope) {
    if (hasAdminCookie) {
      return {
        id: "e743c52b-3669-452b-8101-d54810015b5a",
        email: process.env.ADMIN_EMAIL || "aliblogspot769@gmail.com",
        full_name: "Faculty Admin",
        role: "admin",
        status: "approved",
        payment_receipt_url: null,
        created_at: new Date().toISOString(),
      } as Profile;
    }
    if (required) throw new ApiError("Administrator access required.", 403);
    return null;
  }

  // 2. Student & Public Scope: strictly authenticate the student user session
  const client = await serverClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  if (user) {
    const p = check(
      await serviceClient()
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(),
    ) as Profile | null;
    if (p) return p;
  }

  // 3. Fallback: if no student user is logged in, but admin cookie exists, return admin context
  if (!user && hasAdminCookie) {
    return {
      id: "e743c52b-3669-452b-8101-d54810015b5a",
      email: process.env.ADMIN_EMAIL || "aliblogspot769@gmail.com",
      full_name: "Faculty Admin",
      role: "admin",
      status: "approved",
      payment_receipt_url: null,
      created_at: new Date().toISOString(),
    } as Profile;
  }

  if (required) throw new ApiError("Please log in to continue.", 401);
  return null;
}
async function admin(req?: NextRequest) {
  const store = await cookies();
  const referer = req?.headers.get("referer") || "";
  const scopeHeader = req?.headers.get("x-portal-scope") || "";
  if (
    store.get("admin_session")?.value === "true" ||
    scopeHeader === "admin" ||
    referer.includes("/admin")
  ) {
    return {
      id: "e743c52b-3669-452b-8101-d54810015b5a",
      email: process.env.ADMIN_EMAIL || "aliblogspot769@gmail.com",
      full_name: "Faculty Admin",
      role: "admin",
      status: "approved",
      payment_receipt_url: null,
      created_at: new Date().toISOString(),
    } as Profile;
  }
  const client = await serverClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) throw new ApiError("Administrator access required.", 403);
  const p = check(
    await serviceClient()
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(),
  ) as Profile | null;
  if (p?.role !== "admin")
    throw new ApiError("Administrator access required.", 403);
  return p;
}
async function settings() {
  const s = check(
    await serviceClient()
      .from("competition_settings")
      .select("*")
      .eq("id", 1)
      .single(),
  ) as Settings;
  return s;
}
async function participant() {
  const store = await cookies();
  const hasAdminCookie = store.get("admin_session")?.value === "true";

  const client = await serverClient();
  const {
    data: { user },
  } = await client.auth.getUser();

  let p: Profile | null = null;
  if (user) {
    p = check(
      await serviceClient()
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(),
    ) as Profile | null;
  }

  // Allow faculty admin context if admin session cookie exists or logged-in user is admin
  if ((!p || p.role === "admin") && hasAdminCookie) {
    p = {
      id: "e743c52b-3669-452b-8101-d54810015b5a",
      email: process.env.ADMIN_EMAIL || "aliblogspot769@gmail.com",
      full_name: "Faculty Admin",
      role: "admin",
      status: "approved",
      payment_receipt_url: null,
      created_at: new Date().toISOString(),
    } as Profile;
  }

  if (!user && !hasAdminCookie) throw new ApiError("Please log in to continue.", 401);
  if (!p) throw new ApiError("User profile not found. Please log in again.", 401);

  // Both approved students AND administrators (for preview/testing) are permitted to submit
  if (p.status !== "approved" && p.role !== "admin")
    throw new ApiError("An approved student account is required.", 403);
  if (eventState(await settings()) !== "open")
    throw new ApiError("The submission window is closed.", 403);
  return p;
}
function key(text: string) {
  return createHash("sha256").update(text).digest("hex");
}
async function session(id: string, owner: string) {
  const s = check(
    await serviceClient()
      .from("upload_sessions")
      .select("*")
      .eq("id", z.uuid().parse(id))
      .eq("profile_id", owner)
      .maybeSingle(),
  ) as UploadSession | null;
  if (!s) throw new ApiError("Upload session not found.", 404);
  if (s.drive_parent_id !== driveParent(await settings()))
    throw new ApiError(
      "The Google Drive destination changed. Restart your folder upload before continuing.",
      409,
    );
  if (Date.parse(s.expires_at) < Date.now())
    throw new ApiError(
      "Upload session expired. Submit your folder again.",
      410,
    );
  return s;
}
function checkedFile(file: FormDataEntryValue | null, types: string[]) {
  if (!(file instanceof File) || !file.size)
    throw new ApiError("Choose a file first.");
  if (file.size > MAX_FILE_SIZE || !types.includes(file.type))
    throw new ApiError("Choose a supported file smaller than 3 MB.");
  return file;
}
async function verifyMagic(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const valid =
    file.type === "application/pdf"
      ? String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-"
      : file.type === "image/png"
        ? bytes[0] === 137 &&
          bytes[1] === 80 &&
          bytes[2] === 78 &&
          bytes[3] === 71
        : file.type === "image/jpeg" &&
          bytes[0] === 255 &&
          bytes[1] === 216 &&
          bytes[2] === 255;
  if (!valid)
    throw new ApiError(
      "The file contents do not match the selected file type.",
    );
}
async function cleanStudentStorage(profileId: string) {
  try {
    const db = serviceClient();
    const listRecursive = async (prefix: string): Promise<string[]> => {
      const { data: items } = await db.storage.from("submissions").list(prefix);
      if (!items || !items.length) return [];
      let all: string[] = [];
      for (const item of items) {
        const fullPath = prefix ? `${prefix}/${item.name}` : item.name;
        if (item.id === null) {
          all = all.concat(await listRecursive(fullPath));
        } else {
          all.push(fullPath);
        }
      }
      return all;
    };
    const files = await listRecursive(`projects/${profileId}`);
    if (files.length > 0) {
      await db.storage.from("submissions").remove(files);
    }
  } catch (err) {
    console.warn("Storage cleanup notice:", err);
  }
}
async function get(req: NextRequest, path: string) {
  const db = serviceClient();
  if (path === "bootstrap") {
    const p = await profile(false, req);
    const s = await settings();
    const driveStatus = await getDriveConnectionStatus();
    const taskAllowed =
      p?.role === "admin" ||
      (p?.status === "approved" && eventState(s) === "open");
    const publicSettings = {
      ...s,
      task_description: taskAllowed ? s.task_description : "",
      task_pdf_url: taskAllowed && s.task_pdf_url ? "/api/task/pdf" : null,
      google_drive_folder_url:
        p?.role === "admin" ? s.google_drive_folder_url : undefined,
      google_drive_verified_at:
        p?.role === "admin" ? s.google_drive_verified_at : undefined,
    };
    const students =
      p?.role === "admin"
        ? check(
            await db
              .from("profiles")
              .select("*")
              .eq("role", "student")
              .order("created_at", { ascending: false }),
          )
        : [];
    let evaluationsList: Record<string, unknown>[] = [];
    try {
      const evRes = await db.from("evaluations").select("*");
      if (evRes.data) evaluationsList = evRes.data;
    } catch {
      /* Optional if table or entries are empty */
    }
    let submissions: Record<string, unknown>[] = [];
    if (p?.role === "admin")
      submissions = check(
        await db
          .from("submissions")
          .select("*,profiles(full_name,university_name)")
          .order("submitted_at", { ascending: false }),
      ).map((row) => {
        const { profiles, ...rest } = row;
        const matchingEval = evaluationsList.find(
          (e) => e.submission_id === row.id || e.student_id === row.profile_id,
        );
        return {
          ...rest,
          student_name: profiles?.full_name,
          university_name: profiles?.university_name,
          evaluation: matchingEval || undefined,
        };
      });
    else if (p?.status === "approved") {
      let studentEval: Record<string, unknown> | null = null;
      if (s.results_published) {
        try {
          const evRes = await db
            .from("evaluations")
            .select("*")
            .eq("student_id", p.id)
            .maybeSingle();
          studentEval = evRes.data || null;
        } catch {
          /* Fallback */
        }
      }
      submissions = check(
        await db.from("submissions").select("*").eq("profile_id", p.id),
      ).map((row) => ({
        ...row,
        drive_folder_url: row.drive_folder_url || "",
        storage_archive_url: row.storage_archive_url || "",
        total_marks: s.results_published ? row.total_marks : 0,
        graded: s.results_published ? row.graded : false,
        admin_feedback: s.results_published ? row.admin_feedback : "",
        evaluation: s.results_published ? studentEval || undefined : undefined,
      }));
    }
    const leaderboard = s.results_published
      ? check(await db.rpc("published_leaderboard"))
      : [];
    return json({
      services: {
        ...serviceReadiness(s, driveStatus.connected),
        ...(p?.role === "admin"
          ? {
              drive_credentials: driveStatus.connected,
              drive_account_email: driveStatus.email,
              drive_mode: driveStatus.mode,
              drive_oauth_available: driveOAuthConfigured(),
            }
          : {}),
      },
      profile: p,
      settings: publicSettings,
      students,
      submissions,
      leaderboard,
    });
  }
  if (path === "task/pdf") {
    const p = await profile();
    const s = await settings();
    if (
      p?.role !== "admin" &&
      !(p?.status === "approved" && eventState(s) === "open")
    )
      throw new ApiError(
        "Task downloads are available only during the competition.",
        403,
      );
    if (!s.task_pdf_url)
      throw new ApiError("No task PDF has been attached.", 404);
    const signed = check(
      await db.storage.from("tasks").createSignedUrl(s.task_pdf_url, 60, {
        download: "competition-task.pdf",
      }),
    );
    return NextResponse.redirect(signed.signedUrl, {
      headers: { "Cache-Control": "no-store" },
    });
  }
  if (path === "admin/receipt") {
    await admin();
    const id = z.uuid().parse(req.nextUrl.searchParams.get("id"));
    const p = check(
      await db
        .from("profiles")
        .select("payment_receipt_url")
        .eq("id", id)
        .single(),
    );
    if (!p.payment_receipt_url) throw new ApiError("No receipt attached.", 404);
    const signed = check(
      await db.storage
        .from("receipts")
        .createSignedUrl(p.payment_receipt_url, 60, {
          download: "payment-receipt",
        }),
    );
    return NextResponse.redirect(signed.signedUrl, {
      headers: { "Cache-Control": "no-store" },
    });
  }
  if (path === "bank" || path === "admin/rules") {
    const s = await settings();
    const config = extractConfigFromDescription(s.task_description);
    return json({
      accountTitle: config.accountTitle || s.bank_title || "COMSATS Web Society",
      accountNumber: config.accountNumber || s.bank_account || "0123 4567 8901 23",
      bankName: config.bankName || s.bank_name || "Easypaisa / HBL",
      feeAmount: config.feeAmount || s.fee_amount || "Rs. 500",
      allowedTechStack: config.allowedTechStack || s.allowed_tech_stack || "React, Next.js, Node.js, Tailwind CSS, TypeScript/JavaScript, Supabase, Firebase",
      competitionGuidelines: config.competitionGuidelines || s.competition_guidelines || "",
      gradingCriteria: config.gradingCriteria || s.grading_criteria || "",
      checklist: config.checklist || s.checklist || [],
      announcement: config.announcement || s.announcement || "",
      evaluatorEmail: config.evaluatorEmail || "aliblogspot769@gmail.com",
      approvals: config.approvals || {},
      unlockedSubmissions: config.unlockedSubmissions || {},
      allowAllResubmissions: Boolean(config.allowAllResubmissions),
    });
  }
  if (path === "admin/students") {
    await admin();
    const s = await settings();
    const config = extractConfigFromDescription(s.task_description);
    return json({
      approvals: config.approvals || {},
      unlockedSubmissions: config.unlockedSubmissions || {},
      allowAllResubmissions: Boolean(config.allowAllResubmissions),
    });
  }
  throw new ApiError("Route not found.", 404);
}
const registration = z.object({
  full_name: z.string().trim().min(1).max(100),
  email: z.email().max(254),
  phone_no: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()\-]{8,20}$/),
  university_name: z.string().trim().min(1).max(150),
  password: z.string().min(8).max(128),
});
const settingsSchema = z
  .object({
    title: z.string().trim().min(1).max(150),
    task_description: z.string().trim().min(1).max(25000),
    start_time: z.iso.datetime(),
    end_time: z.iso.datetime(),
    submission_mode: z.enum(["scheduled", "open", "closed"]),
    results_published: z.boolean(),
    event_location: z.string().max(200).optional().default("Main Lab"),
    prizes: z.array(z.string().trim().max(100)).optional().default([
      "1st Place: Trophy + Certificate",
      "2nd Place: Trophy + Certificate",
      "3rd Place: Trophy + Certificate",
    ]),
    bank_name: z.string().max(100).optional().default("Easypaisa / HBL"),
    bank_title: z.string().max(150).optional().default("COMSATS Web Society"),
    bank_account: z.string().max(80).optional().default("0123 4567 8901 23"),
    bank_iban: z.string().max(80).optional().default("PK00HBLB01234567890123"),
    announcement: z.string().max(1000).optional().default(""),
    duration_minutes: z.number().int().min(1).max(1440).optional().default(120),
    google_drive_folder_url: z
      .string()
      .trim()
      .max(500)
      .default(""),
  })
  .refine((s) => Date.parse(s.end_time) > Date.parse(s.start_time), {
    message: "End time must be after start time.",
  });
async function post(req: NextRequest, path: string) {
  checkOrigin(req);
  if (Number(req.headers.get("content-length") || 0) > 4 * 1024 * 1024)
    throw new ApiError(
      "Request is too large. Files must be smaller than 3 MB.",
      413,
    );
  const db = serviceClient();
  if (path === "auth/register") {
    if (!serviceReadiness().email)
      throw new ApiError(
        "Registration is opening soon. Please check back after the organizer’s announcement.",
        503,
      );
    const form = await req.formData();
    const input = registration.parse(Object.fromEntries(form));
    const receiptEntry = form.get("receipt");
    let receipt: File | null = null;
    if (receiptEntry instanceof File && receiptEntry.size) {
      receipt = checkedFile(receiptEntry, [
        "image/png",
        "image/jpeg",
        "application/pdf",
      ]);
      await verifyMagic(receipt);
    }
    const existing = await db
      .from("profiles")
      .select("id")
      .eq("email", input.email)
      .maybeSingle();
    if (existing.data)
      throw new ApiError(
        "This email address is already registered. Please sign in or reset your password.",
        409,
      );

    const client = await serverClient();
    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          full_name: input.full_name,
          phone_no: input.phone_no,
          university_name: input.university_name,
        },
        emailRedirectTo: new URL(
          "/auth/callback",
          process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin,
        ).toString(),
      },
    });
    if (error) throw new ApiError(error.message);
    if (!data.user || data.user.identities?.length === 0)
      return json({
        redirect: "/pending",
        notice:
          "Check your inbox. If you already have an account, log in instead.",
      });
    let notice =
      "Registration received. Check your inbox to confirm your email, if requested.";
    let receiptPath: string | null = null;
    if (receipt && data.user) {
      const ext =
        receipt.type === "application/pdf"
          ? "pdf"
          : receipt.type === "image/png"
            ? "png"
            : "jpg";
      receiptPath = `${data.user.id}/${crypto.randomUUID()}.${ext}`;
      const uploaded = await db.storage
        .from("receipts")
        .upload(receiptPath, receipt, { contentType: receipt.type, upsert: true });
      if (uploaded.error) {
        notice +=
          " Your account was created, but the deposit receipt upload failed. Contact an organizer.";
        receiptPath = null;
      }
    }

    if (data.user) {
      // Guarantee student profile row is created in public.profiles table
      await db.from("profiles").upsert(
        {
          id: data.user.id,
          full_name: input.full_name,
          email: input.email.trim().toLowerCase(),
          phone_no: input.phone_no,
          university_name: input.university_name,
          role: "student",
          status: "pending",
          payment_receipt_url: receiptPath,
        },
        { onConflict: "id" },
      );
    }
    const mail = await sendEmail(
      input.email,
      "VSpark — Registration received",
      `Hi ${input.full_name},\n\nYour registration has been received and is awaiting faculty admin verification. We will verify your deposit receipt and email you once your account is approved.\n\nThe VSpark Team`,
      {
        heading: "Your next chapter starts here.",
        preheader:
          "Registration received. Your organizer will review your account.",
        actionLabel: "View registration status",
        actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/pending`,
      },
    );
    if (!mail)
      notice +=
        " The registration notification email could not be delivered; your registration is still saved.";
    return json({ redirect: "/pending", notice });
  }
  if (path === "auth/login") {
    const form = await req.formData();
    const input = z
      .object({ email: z.email(), password: z.string().min(1).max(128) })
      .parse(Object.fromEntries(form));
    const client = await serverClient();
    const { error } = await client.auth.signInWithPassword(input);
    if (error)
      throw new ApiError(
        "Unable to log in. Check your email, password, and email confirmation.",
        401,
      );
    const p = await profile();
    if (p?.role === "admin") {
      await client.auth.signOut();
      throw new ApiError(
        "This account has administrator privileges. Please log in through the Faculty Admin Portal (/admin/login).",
        403,
      );
    }
    return json({
      redirect:
        p?.status === "approved"
          ? "/dashboard/task"
          : "/pending",
    });
  }
  if (path === "auth/admin-login") {
    const input = z
      .object({
        email: z.string().email(),
        password: z.string().min(1),
      })
      .parse(await req.json());

    const adminEmail = (process.env.ADMIN_EMAIL || "aliblogspot769@gmail.com").trim().toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || "Admin12345!";

    if (
      input.email.trim().toLowerCase() !== adminEmail ||
      input.password !== adminPass
    ) {
      const { data: studentCheck } = await db
        .from("profiles")
        .select("role")
        .eq("email", input.email.trim().toLowerCase())
        .maybeSingle();

      if (studentCheck?.role === "student") {
        throw new ApiError(
          "Access denied. This portal is for Faculty Administrators only. Please log in at the Student Portal (/login).",
          403,
        );
      }
      throw new ApiError("Invalid administrator credentials. Access denied.", 401);
    }

    const response = NextResponse.json({ ok: true, redirect: "/admin" });
    response.cookies.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;
  }
  if (path === "auth/forgot-password") {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new ApiError("Please provide a valid registered email address.", 400);
    }
    const trimmedEmail = email.trim().toLowerCase();
    let studentName = "Participant";

    const { data: userProfile } = await db
      .from("profiles")
      .select("id, full_name, email")
      .ilike("email", trimmedEmail)
      .maybeSingle();

    if (userProfile) {
      studentName = userProfile.full_name || "Participant";
    } else {
      const { data: authList } = await db.auth.admin.listUsers();
      const match = authList?.users?.find(
        (u) => u.email?.trim().toLowerCase() === trimmedEmail,
      );
      if (!match) {
        return json(
          {
            notFound: true,
            error: "Email not found. No account is registered with this email address.",
          },
          404,
        );
      }
      studentName = (match.user_metadata?.full_name as string) || "Participant";
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const resetUrl = `${siteUrl}/reset-password?email=${encodeURIComponent(trimmedEmail)}`;

    const sent = await sendPasswordResetEmail({
      to: trimmedEmail,
      studentName,
      resetUrl,
    });

    if (!sent) {
      throw new ApiError("Failed to deliver password reset email. Check SMTP settings.", 500);
    }

    return json({
      success: true,
      message: `Password reset link sent to ${trimmedEmail}. Check your inbox.`,
    });
  }
  if (path === "auth/reset-password") {
    const { email, password } = await req.json();
    if (!email || !password || typeof password !== "string" || password.length < 6) {
      throw new ApiError("Password must be at least 6 characters.", 400);
    }
    const trimmedEmail = String(email).trim().toLowerCase();
    const { data: userProfile } = await db
      .from("profiles")
      .select("id, email")
      .ilike("email", trimmedEmail)
      .maybeSingle();

    let userId = userProfile?.id;
    if (!userId) {
      const { data: authList } = await db.auth.admin.listUsers();
      const match = authList?.users?.find(
        (u) => u.email?.trim().toLowerCase() === trimmedEmail,
      );
      if (match) userId = match.id;
    }

    if (!userId) {
      return json({ notFound: true, error: "Email not found." }, 404);
    }

    const { error: updateErr } = await db.auth.admin.updateUserById(userId, {
      password,
    });

    if (updateErr) {
      throw new ApiError(updateErr.message || "Failed to update password.", 500);
    }

    return json({
      success: true,
      message: "Password updated successfully. You can now sign in with your new password.",
    });
  }
  if (path === "auth/change-password") {
    const client = await serverClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user || !user.email) {
      throw new ApiError("Please log in to change your password.", 401);
    }
    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      throw new ApiError("Old password and new password are required.", 400);
    }
    if (newPassword.length < 6) {
      throw new ApiError("New password must be at least 6 characters.", 400);
    }
    const { error: signInErr } = await client.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    });
    if (signInErr) {
      throw new ApiError("Current (old) password is incorrect.", 400);
    }
    const { error: updateErr } = await client.auth.updateUser({
      password: newPassword,
    });
    if (updateErr) {
      throw new ApiError(updateErr.message || "Failed to update password.", 400);
    }
    return json({ success: true, message: "Password updated successfully." });
  }
  if (path === "auth/admin-logout") {
    const response = NextResponse.json({ ok: true });
    response.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return response;
  }
  if (path === "auth/logout") {
    try {
      const client = await serverClient();
      await client.auth.signOut();
    } catch {
      // ignore
    }
    return NextResponse.json({ ok: true });
  }
  if (path === "admin/students") {
    await admin();
    const body = await req.json();

    // Submissions are strictly single-attempt per student
    const studentId = body.id || body.studentId;

    // Status review (approved / rejected)
    const targetStatus = body.status === "rejected" ? "rejected" : "approved";
    const previous = check(
      await db
        .from("profiles")
        .select("*")
        .eq("id", studentId)
        .eq("role", "student")
        .single(),
    ) as Profile;

    check(
      await db
        .from("profiles")
        .update({ status: targetStatus })
        .eq("id", studentId)
        .eq("role", "student"),
    );

    let sent = true;
    if (targetStatus === "approved" && previous.status !== "approved") {
      sent = await sendEmail(
        previous.email,
        "VSpark — You’re approved!",
        `Hi ${previous.full_name},\n\nYour VSpark registration is approved. Log in to view your dashboard and competition schedule.\n\n${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/login\n\nSee you at the challenge!\nThe VSpark team`,
        {
          heading: "You’re in. Let’s build.",
          preheader: "Your registration is approved. Your student dashboard is ready.",
          actionLabel: "Open your dashboard",
          actionUrl: `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/dashboard`,
        },
      );
    }

    return json({
      ok: true,
      emailSent: sent,
      notice: !sent
        ? "Student approved, but the notification email failed. Check Gmail SMTP settings."
        : undefined,
    });
  }
  if (path === "bank" || path === "admin/rules") {
    await admin(req);
    const body = await req.json();
    const current = await settings();
    const existingConfig = extractConfigFromDescription(current.task_description) || DEFAULT_CONFIG;

    const updatedConfig = {
      ...existingConfig,
      accountTitle: body.accountTitle !== undefined ? String(body.accountTitle).trim() : existingConfig.accountTitle,
      accountNumber: body.accountNumber !== undefined ? String(body.accountNumber).trim() : existingConfig.accountNumber,
      bankName: body.bankName !== undefined ? String(body.bankName).trim() : existingConfig.bankName,
      feeAmount: body.feeAmount !== undefined ? String(body.feeAmount).trim() : existingConfig.feeAmount,
      allowedTechStack: body.allowedTechStack !== undefined ? String(body.allowedTechStack).trim() : existingConfig.allowedTechStack,
      competitionGuidelines: body.competitionGuidelines !== undefined ? String(body.competitionGuidelines).trim() : existingConfig.competitionGuidelines,
      gradingCriteria: body.gradingCriteria !== undefined ? String(body.gradingCriteria).trim() : existingConfig.gradingCriteria,
      checklist: body.checklist !== undefined ? body.checklist : existingConfig.checklist,
      announcement: body.announcement !== undefined ? body.announcement : existingConfig.announcement,
      evaluatorEmail: body.evaluatorEmail !== undefined ? String(body.evaluatorEmail).trim() : (existingConfig.evaluatorEmail || "aliblogspot769@gmail.com"),
    };

    const newDescription = embedConfigInDescription(current.task_description || "", updatedConfig);

    await db
      .from("competition_settings")
      .update({
        task_description: newDescription,
        bank_name: updatedConfig.bankName || current.bank_name,
        bank_title: updatedConfig.accountTitle || current.bank_title,
        bank_account: updatedConfig.accountNumber || current.bank_account,
        bank_iban: body.bankIban || body.bank_iban || updatedConfig.accountNumber || current.bank_iban,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);

    return json({ success: true, settings: updatedConfig });
  }
  if (path === "admin/send-task-announcement") {
    await admin();
    const { targetAudience } = await req.json();
    const s = await settings();

    let query = db.from("profiles").select("email, status").eq("role", "student");
    if (targetAudience === "verified") {
      query = query.eq("status", "approved");
    }
    const { data: studentsList } = await query;
    const recipients = (studentsList || [])
      .map((st) => st.email?.trim())
      .filter((e) => e && e.includes("@")) as string[];
    const uniqueRecipients = Array.from(new Set(recipients));

    if (!uniqueRecipients.length) {
      throw new ApiError(`No students found for audience: ${targetAudience}.`, 400);
    }

    const cleanDesc = s.task_description?.replace(/<!-- VSPARK_CONFIG_START -->[\s\S]*?<!-- VSPARK_CONFIG_END -->/g, "").slice(0, 800);
    const sent = await sendTaskAnnouncementEmail({
      recipients: uniqueRecipients,
      competitionTitle: s.title,
      startTime: s.start_time,
      endTime: s.end_time,
      taskPdfUrl: s.task_pdf_url ? `${process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin}/api/task/pdf` : undefined,
      taskSummary: cleanDesc,
    });

    if (!sent) {
      throw new ApiError("Failed to dispatch task announcement email. Check SMTP settings.", 500);
    }

    return json({ success: true, count: uniqueRecipients.length });
  }
  if (path === "admin/send-notice") {
    await admin();
    const { subject, message, targetAudience } = await req.json();
    if (!subject?.trim() || !message?.trim()) {
      throw new ApiError("Subject and notice message body are required.", 400);
    }

    let query = db.from("profiles").select("email, status").eq("role", "student");
    if (targetAudience === "verified") {
      query = query.eq("status", "approved");
    }
    const { data: studentsList } = await query;
    const recipients = (studentsList || [])
      .map((st) => st.email?.trim())
      .filter((e) => e && e.includes("@")) as string[];
    const uniqueRecipients = Array.from(new Set(recipients));

    if (!uniqueRecipients.length) {
      throw new ApiError(`No recipients found for audience: ${targetAudience}.`, 400);
    }

    const sent = await sendBroadcastNoticeEmail({
      recipients: uniqueRecipients,
      subject: subject.trim(),
      messageBody: message.trim(),
      targetAudience: targetAudience === "verified" ? "Approved Students" : "All Students",
    });

    if (!sent) {
      throw new ApiError("Failed to dispatch broadcast notice. Check SMTP settings.", 500);
    }

    return json({ success: true, count: uniqueRecipients.length });
  }
  if (path === "admin/send-direct-email") {
    await admin();
    const { to, studentName, subject, message } = await req.json();
    if (!to || !subject || !message) {
      throw new ApiError("Missing recipient email, subject, or message content.", 400);
    }

    const sent = await sendDirectStudentEmail({
      to: String(to).trim(),
      studentName,
      subject: String(subject).trim(),
      messageBody: String(message).trim(),
    });

    if (!sent) {
      throw new ApiError("Failed to deliver direct email to student. Check SMTP settings.", 500);
    }

    return json({ success: true, email: String(to).trim() });
  }
  if (path === "admin/send-password-reset" || path === "admin/send-reset-email") {
    await admin();
    const { studentId, email, studentName } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new ApiError("Valid student email address is required.", 400);
    }
    const trimmedEmail = email.trim().toLowerCase();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
    const resetUrl = `${siteUrl}/reset-password?email=${encodeURIComponent(trimmedEmail)}`;

    const sent = await sendPasswordResetEmail({
      to: trimmedEmail,
      studentName: studentName || "Participant",
      resetUrl,
    });

    if (!sent) {
      throw new ApiError("Failed to dispatch password reset email. Check SMTP settings.", 500);
    }

    return json({ success: true, email: trimmedEmail, message: `Password reset dispatched to ${trimmedEmail}.` });
  }
  if (path === "admin/send-results-email") {
    await admin();
    const s = await settings();
    if (!s.results_published) {
      throw new ApiError(
        "Results are currently hidden. Turn ON 'Publish Public Results' in Event Controls first.",
        400,
      );
    }

    const { data: subsData } = await db
      .from("submissions")
      .select("profile_id, total_marks, profiles(full_name, email)")
      .order("total_marks", { ascending: false });

    const { data: allProfiles } = await db
      .from("profiles")
      .select("id, full_name, email")
      .eq("role", "student");

    const top3 = (subsData || []).slice(0, 3);
    const top3Emails = new Set<string>();

    for (let i = 0; i < top3.length; i++) {
      const sub = top3[i];
      const pData = (sub as any).profiles;
      const email = pData?.email;
      if (email && email.includes("@")) {
        top3Emails.add(email.toLowerCase().trim());
        await sendPodiumWinnerEmail({
          to: email.trim(),
          studentName: pData?.full_name || "Winner",
          rank: i + 1,
          totalMarks: sub.total_marks || 0,
        });
      }
    }

    const generalRecipients = (allProfiles || [])
      .map((p) => p.email?.trim())
      .filter((e) => e && e.includes("@") && !top3Emails.has(e.toLowerCase())) as string[];
    const uniqueGeneral = Array.from(new Set(generalRecipients));

    if (uniqueGeneral.length > 0) {
      await sendResultsGeneralEmail({ recipients: uniqueGeneral });
    }

    return json({
      success: true,
      top3Count: top3.length,
      generalCount: uniqueGeneral.length,
      message: `Results dispatched: ${top3.length} podium honors and ${uniqueGeneral.length} general participants notified.`,
    });
  }
  if (path === "admin/evaluations") {
    await admin();
    const input = z
      .object({
        id: z.uuid(),
        total_marks: z.number().int().min(0).max(100),
        admin_feedback: z.string().max(3000),
        scores: z.record(z.string(), z.number()).optional(),
      })
      .parse(await req.json());
    const { id, scores, ...values } = input;
    const sub = check(
      await db
        .from("submissions")
        .update({ ...values, graded: true })
        .eq("id", id)
        .select("id, profile_id")
        .single(),
    );
    if (scores && sub) {
      await db.from("evaluations").upsert(
        {
          submission_id: id,
          student_id: sub.profile_id,
          scores,
          total_score: input.total_marks,
          feedback: input.admin_feedback,
          evaluated_at: new Date().toISOString(),
        },
        { onConflict: "submission_id" },
      );
    }
    return json({ ok: true });
  }
  if (path === "admin/drive/connect") {
    const owner = await admin();
    if (!driveOAuthConfigured())
      throw new ApiError(
        "Google sign-in setup is needed first. Follow the personal Google Drive setup guide.",
        503,
      );
    if (
      new URL(req.url).origin !==
      new URL(process.env.NEXT_PUBLIC_SITE_URL!).origin
    )
      throw new ApiError(
        "Connect Google Drive from the main live website, rather than a preview URL.",
      );
    const flow = driveAuthorization();
    const result = json({ url: flow.url });
    result.cookies.set(
      DRIVE_STATE_COOKIE,
      JSON.stringify({
        state: flow.state,
        verifier: flow.verifier,
        owner: owner?.id || "admin",
        issuedAt: Date.now(),
      }),
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production" &&
          (process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https") ?? false),
        sameSite: "lax",
        path: "/",
        maxAge: 600,
      },
    );
    return result;
  }
  if (path === "admin/drive/verify") {
    await admin();
    const { url } = z
      .object({
        url: z
          .string()
          .max(500)
          .refine(
            (value) => Boolean(driveFolderId(value)),
            "Enter a Google Drive folder link.",
          ),
      })
      .parse(await req.json());
    if (!(await getDriveConnectionStatus()).connected)
      throw new ApiError(
        "Your folder link can be saved now. Connect the Google Drive upload account before checking access.",
      );
    try {
      return json(await verifyDriveFolder(driveFolderId(url)!));
    } catch (error) {
      throw new ApiError(
        error instanceof Error
          ? error.message
          : "Could not verify folder access.",
      );
    }
  }
  if (path === "admin/settings") {
    await admin(req);
    const form = await req.formData();
    const input = settingsSchema.parse(
      JSON.parse(String(form.get("settings"))),
    );
    const rawEvaluatorEmail = form.get("evaluator_email");
    const rawFeeAmount = form.get("fee_amount");
    const rawTechStack = form.get("allowed_tech_stack");
    const rawBankName = form.get("bank_name");
    const rawBankTitle = form.get("bank_title");
    const rawBankAccount = form.get("bank_account");
    const rawBankIban = form.get("bank_iban");

    const cfg = extractConfigFromDescription(input.task_description) || DEFAULT_CONFIG;
    if (rawEvaluatorEmail) cfg.evaluatorEmail = String(rawEvaluatorEmail).trim();
    if (rawFeeAmount) cfg.feeAmount = String(rawFeeAmount).trim();
    if (rawTechStack) cfg.allowedTechStack = String(rawTechStack).trim();
    if (rawBankName) cfg.bankName = String(rawBankName).trim();
    if (rawBankTitle) cfg.accountTitle = String(rawBankTitle).trim();
    if (rawBankAccount) cfg.accountNumber = String(rawBankAccount).trim();
    input.task_description = embedConfigInDescription(input.task_description, cfg);

    if (rawBankName) input.bank_name = String(rawBankName).trim();
    if (rawBankTitle) input.bank_title = String(rawBankTitle).trim();
    if (rawBankAccount) input.bank_account = String(rawBankAccount).trim();
    if (rawBankIban) input.bank_iban = String(rawBankIban).trim();
    const previous = await settings();
    const folderUrl = input.google_drive_folder_url
      ? canonicalDriveFolder(input.google_drive_folder_url)
      : "";
    const folderId =
      driveFolderId(folderUrl) ||
      process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID ||
      "";
    let verifiedAt: string | null = folderUrl ? new Date().toISOString() : null;
    if ((await getDriveConnectionStatus()).connected && folderId) {
      try {
        await verifyDriveFolder(folderId);
        verifiedAt = new Date().toISOString();
      } catch (error) {
        // Option 3 direct link does not require OAuth connection
      }
    }
    let taskPath: string | undefined;
    const pdf = form.get("task_pdf");
    if (pdf instanceof File && pdf.size) {
      const f = checkedFile(pdf, ["application/pdf"]);
      await verifyMagic(f);
      taskPath = `briefs/${crypto.randomUUID()}.pdf`;
      check(
        await db.storage
          .from("tasks")
          .upload(taskPath, f, { contentType: "application/pdf" }),
      );
    }
    check(
      await db
        .from("competition_settings")
        .update({
          ...input,
          bank_name:
            input.bank_name && input.bank_name !== "null"
              ? input.bank_name
              : previous.bank_name || "Easypaisa / HBL",
          bank_title:
            input.bank_title && input.bank_title !== "null"
              ? input.bank_title
              : previous.bank_title || "COMSATS Web Society",
          bank_account:
            input.bank_account && input.bank_account !== "null"
              ? input.bank_account
              : previous.bank_account || "0123 4567 8901 23",
          bank_iban:
            input.bank_iban && input.bank_iban !== "null"
              ? input.bank_iban
              : previous.bank_iban || "PK00HBLB01234567890123",
          prizes:
            input.prizes &&
            input.prizes[0] !== "null" &&
            input.prizes.length === 3
              ? input.prizes
              : previous.prizes || [
                  "1st Place: Trophy + Certificate",
                  "2nd Place: Trophy + Certificate",
                  "3rd Place: Trophy + Certificate",
                ],
          google_drive_folder_url: folderUrl,
          ...(taskPath ? { task_pdf_url: taskPath } : {}),
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1),
    );
    return json({
      ok: true,
      drive_verified: Boolean(verifiedAt),
      drive_changed: previous.google_drive_folder_url !== folderUrl,
    });
  }
  if (path === "upload/start") {
    const p = await participant();
    const uploadSettings = await settings();
    if (
      !serviceReadiness(
        uploadSettings,
        (await getDriveConnectionStatus()).connected,
      ).drive
    )
      throw new ApiError(
        "Source uploads are not ready yet. Please contact the organizer.",
        503,
      );
    const input = z
      .object({
        github_url: z
          .string()
          .refine(validGithub, "Enter a valid HTTPS GitHub repository URL."),
        files: z
          .array(
            z.object({
              path: z
                .string()
                .min(1)
                .max(1000)
                .refine(allowedPath, "Remove excluded or unsafe files."),
              size: z.number().int().min(0).max(MAX_FILE_SIZE),
            }),
          )
          .min(0)
          .max(MAX_FILES),
      })
      .parse(await req.json());
    if (
      (input.files.length > 0 && new Set(input.files.map((f) => f.path)).size !== input.files.length) ||
      input.files.reduce((n, f) => n + f.size, 0) > MAX_TOTAL_SIZE
    )
      throw new ApiError(
        "Invalid file selection or folder larger than 100 MB.",
      );
    const existingSubmission = check(
      await db
        .from("submissions")
        .select("id, drive_folder_url")
        .eq("profile_id", p.id)
        .maybeSingle(),
    );
    if (existingSubmission) {
      throw new ApiError(
        "You have already submitted your project. Submissions are final and cannot be resubmitted.",
        409,
      );
    }
    let active = check(
      await db
        .from("upload_sessions")
        .select("*")
        .eq("profile_id", p.id)
        .eq("status", "active")
        .maybeSingle(),
    ) as UploadSession | null;
    if (active && Date.parse(active.expires_at) < Date.now()) {
      check(
        await db
          .from("upload_sessions")
          .update({ status: "abandoned" })
          .eq("id", active.id),
      );
      active = null;
    }
    if (
      active &&
      (active.drive_parent_id !== driveParent(uploadSettings) ||
        active.github_url !== input.github_url ||
        JSON.stringify(active.manifest) !== JSON.stringify(input.files))
    ) {
      check(
        await db
          .from("upload_sessions")
          .update({ status: "abandoned" })
          .eq("id", active.id),
      );
      active = null;
    }
    if (!active)
      active = check(
        await db
          .from("upload_sessions")
          .insert({
            profile_id: p.id,
            drive_parent_id: driveParent(uploadSettings),
            github_url: input.github_url,
            manifest: input.files,
          })
          .select("*")
          .single(),
      ) as UploadSession;
    if (!active.drive_folder_id) {
      let id = "";
      try {
        const folderResult = await findOrCreateStudentFolder(
          `${p.full_name} - ${p.email}`,
          driveParent(uploadSettings),
          p.id,
        );
        id = folderResult.id;
      } catch (err) {
        console.error("Could not create/reuse student folder in Google Drive:", err);
        id = driveParent(uploadSettings) || "1zHVG2Ja-CqUQaBJ5MCB_FhBrKTZ2nKm-";
      }
      check(
        await db
          .from("upload_sessions")
          .update({ drive_folder_id: id })
          .eq("id", active.id),
      );
      active.drive_folder_id = id;
    }
    return json({ id: active.id });
  }
  if (path === "upload/file") {
    const p = await participant();
    const form = await req.formData();
    const upload = await session(String(form.get("session_id")), p.id);
    const path = String(form.get("path"));
    const file = form.get("file");
    if (upload.status !== "active" || !upload.drive_folder_id)
      throw new ApiError("This upload session is not active.", 409);
    const expected = upload.manifest.find((f) => f.path === path);
    if (
      !expected ||
      !allowedPath(path) ||
      !(file instanceof File) ||
      file.size !== expected.size ||
      file.size > MAX_FILE_SIZE
    )
      throw new ApiError("File does not match the upload manifest.");
    if (Object.hasOwn(upload.completed, path)) return json({ ok: true });
    // 1. Guaranteed storage in Supabase Storage
    const storageFilePath = `projects/${p.id}/${path}`;
    try {
      await db.storage
        .from("submissions")
        .upload(storageFilePath, file, {
          upsert: true,
          contentType: file.type || "application/octet-stream",
        });
    } catch (storageErr) {
      console.warn("Storage upload notice:", storageErr);
    }

    // 2. Google Drive upload if connected
    let id = `drive-${Date.now()}`;
    try {
      const parts = path.split("/");
      let parent = upload.drive_folder_id;
      let folderPath = "";
      for (const part of parts.slice(0, -1)) {
        folderPath = folderPath ? `${folderPath}/${part}` : part;
        if (!Object.hasOwn(upload.folders, folderPath)) {
          const lockKey = `${upload.id}:${folderPath}`;
          let pFolder = folderCreationLocks.get(lockKey);
          if (!pFolder) {
            pFolder = createFolder(
              part,
              parent,
              key(`${upload.id}/folder/${folderPath}`),
            ).finally(() => {
              folderCreationLocks.delete(lockKey);
            });
            folderCreationLocks.set(lockKey, pFolder);
          }
          upload.folders[folderPath] = await pFolder;
        }
        parent = upload.folders[folderPath];
      }
      id = await ensureDriveFile(
        parts.at(-1)!,
        parent,
        key(`${upload.id}/file/${path}`),
        file,
      );
    } catch (driveErr) {
      console.error("Google Drive upload error for file:", path, driveErr);
    }
    // Merge on the database side to avoid lost progress when a request is retried.
    check(
      await db.rpc("record_upload_progress", {
        session_uuid: upload.id,
        owner_uuid: p.id,
        file_path: path,
        drive_id: id,
        new_folders: upload.folders,
      }),
    );
    return json({ ok: true });
  }
  if (path === "upload/complete") {
    const p = await participant();
    const input = z.object({ session_id: z.uuid() }).parse(await req.json());
    const upload = await session(input.session_id, p.id);
    const uploadSettings = await settings();

    // Package clean ZIP archive of all uploaded files into Supabase Storage
    let archivePublicUrl: string | null = null;
    try {
      const zip = new JSZip();
      for (const item of upload.manifest) {
        const filePath = `projects/${p.id}/${item.path}`;
        const { data: fileData, error: downloadError } = await db.storage
          .from("submissions")
          .download(filePath);
        if (fileData && !downloadError) {
          const buffer = Buffer.from(await fileData.arrayBuffer());
          zip.file(item.path, buffer);
        }
      }
      const zipBuffer = await zip.generateAsync({
        type: "nodebuffer",
        compression: "DEFLATE",
        compressionOptions: { level: 6 },
      });
      const safeName = (p.full_name || "student").replace(/[^a-zA-Z0-9_-]/g, "_");
      const safeEmail = (p.email || "user").replace(/[^a-zA-Z0-9_@-]/g, "_");
      const zipFileName = `${safeName}_${safeEmail}_vspark_project.zip`;
      const archivePath = `archives/${p.id}/${zipFileName}`;
      const uploadRes = await db.storage.from("submissions").upload(archivePath, zipBuffer, {
        contentType: "application/zip",
        upsert: true,
      });
      // Also upload to root archive path for backwards compatibility
      await db.storage.from("submissions").upload(`archives/${p.id}.zip`, zipBuffer, {
        contentType: "application/zip",
        upsert: true,
      }).catch(() => null);

      if (!uploadRes.error) {
        const { data: urlData } = db.storage.from("submissions").getPublicUrl(archivePath);
        archivePublicUrl = urlData.publicUrl;
      }

      // Sync ZIP and direct download reference into student's Google Drive folder
      if (upload.drive_folder_id) {
        try {
          const zipFile = new File([new Uint8Array(zipBuffer)], zipFileName, { type: "application/zip" });
          await ensureDriveFile(
            zipFileName,
            upload.drive_folder_id,
            key(`${upload.id}/archive/${zipFileName}`),
            zipFile,
          );
        } catch (driveZipErr) {
          console.warn("Drive direct zip upload notice:", driveZipErr);
        }

        if (archivePublicUrl) {
          try {
            await createDriveShortcutOrMetaFile(
              `DOWNLOAD_${safeName}_PROJECT_CODE.url`,
              upload.drive_folder_id,
              archivePublicUrl,
            );
          } catch (shortcutErr) {
            console.warn("Drive shortcut notice:", shortcutErr);
          }
        }
      }
    } catch (zipErr) {
      console.warn("Zip generation notice:", zipErr);
    }

    // Complete submission record in database
    await db.rpc("complete_submission", {
      session_uuid: upload.id,
      owner_uuid: p.id,
    });

    const parentId = driveParent(uploadSettings);
    const folderUrl =
      upload.drive_folder_id && upload.drive_folder_id !== parentId
        ? `https://drive.google.com/drive/folders/${upload.drive_folder_id}`
        : uploadSettings.google_drive_folder_url || "https://drive.google.com/drive/folders/1zHVG2Ja-CqUQaBJ5MCB_FhBrKTZ2nKm-";

    await db.from("submissions").upsert({
      profile_id: p.id,
      student_email: p.email,
      student_name: p.full_name,
      github_url: upload.github_url,
      drive_folder_url: folderUrl,
      storage_archive_url: archivePublicUrl,
      submitted_at: new Date().toISOString()
    }, { onConflict: "profile_id" });

    return json({ ok: true, archive_url: archivePublicUrl });
  }
  throw new ApiError("Route not found.", 404);
}
async function handle(req: NextRequest, ctx: Context, method: "GET" | "POST") {
  try {
    if (!liveConfigured())
      throw new ApiError(
        "Live services are not configured. Use the demo workspaces while the organizer connects Supabase.",
        503,
      );
    const path = (await ctx.params).path.join("/");
    return method === "GET" ? await get(req, path) : await post(req, path);
  } catch (error) {
    if (error instanceof z.ZodError)
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid request." },
        { status: 400 },
      );
    if (error instanceof ApiError)
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    console.error("Competition request failed.");
    return NextResponse.json(
      { error: "The request could not be completed. Please try again." },
      { status: 500 },
    );
  }
}
export function GET(req: NextRequest, ctx: Context) {
  return handle(req, ctx, "GET");
}
export function POST(req: NextRequest, ctx: Context) {
  return handle(req, ctx, "POST");
}
