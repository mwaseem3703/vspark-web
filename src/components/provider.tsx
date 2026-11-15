"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { createDemo, demoStudent } from "@/lib/demo";
import type { AppData, Profile } from "@/lib/types";
type AppContext = {
  data: AppData;
  ready: boolean;
  demo: boolean;
  error: string;
  toast: string;
  notify: (m: string) => void;
  refresh: () => Promise<void>;
  update: (fn: (d: AppData) => AppData) => void;
  demoLogin: (role: "student" | "admin") => void;
  resetDemo: () => void;
  logout: (isAdmin?: boolean) => Promise<void>;
};
const Context = createContext<AppContext | null>(null);
const KEY = "vspark-demo-v1";
export async function request(path: string, options: RequestInit = {}) {
  const isAdmin =
    typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
  const baseHeaders: Record<string, string> = {};
  if (isAdmin) baseHeaders["x-portal-scope"] = "admin";
  if (!(options.body instanceof FormData))
    baseHeaders["Content-Type"] = "application/json";

  const response = await fetch(`/api/${path}`, {
    ...options,
    headers: { ...baseHeaders, ...options.headers },
  });
  const payload = await response.json();
  if (!response.ok)
    throw new Error(payload.error || "Something went wrong. Please try again.");
  return payload;
}
export function Provider({
  children,
  demo,
}: {
  children: ReactNode;
  demo: boolean;
}) {
  const [data, setData] = useState<AppData>(() => {
    const initial = createDemo();
    return demo
      ? initial
      : {
          ...initial,
          profile: null,
          students: [],
          submissions: [],
          leaderboard: [],
          settings: { ...initial.settings, task_description: "" },
        };
  });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const notify = useCallback((m: string) => setToast(m), []);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);
  const refresh = useCallback(async () => {
    if (!demo) {
      try {
        const next = await request("bootstrap");
        setData(next);
        setError("");
      } catch (e) {
        setError((e as Error).message);
      }
    }
  }, [demo]);
  useEffect(() => {
    if (demo) {
      try {
        const stored = localStorage.getItem(KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (
            parsed.settings &&
            Array.isArray(parsed.students) &&
            Array.isArray(parsed.submissions)
          )
            setData(parsed);
        }
      } catch {
        /* Fresh demo if storage is unavailable. */
      }
    }
    refresh().finally(() => setReady(true));
  }, [demo, refresh]);
  const update = (fn: (d: AppData) => AppData) =>
    setData((prev) => {
      const next = fn(prev);
      if (demo) {
        try {
          localStorage.setItem(KEY, JSON.stringify(next));
        } catch {
          notify(
            "Browser storage is full. Changes will last for this visit only.",
          );
        }
      }
      return next;
    });
  const demoLogin = (role: "student" | "admin") =>
    update((d) => ({
      ...d,
      profile:
        role === "admin"
          ? {
              ...demoStudent,
              id: "demo-admin",
              full_name: "Competition Admin",
              role: "admin",
            }
          : ({
              ...(d.students.find((s) => s.id === demoStudent.id) ||
                demoStudent),
            } as Profile),
    }));
  const logout = async (isAdmin?: boolean) => {
    if (!demo) await request(isAdmin ? "auth/admin-logout" : "auth/logout", { method: "POST" });
    update((d) => ({ ...d, profile: null }));
  };
  const resetDemo = () => {
    if (demo) {
      update(() => createDemo());
      notify("Demo reset to the original sample data.");
    }
  };
  return (
    <Context.Provider
      value={{
        data,
        ready,
        demo,
        error,
        toast,
        notify,
        refresh,
        update,
        demoLogin,
        resetDemo,
        logout,
      }}
    >
      {children}
      {toast && (
        <div className="toast" role="status">
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            ×
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
export function useApp() {
  const c = useContext(Context);
  if (!c) throw new Error("Missing provider");
  return c;
}
