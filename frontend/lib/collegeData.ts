import { colleges as seedColleges } from "../../backend/src/data/seedData";
import type { College } from "@/types/api";

const ownershipKeywords = [
  { match: /IIT|NIT|IIIT|AIIMS|JIPMER|DU|BHU|Jadavpur|Osmania|Jamia|Faculty of Law/i, value: "Government" },
  { match: /IIM|FMS|XLRI|MDI|SPJIMR|Symbiosis|NMIMS/i, value: "Private" },
];

const getOwnership = (name: string) => {
  const matched = ownershipKeywords.find((item) => item.match.test(name));
  return matched?.value ?? "Private";
};

const getPrimaryStream = (courseNames: string[]) => {
  if (courseNames.some((name) => /MBBS|BDS|BAMS/i.test(name))) return "Medical";
  if (courseNames.some((name) => /LLB|LLM/i.test(name))) return "Law";
  if (courseNames.some((name) => /MBA|BBA|B\.Com/i.test(name))) return "Management";
  if (courseNames.some((name) => /BCA/i.test(name))) return "Computer Applications";
  if (courseNames.some((name) => /B\.Sc/i.test(name))) return "Science";
  return "Engineering";
};

const getNirfRank = (index: number, rating: number) => Math.max(1, Math.round(index + 1 + (5 - rating) * 4));
const fallbackNirfRank = Number.MAX_SAFE_INTEGER;

export const collegeDirectory: College[] = seedColleges.map((college, index) => ({
  id: index + 1,
  slug: college.slug,
  name: college.name,
  city: college.city,
  state: college.state,
  feesPerYear: college.feesPerYear,
  rating: college.rating,
  naacGrade: college.naacGrade,
  establishedYear: college.establishedYear,
  website: college.website,
  placementPct: college.placementPct,
  avgPackage: college.avgPackage,
  highestPackage: college.highestPackage,
  topRecruiters: college.topRecruiters,
  createdAt: "2026-01-01T00:00:00.000Z",
  stream: getPrimaryStream(college.courses.map((course) => course.name)),
  ownership: getOwnership(college.name),
  nirfRank: getNirfRank(index, college.rating),
  accreditation: college.naacGrade,
  courses: college.courses.map((course, courseIndex) => ({
    id: (index + 1) * 100 + courseIndex + 1,
    collegeId: index + 1,
    name: course.name,
    duration: course.duration,
    seats: course.seats,
    fees: course.fees,
  })),
  reviews: [],
  _count: {
    reviews: 0,
  },
}));

export type CollegeDirectoryFilters = {
  search?: string;
  city?: string;
  location?: string;
  stream?: string;
  ownership?: string;
  maxFees?: number;
  feesMax?: number;
  course?: string;
  sort?: "rating" | "fees" | "nirf" | "placements";
  sortBy?: "rating" | "fees" | "nirfRank";
  page?: number;
  limit?: number;
};

const includesValue = (value: string, search: string) => value.toLowerCase().includes(search.toLowerCase());

export const filterColleges = (filters: CollegeDirectoryFilters) => {
  const effectiveMaxFees = filters.feesMax ?? filters.maxFees;
  const effectiveLocation = filters.city ?? filters.location;
  const effectiveSort = filters.sortBy ?? filters.sort ?? "rating";
  const filtered = collegeDirectory.filter((college) => {
    const matchesSearch =
      !filters.search ||
      [college.name, college.city, college.state, college.stream ?? "", college.ownership ?? ""].some((value) =>
        includesValue(value, filters.search!),
      ) ||
      college.courses.some((course) => includesValue(course.name, filters.search!));
    const matchesLocation = !effectiveLocation || college.city === effectiveLocation || college.state === effectiveLocation;
    const matchesStream = !filters.stream || college.stream === filters.stream;
    const matchesOwnership = !filters.ownership || college.ownership === filters.ownership;
    const matchesFees = !effectiveMaxFees || college.feesPerYear <= effectiveMaxFees;
    const matchesCourse = !filters.course || college.courses.some((course) => includesValue(course.name, filters.course!));

    return matchesSearch && matchesLocation && matchesStream && matchesOwnership && matchesFees && matchesCourse;
  });

  const sorted = [...filtered].sort((left, right) => {
    if (effectiveSort === "fees") return left.feesPerYear - right.feesPerYear || right.rating - left.rating;
    if (effectiveSort === "nirfRank") {
      return (left.nirfRank ?? fallbackNirfRank) - (right.nirfRank ?? fallbackNirfRank) || right.rating - left.rating;
    }
    if (effectiveSort === "placements") return right.avgPackage - left.avgPackage || right.placementPct - left.placementPct;
    return right.rating - left.rating || left.feesPerYear - right.feesPerYear;
  });

  const page = filters.page ?? 1;
  const limit = filters.limit ?? sorted.length;
  const startIndex = (page - 1) * limit;

  return {
    total: sorted.length,
    page,
    limit,
    colleges: sorted.slice(startIndex, startIndex + limit),
  };
};

export const getCollegeByIdentifier = (identifier: string) =>
  collegeDirectory.find((college) => college.slug === identifier || String(college.id) === identifier) ?? null;

export const getFeaturedColleges = (limit = 6) =>
  [...collegeDirectory]
    .sort((left, right) => right.rating - left.rating || right.avgPackage - left.avgPackage)
    .slice(0, limit);

export const getComparedColleges = (ids: number[]) =>
  collegeDirectory.filter((college) => ids.includes(college.id));
