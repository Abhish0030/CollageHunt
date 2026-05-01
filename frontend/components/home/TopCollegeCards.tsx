"use client";

import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { fetchFeaturedColleges } from "@/lib/api";
import { formatCurrency, getInitials, getTopCourse } from "@/lib/utils";

const gradients = [
  "from-slate-900 to-slate-700",
  "from-blue-900 to-blue-700",
  "from-indigo-900 to-indigo-700",
  "from-sky-900 to-sky-700",
] as const;

export const TopCollegeCards = () => {
  const featuredQuery = useQuery({
    queryKey: ["prelogin-featured"],
    queryFn: () => fetchFeaturedColleges(8),
  });

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Top Universities/Colleges</h2>
          <button type="button" className="rounded-full border border-slate-200 bg-white p-2 text-slate-700">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="scrollbar-hide flex gap-5 overflow-x-auto pb-2 scroll-smooth">
          {(featuredQuery.data ?? []).map((college, index) => (
            <article key={college.id} className="min-w-[280px] overflow-hidden rounded-xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-md">
              <div className={`relative flex h-40 flex-col justify-between bg-gradient-to-br ${gradients[index % gradients.length]} p-4`}>
                <span className="w-fit rounded-full bg-slate-950/70 px-3 py-1 text-xs font-semibold text-white">cd 10/10</span>
                <div className="flex items-end gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-sm font-bold text-slate-900">
                    {getInitials(college.name)}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{college.name}</p>
                    <p className="text-xs text-white/80">
                      {college.city}, {college.state} | {college.naacGrade}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 p-4">
                <p className="text-sm text-slate-700">
                  {getTopCourse(college.courses)}  ⭐ {college.rating.toFixed(1)}/5  ({college._count?.reviews ?? 0} reviews)
                </p>
                <p className="font-semibold text-orange-500">{formatCurrency(college.feesPerYear)} Total Fees</p>
                <p className="text-xs text-gray-500">Ranked {index + 1} out of 372 Gradly-ranked colleges in India</p>
                <div className="h-px bg-slate-200" />
                <Link href={`/college/${college.slug}`} className="block text-sm text-slate-700">View All Courses and fees ›</Link>
                <a href={college.website ?? "/"} className="block text-sm text-orange-500">Download Brochure ›</a>
                <Link href="/compare" className="block text-sm text-slate-700">Compare ›</Link>
              </div>
            </article>
          ))}

          {featuredQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-[320px] min-w-[280px] animate-pulse rounded-xl bg-slate-200" />
              ))
            : null}
        </div>
      </div>
    </section>
  );
};

export default TopCollegeCards;
