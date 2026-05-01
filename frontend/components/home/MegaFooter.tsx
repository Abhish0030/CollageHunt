"use client";

import { Facebook, Instagram, Linkedin, Play, Twitter, Youtube } from "lucide-react";
import Link from "next/link";

const footerColumns = [
  { title: "Top Colleges", items: ["M.B.A", "B.Tech/B.E", "MCA", "BCA", "M.Tech", "MA", "BA"] },
  { title: "Top Universities", items: ["Engineering", "Management", "Medical", "Law", "Commerce", "Science", "Arts"] },
  { title: "Top Exam", items: ["CAT", "GATE", "Jee-Main", "NEET", "XAT", "CLAT", "MAT"] },
  { title: "Study Abroad", items: ["Canada", "USA", "UK", "UAE", "Australia", "Germany", "Sweden", "Ireland", "New Zealand", "Hong Kong", "Singapore", "Malaysia", "Italy"] },
  { title: "Board Exams", items: ["CBSE Class 12", "CBSE Class 12th Results", "CBSE Class 12th Syllabus", "CBSE Class 12th Exam Dates", "CBSE Class 10", "CBSE Class 10th Result", "CBSE Class 10th Syllabus"] },
] as const;

const otherLinks = ["About Gradly", "Contact Us", "Terms & Conditions", "Privacy Policy"] as const;
const socials = [
  { icon: Facebook, label: "Facebook" },
  { icon: Instagram, label: "Instagram" },
  { icon: Twitter, label: "Twitter" },
  { icon: Youtube, label: "YouTube" },
  { icon: Linkedin, label: "LinkedIn" },
] as const;

export const MegaFooter = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-300">{column.title}</h3>
              <div className="mt-4 space-y-3">
                {column.items.map((item) => (
                  <Link key={item} href="/" className="block text-sm text-slate-300 transition hover:text-white">
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <div className="flex flex-wrap gap-4">
            {otherLinks.map((item) => (
              <Link key={item} href="/" className="text-sm text-slate-300 transition hover:text-white">
                {item}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.label}
                  href="/"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-slate-300 transition hover:border-white/30 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-black tracking-tight">
              Grad<span className="text-blue-400">ly</span>
            </div>
            <p className="text-sm text-slate-400">© 2026 Gradly. All Rights Reserved.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-400">Download the Gradly app on</span>
            <a href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">
              <Play className="h-4 w-4" />
              Google Play
            </a>
            <a href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200">
              <Play className="h-4 w-4" />
              App Store
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MegaFooter;
