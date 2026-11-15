"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  FileCode2,
  Trophy,
  Settings2,
  Users,
  ClipboardCheck,
  LogOut,
  Menu,
  X,
  Zap,
  ExternalLink,
  Bell,
  CircleHelp,
  BookOpen,
  Mail,
  CreditCard,
  Award,
} from "lucide-react";
import { CompetitionRulesModal } from "./CompetitionRulesModal";
import { NotificationPopover } from "./NotificationPopover";
import { extractConfigFromDescription } from "@/lib/competition-rules";
import { useApp } from "./provider";
import { Button } from "./ui/button";
import { ThemeToggle } from "./appearance";
export function Logo({
  small = false,
  className = "",
}: {
  small?: boolean;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center group py-0.5 ${className}`}
      aria-label="VSpark home"
    >
      <img
        src="/vspark.png"
        alt="VSpark"
        className={`vspark-logo-light object-contain transition-transform group-hover:scale-105 ${
          small ? "h-7 w-auto" : "h-9 w-auto"
        }`}
      />
      <img
        src="/dark-logo.webp"
        alt="VSpark"
        className={`vspark-logo-dark object-contain transition-transform group-hover:scale-105 ${
          small ? "h-9 w-auto" : "h-12 w-auto"
        }`}
      />
    </Link>
  );
}
export function DemoBanner() {
  const { demo } = useApp();
  return demo ? (
    <div className="demo-banner">
      <span className="demo-dot" />
      <strong>Demo preview</strong>
      <span>Sample content · Changes stay in this browser</span>
      <Link href="/login">
        Explore dashboards <ArrowUpRight size={12} />
      </Link>
    </div>
  ) : null;
}
export function PublicShell({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const { data, ready } = useApp();
  const pathname = usePathname();
  const config = extractConfigFromDescription(data?.settings?.task_description);
  const dashboard =
    data.profile?.role === "admin"
      ? "/admin"
      : data.profile?.status === "approved"
        ? "/dashboard/task"
        : "/pending";
  useEffect(() => setMenu(false), [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <DemoBanner />
      <div className="scroll-progress" aria-hidden="true" />
      <header className="public-header">
        <div className="container nav-inner">
          <Logo />
          <nav
            className={menu ? "public-nav nav-open" : "public-nav"}
            aria-label="Main navigation"
          >
            <Link href="/#challenge" onClick={() => setMenu(false)}>
              The challenge
            </Link>
            <Link href="/#how-it-works" onClick={() => setMenu(false)}>
              How it works
            </Link>
            <Link href="/#prizes" onClick={() => setMenu(false)}>
              Recognition
            </Link>
            <Link href="/results">Leaderboard</Link>
          </nav>
          <div className="nav-actions">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/80 dark:hover:text-blue-100 shadow-xs transition-colors cursor-pointer"
            >
              <BookOpen size={14} />
              Rules
            </button>
            <ThemeToggle />
            {ready && data.profile ? (
              <Button asChild size="sm">
                <Link href={dashboard}>
                  My dashboard <ArrowUpRight size={15} />
                </Link>
              </Button>
            ) : (
              <>
                <Link className="login-link" href="/login">
                  Log in
                </Link>
                <Button asChild size="sm">
                  <Link href="/register">
                    Register now <ArrowUpRight size={15} />
                  </Link>
                </Button>
              </>
            )}
            <button
              className="mobile-menu"
              aria-label={menu ? "Close menu" : "Open menu"}
              aria-expanded={menu}
              onClick={() => setMenu(!menu)}
            >
              {menu ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="footer">
        <div className="container footer-main">
          <div>
            <Logo />
            <p>
              A little spark. A big possibility.
              <br />
              Built for the next generation of makers.
            </p>
          </div>
          <div>
            <span className="eyebrow">THE COMPETITION</span>
            <Link href="/#challenge">About the challenge</Link>
            <Link href="/#how-it-works">Guidelines & timeline</Link>
            <Link href="/results">Leaderboard</Link>
          </div>
          <div>
            <span className="eyebrow">YOUR NEXT STEP</span>
            <Link href="/register">
              Register to compete <ArrowUpRight size={13} />
            </Link>
            <Link href="/login">Student login</Link>
            <Link href="/admin/login" className="text-blue-600 font-bold hover:underline">
              Faculty / Admin portal <ArrowUpRight size={13} />
            </Link>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} VSpark. Built with purpose.</span>
          <span>
            University Web Development Competition <Zap size={13} />
          </span>
        </div>
      </footer>
      <CompetitionRulesModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
        allowedTechStack={config.allowedTechStack}
        guidelines={config.competitionGuidelines}
        checklist={config.checklist}
      />
    </>
  );
}
export function Workspace({
  children,
  admin = false,
}: {
  children: ReactNode;
  admin?: boolean;
}) {
  const { data, ready, logout, error, refresh, demo } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const profile = admin
    ? (data.profile?.role === "admin"
        ? data.profile
        : {
            id: "e743c52b-3669-452b-8101-d54810015b5a",
            email: "admin@vspark.edu",
            full_name: "Faculty Admin",
            role: "admin",
            status: "approved",
            payment_receipt_url: null,
            created_at: new Date().toISOString(),
          })
    : (data.profile?.role === "student" ? data.profile : null);
  const config = extractConfigFromDescription(data?.settings?.task_description);
  const allowed = demo || (admin ? true : !!profile);
  useEffect(() => {
    if (!ready || error || demo) return;
    if (admin) {
      if (!profile && !document.cookie.includes("admin_session=true")) {
        router.replace("/admin/login");
      }
    } else {
      if (!profile) {
        router.replace("/login");
      } else if (profile.status !== "approved") {
        router.replace("/pending");
      }
    }
  }, [ready, profile, admin, router, error, demo]);
  useEffect(() => setMenu(false), [pathname]);
  const links = admin
    ? [
        { href: "/admin", label: "Overview", icon: LayoutDashboard },
        { href: "/admin/students", label: "Students", icon: Users },
        { href: "/admin/emails", label: "Email Dispatch", icon: Mail },
        { href: "/admin/bank", label: "Bank & Fee", icon: CreditCard },
        { href: "/admin/rules", label: "Rules & Rubric", icon: BookOpen },
        {
          href: "/admin/evaluations",
          label: "Evaluations",
          icon: ClipboardCheck,
        },
        {
          href: "/admin/settings",
          label: "Competition settings",
          icon: Settings2,
        },
      ]
    : [
        {
          href: "/dashboard/task",
          label: "Task & submission",
          icon: FileCode2,
        },
        {
          href: "/guidelines",
          label: "Competition Guidelines",
          icon: BookOpen,
        },
        {
          href: "/dashboard/settings",
          label: "Account Settings",
          icon: Settings2,
        },
        { href: "/results", label: "Leaderboard", icon: Trophy },
        { href: "/dashboard/results", label: "My Result", icon: Award },
      ];
  if (error)
    return (
      <PublicShell>
        <div className="container empty-state">
          <CircleHelp size={36} />
          <h1>We couldn’t load your workspace.</h1>
          <p>{error}</p>
          <Button onClick={refresh}>Try again</Button>
        </div>
      </PublicShell>
    );
  if (!ready || !allowed)
    return (
      <div className="loading">
        <span className="spinner" />
        Loading your workspace…
      </div>
    );
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <DemoBanner />
      <div className="workspace-app">
        {/* Full-width Top Navbar Strip */}
        <header className="workspace-top-navbar">
          <div className="top-navbar-left">
            <button
              className="mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMenu(true)}
            >
              <Menu size={22} />
            </button>
            <div className="top-navbar-brand">
              <Logo />
            </div>
            <div className="top-navbar-title">
              <span className="system-page font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
                {links.find((l) => l.href === pathname)?.label || (admin ? "Overview" : "Task & submission")}
              </span>
            </div>
          </div>

          <div className="top-navbar-right">
            <button
              type="button"
              onClick={() => setRulesOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-[6px] bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-900/80 dark:hover:text-blue-100 shadow-2xs transition-colors cursor-pointer"
            >
              <BookOpen size={14} />
              Rules
            </button>
            <ThemeToggle />

            {/* Notification Popover Dropdown */}
            <NotificationPopover
              admin={admin}
              profile={profile}
              settings={data.settings}
              students={data.students}
              submissions={data.submissions}
            />

            {/* User Profile Area */}
            <div className="top-navbar-user">
              <div className="top-user-avatar">
                {(profile?.full_name || "AD")
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="top-user-details">
                <span className="top-user-name">
                  {profile?.full_name || (admin ? "Faculty Admin" : "Student Participant")}
                </span>
                <span className="top-user-role">
                  {admin ? "Super Admin" : "Verified Participant"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Workspace Body Area below Top Navbar */}
        <div className="workspace-body-container">
          <aside className={`sidebar ${menu ? "sidebar-open" : ""}`}>
            <nav aria-label="Workspace navigation" style={{ paddingTop: "18px" }}>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#94a3b8",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  padding: "4px 14px 10px",
                }}
              >
                Menu
              </div>
              {links.map((l) => (
                <Link
                  key={l.href}
                  className={
                    pathname === l.href ? "side-link active" : "side-link"
                  }
                  href={l.href}
                >
                  <l.icon size={18} />
                  {l.label}
                  {admin && l.href === "/admin/students" && (
                    <span className="nav-count" title={`${data.students.length} registered students`}>
                      {data.students.length}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
            <div className="sidebar-bottom">
              <Link href="/" className="side-link" style={{ marginBottom: "2px" }}>
                <ExternalLink size={17} />
                Back to website
              </Link>
              <button
                className="side-link"
                onClick={async () => {
                  try {
                    await logout(admin);
                    router.push(admin ? "/admin/login" : "/login");
                  } catch (e) {
                    alert((e as Error).message);
                  }
                }}
                style={{ marginBottom: "6px" }}
              >
                <LogOut size={17} />
                Sign out
              </button>
            </div>
          </aside>

          {menu && (
            <button
              className="sidebar-overlay"
              aria-label="Close navigation"
              onClick={() => setMenu(false)}
            />
          )}

          <div className="workspace-main-content">
            <main id="main" className="workspace-content">
              {children}
            </main>
            <div className="workspace-footer">
              Made for curious minds. Built for what’s next.
              <span>
                VSpark <Zap size={12} />
              </span>
            </div>
          </div>
        </div>
      </div>
      <CompetitionRulesModal
        isOpen={rulesOpen}
        onClose={() => setRulesOpen(false)}
        allowedTechStack={config.allowedTechStack}
        guidelines={config.competitionGuidelines}
        checklist={config.checklist}
      />
    </>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function EmptyState({
  title,
  description,
  icon: Icon = FileCode2,
  children,
}: {
  title: string;
  description: string;
  icon?: typeof FileCode2;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Icon size={26} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status}`}>
      {status === "approved" || status === "open" ? (
        <span className="online-dot" />
      ) : null}
      {status === "pending"
        ? "Pending approval"
        : status === "scheduled"
          ? "Scheduled"
          : status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
export function TextLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link className="text-link" href={href}>
      {children}
      <ArrowRight size={15} />
    </Link>
  );
}
