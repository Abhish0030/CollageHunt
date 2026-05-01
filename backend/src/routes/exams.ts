import { Router } from "express";
import { z } from "zod";
import { sendSuccess } from "../utils/api";

const router = Router();

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(12).default(6),
});

const exams = [
  { id: 1, slug: "jee-main", name: "JEE Main", mode: "Online Exam", participatingColleges: 2040, examDate: "2026-04-02", level: "National" },
  { id: 2, slug: "neet-ug", name: "NEET UG", mode: "Online Exam", participatingColleges: 980, examDate: "2026-05-03", level: "National" },
  { id: 3, slug: "cat", name: "CAT", mode: "Online Exam", participatingColleges: 1320, examDate: "2026-11-29", level: "National" },
  { id: 4, slug: "cuet-ug", name: "CUET UG", mode: "Online Exam", participatingColleges: 1450, examDate: "2026-05-12", level: "National" },
  { id: 5, slug: "gate", name: "GATE", mode: "Online Exam", participatingColleges: 760, examDate: "2026-02-07", level: "National" },
  { id: 6, slug: "clat", name: "CLAT", mode: "Online Exam", participatingColleges: 68, examDate: "2026-12-06", level: "National" },
  { id: 7, slug: "mat", name: "MAT", mode: "Online Exam", participatingColleges: 620, examDate: "2026-03-08", level: "National" },
  { id: 8, slug: "ts-eamcet", name: "TS EAMCET", mode: "Online Exam", participatingColleges: 310, examDate: "2026-05-10", level: "State" },
];

router.get("/", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    return sendSuccess(res, exams.slice(0, query.limit));
  } catch (error) {
    next(error);
  }
});

router.get("/featured", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query);
    return sendSuccess(res, exams.slice(0, query.limit));
  } catch (error) {
    next(error);
  }
});

export default router;
