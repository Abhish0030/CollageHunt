"use client";

import type { HelpCategory } from "@/types/api";

export const HELP_CATEGORIES: Array<{ label: string; value: HelpCategory | "all" }> = [
  { label: "All", value: "all" },
  { label: "Engineering", value: "engineering" },
  { label: "Medicine", value: "medicine" },
  { label: "Law", value: "law" },
  { label: "Management", value: "management" },
  { label: "University", value: "university" },
  { label: "Design", value: "design" },
];

export const HELP_SORTS = [
  { label: "Latest", value: "latest" },
  { label: "Popular", value: "popular" },
  { label: "Unanswered", value: "unanswered" },
  { label: "Solved", value: "solved" },
] as const;

export const POPULAR_HELP_TAGS = [
  "JEE Main",
  "NEET",
  "CAT",
  "CLAT",
  "B.Tech",
  "MBA",
  "Cutoff",
  "Admission",
  "Scholarship",
  "Hostel",
  "Fees",
];

export const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const diffSeconds = Math.round(diffMs / 1000);
  const absSeconds = Math.abs(diffSeconds);
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) {
    return rtf.format(diffSeconds, "second");
  }

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) {
    return rtf.format(diffMinutes, "minute");
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return rtf.format(diffHours, "hour");
  }

  const diffDays = Math.round(diffHours / 24);
  if (Math.abs(diffDays) < 30) {
    return rtf.format(diffDays, "day");
  }

  const diffMonths = Math.round(diffDays / 30);
  if (Math.abs(diffMonths) < 12) {
    return rtf.format(diffMonths, "month");
  }

  const diffYears = Math.round(diffMonths / 12);
  return rtf.format(diffYears, "year");
};

export const getCategoryLabel = (category: HelpCategory) =>
  HELP_CATEGORIES.find((item) => item.value === category)?.label ?? category;
