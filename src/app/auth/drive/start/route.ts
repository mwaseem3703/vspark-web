import { NextRequest, NextResponse } from "next/server";
import {
  DRIVE_STATE_COOKIE,
  driveAuthorization,
  driveOAuthConfigured,
} from "@/lib/drive-oauth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!driveOAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Google OAuth credentials (GOOGLE_DRIVE_OAUTH_CLIENT_ID / SECRET) are not configured.",
      },
      { status: 503 },
    );
  }
  const flow = driveAuthorization();
  const response = NextResponse.redirect(flow.url);
  response.cookies.set(
    DRIVE_STATE_COOKIE,
    JSON.stringify({
      state: flow.state,
      verifier: flow.verifier,
      owner: "admin",
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
  return response;
}
