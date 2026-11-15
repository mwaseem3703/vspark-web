"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";

const Appearance = createContext({ dark: false, toggle: () => {} });
const STORAGE_KEY = "vspark-appearance";

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      let saved: string | null = null;
      try {
        saved = localStorage.getItem(STORAGE_KEY);
      } catch {}
      const next =
        saved === "dark" || (saved !== "light" && preference.matches);
      document.documentElement.dataset.theme = next ? "dark" : "light";
      setDark(next);
    };
    sync();
    preference.addEventListener("change", sync);
    window.addEventListener("storage", sync);
    return () => {
      preference.removeEventListener("change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let intersection: IntersectionObserver | undefined;
    let mutations: MutationObserver | undefined;
    const selector =
      "[data-reveal], .page-heading, .stat-card, .settings-card, .auth-card, .results-locked, .podium-card";
    const observed = new Set<HTMLElement>();
    let frame = 0;
    let landing: HTMLElement | null = null;
    let journey: HTMLElement | null = null;
    const paintScroll = () => {
      frame = 0;
      if (reduced.matches) return;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      document.documentElement.style.setProperty(
        "--page-progress",
        String(height > 0 ? Math.min(1, window.scrollY / height) : 0),
      );
      landing = document.querySelector<HTMLElement>(".hero");
      journey = document.querySelector<HTMLElement>("#how-it-works");
      if (landing) {
        const bounds = landing.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, -bounds.top / bounds.height));
        landing.style.setProperty("--hero-scroll", String(progress));
      }
      if (journey) {
        const bounds = journey.getBoundingClientRect();
        const progress = Math.min(
          1,
          Math.max(
            0,
            (window.innerHeight * 0.8 - bounds.top) /
              Math.max(1, bounds.height * 0.8),
          ),
        );
        journey.style.setProperty("--journey-progress", String(progress));
      }
    };
    const scheduleScroll = () => {
      if (!frame) frame = requestAnimationFrame(paintScroll);
    };
    const start = () => {
      intersection?.disconnect();
      mutations?.disconnect();
      observed.forEach((node) =>
        node.classList.remove("motion-reveal", "is-in-view"),
      );
      observed.clear();
      if (reduced.matches || !("IntersectionObserver" in window)) return;
      intersection = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const node = entry.target as HTMLElement;
            if (entry.isIntersecting) {
              node.classList.add("is-in-view");
            } else if (!node.contains(document.activeElement)) {
              // Re-arm only after the entire element has left the screen.
              // This makes a second pass through the page feel alive too.
              const bounds = node.getBoundingClientRect();
              if (bounds.bottom <= 0 || bounds.top >= window.innerHeight * 0.9)
                node.classList.remove("is-in-view");
            }
          });
        },
        { threshold: [0, 0.12], rootMargin: "0px 0px -8% 0px" },
      );
      const register = () => {
        observed.forEach((node) => {
          if (!node.isConnected) {
            intersection?.unobserve(node);
            observed.delete(node);
          }
        });
        document.querySelectorAll<HTMLElement>(selector).forEach((node) => {
          if (observed.has(node)) return;
          observed.add(node);
          const siblings = Array.from(
            node.parentElement?.children || [],
          ).filter((sibling) => sibling.matches(selector));
          node.style.setProperty(
            "--reveal-delay",
            `${Math.min(3, siblings.indexOf(node)) * (window.innerWidth < 650 ? 85 : 140)}ms`,
          );
          node.classList.add("motion-reveal");
          const bounds = node.getBoundingClientRect();
          if (bounds.top < window.innerHeight * 0.9 && bounds.bottom > 0)
            node.classList.add("is-in-view");
          intersection?.observe(node);
        });
        scheduleScroll();
      };
      register();
      mutations = new MutationObserver(register);
      mutations.observe(document.body, { childList: true, subtree: true });
    };
    start();
    window.addEventListener("scroll", scheduleScroll, { passive: true });
    window.addEventListener("resize", scheduleScroll);
    reduced.addEventListener("change", start);
    return () => {
      intersection?.disconnect();
      mutations?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleScroll);
      window.removeEventListener("resize", scheduleScroll);
      reduced.removeEventListener("change", start);
    };
  }, []);

  function toggle() {
    const next = document.documentElement.dataset.theme !== "dark";
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    } catch {}
    setDark(next);
  }
  return (
    <Appearance.Provider value={{ dark, toggle }}>
      {children}
    </Appearance.Provider>
  );
}

export function ThemeToggle() {
  const { dark, toggle } = useContext(Appearance);
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label="Dark appearance"
      aria-pressed={dark}
      title={dark ? "Switch to light appearance" : "Switch to dark appearance"}
    >
      <Moon className="theme-moon" size={18} aria-hidden="true" />
      <Sun className="theme-sun" size={18} aria-hidden="true" />
    </button>
  );
}
