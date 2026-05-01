import { Prisma } from "../generated/prisma";
import { type Request, Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { authMiddleware } from "../middleware/authMiddleware";
import { AppError, sendCreated, sendSuccess } from "../utils/api";
import { getTokenCookieName, verifyToken } from "../utils/auth";

const router = Router();

const helpCategories = [
  "engineering",
  "medicine",
  "law",
  "management",
  "university",
  "design",
] as const;

const questionSelect = {
  id: true,
  title: true,
  body: true,
  category: true,
  tags: true,
  upvotes: true,
  views: true,
  isSolved: true,
  isPinned: true,
  createdAt: true,
  updatedAt: true,
  authorId: true,
  author: {
    select: {
      id: true,
      name: true,
    },
  },
  _count: {
    select: {
      answers: true,
    },
  },
} satisfies Prisma.QuestionSelect;

const answerSelect = {
  id: true,
  body: true,
  questionId: true,
  authorId: true,
  upvotes: true,
  isAccepted: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.AnswerSelect;

const listQuestionsSchema = z.object({
  category: z.enum(helpCategories).optional(),
  tag: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
  sort: z.enum(["latest", "popular", "unanswered", "solved"]).default("latest"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(20).default(10),
  authorId: z.string().trim().optional(),
  isSolved: z
    .union([z.literal("true"), z.literal("false")])
    .transform((value) => value === "true")
    .optional(),
});

const createQuestionSchema = z.object({
  title: z.string().trim().min(10).max(200),
  body: z.string().trim().max(5000).optional(),
  category: z.enum(helpCategories),
  tags: z.array(z.string().trim().min(1).max(30)).max(5),
});

const updateQuestionSchema = z
  .object({
    title: z.string().trim().min(10).max(200).optional(),
    body: z.string().trim().max(5000).optional(),
    category: z.enum(helpCategories).optional(),
    tags: z.array(z.string().trim().min(1).max(30)).max(5).optional(),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "Please provide at least one field to update",
  });

const createAnswerSchema = z.object({
  body: z.string().trim().min(20).max(2000),
});

const updateAnswerSchema = z.object({
  body: z.string().trim().min(20).max(2000),
});

const idSchema = z.coerce.number().int().positive();

const normalizeTags = (tags: string[]) =>
  Array.from(
    new Set(
      tags
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ).slice(0, 5);

const getOptionalUserId = (req: Request) => {
  const token =
    req.cookies[getTokenCookieName()] ??
    req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token).userId;
  } catch {
    return null;
  }
};

const buildQuestionWhere = (
  query: z.infer<typeof listQuestionsSchema>,
  currentUserId: number | null,
): Prisma.QuestionWhereInput => {
  const where: Prisma.QuestionWhereInput = {};

  if (query.category) {
    where.category = query.category;
  }

  if (query.tag) {
    where.tags = { has: query.tag };
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { body: { contains: query.search, mode: "insensitive" } },
      { tags: { has: query.search } },
    ];
  }

  if (query.sort === "unanswered") {
    where.answers = { none: {} };
  }

  if (query.sort === "solved") {
    where.isSolved = true;
  }

  if (typeof query.isSolved === "boolean") {
    where.isSolved = query.isSolved;
  }

  if (query.authorId) {
    if (query.authorId === "me") {
      if (!currentUserId) {
        where.authorId = -1;
      } else {
        where.authorId = currentUserId;
      }
    } else {
      const authorId = Number(query.authorId);
      if (Number.isInteger(authorId) && authorId > 0) {
        where.authorId = authorId;
      }
    }
  }

  return where;
};

const getQuestionOrderBy = (sort: z.infer<typeof listQuestionsSchema>["sort"]): Prisma.QuestionOrderByWithRelationInput[] => {
  if (sort === "popular") {
    return [{ isPinned: "desc" }, { upvotes: "desc" }, { views: "desc" }, { createdAt: "desc" }];
  }

  if (sort === "solved") {
    return [{ isPinned: "desc" }, { updatedAt: "desc" }, { createdAt: "desc" }];
  }

  if (sort === "unanswered") {
    return [{ isPinned: "desc" }, { createdAt: "desc" }];
  }

  return [{ isPinned: "desc" }, { createdAt: "desc" }];
};

router.get("/top-contributors", async (_req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const grouped = await prisma.answer.groupBy({
      by: ["authorId"],
      where: {
        createdAt: {
          gte: since,
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        _count: {
          authorId: "desc",
        },
      },
      take: 5,
    });

    const users = await prisma.user.findMany({
      where: {
        id: {
          in: grouped.map((item) => item.authorId),
        },
      },
      select: {
        id: true,
        name: true,
      },
    });

    const usersById = new Map(users.map((user) => [user.id, user]));

    return sendSuccess(
      res,
      grouped.map((item) => ({
        id: item.authorId,
        name: usersById.get(item.authorId)?.name ?? "Unknown User",
        answersCount: item._count._all,
      })),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/questions", async (req, res, next) => {
  try {
    const query = listQuestionsSchema.parse(req.query);
    const currentUserId = getOptionalUserId(req);
    const where = buildQuestionWhere(query, currentUserId);

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        select: questionSelect,
        orderBy: getQuestionOrderBy(query.sort),
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      prisma.question.count({ where }),
    ]);

    return sendSuccess(
      res,
      questions.map((question) => ({
        id: question.id,
        title: question.title,
        body: question.body,
        category: question.category,
        tags: question.tags,
        upvotes: question.upvotes,
        views: question.views,
        answersCount: question._count.answers,
        isSolved: question.isSolved,
        isPinned: question.isPinned,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
        authorId: question.authorId,
        author: question.author,
      })),
      {
        total,
        page: query.page,
        limit: query.limit,
      },
    );
  } catch (error) {
    next(error);
  }
});

router.get("/questions/:id", async (req, res, next) => {
  try {
    const questionId = idSchema.parse(req.params.id);
    const currentUserId = getOptionalUserId(req);
    const exists = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!exists) {
      throw new AppError(404, "NOT_FOUND", "Question not found");
    }

    const question = await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id: questionId },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      return tx.question.findUnique({
        where: { id: questionId },
        select: {
          ...questionSelect,
          answers: {
            select: answerSelect,
            orderBy: [{ isAccepted: "desc" }, { upvotes: "desc" }, { createdAt: "asc" }],
          },
          upvotedBy: currentUserId
            ? {
                where: { userId: currentUserId },
                select: { id: true },
              }
            : false,
        },
      });
    });

    if (!question) {
      throw new AppError(404, "NOT_FOUND", "Question not found");
    }

    const answerUpvotes = currentUserId
      ? await prisma.answerUpvote.findMany({
          where: {
            answerId: {
              in: question.answers.map((answer) => answer.id),
            },
            userId: currentUserId,
          },
          select: {
            answerId: true,
          },
        })
      : [];

    const upvotedAnswerIds = new Set(answerUpvotes.map((item) => item.answerId));

    return sendSuccess(res, {
      id: question.id,
      title: question.title,
      body: question.body,
      category: question.category,
      tags: question.tags,
      upvotes: question.upvotes,
      views: question.views,
      isSolved: question.isSolved,
      isPinned: question.isPinned,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      authorId: question.authorId,
      author: question.author,
      answersCount: question._count.answers,
      upvoted: "upvotedBy" in question ? question.upvotedBy.length > 0 : false,
      answers: question.answers.map((answer) => ({
        ...answer,
        upvoted: upvotedAnswerIds.has(answer.id),
      })),
    });
  } catch (error) {
    next(error);
  }
});

router.get("/questions/:id/answers", async (req, res, next) => {
  try {
    const questionId = idSchema.parse(req.params.id);
    const currentUserId = getOptionalUserId(req);
    const answers = await prisma.answer.findMany({
      where: { questionId },
      select: answerSelect,
      orderBy: [{ isAccepted: "desc" }, { upvotes: "desc" }, { createdAt: "asc" }],
    });

    const answerUpvotes = currentUserId
      ? await prisma.answerUpvote.findMany({
          where: {
            userId: currentUserId,
            answerId: {
              in: answers.map((answer) => answer.id),
            },
          },
          select: {
            answerId: true,
          },
        })
      : [];

    const upvotedIds = new Set(answerUpvotes.map((item) => item.answerId));

    return sendSuccess(
      res,
      answers.map((answer) => ({
        ...answer,
        upvoted: upvotedIds.has(answer.id),
      })),
    );
  } catch (error) {
    next(error);
  }
});

router.post("/questions", authMiddleware, async (req, res, next) => {
  try {
    const payload = createQuestionSchema.parse(req.body);
    const question = await prisma.question.create({
      data: {
        title: payload.title.trim(),
        body: payload.body?.trim() || null,
        category: payload.category,
        tags: normalizeTags(payload.tags),
        authorId: req.user!.userId,
      },
      select: {
        ...questionSelect,
        answers: {
          select: answerSelect,
        },
      },
    });

    return sendCreated(res, {
      ...question,
      answersCount: question._count.answers,
      upvoted: false,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/questions/:id", authMiddleware, async (req, res, next) => {
  try {
    const questionId = idSchema.parse(req.params.id);
    const payload = updateQuestionSchema.parse(req.body);
    const existing = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        authorId: true,
      },
    });

    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Question not found");
    }

    if (existing.authorId !== req.user!.userId) {
      throw new AppError(403, "UNAUTHORIZED", "Only the question author can edit this question");
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
        ...(payload.body !== undefined ? { body: payload.body.trim() || null } : {}),
        ...(payload.category !== undefined ? { category: payload.category } : {}),
        ...(payload.tags !== undefined ? { tags: normalizeTags(payload.tags) } : {}),
      },
      select: {
        ...questionSelect,
        answers: {
          select: answerSelect,
          orderBy: [{ isAccepted: "desc" }, { upvotes: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    return sendSuccess(res, {
      ...question,
      answersCount: question._count.answers,
    });
  } catch (error) {
    next(error);
  }
});

router.delete("/questions/:id", authMiddleware, async (req, res, next) => {
  try {
    const questionId = idSchema.parse(req.params.id);
    const existing = await prisma.question.findUnique({
      where: { id: questionId },
      select: {
        authorId: true,
      },
    });

    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Question not found");
    }

    if (existing.authorId !== req.user!.userId) {
      throw new AppError(403, "UNAUTHORIZED", "Only the question author can delete this question");
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    return sendSuccess(res, { deleted: true, id: questionId });
  } catch (error) {
    next(error);
  }
});

router.post("/questions/:id/upvote", authMiddleware, async (req, res, next) => {
  try {
    const questionId = idSchema.parse(req.params.id);
    const existing = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Question not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.questionUpvote.findUnique({
        where: {
          questionId_userId: {
            questionId,
            userId: req.user!.userId,
          },
        },
      });

      if (current) {
        await tx.questionUpvote.delete({
          where: { id: current.id },
        });
        const question = await tx.question.update({
          where: { id: questionId },
          data: {
            upvotes: {
              decrement: 1,
            },
          },
          select: { upvotes: true },
        });

        return { upvotes: question.upvotes, upvoted: false };
      }

      await tx.questionUpvote.create({
        data: {
          questionId,
          userId: req.user!.userId,
        },
      });

      const question = await tx.question.update({
        where: { id: questionId },
        data: {
          upvotes: {
            increment: 1,
          },
        },
        select: { upvotes: true },
      });

      return { upvotes: question.upvotes, upvoted: true };
    });

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.post("/questions/:id/answers", authMiddleware, async (req, res, next) => {
  try {
    const questionId = idSchema.parse(req.params.id);
    const payload = createAnswerSchema.parse(req.body);
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { id: true },
    });

    if (!question) {
      throw new AppError(404, "NOT_FOUND", "Question not found");
    }

    const answer = await prisma.answer.create({
      data: {
        body: payload.body.trim(),
        questionId,
        authorId: req.user!.userId,
      },
      select: answerSelect,
    });

    return sendCreated(res, {
      ...answer,
      upvoted: false,
    });
  } catch (error) {
    next(error);
  }
});

router.patch("/answers/:id", authMiddleware, async (req, res, next) => {
  try {
    const answerId = idSchema.parse(req.params.id);
    const payload = updateAnswerSchema.parse(req.body);
    const existing = await prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        authorId: true,
      },
    });

    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Answer not found");
    }

    if (existing.authorId !== req.user!.userId) {
      throw new AppError(403, "UNAUTHORIZED", "Only the answer author can edit this answer");
    }

    const answer = await prisma.answer.update({
      where: { id: answerId },
      data: {
        body: payload.body.trim(),
      },
      select: answerSelect,
    });

    return sendSuccess(res, answer);
  } catch (error) {
    next(error);
  }
});

router.delete("/answers/:id", authMiddleware, async (req, res, next) => {
  try {
    const answerId = idSchema.parse(req.params.id);
    const existing = await prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        authorId: true,
        questionId: true,
        isAccepted: true,
      },
    });

    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Answer not found");
    }

    if (existing.authorId !== req.user!.userId) {
      throw new AppError(403, "UNAUTHORIZED", "Only the answer author can delete this answer");
    }

    await prisma.$transaction(async (tx) => {
      await tx.answer.delete({
        where: { id: answerId },
      });

      if (existing.isAccepted) {
        await tx.question.update({
          where: { id: existing.questionId },
          data: {
            isSolved: false,
          },
        });
      }
    });

    return sendSuccess(res, { deleted: true, id: answerId });
  } catch (error) {
    next(error);
  }
});

router.post("/answers/:id/upvote", authMiddleware, async (req, res, next) => {
  try {
    const answerId = idSchema.parse(req.params.id);
    const existing = await prisma.answer.findUnique({
      where: { id: answerId },
      select: { id: true },
    });

    if (!existing) {
      throw new AppError(404, "NOT_FOUND", "Answer not found");
    }

    const result = await prisma.$transaction(async (tx) => {
      const current = await tx.answerUpvote.findUnique({
        where: {
          answerId_userId: {
            answerId,
            userId: req.user!.userId,
          },
        },
      });

      if (current) {
        await tx.answerUpvote.delete({
          where: { id: current.id },
        });
        const answer = await tx.answer.update({
          where: { id: answerId },
          data: {
            upvotes: {
              decrement: 1,
            },
          },
          select: { upvotes: true },
        });

        return { upvotes: answer.upvotes, upvoted: false };
      }

      await tx.answerUpvote.create({
        data: {
          answerId,
          userId: req.user!.userId,
        },
      });

      const answer = await tx.answer.update({
        where: { id: answerId },
        data: {
          upvotes: {
            increment: 1,
          },
        },
        select: { upvotes: true },
      });

      return { upvotes: answer.upvotes, upvoted: true };
    });

    return sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

router.post("/answers/:id/accept", authMiddleware, async (req, res, next) => {
  try {
    const answerId = idSchema.parse(req.params.id);
    const answer = await prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        id: true,
        questionId: true,
        question: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!answer) {
      throw new AppError(404, "NOT_FOUND", "Answer not found");
    }

    if (answer.question.authorId !== req.user!.userId) {
      throw new AppError(403, "UNAUTHORIZED", "Only the question author can accept an answer");
    }

    await prisma.$transaction(async (tx) => {
      await tx.answer.updateMany({
        where: {
          questionId: answer.questionId,
          isAccepted: true,
        },
        data: {
          isAccepted: false,
        },
      });

      await tx.answer.update({
        where: { id: answerId },
        data: {
          isAccepted: true,
        },
      });

      await tx.question.update({
        where: { id: answer.questionId },
        data: {
          isSolved: true,
        },
      });
    });

    return sendSuccess(res, { accepted: true });
  } catch (error) {
    next(error);
  }
});

export default router;
