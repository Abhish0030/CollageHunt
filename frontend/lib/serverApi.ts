import { notFound } from "next/navigation";
import { filterColleges, getCollegeByIdentifier } from "@/lib/collegeData";
import type { ApiResponse, College } from "@/types/api";

export const fetchServerColleges = async (path: string) => {
  const url = new URL(path, "http://local");
  const result = filterColleges({
    search: url.searchParams.get("search") ?? undefined,
    location: url.searchParams.get("location") ?? undefined,
    city: url.searchParams.get("city") ?? undefined,
    stream: url.searchParams.get("stream") ?? undefined,
    ownership: url.searchParams.get("ownership") ?? undefined,
    maxFees: url.searchParams.get("maxFees") ? Number(url.searchParams.get("maxFees")) : undefined,
    feesMax: url.searchParams.get("fees_max") ? Number(url.searchParams.get("fees_max")) : undefined,
    course: url.searchParams.get("course") ?? undefined,
    sortBy: (url.searchParams.get("sortBy") as "rating" | "fees" | "nirfRank" | null) ?? undefined,
    page: url.searchParams.get("page") ? Number(url.searchParams.get("page")) : undefined,
    limit: url.searchParams.get("limit") ? Number(url.searchParams.get("limit")) : undefined,
  });

  return {
    success: true,
    data: result.colleges,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
    },
  } satisfies ApiResponse<College[]>;
};

export const fetchServerCollege = async (identifier: string) => {
  const college = getCollegeByIdentifier(identifier);
  if (!college) {
    notFound();
  }

  return college;
};
