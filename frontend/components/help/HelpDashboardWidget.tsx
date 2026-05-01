"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CircleHelp, List, MessageCircleMore, MessageCirclePlus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { getQuestions } from "@/lib/api";
import { AskQuestionModal } from "./AskQuestionModal";
import { formatRelativeTime, getCategoryLabel } from "./helpUtils";

export const HelpDashboardWidget = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const questionsQuery = useQuery({
    queryKey: ["help-dashboard-widget"],
    queryFn: () => getQuestions({ limit: 3, sort: "popular" }),
  });

  const questions = questionsQuery.data?.data ?? [];

  return (
    <>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900">
              <MessageCircleMore size={22} className="text-blue-600" />
              <h2 className="text-xl font-bold">Student Help Center</h2>
            </div>
            <p className="mt-2 text-sm text-slate-500">Ask questions · Get answers · Help others</p>
          </div>
          <Link href="/help" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
            View All
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[180px_180px_1fr]">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-2xl border border-orange-200 bg-orange-50 p-5 text-left transition hover:bg-orange-100"
          >
            <MessageCirclePlus className="text-orange-600" size={22} />
            <p className="mt-4 text-lg font-semibold text-slate-900">Ask a Question</p>
            <p className="mt-1 text-sm text-slate-500">Share your admission doubt with the community</p>
          </button>

          <Link href="/help" className="rounded-2xl border border-blue-200 bg-blue-50 p-5 transition hover:bg-blue-100">
            <List className="text-blue-600" size={22} />
            <p className="mt-4 text-lg font-semibold text-slate-900">Browse Questions</p>
            <p className="mt-1 text-sm text-slate-500">Explore live student discussions</p>
          </Link>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <CircleHelp size={18} className="text-blue-600" />
              <p className="font-semibold">3 recent questions from community</p>
            </div>
            <div className="mt-4 space-y-4">
              {questionsQuery.isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                      <div className="h-3 w-40 animate-pulse rounded bg-slate-200" />
                    </div>
                  ))
                : questions.map((question) => (
                    <Link key={question.id} href={`/help/${question.id}`} className="block">
                      <p className="truncate font-medium text-slate-900 transition hover:text-blue-700">
                        {question.isSolved ? "✅" : "💬"} {question.title}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {question.answersCount} answers · {getCategoryLabel(question.category)} · {formatRelativeTime(question.createdAt)}
                      </p>
                    </Link>
                  ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200">
          {questionsQuery.isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="border-b border-slate-200 px-5 py-4 last:border-b-0">
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-48 animate-pulse rounded bg-slate-200" />
                </div>
              ))
            : questions.map((question, index) => (
                <Link
                  key={question.id}
                  href={`/help/${question.id}`}
                  className={`block px-5 py-4 transition hover:bg-slate-50 ${index < questions.length - 1 ? "border-b border-slate-200" : ""}`}
                >
                  <p className="font-medium text-slate-900">
                    {question.isSolved ? "✅" : "💬"} {question.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {question.answersCount} answers · {getCategoryLabel(question.category)} · {formatRelativeTime(question.createdAt)}
                  </p>
                </Link>
              ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            + Ask Your Question
          </button>
          <Link
            href="/help"
            className="inline-flex items-center justify-center rounded-full border border-blue-200 px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
          >
            See All Discussions -&gt;
          </Link>
        </div>
      </section>

      <AskQuestionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
