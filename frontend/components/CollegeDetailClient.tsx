"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, GitCompareArrows, MapPin } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ReviewCard } from "@/components/ReviewCard";
import { StarRating } from "@/components/StarRating";
import { getApiErrorMessage, isUnauthorizedError, saveCollege, unsaveCollege } from "@/lib/api";
import { formatCurrency, formatLpa } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useCompareStore } from "@/store/compareStore";
import type { College } from "@/types/api";

const tabs = ["Overview", "Courses & Fees", "Placements", "Reviews", "Admission"] as const;

const placementBars = (college: College) => [
  { label: "Placement rate", value: college.placementPct, suffix: "%" },
  { label: "Average package", value: Math.min(100, Math.round(college.avgPackage / 50000)), suffix: formatLpa(college.avgPackage) },
  { label: "Highest package", value: Math.min(100, Math.round(college.highestPackage / 100000)), suffix: formatLpa(college.highestPackage) },
];

export const CollegeDetailClient = ({ college }: { college: College }) => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const queryClient = useQueryClient();
  const { addCollege, ids, removeCollege } = useCompareStore();
  const { addSavedCollegeId, openAuthModal, removeSavedCollegeId, savedCollegeIds, setSavedCollegeIds, setUser } =
    useAuthStore();
  const isSaved = savedCollegeIds.includes(college.id);
  const isShortlisted = ids.includes(college.id);

  const toggleSave = useMutation({
    mutationFn: async ({ shouldUnsave }: { shouldUnsave: boolean }) =>
      shouldUnsave ? unsaveCollege(college.id) : saveCollege(college.id),
    onMutate: async ({ shouldUnsave }) => {
      const state = useAuthStore.getState();
      if (!state.user) {
        openAuthModal("login");
        throw new Error("AUTH_REQUIRED");
      }

      const previous = state.savedCollegeIds;
      if (shouldUnsave) {
        removeSavedCollegeId(college.id);
      } else {
        addSavedCollegeId(college.id);
      }
      return { previous };
    },
    onSuccess: async (_data, variables) => {
      toast.success(variables.shouldUnsave ? "Removed from saved list" : "Saved to your account");
      await queryClient.invalidateQueries({ queryKey: ["saved-colleges"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error, _variables, context) => {
      if (error instanceof Error && error.message === "AUTH_REQUIRED") {
        return;
      }
      if (context?.previous) {
        setSavedCollegeIds(context.previous);
      }
      if (isUnauthorizedError(error)) {
        setUser(null);
        setSavedCollegeIds([]);
        openAuthModal("login");
        return;
      }
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <div className="container-shell py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Colleges", href: "/colleges" },
          { label: college.name },
        ]}
      />

      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">
              {college.accreditation ?? college.naacGrade} Accredited
            </p>
            <h1 className="mt-3 text-[34px] font-bold tracking-tight text-slate-950">{college.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} />
                {college.city}, {college.state}
              </span>
              <span>NIRF #{college.nirfRank ?? "N/A"}</span>
              <span>Established {college.establishedYear}</span>
              <div className="flex items-center gap-2">
                <StarRating rating={college.rating} />
                <span>{college.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href={college.website ?? "#"} target="_blank" className="button-primary min-w-[180px]">
              Apply now
            </Link>
            <button
              type="button"
              onClick={() => {
                const currentSaved = useAuthStore.getState().savedCollegeIds.includes(college.id);
                toggleSave.mutate({ shouldUnsave: currentSaved });
              }}
              className="button-secondary min-w-[180px]"
            >
              <Bookmark className="mr-2" size={16} />
              {isSaved ? "Saved" : "Save college"}
            </button>
            <button
              type="button"
              onClick={() => {
                if (!isShortlisted && ids.length >= 3) {
                  toast.error("You can shortlist up to 3 colleges at a time");
                  return;
                }
                if (isShortlisted) {
                  removeCollege(college.id);
                  toast.success("Removed from shortlist");
                  return;
                }
                addCollege(college.id);
                toast.success("Added to shortlist");
              }}
              className="button-secondary min-w-[180px]"
            >
              <GitCompareArrows className="mr-2" size={16} />
              {isShortlisted ? "Remove shortlist" : "Shortlist"}
            </button>
          </div>
        </div>
      </section>

      <div className="sticky top-20 z-20 mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
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
                {[
                  ["Annual fees", formatCurrency(college.feesPerYear)],
                  ["Ownership", college.ownership ?? "N/A"],
                  ["Primary stream", college.stream ?? "N/A"],
                  ["NIRF rank", college.nirfRank ? `#${college.nirfRank}` : "Unranked"],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-semibold text-slate-900">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Quick facts</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Average package</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">{formatLpa(college.avgPackage)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Highest package</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">{formatLpa(college.highestPackage)}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Placement rate</p>
                  <p className="mt-1 text-xl font-semibold text-slate-950">{college.placementPct}%</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Official website</p>
                  <Link href={college.website ?? "#"} target="_blank" className="mt-1 block text-sm font-semibold text-blue-700">
                    Visit website
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {activeTab === "Courses & Fees" ? (
          <section className="grid gap-4">
            {college.courses.map((course) => (
              <article key={course.id} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-950">{course.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {course.duration} years · {course.seats} seats
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3 text-right">
                    <p className="text-sm text-slate-500">Fees per year</p>
                    <p className="font-semibold text-slate-950">{formatCurrency(course.fees)}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {activeTab === "Placements" ? (
          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Placement snapshot</h2>
              <div className="mt-6 space-y-5">
                {placementBars(college).map((item) => (
                  <div key={item.label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">{item.label}</span>
                      <span className="font-semibold text-slate-950">{item.suffix}</span>
                    </div>
                    <div className="h-3 rounded-full bg-slate-100">
                      <div className="h-3 rounded-full bg-blue-700" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Top recruiters</h2>
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
              <p className="text-sm text-slate-500">{college._count?.reviews ?? college.reviews?.length ?? 0} approved reviews</p>
            </div>
            {college.reviews && college.reviews.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {college.reviews.map((review) => <ReviewCard key={review.id} review={review} />)}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
                No approved reviews are visible yet.
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "Admission" ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Admission signals</h2>
              <div className="mt-5 space-y-4">
                {college.courses.slice(0, 4).map((course, index) => (
                  <div key={course.id} className="rounded-xl bg-slate-50 p-4">
                    <p className="font-semibold text-slate-950">{course.name}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {course.name.includes("MBA")
                        ? "CAT percentile"
                        : course.name.includes("MBBS")
                          ? "NEET score"
                          : course.name.includes("LL")
                            ? "CLAT rank"
                            : "JEE Main percentile"}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                      Indicative cutoff band: {Math.max(85, Math.round(college.rating * 18) - index)} percentile equivalent
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-xl font-semibold text-slate-900">Application next steps</h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                <li>Shortlist the course you actually want before comparing fees and placements.</li>
                <li>Check the latest counselling or entrance timeline on the official website.</li>
                <li>Review course seats, fee structure, and recruiter mix together before applying.</li>
              </ul>
              <Link href={college.website ?? "#"} target="_blank" className="button-primary mt-6 inline-flex">
                Open official admissions page
              </Link>
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};
