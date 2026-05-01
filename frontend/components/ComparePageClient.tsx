"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchComparedColleges } from "@/lib/api";
import { formatCurrency, formatLpa } from "@/lib/utils";
import { useCompareStore } from "@/store/compareStore";

const naacScore: Record<string, number> = {
  "A++": 6,
  "A+": 5,
  A: 4,
  "B++": 3,
  "B+": 2,
  B: 1,
};

const getBestIndices = (values: number[], preference: "max" | "min") => {
  const target = preference === "max" ? Math.max(...values) : Math.min(...values);
  return values.map((value) => value === target);
};

export const ComparePageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { ids, removeCollege } = useCompareStore();

  const paramIds = (searchParams.get("ids") ?? "")
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  const effectiveIds = paramIds.length > 0 ? paramIds : ids;

  const query = useQuery({
    queryKey: ["compare", effectiveIds],
    queryFn: () => fetchComparedColleges(effectiveIds),
    enabled: effectiveIds.length >= 2,
  });

  if (effectiveIds.length < 2) {
    return (
      <div className="container-shell py-16 text-center">
        <h1 className="text-3xl font-semibold text-slate-900">Choose at least two colleges to compare</h1>
        <p className="mt-3 text-slate-500">Add colleges from the listing page and they will appear here instantly.</p>
        <Link href="/colleges" className="button-primary mt-6">
          Add another college
        </Link>
      </div>
    );
  }

  if (query.isLoading) {
    return (
      <div className="container-shell py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading comparison table...
        </div>
      </div>
    );
  }

  const colleges = query.data ?? [];
  const feeHighlights = getBestIndices(colleges.map((college) => college.feesPerYear), "min");
  const avgPackageHighlights = getBestIndices(colleges.map((college) => college.avgPackage), "max");
  const placementHighlights = getBestIndices(colleges.map((college) => college.placementPct), "max");
  const ratingHighlights = getBestIndices(colleges.map((college) => college.rating), "max");
  const reviewsHighlights = getBestIndices(colleges.map((college) => college._count?.reviews ?? 0), "max");
  const naacHighlights = getBestIndices(colleges.map((college) => naacScore[college.naacGrade] ?? 0), "max");
  const courseHighlights = getBestIndices(colleges.map((college) => college.courses.length), "max");

  const removeAndSync = (collegeId: number) => {
    const nextIds = effectiveIds.filter((id) => id !== collegeId);
    removeCollege(collegeId);
    router.replace(nextIds.length > 0 ? `/compare?ids=${nextIds.join(",")}` : "/compare");
  };

  return (
    <div className="container-shell py-10">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Comparison Desk</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Compare colleges side by side</h1>
        </div>
        <Link href="/colleges" className="button-secondary">
          Add another college
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="min-w-[900px] w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-500">Criteria</th>
              {colleges.map((college) => (
                <th key={college.id} className="px-6 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{college.name}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {college.city}, {college.state}
                      </p>
                    </div>
                    <button type="button" onClick={() => removeAndSync(college.id)} className="text-xs font-semibold text-rose-600">
                      Remove
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {[
              {
                label: "Location",
                values: colleges.map((college) => `${college.city}, ${college.state}`),
              },
              {
                label: "Fees (annual)",
                values: colleges.map((college) => formatCurrency(college.feesPerYear)),
                highlights: feeHighlights,
              },
              {
                label: "NAAC Grade",
                values: colleges.map((college) => college.naacGrade),
                highlights: naacHighlights,
              },
              {
                label: "Avg Package",
                values: colleges.map((college) => formatLpa(college.avgPackage)),
                highlights: avgPackageHighlights,
              },
              {
                label: "Placement %",
                values: colleges.map((college) => `${college.placementPct}%`),
                highlights: placementHighlights,
              },
              {
                label: "Rating",
                values: colleges.map((college) => college.rating.toFixed(1)),
                highlights: ratingHighlights,
              },
              {
                label: "Courses offered",
                values: colleges.map((college) => String(college.courses.length)),
                highlights: courseHighlights,
              },
              {
                label: "Total reviews",
                values: colleges.map((college) => String(college._count?.reviews ?? 0)),
                highlights: reviewsHighlights,
              },
            ].map((row) => (
              <tr key={row.label}>
                <td className="px-6 py-4 font-medium text-slate-700">{row.label}</td>
                {row.values.map((value, index) => (
                  <td
                    key={`${row.label}-${index}`}
                    className={`px-6 py-4 text-slate-600 ${
                      row.highlights?.[index] ? "bg-emerald-50 text-emerald-900" : ""
                    }`}
                  >
                    {value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
