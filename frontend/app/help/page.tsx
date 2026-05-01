"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AskQuestionModal } from "@/components/help/AskQuestionModal";
import { HelpSidebar } from "@/components/help/HelpSidebar";
import { QuestionCard } from "@/components/help/QuestionCard";
import { QuestionFilters } from "@/components/help/QuestionFilters";
import { getQuestions } from "@/lib/api";

export default function HelpPage() {
  const searchParams = useSearchParams();
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState<"latest" | "popular" | "unanswered" | "solved">("latest");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [selectedTag, setSelectedTag] = useState<string | undefined>(searchParams.get("tag") ?? undefined);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setSearch(searchParams.get("search") ?? "");
    setCategory(searchParams.get("category") ?? "all");
    setSelectedTag(searchParams.get("tag") ?? undefined);
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, category, selectedTag]);

  const questionsQuery = useQuery({
    queryKey: ["help-questions", debouncedSearch, sort, category, selectedTag, page],
    queryFn: () =>
      getQuestions({
        search: debouncedSearch || undefined,
        sort,
        category: category === "all" ? undefined : category,
        tag: selectedTag,
        page,
        limit: 10,
      }),
  });

  const recentlySolvedQuery = useQuery({
    queryKey: ["help-recently-solved"],
    queryFn: () =>
      getQuestions({
        sort: "solved",
        limit: 3,
        page: 1,
      }),
  });

  const questions = questionsQuery.data?.data ?? [];
  const meta = questionsQuery.data?.meta;

  return (
    <>
      <div className="bg-[linear-gradient(180deg,#eff6ff_0%,#ffffff_100%)]">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="rounded-[2rem] border border-blue-100 bg-white/80 p-6 shadow-sm backdrop-blur">
            <h1 className="text-3xl font-bold text-slate-950">Student Help Center</h1>
            <p className="mt-2 text-sm text-slate-600">
              Ask questions, share knowledge, help fellow students
            </p>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsAskOpen(true)}
                className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                + Ask a Question
              </button>
              <a
                href="#all-questions"
                className="inline-flex items-center justify-center rounded-full border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Browse All Questions
              </a>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                { icon: "💬", value: "2,847", label: "Questions" },
                { icon: "✅", value: "1,923", label: "Answered" },
                { icon: "👥", value: "12,540", label: "Students" },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                  <p className="text-lg font-semibold text-slate-900">
                    {stat.icon} {stat.value} {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <div id="all-questions">
          <QuestionFilters
            search={search}
            onSearchChange={setSearch}
            activeSort={sort}
            onSortChange={setSort}
            activeCategory={category}
            onCategoryChange={(nextCategory) => {
              setCategory(nextCategory);
              setSelectedTag(undefined);
            }}
          />

          {selectedTag ? (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              <span>Filtering by tag: {selectedTag}</span>
              <button type="button" onClick={() => setSelectedTag(undefined)} className="font-semibold">
                Clear
              </button>
            </div>
          ) : null}

          <div className="mt-5">
            {questionsQuery.isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="mb-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="h-5 w-36 animate-pulse rounded bg-slate-200" />
                  <div className="mt-3 h-6 w-full animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 flex gap-2">
                    <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-6 w-14 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>
              ))
            ) : questions.length > 0 ? (
              questions.map((question) => (
                <QuestionCard key={question.id} question={question} onTagClick={setSelectedTag} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                <MessageCircle className="mx-auto text-slate-400" size={28} />
                <h2 className="mt-4 text-xl font-semibold text-slate-900">No discussions matched your filters</h2>
                <p className="mt-2 text-sm text-slate-500">Try a different keyword, tag, or category.</p>
              </div>
            )}
          </div>

          {meta ? (
            <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
              <button
                type="button"
                onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                disabled={page === 1}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <p className="text-sm text-slate-500">
                Page {meta.page} of {Math.max(1, Math.ceil(meta.total / meta.limit))}
              </p>
              <button
                type="button"
                onClick={() => setPage((currentPage) => currentPage + 1)}
                disabled={page * meta.limit >= meta.total}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>

        <HelpSidebar
          onAskQuestion={() => setIsAskOpen(true)}
          onTagClick={setSelectedTag}
          recentlySolved={recentlySolvedQuery.data?.data ?? []}
        />
      </div>

      <AskQuestionModal isOpen={isAskOpen} onClose={() => setIsAskOpen(false)} />
    </>
  );
}
