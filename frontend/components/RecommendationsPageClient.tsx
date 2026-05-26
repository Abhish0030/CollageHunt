"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { GraduationCap, LaptopMinimal, MapPin, ScrollText } from "lucide-react";
import { CollegeCard } from "@/components/CollegeCard";
import {
  getRecommendedColleges,
  getRecommendedOnlineDegrees,
  type OnlineDegree,
} from "@/lib/recommendations";
import type { RecommendationPreferences } from "@/store/authStore";
import type { College } from "@/types/api";

const parsePreferences = (searchParams: URLSearchParams): RecommendationPreferences => ({
  interests: (searchParams.get("interests") ?? "").split(",").filter(Boolean),
  exams: (searchParams.get("exams") ?? "").split(",").filter(Boolean),
  preferredLocation: searchParams.get("preferredLocation") ?? "",
  preferredStates: (searchParams.get("preferredStates") ?? "").split(",").filter(Boolean),
  preferredCollegeIds: (searchParams.get("preferredCollegeIds") ?? "")
    .split(",")
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0),
  budget: (searchParams.get("budget") as RecommendationPreferences["budget"]) ?? "medium",
  studyMode: (searchParams.get("studyMode") as RecommendationPreferences["studyMode"]) ?? "hybrid",
});

const DegreeCard = ({ degree }: { degree: OnlineDegree }) => (
  <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{degree.stream}</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950">{degree.title}</h3>
        <p className="mt-1 text-sm text-slate-500">{degree.provider}</p>
      </div>
      <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{degree.mode}</div>
    </div>
    <p className="mt-4 text-sm leading-7 text-slate-600">{degree.highlight}</p>
    <div className="mt-4 flex items-center gap-4 text-sm text-slate-500">
      <span>{degree.duration}</span>
      <span>{degree.feeLabel}</span>
    </div>
  </article>
);

export const RecommendationsPageClient = ({ colleges }: { colleges: College[] }) => {
  const searchParams = useSearchParams();
  const preferences = useMemo(() => parsePreferences(searchParams), [searchParams]);

  const recommendedColleges = useMemo(
    () => getRecommendedColleges(colleges, preferences),
    [colleges, preferences],
  );
  const recommendedDegrees = useMemo(
    () => getRecommendedOnlineDegrees(preferences),
    [preferences],
  );
  const selectedColleges = colleges.filter((college) => preferences.preferredCollegeIds.includes(college.id));

  return (
    <div className="container-shell py-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-slate-800/60 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_28%),radial-gradient(circle_at_85%_22%,rgba(249,115,22,0.18),transparent_20%),linear-gradient(135deg,#050816_0%,#0b1330_46%,#111827_100%)] px-6 py-12 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,rgba(255,255,255,0)_38%)]" />
        <div className="absolute -right-20 top-10 h-48 w-48 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-orange-400/10 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">Personalized Recommendations</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Colleges and online degree options tailored to your interests.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            We used your selected interests, exam plans, budget, preferred location, and study format to build this shortlist.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {preferences.interests.map((interest) => (
              <span
                key={interest}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
              >
                {interest}
              </span>
            ))}
            {preferences.preferredStates.map((state) => (
              <span
                key={state}
                className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
              >
                State: {state}
              </span>
            ))}
            {preferences.preferredLocation ? (
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                <MapPin className="mr-2 inline" size={14} />
                {preferences.preferredLocation}
              </span>
            ) : null}
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              Budget: {preferences.budget}
            </span>
            <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              Mode: {preferences.studyMode}
            </span>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700">
              <ScrollText size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Targeted exams</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                Stay focused on the exams that best unlock your preferred colleges and programs.
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {preferences.exams.length > 0 ? (
              preferences.exams.map((exam) => (
                <span key={exam} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                  {exam}
                </span>
              ))
            ) : (
              <p className="text-sm text-slate-500">No exams selected. You can still explore college and degree matches below.</p>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <LaptopMinimal size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-950">Recommendation logic</h2>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                We prioritize matching course streams first, then budget fit, location fit, and stronger rating outcomes.
              </p>
            </div>
          </div>
          {selectedColleges.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-3">
              {selectedColleges.map((college) => (
                <span key={college.id} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">
                  {college.name}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Campus Matches</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Recommended colleges for your profile</h2>
          </div>
        </div>
        {recommendedColleges.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {recommendedColleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <GraduationCap className="mx-auto text-slate-400" size={28} />
            <h3 className="mt-4 text-xl font-semibold text-slate-900">No direct college matches yet</h3>
            <p className="mt-3 text-sm text-slate-500">
              Try widening your location or budget preferences next time to unlock more recommendations.
            </p>
          </div>
        )}
      </section>

      <section className="mt-12">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-700">Flexible Pathways</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Online degree options based on your interests</h2>
        </div>
        <div className="grid gap-5 lg:grid-cols-2">
          {recommendedDegrees.map((degree) => (
            <DegreeCard key={degree.id} degree={degree} />
          ))}
        </div>
      </section>
    </div>
  );
};
