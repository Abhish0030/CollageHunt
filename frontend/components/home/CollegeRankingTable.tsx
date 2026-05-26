"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { fetchCollegeRankings } from "@/lib/api";
import { getInitials } from "@/lib/utils";

const yearOptions = [2026, 2025, 2024] as const;
const agencies = [
  { label: "CollageHunt", value: "collagehunt" },
  { label: "NIRF", value: "nirf" },
  { label: "Outlook", value: "outlook" },
  { label: "IIRF", value: "iirf" },
  { label: "The Week", value: "the-week" },
] as const;

export const CollegeRankingTable = () => {
  const [year, setYear] = useState<(typeof yearOptions)[number]>(2026);
  const [agency, setAgency] = useState<(typeof agencies)[number]["value"]>("collagehunt");

  const rankingsQuery = useQuery({
    queryKey: ["college-rankings", year, agency],
    queryFn: () => fetchCollegeRankings(year, agency, 10),
  });

  const rows = rankingsQuery.data ?? [];

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-gray-900">College Ranking 2026</h2>
          <Link href="/colleges" className="text-sm font-semibold text-orange-500">
            View all Colleges
          </Link>
        </div>
        <div className="mb-4">
          <select
            value={year}
            onChange={(event) => setYear(Number(event.target.value) as (typeof yearOptions)[number])}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700"
          >
            {yearOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="scrollbar-hide mb-6 flex gap-3 overflow-x-auto pb-2 scroll-smooth">
          {agencies.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setAgency(item.value)}
              className={
                agency === item.value
                  ? "rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-600"
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50 text-left text-sm text-slate-600">
              <tr>
                <th className="px-4 py-4 font-semibold">College</th>
                <th className="px-4 py-4 font-semibold">Ranking</th>
                <th className="px-4 py-4 font-semibold">Streams</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white text-sm text-slate-700">
              {rankingsQuery.isLoading
                ? Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={3} className="px-4 py-4">
                        <div className="h-14 animate-pulse rounded-xl bg-slate-200" />
                      </td>
                    </tr>
                  ))
                : rows.map((college) => (
                    <tr key={college.id} className="transition hover:bg-slate-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                            {getInitials(college.name)}
                          </div>
                          <div>
                            <Link href={`/colleges/${college.slug}`} className="font-semibold text-slate-900 hover:text-blue-700">
                              {college.name} - {college.abbreviation}
                            </Link>
                            <p className="text-xs text-slate-500">{college.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        Rank {college.ranking.rank} out of {college.ranking.total}
                      </td>
                      <td className="px-4 py-4">{college.stream}</td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default CollegeRankingTable;
