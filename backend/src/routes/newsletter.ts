import { Router } from "express";
import { Prisma } from "../generated/prisma";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { sendCreated } from "../utils/api";

const router = Router();

const newsletterSchema = z.object({
  email: z.string().trim().email(),
  mobile: z.string().trim().min(10).max(16).optional().or(z.literal("")),
  course: z.string().trim().min(1).max(120).optional().or(z.literal("")),
});

router.post("/", async (req, res, next) => {
  try {
    const payload = newsletterSchema.parse(req.body);
    await prisma.$executeRaw`
      INSERT INTO "Newsletter" ("email", "mobile", "course")
      VALUES (${payload.email.toLowerCase()}, ${payload.mobile || null}, ${payload.course || null})
    `;

    return sendCreated(res, { success: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientValidationError
    ) {
      return next(error);
    }

    next(error);
  }
});

export default router;
