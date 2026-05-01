"use client";

import { ArrowRight, BarChart3, BookOpen, GitCompareArrows, SearchCheck, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";

const pills = ["All", "BE/B.Tech", "MBA/PGDM", "MBBS", "ME/M.Tech", "B.Sc", "BA", "B.Com", "BCA", "BBA/BMS"] as const;

const compareRows = [
  "IIT Madras BE/B.Tech vs IIT Delhi BE/B.Tech",
  "IIT Madras BE/B.Tech vs IIT Bombay BE/B.Tech",
] as const;

const examTags = ["B.Com", "B.Sc", "B.Sc (Nursing)", "BA", "BBA/BMS", "BCA", "BE/B.Tech"] as const;
const predictorTags = ["JEE Main", "JEE Advanced", "CUET", "CAT", "NEET", "TS EAMCET", "MAT"] as const;

const cards = [
  {
    title: "Ranking",
    subtitle: "College ranked based on real data",
    content: "Gradly - 2899   NIRF - 1780   Outlook - 1388",
    link: "Top Ranked Colleges in India",
    icon: Trophy,
    accent: "bg-amber-50 text-amber-700",
  },
  {
    title: "Find Colleges",
    subtitle: "Discover 19000+ colleges via preferences",
    content: "Best MBA colleges in India\nBest BTech colleges in India",
    link: "Discover Top Colleges in India",
    icon: SearchCheck,
    accent: "bg-blue-50 text-blue-700",
  },
  {
    title: "Compare Colleges",
    subtitle: "Compare on the basis of rank, fees, etc.",
    content: compareRows.join("\n"),
    link: "Compare Colleges",
    icon: GitCompareArrows,
    accent: "bg-violet-50 text-violet-700",
  },
  {
    title: "Exams",
    subtitle: "Know more about your exams",
    content: examTags.join("  "),
    link: "Check All Entrance Exams in India",
    icon: BookOpen,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    title: "College Predictor",
    subtitle: "Know your college admission chances",
    content: predictorTags.join("  "),
    link: "Find Where you may get Admission",
    icon: Sparkles,
    accent: "bg-orange-50 text-orange-700",
  },
  {
    title: "Course Finder",
    subtitle: "Discover top courses in Indian Colleges 2026",
    content: "BE/B.Tech - 969   MBA/PGDM - 1089   ME/M.Tech - 1223   B.Sc - 1045",
    link: "Get Top Courses in Indian Colleges",
    icon: BarChart3,
    accent: "bg-sky-50 text-sky-700",
  },
] as const;

export const ExploreProgramsGrid = () => {
  const [activePill, setActivePill] = useState<(typeof pills)[number]>("All");

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Explore Programs</h2>
        <div className="scrollbar-hide mb-6 flex gap-3 overflow-x-auto pb-2 scroll-smooth">
          {pills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setActivePill(pill)}
              className={
                activePill === pill
                  ? "rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-600"
              }
            >
              {pill}
            </button>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => {
            const Icon = card.icon;
            const contentRows = card.content.split("\n");

            return (
              <article key={card.title} className="rounded-xl border border-[#e5e7eb] bg-white p-5 transition-shadow duration-200 hover:shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{card.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{card.subtitle}</p>
                  </div>
                  <div className={`rounded-2xl p-3 ${card.accent}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
                <div className="mt-5 space-y-3 text-sm text-slate-700">
                  {contentRows.map((row) => (
                    <p key={row}>{row}</p>
                  ))}
                </div>
                <div className="mt-5 border-t border-slate-200 pt-3">
                  <a href="/colleges" className="inline-flex items-center text-sm text-gray-700">
                    {card.link}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ExploreProgramsGrid;
