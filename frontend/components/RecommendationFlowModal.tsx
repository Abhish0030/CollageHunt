"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { examOptionsByInterest, interestOptions } from "@/lib/recommendations";
import { fetchColleges } from "@/lib/api";
import { useAuthStore, type RecommendationPreferences } from "@/store/authStore";

const buildQuery = (preferences: RecommendationPreferences) => {
  const params = new URLSearchParams();
  params.set("interests", preferences.interests.join(","));
  params.set("exams", preferences.exams.join(","));
  params.set("preferredLocation", preferences.preferredLocation);
  params.set("preferredStates", preferences.preferredStates.join(","));
  params.set("preferredCollegeIds", preferences.preferredCollegeIds.join(","));
  params.set("budget", preferences.budget);
  params.set("studyMode", preferences.studyMode);
  return params.toString();
};

export const RecommendationFlowModal = () => {
  const router = useRouter();
  const {
    closeRecommendationFlow,
    isRecommendationFlowOpen,
    recommendationPreferences,
    setRecommendationPreferences,
  } = useAuthStore();
  const [step, setStep] = useState(1);
  const [interests, setInterests] = useState<string[]>(recommendationPreferences?.interests ?? []);
  const [exams, setExams] = useState<string[]>(recommendationPreferences?.exams ?? []);
  const [preferredLocation, setPreferredLocation] = useState(
    recommendationPreferences?.preferredLocation ?? "",
  );
  const [preferredStates, setPreferredStates] = useState<string[]>(
    recommendationPreferences?.preferredStates ?? [],
  );
  const [preferredCollegeIds, setPreferredCollegeIds] = useState<number[]>(
    recommendationPreferences?.preferredCollegeIds ?? [],
  );
  const [budget, setBudget] = useState<RecommendationPreferences["budget"]>(
    recommendationPreferences?.budget ?? "medium",
  );
  const [studyMode, setStudyMode] = useState<RecommendationPreferences["studyMode"]>(
    recommendationPreferences?.studyMode ?? "hybrid",
  );
  const directoryQuery = useQuery({
    queryKey: ["recommendation-directory"],
    queryFn: () => fetchColleges({ limit: 40, page: 1 }),
  });
  const colleges = directoryQuery.data?.data ?? [];
  const states = [...new Set(colleges.map((college) => college.state))].sort();

  const availableExams = useMemo(
    () => [...new Set(interests.flatMap((interest) => examOptionsByInterest[interest] ?? []))],
    [interests],
  );

  if (!isRecommendationFlowOpen) {
    return null;
  }

  const preferences: RecommendationPreferences = {
    interests,
    exams,
    preferredLocation,
    preferredStates,
    preferredCollegeIds,
    budget,
    studyMode,
  };

  const finishFlow = () => {
    setRecommendationPreferences(preferences);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("gradly-recommendation-preferences", JSON.stringify(preferences));
    }
    closeRecommendationFlow();
    router.push(`/recommendations?${buildQuery(preferences)}`);
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-950/55 px-4 py-8 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-white/80 bg-white px-6 py-8 shadow-2xl sm:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Welcome to Gradly</p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-950">
            {step === 1 ? "Pick your interests and target exams" : "Tune your recommendation preferences"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            We&apos;ll use these choices to recommend colleges and online degree options that fit your goals.
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-md items-center gap-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex flex-1 items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold ${
                  step >= item ? "border-emerald-500 text-emerald-600" : "border-slate-300 text-slate-400"
                }`}
              >
                {item}
              </div>
              {item < 3 ? <div className="h-1 flex-1 rounded-full bg-slate-200" /> : null}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <div className="mt-10 space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Interests</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {interestOptions.map((interest) => {
                  const active = interests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() =>
                        setInterests((current) =>
                          active ? current.filter((item) => item !== interest) : [...current, interest],
                        )
                      }
                      className={`rounded-2xl border px-4 py-4 text-left transition ${
                        active
                          ? "border-blue-700 bg-blue-50 text-blue-900"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-base font-semibold">{interest}</div>
                      <div className="mt-1 text-xs text-slate-500">Use this to match the right courses and pathways.</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Targeted Exams</p>
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                {availableExams.length > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {availableExams.map((exam) => {
                      const checked = exams.includes(exam);
                      return (
                        <label key={exam} className="flex items-center gap-3 rounded-xl bg-white px-4 py-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setExams((current) =>
                                checked ? current.filter((item) => item !== exam) : [...current, exam],
                              )
                            }
                            className="h-5 w-5 rounded border-slate-300"
                          />
                          <span className="text-sm font-medium text-slate-800">{exam}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Select at least one interest first to unlock suggested exams.</p>
                )}
              </div>
            </div>
          </div>
        ) : step === 2 ? (
          <div className="mt-10 space-y-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Preferred states</p>
              <p className="mt-2 text-sm text-slate-500">Select up to 4 states where you want to study.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {states.map((state) => {
                  const active = preferredStates.includes(state);
                  const disabled = !active && preferredStates.length >= 4;
                  return (
                    <button
                      key={state}
                      type="button"
                      disabled={disabled}
                      onClick={() =>
                        setPreferredStates((current) =>
                          active ? current.filter((item) => item !== state) : [...current, state],
                        )
                      }
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                        active
                          ? "border-blue-700 bg-blue-50 text-blue-900"
                          : "border-slate-200 bg-white text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                      }`}
                    >
                      {state}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Target colleges</p>
              <p className="mt-2 text-sm text-slate-500">Pick up to 4 colleges you are most interested in.</p>
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="grid gap-3">
                  {colleges.slice(0, 16).map((college) => {
                    const checked = preferredCollegeIds.includes(college.id);
                    const disabled = !checked && preferredCollegeIds.length >= 4;
                    return (
                      <label key={college.id} className="flex items-start gap-3 rounded-xl bg-white px-4 py-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disabled}
                          onChange={() =>
                            setPreferredCollegeIds((current) =>
                              checked ? current.filter((item) => item !== college.id) : [...current, college.id],
                            )
                          }
                          className="mt-1 h-5 w-5 rounded border-slate-300"
                        />
                        <span className="text-sm font-medium text-slate-800">
                          {college.name}
                          <span className="mt-1 block text-xs text-slate-500">
                            {college.city}, {college.state}
                          </span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Preferred location</span>
                <input
                  value={preferredLocation}
                  onChange={(event) => setPreferredLocation(event.target.value)}
                  placeholder="City or state"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700"
                />
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Budget range</span>
                <select
                  value={budget}
                  onChange={(event) => setBudget(event.target.value as RecommendationPreferences["budget"])}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-700"
                >
                  <option value="low">Budget friendly</option>
                  <option value="medium">Balanced</option>
                  <option value="high">Premium options</option>
                </select>
              </label>
            </div>

            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Preferred learning format</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  { key: "campus", label: "Campus first" },
                  { key: "hybrid", label: "Hybrid mix" },
                  { key: "online", label: "Online flexible" },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setStudyMode(option.key as RecommendationPreferences["studyMode"])}
                    className={`rounded-2xl border px-4 py-4 text-sm font-semibold transition ${
                      studyMode === option.key
                        ? "border-blue-700 bg-blue-50 text-blue-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => (step === 1 ? closeRecommendationFlow() : setStep((current) => current - 1))}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            {step === 1 ? "Skip for now" : "Back"}
          </button>

          <button
            type="button"
            disabled={step === 1 && interests.length === 0}
            onClick={() => (step < 3 ? setStep((current) => current + 1) : finishFlow())}
            className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {step < 3 ? "Next" : "See my recommendations"}
          </button>
        </div>
      </div>
    </div>
  );
};
