import { Router } from "express";
import { Prisma } from "../generated/prisma";
import { z } from "zod";
import {
  getFallbackCollegeByIdentifier,
  getFallbackCompareColleges,
  getFallbackFeaturedColleges,
  getFallbackListingColleges,
  isDatabaseUnavailableError,
} from "../data/collegeFallback";
import { prisma } from "../lib/prisma";
import { AppError, sendSuccess } from "../utils/api";

const router = Router();

const rankingAgencies = ["gradly", "nirf", "outlook", "iirf", "the-week"] as const;
type RankingAgency = (typeof rankingAgencies)[number];
type SortBy = "rating" | "fees" | "nirfRank";

const listingSchema = z.object({
  search: z.string().trim().optional(),
  location: z.string().trim().optional(),
  maxFees: z.coerce.number().int().positive().optional(),
  course: z.string().trim().optional(),
  category: z.string().trim().optional(),
  sortBy: z.enum(["rating", "fees", "nirfRank"]).default("rating"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const compareSchema = z.object({
  ids: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((item) => Number(item.trim()))
        .filter((item) => Number.isInteger(item) && item > 0),
    )
    .refine((value) => value.length >= 2 && value.length <= 3, {
      message: "Please compare between 2 and 3 colleges",
    }),
});

const rankingsSchema = z.object({
  year: z.coerce.number().int().min(2024).max(2030).default(2026),
  agency: z.enum(rankingAgencies).default("gradly"),
  limit: z.coerce.number().int().min(1).max(20).default(10),
});

const featuredSchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

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

const matchesCourseToken = (courseName: string, token: string) =>
  courseName.toLowerCase().includes(token.toLowerCase());

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

const getOrderBy = (sortBy: SortBy): Prisma.CollegeOrderByWithRelationInput[] => {
  if (sortBy === "fees") {
    return [{ feesPerYear: "asc" }, { rating: "desc" }];
  }

  if (sortBy === "nirfRank") {
    return [{ rating: "desc" }, { placementPct: "desc" }, { feesPerYear: "asc" }];
  }

  return [{ rating: "desc" }, { feesPerYear: "asc" }];
};

const buildRankingMeta = (college: { rating: number; placementPct: number; feesPerYear: number }, index: number, agency: RankingAgency) => {
  const agencyOffsetMap: Record<RankingAgency, number> = {
    gradly: 0,
    nirf: 1,
    outlook: 3,
    iirf: 5,
    "the-week": 7,
  };

  const agencyLabelMap: Record<RankingAgency, string> = {
    gradly: "Gradly",
    nirf: "NIRF",
    outlook: "Outlook",
    iirf: "IIRF",
    "the-week": "The Week",
  };

  const rank = index + 1 + agencyOffsetMap[agency];
  const total = 50 + Math.round((5 - college.rating) * 40) + agencyOffsetMap[agency] * 4;

  return {
    agency: agencyLabelMap[agency],
    rank,
    total,
    score: Math.max(72, Math.round(college.rating * 18 + college.placementPct * 0.12 - college.feesPerYear / 150000)),
  };
};

const buildCutoffDetails = (college: { courses: Array<{ name: string }>; rating: number }, index: number) => {
  const primaryCourse = college.courses[0]?.name ?? "B.Tech";
  const exam = primaryCourse.includes("MBA")
    ? "CAT"
    : primaryCourse.includes("MBBS")
      ? "NEET"
      : primaryCourse.includes("LL")
        ? "CLAT"
        : primaryCourse.includes("B.Com")
          ? "CUET"
          : "JEE Main";

  return {
    exam,
    score: `${Math.max(78, Math.round(college.rating * 18) - index)} percentile`,
  };
};

const buildDeadlineDetails = (index: number) => ({
  start: `Apr ${String(10 + index).padStart(2, "0")}, 2026`,
  end: `May ${String(5 + index).padStart(2, "0")}, 2026`,
});

router.get("/", async (req, res, next) => {
  try {
    const query = listingSchema.parse(req.query);
    let total: number;
    let colleges;
    const courseFilters = buildCourseFilters(query.course, query.category);

    try {
      const where: Prisma.CollegeWhereInput = {
        ...(query.search
          ? {
              OR: [
                { name: { contains: query.search, mode: "insensitive" } },
                { city: { contains: query.search, mode: "insensitive" } },
                { state: { contains: query.search, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(query.location
          ? {
              OR: [
                { city: { equals: query.location, mode: "insensitive" } },
                { state: { equals: query.location, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(query.maxFees ? { feesPerYear: { lte: query.maxFees } } : {}),
        ...(courseFilters.length > 0
          ? {
              courses: {
                some: {
                  OR: courseFilters.map((item) => ({
                    name: {
                      contains: item,
                      mode: "insensitive",
                    },
                  })),
                },
              },
            }
          : {}),
      };

      [total, colleges] = await Promise.all([
        prisma.college.count({ where }),
        prisma.college.findMany({
          where,
          include: {
            courses: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
          orderBy: getOrderBy(query.sortBy),
          skip: (query.page - 1) * query.limit,
          take: query.limit,
        }),
      ]);
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      const fallback = getFallbackListingColleges(query);
      total = fallback.total;
      colleges = fallback.colleges;
    }

    return sendSuccess(res, colleges, {
      total,
      page: query.page,
      limit: query.limit,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/compare", async (req, res, next) => {
  try {
    const query = compareSchema.parse(req.query);
    let colleges;

    try {
      colleges = await prisma.college.findMany({
        where: {
          id: {
            in: query.ids,
          },
        },
        include: {
          courses: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      colleges = getFallbackCompareColleges(query.ids);
    }

    return sendSuccess(res, colleges);
  } catch (error) {
    next(error);
  }
});

router.get("/featured", async (req, res, next) => {
  try {
    const query = featuredSchema.parse(req.query);
    let colleges;

    try {
      colleges = await prisma.college.findMany({
        include: {
          courses: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: [{ rating: "desc" }, { placementPct: "desc" }],
        take: query.limit,
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      colleges = getFallbackFeaturedColleges().slice(0, query.limit);
    }

    return sendSuccess(res, colleges);
  } catch (error) {
    next(error);
  }
});

router.get("/rankings", async (req, res, next) => {
  try {
    const query = rankingsSchema.parse(req.query);
    let colleges;

    try {
      colleges = await prisma.college.findMany({
        include: {
          courses: true,
          _count: {
            select: {
              reviews: true,
            },
          },
        },
        orderBy: getOrderBy("nirfRank"),
        take: query.limit,
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      colleges = getFallbackFeaturedColleges()
        .sort((left, right) => right.rating - left.rating || right.placementPct - left.placementPct)
        .slice(0, query.limit);
    }

    const rankings = colleges.map((college, index) => ({
      ...college,
      ranking: buildRankingMeta(college, index, query.agency),
      stream: college.courses[0]?.name ?? "General",
      abbreviation: college.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 5)
        .toUpperCase(),
      year: query.year,
    }));

    return sendSuccess(res, rankings, {
      year: query.year,
      agency: query.agency,
      limit: query.limit,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/:identifier", async (req, res, next) => {
  try {
    const identifier = req.params.identifier;
    const isNumeric = /^\d+$/.test(identifier);
    let college;

    try {
      college = await prisma.college.findFirst({
        where: isNumeric ? { id: Number(identifier) } : { slug: identifier },
        include: {
          courses: true,
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      });
    } catch (error) {
      if (!isDatabaseUnavailableError(error)) {
        throw error;
      }

      college = getFallbackCollegeByIdentifier(identifier);
    }

    if (!college) {
      throw new AppError(404, "NOT_FOUND", "College not found");
    }

    return sendSuccess(res, college);
  } catch (error) {
    next(error);
  }
});

export default router;
