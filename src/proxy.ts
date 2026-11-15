import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Dedicated admin login page
  if (path === "/admin/login") {
    if (request.cookies.get("admin_session")?.value === "true") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // Dedicated admin routes guard
  if (path.startsWith("/admin")) {
    if (request.cookies.get("admin_session")?.value === "true") {
      return NextResponse.next();
    }
  }

  if (
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookies.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  function redirect(pathname: string) {
    const next = NextResponse.redirect(new URL(pathname, request.url));
    response.cookies.getAll().forEach((c) => next.cookies.set(c));
    return next;
  }

  // Admin access check if cookie not present
  if (path.startsWith("/admin")) {
    if (!user) return redirect("/admin/login");
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .single();
    if (!profile || profile.role !== "admin") return redirect("/admin/login");
    return response;
  }

  // Student dashboard route guard
  if (path.startsWith("/dashboard")) {
    if (!user) return redirect("/login");
    const { data: profile } = await supabase
      .from("profiles")
      .select("role,status")
      .eq("id", user.id)
      .single();
    if (!profile) return redirect("/pending");
    if (profile.status !== "approved") return redirect("/pending");
    return response;
  }

  return response;
}

export const config = { matcher: ["/admin/:path*", "/dashboard/:path*"] };
