"use client";

import Link from "next/link";
import { useState } from "react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import { formatCurrency, formatLpa } from "@/lib/utils";
import type { College } from "@/types/api";

const tabs = ["Overview", "Courses", "Placements", "Reviews"] as const;

export const CollegeDetailClient = ({ college }: { college: College }) => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <div className="container-shell py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Colleges", href: "/colleges" },
          { label: college.name },
        ]}
      />

      <section className="rounded-3xl bg-slate-950 px-6 py-10 text-white shadow-card">
        <p className="text-sm uppercase tracking-[0.18em] text-blue-300">{college.naacGrade} Accredited</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">{college.name}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <span>
            {college.city}, {college.state}
          </span>
          <span>Established {college.establishedYear}</span>
          <div className="flex items-center gap-2">
            <StarRating rating={college.rating} />
            <span>{college.rating.toFixed(1)}</span>
          </div>
        </div>
      </section>

      <div className="sticky top-20 z-20 mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white/90 p-2 backdrop-blur">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                activeTab === tab ? "bg-blue-700 text-white" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {activeTab === "Overview" ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Overview</h2>
              <div className="mt-5 grid gap-4 text-sm">
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-slate-500">Annual fees</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(college.feesPerYear)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-slate-500">NAAC grade</span>
                  <span className="font-semibold text-slate-900">{college.naacGrade}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                  <span className="text-slate-500">Established</span>
                  <span className="font-semibold text-slate-900">{college.establishedYear}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-2 text-slate-500">Official website</p>
                  <Link href={college.website ?? "#"} target="_blank" className="font-semibold text-blue-700">
                    {college.website}
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Fees Breakdown</h2>
              <div className="mt-5 space-y-3">
                {college.courses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                    <div>
                      <p className="font-semibold text-slate-900">{course.name}</p>
                      <p className="text-sm text-slate-500">{course.duration} years</p>
                    </div>
                    <p className="font-semibold text-slate-900">{formatCurrency(course.fees)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "Courses" ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Course</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Seats</th>
                  <th className="px-6 py-4 font-medium">Fees / year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {college.courses.map((course) => (
                  <tr key={course.id}>
                    <td className="px-6 py-4 font-semibold text-slate-900">{course.name}</td>
                    <td className="px-6 py-4 text-slate-600">{course.duration} years</td>
                    <td className="px-6 py-4 text-slate-600">{course.seats}</td>
                    <td className="px-6 py-4 text-slate-600">{formatCurrency(course.fees)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ) : null}

        {activeTab === "Placements" ? (
          <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Placement Snapshot</h2>
              <div className="mt-5 grid gap-4">
                <div className="rounded-xl bg-emerald-50 p-4">
                  <p className="text-sm text-emerald-700">Placement rate</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-900">{college.placementPct}%</p>
                </div>
                <div className="rounded-xl bg-blue-50 p-4">
                  <p className="text-sm text-blue-700">Average package</p>
                  <p className="mt-2 text-2xl font-semibold text-blue-900">{formatLpa(college.avgPackage)}</p>
                </div>
                <div className="rounded-xl bg-amber-50 p-4">
                  <p className="text-sm text-amber-700">Highest package</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-900">{formatLpa(college.highestPackage)}</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Top Recruiters</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                {college.topRecruiters.map((recruiter) => (
                  <span key={recruiter} className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                    {recruiter}
                  </span>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "Reviews" ? (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Student Reviews</h2>
              <p className="text-sm text-slate-500">{college._count?.reviews ?? college.reviews?.length ?? 0} total reviews</p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {college.reviews?.map((review) => <ReviewCard key={review.id} review={review} />)}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};
