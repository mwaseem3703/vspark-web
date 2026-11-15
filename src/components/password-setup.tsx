"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { browserClient } from "@/lib/supabase/client";
import { PublicShell } from "./shell";
import { Button } from "./ui/button";
import { useApp } from "./provider";

export function PasswordSetup() {
  const { demo, refresh, notify } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    async function connect() {
      try {
        if (demo)
          throw new Error(
            "Password setup is available on the live website. Open your invitation link there.",
          );
        const client = browserClient();
        const hash = new URLSearchParams(window.location.hash.slice(1));
        const params = new URLSearchParams(window.location.search);
        const access = hash.get("access_token");
        const refreshToken = hash.get("refresh_token");
        const code = params.get("code");
        if (hash.get("error") || params.get("error")) {
          window.history.replaceState(null, "", "/auth/setup");
          throw new Error(
            "This invitation has expired or could not be verified. Ask the organizer for a new link.",
          );
        }
        if (access && refreshToken) {
          const { error } = await client.auth.setSession({
            access_token: access,
            refresh_token: refreshToken,
          });
          window.history.replaceState(null, "", "/auth/setup");
          if (error) throw error;
        } else if (code) {
          const { error } = await client.auth.exchangeCodeForSession(code);
          window.history.replaceState(null, "", "/auth/setup");
          if (error) throw error;
        }
        const { data, error } = await client.auth.getUser();
        if (error || !data.user?.email)
          throw new Error(
            "Open a valid invitation or recovery link to set your password.",
          );
        if (active) setEmail(data.user.email);
      } catch (e) {
        if (active) setError((e as Error).message);
      } finally {
        if (active) setLoading(false);
      }
    }
    void connect();
    return () => {
      active = false;
    };
  }, [demo]);
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    try {
      if (password !== form.get("confirm"))
        throw new Error("The passwords do not match.");
      const client = browserClient();
      const { error } = await client.auth.updateUser({ password });
      if (error) throw error;
      const { data } = await client.auth.getUser();
      const { data: profile } = await client
        .from("profiles")
        .select("role,status")
        .eq("id", data.user!.id)
        .single();
      await refresh();
      notify("Your password is set. Welcome to VSpark.");
      router.replace(
        profile?.role === "admin"
          ? "/admin"
          : profile?.status === "approved"
            ? "/dashboard"
            : "/pending",
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <PublicShell>
      <div className="container pending-wrap">
        <section className="pending-card password-setup-card">
          <span className="pending-icon">
            <ShieldCheck size={32} />
          </span>
          <div className="eyebrow">YOUR WORKSPACE IS READY</div>
          <h1>Set your password.</h1>
          <p>
            {email
              ? `Choose a password for ${email}.`
              : "We’ll verify your invitation before setting up your account."}
          </p>
          {loading ? (
            <p className="setup-loading">
              <span className="spinner" /> Verifying your link…
            </p>
          ) : email ? (
            <form className="form-stack" onSubmit={save}>
              <label>
                New password
                <input
                  type="password"
                  name="password"
                  minLength={12}
                  maxLength={128}
                  placeholder="At least 12 characters"
                  autoComplete="new-password"
                  required
                />
              </label>
              <label>
                Confirm password
                <input
                  type="password"
                  name="confirm"
                  minLength={12}
                  maxLength={128}
                  autoComplete="new-password"
                  required
                />
              </label>
              {error && (
                <p className="error-message" role="alert">
                  {error}
                </p>
              )}
              <Button disabled={busy} type="submit">
                {busy ? "Saving…" : "Save password & continue"}
                <ArrowUpRight size={16} />
              </Button>
            </form>
          ) : (
            <>
              <p className="error-message setup-loading" role="alert">
                {error}
              </p>
              <Button asChild variant="outline">
                <Link href="/login">Back to login</Link>
              </Button>
            </>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
