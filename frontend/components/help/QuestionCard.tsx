"use client";

import { Eye, MessageCircle, Pin, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/lib/utils";
import type { HelpQuestion } from "@/types/api";
import { formatRelativeTime, getCategoryLabel } from "./helpUtils";

type QuestionCardProps = {
  question: HelpQuestion;
  href?: string;
  onTagClick?: (tag: string) => void;
};

export const QuestionCard = ({ question, href, onTagClick }: QuestionCardProps) => {
  const targetHref = href ?? `/help/${question.id}`;

  return (
    <article className="mb-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {question.isSolved ? (
            <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
              SOLVED
            </span>
          ) : (
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
              {question.answersCount} {question.answersCount === 1 ? "answer" : "answers"}
            </span>
          )}
          <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
            {getCategoryLabel(question.category)}
          </span>
        </div>
        {question.isPinned ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
            <Pin size={12} />
            PINNED
          </span>
        ) : null}
      </div>

      <Link href={targetHref} className="mt-3 block text-lg font-semibold text-slate-900 transition hover:text-blue-600">
        {question.title}
      </Link>

      {question.body ? (
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">{question.body}</p>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        {question.tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onTagClick?.(tag)}
            className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100"
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
            {getInitials(question.author.name)}
          </div>
          <div className="text-sm text-slate-500">
            <span className="font-medium text-slate-800">{question.author.name}</span> · {formatRelativeTime(question.createdAt)}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp size={14} />
            {question.upvotes}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageCircle size={14} />
            {question.answersCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye size={14} />
            {question.views}
          </span>
        </div>
      </div>
    </article>
  );
};
