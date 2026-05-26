import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CompareTray } from "@/components/CompareTray";
import { MegaMenu } from "@/components/MegaMenu";
import { Navbar } from "@/components/Navbar";
import { AppProviders } from "@/providers/AppProviders";
import { getAuthCookieNames } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CollageHunt | Discover Top Colleges in India",
    template: "%s | CollageHunt",
  },
  description:
    "Search, compare, and save top Indian colleges across engineering, management, medical, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = cookies();
  const hasAuthCookie = getAuthCookieNames().some((name) => cookieStore.has(name));

  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-slate-900">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <Navbar hasAuthCookie={hasAuthCookie} />
            <MegaMenu />
            <main className="flex-1 pb-28">{children}</main>
            <CompareTray />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
