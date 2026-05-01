"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchCourses } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

const levels = ["Bachelors", "Masters", "Doctorate", "Diploma", "Certification"] as const;

export const ExploreCourses = () => {
  const [activeLevel, setActiveLevel] = useState<(typeof levels)[number]>("Bachelors");
  const coursesQuery = useQuery({
    queryKey: ["explore-courses", activeLevel],
    queryFn: () => fetchCourses(activeLevel, 8),
  });

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Explore Courses</h2>
        <div className="scrollbar-hide mb-6 flex gap-3 overflow-x-auto pb-2 scroll-smooth">
          {levels.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => setActiveLevel(level)}
              className={
                activeLevel === level
                  ? "rounded-full bg-black px-5 py-2 text-sm font-medium text-white"
                  : "rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-medium text-gray-600"
              }
            >
              {level}
            </button>
          ))}
        </div>

        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 scroll-smooth">
          {(coursesQuery.data ?? []).map((course) => (
            <article key={course.name} className="w-[220px] min-w-[220px] rounded-xl border border-slate-200 bg-white p-4 transition-shadow duration-200 hover:shadow-md">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{course.mode}</span>
              <h3 className="mt-4 font-bold text-slate-900">{course.name}</h3>
              <p className="mt-2 text-sm text-slate-500">{course.duration}</p>
              <p className="mt-3 text-sm font-semibold text-slate-800">{formatCurrency(course.totalFees)}</p>
            </article>
          ))}
          {coursesQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-44 w-[220px] min-w-[220px] animate-pulse rounded-xl bg-slate-200" />
              ))
            : null}
        </div>
      </div>
    </section>
  );
};

export default ExploreCourses;
