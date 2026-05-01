import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { AppError, sendCreated, sendSuccess } from "../utils/api";

const router = Router();
const idSchema = z.coerce.number().int().positive();

router.use(authMiddleware);

router.get("/", async (req, res, next) => {
  try {
    const saved = await prisma.savedCollege.findMany({
      where: { userId: req.user?.userId },
      include: {
        college: {
          include: {
            courses: true,
            _count: {
              select: {
                reviews: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return sendSuccess(
      res,
      saved.map((entry: (typeof saved)[number]) => ({
        id: entry.id,
        college: entry.college,
      })),
    );
  } catch (error) {
    next(error);
  }
});

router.post("/:id", async (req, res, next) => {
  try {
    const collegeId = idSchema.parse(req.params.id);
    const college = await prisma.college.findUnique({ where: { id: collegeId } });

    if (!college) {
      throw new AppError(404, "NOT_FOUND", "College not found");
    }

    const saved = await prisma.savedCollege.upsert({
      where: {
        userId_collegeId: {
          userId: req.user!.userId,
          collegeId,
        },
      },
      update: {},
      create: {
        userId: req.user!.userId,
        collegeId,
      },
      include: {
        college: true,
      },
    });

    return sendCreated(res, saved);
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const collegeId = idSchema.parse(req.params.id);

    const result = await prisma.savedCollege.deleteMany({
      where: {
        userId: req.user!.userId,
        collegeId,
      },
    });

    return sendSuccess(res, { removed: result.count > 0, collegeId });
  } catch (error) {
    return next(error);
  }
});

export default router;
