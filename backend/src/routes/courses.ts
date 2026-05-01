import { Router } from "express";
import { z } from "zod";
import { colleges } from "../data/seedData";
import { sendSuccess } from "../utils/api";

const router = Router();

const querySchema = z.object({
  level: z.enum(["Bachelors", "Masters", "Doctorate", "Diploma", "Certification"]).default("Bachelors"),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

const levelMatchers: Record<string, (courseName: string) => boolean> = {
  Bachelors: (courseName) => /^(B\.|MBBS|BA|BBA|BCA|BDS|BAMS)/i.test(courseName),
  Masters: (courseName) => /^(M\.|MBA|LLM)/i.test(courseName),
  Doctorate: (courseName) => /^PhD/i.test(courseName),
  Diploma: (courseName) => /^Diploma/i.test(courseName),
  Certification: (courseName) => /Certificate/i.test(courseName),
};

const courseCatalog = Array.from(
  new Map(
    colleges
      .flatMap((college) =>
        college.courses.map((course) => ({
          name: course.name,
          duration: `${course.duration} ${course.duration === 1 ? "Year" : "Years"}`,
          totalFees: course.fees * course.duration,
          mode: "Full Time",
        })),
      )
      .map((course) => [course.name, course]),
  ).values(),
);

router.get("/", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    const matcher = levelMatchers[query.level];
    const filtered = matcher ? courseCatalog.filter((course) => matcher(course.name)) : courseCatalog;
    return sendSuccess(res, filtered.slice(0, query.limit));
  } catch (error) {
    next(error);
  }
});

export default router;
