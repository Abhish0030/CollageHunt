import { Prisma } from "../generated/prisma";
import { colleges, reviewBodies, reviewRatings, reviewUsers } from "./seedData";

type ListingQuery = {
  search?: string;
  location?: string;
  maxFees?: number;
  course?: string;
  category?: string;
  sortBy?: "rating" | "fees" | "nirfRank";
  page: number;
  limit: number;
};

type FallbackCollege = {
  id: number;
  slug: string;
  name: string;
  city: string;
  state: string;
  feesPerYear: number;
  rating: number;
  naacGrade: string;
  establishedYear: number;
  website: string;
  placementPct: number;
  avgPackage: number;
  highestPackage: number;
  topRecruiters: string[];
  createdAt: Date;
  courses: Array<{
    id: number;
    collegeId: number;
    name: string;
    duration: number;
    seats: number;
    fees: number;
  }>;
  reviews: Array<{
    id: number;
    collegeId: number;
    userId: number;
    rating: number;
    body: string;
    createdAt: Date;
    user: {
      id: number;
      name: string;
    };
  }>;
  _count: {
    reviews: number;
  };
};

let courseId = 1;
let reviewId = 1;

const fallbackColleges: FallbackCollege[] = colleges.map((college, collegeIndex) => {
  const collegeId = collegeIndex + 1;
  const createdAt = new Date(Date.UTC(2024, 0, collegeIndex + 1));
  const mappedCourses = college.courses.map((course) => ({
    id: courseId++,
    collegeId,
    ...course,
  }));
  const reviews = reviewUsers.map((user, reviewIndex) => ({
    id: reviewId++,
    collegeId,
    userId: reviewIndex + 1,
    rating: reviewRatings[reviewIndex] ?? 4,
    body: reviewBodies[(collegeIndex + reviewIndex) % reviewBodies.length]!,
    createdAt: new Date(Date.UTC(2024, 0, collegeIndex + reviewIndex + 1)),
    user: {
      id: reviewIndex + 1,
      name: user.name,
    },
  }));

  return {
    id: collegeId,
    ...college,
    createdAt,
    courses: mappedCourses,
    reviews,
    _count: {
      reviews: reviews.length,
    },
  };
});

const includesValue = (value: string, query?: string) =>
  !query || value.toLowerCase().includes(query.toLowerCase());

const equalsValue = (value: string, query?: string) => !query || value.toLowerCase() === query.toLowerCase();

const courseAliases: Record<string, string[]> = {
  engineering: ["BE/B.Tech", "B.Tech", "Diploma in Engineering", "ME/M.Tech", "M.Tech"],
  management: ["MBA/PGDM", "MBA", "Executive MBA", "BBA/BMS", "BBA"],
  commerce: ["B.Com", "M.Com", "CA Foundation"],
  arts: ["BA", "MA", "BFA"],
  science: ["B.Sc", "M.Sc", "B.Sc Nursing", "B.Sc (Nursing)"],
  law: ["LLB", "BA LLB", "BBA LLB", "LLM"],
  medical: ["MBBS", "BDS", "BAMS"],
  design: ["B.Des", "M.Des", "BFA"],
  "be/b.tech": ["BE/B.Tech", "B.Tech"],
  "mba/pgdm": ["MBA/PGDM", "MBA"],
  mbbs: ["MBBS"],
  "me/m.tech": ["ME/M.Tech", "M.Tech"],
  "b.sc": ["B.Sc"],
  ba: ["BA", "BA LLB"],
  "b.com": ["B.Com"],
  bca: ["BCA"],
  "bba/bms": ["BBA/BMS", "BBA"],
  "b.sc (nursing)": ["B.Sc Nursing", "B.Sc (Nursing)", "B.Sc"],
};

const buildCourseFilters = (course?: string, category?: string) => {
  const tokens = new Set<string>();
  if (course) {
    tokens.add(course);
  }

  if (category) {
    const aliases = courseAliases[category.toLowerCase()] ?? [category];
    aliases.forEach((alias) => tokens.add(alias));
  }

  return Array.from(tokens);
};

export const isDatabaseUnavailableError = (error: unknown) =>
  error instanceof Prisma.PrismaClientInitializationError ||
  (error instanceof Error &&
    (error.message.includes("Can't reach database server") ||
      error.message.includes("Environment variable not found: DATABASE_URL")));

export const getFallbackCollegeByIdentifier = (identifier: string) => {
  const isNumeric = /^\d+$/.test(identifier);
  return fallbackColleges.find((college) => (isNumeric ? college.id === Number(identifier) : college.slug === identifier)) ?? null;
};

export const getFallbackFeaturedColleges = () =>
  [...fallbackColleges]
    .sort((left, right) => right.rating - left.rating || right.placementPct - left.placementPct)
    .slice(0, 6)
    .map(({ reviews: _reviews, ...college }) => college);

export const getFallbackCompareColleges = (ids: number[]) =>
  fallbackColleges.filter((college) => ids.includes(college.id));

export const getFallbackListingColleges = (query: ListingQuery) => {
  const courseFilters = buildCourseFilters(query.course, query.category);
  const filtered = fallbackColleges.filter((college) => {
    const matchesSearch =
      !query.search ||
      includesValue(college.name, query.search) ||
      includesValue(college.city, query.search) ||
      includesValue(college.state, query.search);
    const matchesLocation =
      !query.location || equalsValue(college.city, query.location) || equalsValue(college.state, query.location);
    const matchesFees = !query.maxFees || college.feesPerYear <= query.maxFees;
    const matchesCourse =
      courseFilters.length === 0 ||
      college.courses.some((course) => courseFilters.some((filter) => includesValue(course.name, filter)));

    return matchesSearch && matchesLocation && matchesFees && matchesCourse;
  });

  const ordered = [...filtered].sort((left, right) => {
    if (query.sortBy === "fees") {
      return left.feesPerYear - right.feesPerYear || right.rating - left.rating;
    }

    return right.rating - left.rating || left.feesPerYear - right.feesPerYear;
  });
  const total = ordered.length;
  const paginated = ordered
    .slice((query.page - 1) * query.limit, query.page * query.limit)
    .map(({ reviews: _reviews, ...college }) => college);

  return {
    colleges: paginated,
    total,
  };
};
