import { NextRequest, NextResponse } from "next/server";
import { liveConfigured, serverClient } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  if (!liveConfigured())
    return NextResponse.redirect(new URL("/login", request.url));
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const client = await serverClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/pending", request.url));
  }
  return NextResponse.redirect(
    new URL("/login?confirmation=failed", request.url),
  );
}
