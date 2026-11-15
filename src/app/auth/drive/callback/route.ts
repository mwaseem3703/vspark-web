import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { serverClient, serviceClient } from "@/lib/supabase/server";
import {
  DRIVE_STATE_COOKIE,
  driveOAuthConfigured,
  finishDriveAuthorization,
  validDriveFlow,
} from "@/lib/drive-oauth";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(request: NextRequest) {
  const site = process.env.NEXT_PUBLIC_SITE_URL!;
  const redirect = (status: string) => {
    const result = NextResponse.redirect(
      new URL(`/admin/settings?drive=${status}`, site),
    );
    result.cookies.set(DRIVE_STATE_COOKIE, "", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/auth/drive/callback",
      maxAge: 0,
    });
    return result;
  };
  try {
    const store = await cookies();
    const saved = store.get(DRIVE_STATE_COOKIE)?.value;
    const code = request.nextUrl.searchParams.get("code");
    const state = request.nextUrl.searchParams.get("state");
    if (!saved || !code || !state || !driveOAuthConfigured())
      return redirect("invalid");
    const flow = JSON.parse(saved) as {
      state: string;
      verifier: string;
      owner: string;
      issuedAt: number;
    };
    const client = await serverClient();
    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user || !validDriveFlow(flow, state, user.id))
      return redirect("invalid");
    const { data: profile } = await serviceClient()
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role !== "admin") return redirect("invalid");
    await finishDriveAuthorization(code, flow.verifier);
    return redirect("connected");
  } catch {
    console.error("Google Drive connection could not be completed.");
    return redirect("failed");
  }
}
