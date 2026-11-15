import type { Metadata } from "next";
import { Provider } from "@/components/provider";
import { AppearanceProvider } from "@/components/appearance";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "VSpark — Build something that matters.",
    template: "%s · VSpark",
  },
  description:
    "A university web development competition. Turn your ideas into impact, build with purpose, and put your skills to the test.",
  icons: {
    icon: "/favicon.webp",
    shortcut: "/favicon.webp",
    apple: "/favicon.webp",
  },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const demo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.webp" type="image/webp" />
        <link rel="shortcut icon" href="/favicon.webp" />
        <link rel="apple-touch-icon" href="/favicon.webp" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('vspark-appearance');document.documentElement.dataset.theme=t==='dark'||(t!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light'}catch(e){document.documentElement.dataset.theme=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}})();`,
          }}
        />
      </head>
      <body>
        <AppearanceProvider>
          <Provider demo={demo}>{children}</Provider>
        </AppearanceProvider>
      </body>
    </html>
  );
}
