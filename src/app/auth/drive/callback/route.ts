import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  DRIVE_STATE_COOKIE,
  driveOAuthConfigured,
  finishDriveAuthorization,
  validDriveFlow,
} from "@/lib/drive-oauth";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const redirect = (status: string) => {
    const result = NextResponse.redirect(
      new URL(`/admin/settings?drive=${status}`, origin),
    );
    result.cookies.set(DRIVE_STATE_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && origin.startsWith("https"),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return result;
  };
  try {
    const store = await cookies();
    const saved = store.get(DRIVE_STATE_COOKIE)?.value;
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    if (!saved || !code || !state || !driveOAuthConfigured()) {
      console.warn("Drive OAuth callback missing state or verifier:", { hasSaved: Boolean(saved), hasCode: Boolean(code), hasState: Boolean(state) });
      return redirect("invalid");
    }
    const flow = JSON.parse(saved) as {
      state: string;
      verifier: string;
      owner: string;
      issuedAt: number;
    };

    if (!validDriveFlow(flow, state, flow.owner)) {
      console.warn("Drive OAuth callback validDriveFlow failed.");
      return redirect("invalid");
    }

    await finishDriveAuthorization(code, flow.verifier);
    return redirect("connected");
  } catch (err) {
    console.error("Google Drive connection could not be completed:", err);
    return redirect("failed");
  }
}
