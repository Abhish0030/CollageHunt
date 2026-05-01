"use client";

import { Search } from "lucide-react";
import { HELP_CATEGORIES, HELP_SORTS } from "./helpUtils";

type QuestionFiltersProps = {
  search: string;
  onSearchChange: (value: string) => void;
  activeSort: "latest" | "popular" | "unanswered" | "solved";
  onSortChange: (value: "latest" | "popular" | "unanswered" | "solved") => void;
  activeCategory: string;
  onCategoryChange: (value: string) => void;
};

export const QuestionFilters = ({
  search,
  onSearchChange,
  activeSort,
  onSortChange,
  activeCategory,
  onCategoryChange,
}: QuestionFiltersProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search questions..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="flex gap-2">
          {HELP_SORTS.map((sort) => (
            <button
              key={sort.value}
              type="button"
              onClick={() => onSortChange(sort.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeSort === sort.value
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div className="flex gap-2">
          {HELP_CATEGORIES.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => onCategoryChange(category.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === category.value
                  ? "bg-blue-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
