import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CompareTray } from "@/components/CompareTray";
import { MegaMenu } from "@/components/MegaMenu";
import { Navbar } from "@/components/Navbar";
import { AppProviders } from "@/providers/AppProviders";
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
  return (
    <html lang="en">
      <body className="min-h-screen font-sans text-slate-900">
        <AppProviders>
          <div className="relative flex min-h-screen flex-col">
            <Navbar />
            <MegaMenu />
            <main className="flex-1 pb-28">{children}</main>
            <CompareTray />
          </div>
        </AppProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
