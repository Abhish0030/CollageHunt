"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  HeartPulse,
  Newspaper,
  Scale,
  Search,
} from "lucide-react";
import Link from "next/link";
import { CollegeCard } from "@/components/CollegeCard";
import { HelpDashboardWidget } from "@/components/help/HelpDashboardWidget";
import { fetchColleges, fetchFeaturedColleges } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export const GradlyDashboard = () => {
  const featuredQuery = useQuery({
    queryKey: ["homepage-featured"],
    queryFn: () => fetchFeaturedColleges(),
  });

  const directoryQuery = useQuery({
    queryKey: ["homepage-directory"],
    queryFn: () => fetchColleges({ limit: 40, page: 1 }),
  });

  if (featuredQuery.isLoading || directoryQuery.isLoading) {
    return (
      <div className="container-shell py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-12 rounded-full bg-slate-200" />
          <div className="h-80 rounded-[2rem] bg-slate-200" />
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-48 rounded-2xl bg-slate-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const featured = featuredQuery.data ?? [];
  const directory = directoryQuery.data;
  const allColleges = directory?.data ?? [];
  const states = new Set(allColleges.map((college) => college.state));
  const courses = new Set(allColleges.flatMap((college) => college.courses.map((course) => course.name)));
  const reviewCount = allColleges.reduce((sum, college) => sum + (college._count?.reviews ?? 0), 0);
  const affordablePicks = [...allColleges].sort((a, b) => a.feesPerYear - b.feesPerYear).slice(0, 4);
  const managementPicks = allColleges
    .filter((college) => college.courses.some((course) => course.name === "MBA"))
    .slice(0, 4);

  const dashboardCategories = [
    { label: "Engineering", icon: GraduationCap, href: "/colleges?course=B.Tech" },
    { label: "Medicine", icon: HeartPulse, href: "/colleges?course=MBBS" },
    { label: "Law", icon: Scale, href: "/colleges?search=law" },
    { label: "Management", icon: BriefcaseBusiness, href: "/colleges?course=MBA" },
    { label: "University", icon: Building2, href: "/colleges" },
  ];

  const predictorShortcuts = [
    "JEE Main College Predictor",
    "NEET College Predictor",
    "CAT MBA Shortlist",
  ];

  const latestUpdates = [
    {
      title: "Live admission updates for top engineering and MBA colleges",
      meta: "Updated for the current shortlist season",
    },
    {
      title: "Track fee trends, placement signals, and location fit together",
      meta: "Built for faster decision-making",
    },
    {
      title: "Compare campus and online pathways before you commit",
      meta: "Useful for hybrid and flexible learners",
    },
  ];

  return (
    <div className="pb-16">
      <section className="border-b border-white/60 bg-white/70 backdrop-blur">
        <div className="container-shell flex flex-wrap items-center justify-center gap-3 py-4 lg:justify-between">
          {dashboardCategories.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:text-blue-700"
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </section>

      <section className="bg-[linear-gradient(180deg,#f5f2ff_0%,#eef3ff_100%)]">
        <div className="container-shell grid gap-10 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">Student Guidance Dashboard</p>
            <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
              Empowering students, building sharper college decisions.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">
              Search colleges, compare real outcomes, discover online degree pathways, and move from uncertainty to a clearer shortlist.
            </p>

            <form action="/colleges" className="mt-8 max-w-xl">
              <div className="flex items-center gap-3 rounded-full border border-blue-100 bg-white px-5 py-3 shadow-sm">
                <Search size={18} className="text-slate-400" />
                <input
                  name="search"
                  placeholder="Search colleges, exams, courses, and cities"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
                <button type="submit" className="rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600">
                  Search
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-3">
              {predictorShortcuts.map((shortcut) => (
                <Link
                  key={shortcut}
                  href="/recommendations"
                  className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-white"
                >
                  <span className="mr-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Popular
                  </span>
                  {shortcut}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(147,197,253,0.45),transparent_30%),linear-gradient(145deg,#242647_0%,#4a4f9b_58%,#9be7e7_100%)] p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">Verified Guidance</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight">
                  Turn your score into better college opportunities.
                </h2>
              </div>
              <div className="rounded-2xl bg-white/90 px-4 py-3 text-right text-slate-900 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">Verified Data</p>
                <p className="mt-1 text-xs text-slate-500">Official counselling style guidance</p>
              </div>
            </div>

            <p className="mt-6 max-w-lg text-base leading-8 text-blue-50/90">
              Predict your best-fit colleges using exam direction, course category, budget, state preference, and campus-vs-online flexibility.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Link href="/recommendations" className="inline-flex items-center justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                Explore Recommendation Engine
                <ArrowRight className="ml-2" size={16} />
              </Link>
              <div className="rounded-3xl bg-white/85 p-4 text-slate-900 shadow-xl">
                <p className="text-sm font-semibold">Cutoff trend snapshot</p>
                <div className="mt-3 flex items-end gap-2">
                  {["h-7", "h-10", "h-8", "h-8", "h-14"].map((heightClass, index) => (
                    <div key={index} className={`w-6 rounded-t-md bg-blue-500/80 ${heightClass}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell -mt-8">
        <div className="rounded-[1.75rem] border border-white/70 bg-white/95 p-6 shadow-xl backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Latest News and Notifications</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Stay on top of admissions, results, and form deadlines</h2>
            </div>
            <Link href="/colleges" className="text-sm font-semibold text-blue-700">
              View all
            </Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {latestUpdates.map((item) => (
              <article key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-3 text-orange-500 shadow-sm">
                    <Newspaper size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-6 text-slate-900">{item.title}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-500">{item.meta}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="container-shell mt-12 grid gap-12">
        <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Counselling</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              Ease your biggest doubts with clearer pathways and smarter shortlists.
            </h2>
            <p className="mt-4 text-base leading-8 text-slate-600">
              Move beyond generic ranking lists. Gradly helps you match scores, outcomes, and preferences with colleges that actually fit.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                { label: "Colleges in directory", value: `${allColleges.length}+` },
                { label: "States covered", value: `${states.size}+` },
                { label: "Course categories", value: `${courses.size}` },
                { label: "Student reviews", value: `${reviewCount}+` },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-3xl font-semibold text-slate-950">{stat.value}</p>
                  <p className="mt-2 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-300">Affordable Picks</p>
              <h3 className="mt-3 text-2xl font-semibold">Budget-friendly colleges with strong visibility</h3>
              <div className="mt-6 space-y-4">
                {affordablePicks.map((college) => (
                  <div key={college.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="font-semibold">{college.name}</p>
                    <p className="mt-1 text-sm text-slate-300">
                      {college.city}, {college.state}
                    </p>
                    <p className="mt-3 text-sm font-medium text-blue-200">{formatCurrency(college.feesPerYear)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] bg-[linear-gradient(160deg,#fff7ed_0%,#ffffff_45%,#eef2ff_100%)] p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-600">Management Focus</p>
              <h3 className="mt-3 text-2xl font-semibold text-slate-950">Top MBA-friendly campuses to compare next</h3>
              <div className="mt-6 space-y-4">
                {managementPicks.map((college) => (
                  <div key={college.id} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-slate-900">{college.name}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {college.city}, {college.state}
                    </p>
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      Avg package: {formatCurrency(college.avgPackage)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Featured Colleges</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
                Top-rated campuses students shortlist first
              </h2>
            </div>
            <Link href="/colleges" className="text-sm font-semibold text-blue-700">
              View all colleges
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {featured.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        </section>

        <HelpDashboardWidget />
      </div>
    </div>
  );
};

export default GradlyDashboard;
