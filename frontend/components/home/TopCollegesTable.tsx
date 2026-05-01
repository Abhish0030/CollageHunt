"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { fetchTopColleges } from "@/lib/api";
import { formatCurrency, getInitials } from "@/lib/utils";

const coursePills = ["BE/B.Tech", "MBA/PGDM", "MBBS", "ME/M.Tech", "B.Sc", "BA", "B.Com", "BCA", "BBA/BMS", "B.Sc (Nursing)"] as const;

const getRankingLabel = (index: number) => `#${index + 2} out of ${50 + index * 9} in India 2025`;
const getCutoffLabel = (course: string, index: number) => {
  const exam = course.includes("MBA")
    ? "CAT"
    : course.includes("MBBS")
      ? "NEET"
      : course.includes("B.Com")
        ? "CUET"
        : "JEE Main";

  return `${exam} ${95 - index} percentile`;
};
const getDeadlineLabel = (index: number) => `Apr ${10 + index} - May ${5 + index}, 2026`;

export const TopCollegesTable = () => {
  const [activeCourse, setActiveCourse] = useState<(typeof coursePills)[number]>("BE/B.Tech");

  const collegesQuery = useQuery({
    queryKey: ["top-colleges", activeCourse],
    queryFn: () => fetchTopColleges(activeCourse, 10),
  });

  const colleges = collegesQuery.data ?? [];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Top 10 Colleges</h2>
        <div className="scrollbar-hide mb-6 flex gap-3 overflow-x-auto pb-2 scroll-smooth">
          {coursePills.map((pill) => (
            <button
              key={pill}
              type="button"
              onClick={() => setActiveCourse(pill)}
              className={
                activeCourse === pill
                  ? "rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-600"
              }
            >
              {pill}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-4 font-semibold">Rank</th>
                  <th className="px-4 py-4 font-semibold">College</th>
                  <th className="px-4 py-4 font-semibold">Ranking</th>
                  <th className="px-4 py-4 font-semibold">Cutoff</th>
                  <th className="px-4 py-4 font-semibold">Application Deadline</th>
                  <th className="px-4 py-4 font-semibold">Total Fees</th>
                </tr>
              </thead>
              <tbody>
                {collegesQuery.isLoading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                        <td colSpan={6} className="px-4 py-5">
                          <div className="h-14 animate-pulse rounded-xl bg-slate-200" />
                        </td>
                      </tr>
                    ))
                  : colleges.map((college, index) => (
                      <tr
                        key={college.id}
                        className={`${index % 2 === 0 ? "bg-white" : "bg-slate-50"} transition hover:bg-blue-50`}
                      >
                        <td className="px-4 py-5 text-lg font-bold text-gray-400">#{index + 1}</td>
                        <td className="px-4 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                              {getInitials(college.name)}
                            </div>
                            <div>
                              <Link href={`/college/${college.slug}`} className="font-semibold text-slate-900 hover:text-blue-700">
                                {college.name}
                              </Link>
                              <p className="mt-1 text-xs text-slate-500">
                                {college.city}, {college.state} | ⭐ {college.rating.toFixed(1)}/5
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-5">
                          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                            <span className="rounded-full bg-blue-700 px-2 py-1 text-[10px] text-white">NIRF</span>
                            {getRankingLabel(index)}
                          </div>
                        </td>
                        <td className="px-4 py-5 font-semibold text-slate-900">
                          {getCutoffLabel(activeCourse, index)}
                        </td>
                        <td className="px-4 py-5 text-sm text-slate-600">{getDeadlineLabel(index)}</td>
                        <td className="px-4 py-5 font-semibold text-slate-900">{formatCurrency(college.feesPerYear)}</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopCollegesTable;
