"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageCirclePlus } from "lucide-react";
import Link from "next/link";
import { getTopContributors } from "@/lib/api";
import { getInitials } from "@/lib/utils";
import type { HelpCategory, HelpQuestion } from "@/types/api";
import { POPULAR_HELP_TAGS, formatRelativeTime, getCategoryLabel } from "./helpUtils";

type HelpSidebarProps = {
  onAskQuestion: () => void;
  onTagClick: (tag: string) => void;
  recentlySolved: HelpQuestion[];
  questionStats?: {
    views: number;
    answers: number;
    askedAt: string;
    category: string;
  };
};

export const HelpSidebar = ({
  onAskQuestion,
  onTagClick,
  recentlySolved,
  questionStats,
}: HelpSidebarProps) => {
  const contributorsQuery = useQuery({
    queryKey: ["help-top-contributors"],
    queryFn: getTopContributors,
  });

  return (
    <aside className="space-y-5">
      <div className="rounded-2xl bg-blue-600 p-5 text-white shadow-sm">
        <MessageCirclePlus size={24} />
        <h3 className="mt-3 text-xl font-semibold">Got a question?</h3>
        <p className="mt-2 text-sm leading-6 text-blue-100">Get answers from students and experts</p>
        <button
          type="button"
          onClick={onAskQuestion}
          className="mt-4 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
        >
          Ask Now -&gt;
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Popular Topics</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {POPULAR_HELP_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagClick(tag)}
              className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-600 transition hover:border-blue-200 hover:text-blue-700"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Top Contributors</h3>
        <div className="mt-4 space-y-3">
          {contributorsQuery.isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="h-3 w-20 animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))
            : contributorsQuery.data?.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-500">{user.answersCount} answers this week</p>
                  </div>
                </div>
              ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Recently Solved</h3>
        <div className="mt-4 space-y-4">
          {recentlySolved.map((question) => (
            <Link key={question.id} href={`/help/${question.id}`} className="block">
              <p className="truncate text-sm font-medium text-slate-900 transition hover:text-blue-700">
                {question.title}
              </p>
              <p className="mt-1 text-xs text-slate-500">{question.answersCount} answers</p>
            </Link>
          ))}
        </div>
      </div>

      {questionStats ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Question Stats</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Views</span>
              <span className="font-semibold text-slate-900">{questionStats.views}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Answers</span>
              <span className="font-semibold text-slate-900">{questionStats.answers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Asked</span>
              <span className="font-semibold text-slate-900">{formatRelativeTime(questionStats.askedAt)}</span>
            </div>
            <div className="flex items-center justify-between">
                <span>Category</span>
                <span className="font-semibold text-slate-900">
                {getCategoryLabel(questionStats.category as HelpCategory)}
                </span>
              </div>
            </div>
          </div>
      ) : null}
    </aside>
  );
};
