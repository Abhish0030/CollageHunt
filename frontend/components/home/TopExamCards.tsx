"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchFeaturedExams } from "@/lib/api";
import { formatDate, getInitials } from "@/lib/utils";

export const TopExamCards = () => {
  const examsQuery = useQuery({
    queryKey: ["featured-exams"],
    queryFn: () => fetchFeaturedExams(6),
  });

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Top Exams</h2>
        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 scroll-smooth">
          {(examsQuery.data ?? []).map((exam) => (
            <article key={exam.id} className="w-[220px] min-w-[220px] rounded-xl border border-slate-200 bg-white p-4 transition-shadow duration-200 hover:shadow-md">
              <div className="flex items-center justify-between gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {getInitials(exam.name)}
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">{exam.mode}</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{exam.name}</h3>
              <p className="mt-2 text-sm text-slate-500">Participating Colleges: {exam.participatingColleges}</p>
              <p className="mt-2 font-semibold text-slate-800">Exam Date: {formatDate(exam.examDate)}</p>
              <p className="mt-2 text-sm text-slate-500">Exam Level: {exam.level}</p>
              <div className="my-4 h-px bg-slate-200" />
              <a href="/colleges" className="block text-sm text-slate-700">Application Process ›</a>
              <a href="/colleges" className="mt-2 block text-sm text-slate-700">Exam Info ›</a>
            </article>
          ))}
          {examsQuery.isLoading
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-64 w-[220px] min-w-[220px] animate-pulse rounded-xl bg-slate-200" />
              ))
            : null}
        </div>
      </div>
    </section>
  );
};

export default TopExamCards;
