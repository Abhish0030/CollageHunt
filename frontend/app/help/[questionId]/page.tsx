"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AnswerCard } from "@/components/help/AnswerCard";
import { AskQuestionModal } from "@/components/help/AskQuestionModal";
import { HelpSidebar } from "@/components/help/HelpSidebar";
import { TagInput } from "@/components/help/TagInput";
import { formatRelativeTime, getCategoryLabel } from "@/components/help/helpUtils";
import {
  acceptAnswer,
  createAnswer,
  deleteAnswer,
  deleteQuestion,
  getApiErrorMessage,
  getQuestion,
  getQuestions,
  updateAnswer,
  updateQuestion,
  upvoteAnswer,
  upvoteQuestion,
} from "@/lib/api";
import { getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { HelpQuestionDetail } from "@/types/api";

const answerSchema = z.object({
  body: z.string().trim().min(20).max(2000),
});

const editQuestionSchema = z.object({
  title: z.string().trim().min(10).max(200),
  category: z.string().min(1),
  body: z.string().trim().max(5000).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(5),
});

type AnswerForm = z.infer<typeof answerSchema>;
type EditQuestionForm = z.infer<typeof editQuestionSchema>;

export default function HelpQuestionPage() {
  const params = useParams<{ questionId: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const questionId = Number(params.questionId);
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const { openAuthModal, user } = useAuthStore();

  const questionQuery = useQuery({
    queryKey: ["help-question", questionId],
    queryFn: () => getQuestion(questionId),
    enabled: Number.isInteger(questionId) && questionId > 0,
  });

  const recentlySolvedQuery = useQuery({
    queryKey: ["help-recently-solved"],
    queryFn: () => getQuestions({ sort: "solved", limit: 3, page: 1 }),
  });

  const answerForm = useForm<AnswerForm>({
    resolver: zodResolver(answerSchema),
    mode: "onChange",
    defaultValues: {
      body: "",
    },
  });

  const editQuestionForm = useForm<EditQuestionForm>({
    resolver: zodResolver(editQuestionSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      category: "engineering",
      body: "",
      tags: [],
    },
  });

  const question = questionQuery.data;

  useEffect(() => {
    if (question) {
      editQuestionForm.reset({
        title: question.title,
        category: question.category,
        body: question.body ?? "",
        tags: question.tags,
      });
    }
  }, [editQuestionForm, question]);

  const setQuestionCache = (updater: (current: HelpQuestionDetail) => HelpQuestionDetail) => {
    queryClient.setQueryData<HelpQuestionDetail>(["help-question", questionId], (current) =>
      current ? updater(current) : current,
    );
  };

  const questionUpvoteMutation = useMutation({
    mutationFn: () => upvoteQuestion(questionId),
    onMutate: async () => {
      const previous = queryClient.getQueryData<HelpQuestionDetail>(["help-question", questionId]);
      if (!previous) {
        return { previous };
      }

      setQuestionCache((current) => ({
        ...current,
        upvotes: current.upvoted ? current.upvotes - 1 : current.upvotes + 1,
        upvoted: !current.upvoted,
      }));

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["help-question", questionId], context.previous);
      }
      toast.error(getApiErrorMessage(error));
    },
    onSuccess: (result) => {
      setQuestionCache((current) => ({
        ...current,
        upvotes: result.upvotes,
        upvoted: result.upvoted,
      }));
    },
  });

  const createAnswerMutation = useMutation({
    mutationFn: (body: string) => createAnswer(questionId, body),
    onSuccess: (answer) => {
      setQuestionCache((current) => ({
        ...current,
        answers: [answer, ...current.answers],
        answersCount: current.answersCount + 1,
      }));
      answerForm.reset();
      toast.success("Answer posted!");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const updateQuestionMutation = useMutation({
    mutationFn: (values: EditQuestionForm) =>
      updateQuestion(questionId, {
        title: values.title,
        category: values.category,
        body: values.body,
        tags: values.tags,
      }),
    onSuccess: (updatedQuestion) => {
      queryClient.setQueryData(["help-question", questionId], updatedQuestion);
      setIsEditingQuestion(false);
      toast.success("Question updated");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const deleteQuestionMutation = useMutation({
    mutationFn: () => deleteQuestion(questionId),
    onSuccess: () => {
      toast.success("Question deleted");
      router.push("/help");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const canEditQuestion = Boolean(user && question && user.id === question.authorId);

  if (questionQuery.isLoading) {
    return (
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <div className="space-y-5">
          <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="h-8 w-3/4 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 h-5 w-full animate-pulse rounded bg-slate-200" />
            <div className="mt-2 h-5 w-5/6 animate-pulse rounded bg-slate-200" />
          </div>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-5 w-32 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-4/5 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
        <div className="space-y-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-5 w-28 animate-pulse rounded bg-slate-200" />
              <div className="mt-4 h-4 w-full animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Question not found</h1>
          <Link href="/help" className="mt-4 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white">
            Back to Help Center
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
        <div>
          <div className="mb-4 text-sm text-slate-500">
            <Link href="/help" className="transition hover:text-blue-700">
              Help Center
            </Link>{" "}
            &gt; {getCategoryLabel(question.category)} &gt;{" "}
            <span className="truncate text-slate-700">{question.title}</span>
          </div>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {question.isSolved ? (
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                SOLVED
              </span>
            ) : null}

            {isEditingQuestion ? (
              <form
                className="mt-4 space-y-4"
                onSubmit={editQuestionForm.handleSubmit((values) => updateQuestionMutation.mutate(values))}
              >
                <input
                  {...editQuestionForm.register("title")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-xl font-semibold outline-none transition focus:border-blue-400"
                />
                <select
                  {...editQuestionForm.register("category")}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
                >
                  {["engineering", "medicine", "law", "management", "university", "design"].map((category) => (
                    <option key={category} value={category}>
                      {getCategoryLabel(category as HelpQuestionDetail["category"])}
                    </option>
                  ))}
                </select>
                <textarea
                  {...editQuestionForm.register("body")}
                  className="min-h-[160px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-400"
                />
                <Controller
                  control={editQuestionForm.control}
                  name="tags"
                  render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
                />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-rose-600">{editQuestionForm.formState.errors.title?.message}</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        editQuestionForm.reset({
                          title: question.title,
                          category: question.category,
                          body: question.body ?? "",
                          tags: question.tags,
                        });
                        setIsEditingQuestion(false);
                      }}
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updateQuestionMutation.isPending}
                      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                    >
                      {updateQuestionMutation.isPending ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <>
                <h1 className="mt-4 text-2xl font-bold text-slate-950">{question.title}</h1>

                <div className="mt-4 flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {getInitials(question.author.name)}
                    </div>
                    <div className="text-sm text-slate-500">
                      <span className="font-medium text-slate-900">{question.author.name}</span> · Asked {formatRelativeTime(question.createdAt)}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">{question.views} views</div>
                </div>

                <div className="my-6 border-t border-slate-200" />
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{question.body}</p>
                <div className="my-6 border-t border-slate-200" />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (!user) {
                        openAuthModal("login", `/help/${question.id}`);
                        return;
                      }
                      questionUpvoteMutation.mutate();
                    }}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      question.upvoted
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    Upvote ({question.upvotes})
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await navigator.clipboard.writeText(window.location.href);
                      toast.success("Question link copied");
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  {canEditQuestion ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          editQuestionForm.reset({
                            title: question.title,
                            category: question.category,
                            body: question.body ?? "",
                            tags: question.tags,
                          });
                          setIsEditingQuestion(true);
                        }}
                        className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Delete this question?")) {
                            deleteQuestionMutation.mutate();
                          }
                        }}
                        className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </>
            )}
          </article>

          <section className="mt-8">
            <h2 className="text-xl font-semibold text-slate-900">{question.answersCount} Answers</h2>
            <div className="mt-4 space-y-4">
              {question.answers.map((answer) => (
                <AnswerDetailRow
                  key={answer.id}
                  answer={answer}
                  question={question}
                  onQuestionRefresh={(updatedQuestion) =>
                    queryClient.setQueryData(["help-question", questionId], updatedQuestion)
                  }
                />
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            {user ? (
              <>
                <h2 className="text-xl font-semibold text-slate-900">Your Answer</h2>
                <form
                  className="mt-4"
                  onSubmit={answerForm.handleSubmit((values) => createAnswerMutation.mutate(values.body))}
                >
                  <textarea
                    {...answerForm.register("body")}
                    placeholder="Share your knowledge... (minimum 20 characters)"
                    className="min-h-[160px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-400"
                  />
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-rose-600">{answerForm.formState.errors.body?.message}</p>
                    <p className="text-xs text-slate-400">{(answerForm.watch("body") ?? "").length} / 2000</p>
                  </div>
                  <button
                    type="submit"
                    disabled={createAnswerMutation.isPending}
                    className="mt-4 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {createAnswerMutation.isPending ? "Posting..." : "Post Answer"}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <p className="text-lg font-semibold text-slate-900">Login to post an answer</p>
                <button
                  type="button"
                  onClick={() => openAuthModal("login", `/help/${question.id}`)}
                  className="mt-4 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Login
                </button>
              </div>
            )}
          </section>
        </div>

        <HelpSidebar
          onAskQuestion={() => setIsAskOpen(true)}
          onTagClick={(tag) => {
            router.push(`/help?tag=${encodeURIComponent(tag)}`);
          }}
          recentlySolved={recentlySolvedQuery.data?.data ?? []}
          questionStats={{
            views: question.views,
            answers: question.answersCount,
            askedAt: question.createdAt,
            category: question.category,
          }}
        />
      </div>

      <AskQuestionModal isOpen={isAskOpen} onClose={() => setIsAskOpen(false)} />
    </>
  );
}

type AnswerDetailRowProps = {
  answer: HelpQuestionDetail["answers"][number];
  question: HelpQuestionDetail;
  onQuestionRefresh: (question: HelpQuestionDetail) => void;
};

const AnswerDetailRow = ({ answer, question, onQuestionRefresh }: AnswerDetailRowProps) => {
  const queryClient = useQueryClient();
  const { openAuthModal, user } = useAuthStore();
  const questionId = question.id;
  const canEdit = Boolean(user && user.id === answer.authorId);
  const canAccept = Boolean(user && user.id === question.authorId);

  const setQuestionCache = (updater: (current: HelpQuestionDetail) => HelpQuestionDetail) => {
    queryClient.setQueryData<HelpQuestionDetail>(["help-question", questionId], (current) =>
      current ? updater(current) : current,
    );
  };

  const upvoteMutation = useMutation({
    mutationFn: () => upvoteAnswer(answer.id),
    onMutate: async () => {
      const previous = queryClient.getQueryData<HelpQuestionDetail>(["help-question", questionId]);
      if (!previous) {
        return { previous };
      }

      setQuestionCache((current) => ({
        ...current,
        answers: current.answers.map((item) =>
          item.id === answer.id
            ? {
                ...item,
                upvoted: !item.upvoted,
                upvotes: item.upvoted ? item.upvotes - 1 : item.upvotes + 1,
              }
            : item,
        ),
      }));

      return { previous };
    },
    onError: (error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["help-question", questionId], context.previous);
      }
      toast.error(getApiErrorMessage(error));
    },
    onSuccess: (result) => {
      setQuestionCache((current) => ({
        ...current,
        answers: current.answers.map((item) =>
          item.id === answer.id ? { ...item, upvotes: result.upvotes, upvoted: result.upvoted } : item,
        ),
      }));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (body: string) => updateAnswer(answer.id, body),
    onSuccess: (updatedAnswer) => {
      setQuestionCache((current) => ({
        ...current,
        answers: current.answers.map((item) => (item.id === answer.id ? { ...item, ...updatedAnswer } : item)),
      }));
      toast.success("Answer updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAnswer(answer.id),
    onSuccess: async () => {
      const refreshed = await getQuestion(questionId);
      onQuestionRefresh(refreshed);
      toast.success("Answer deleted");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptAnswer(answer.id),
    onSuccess: async () => {
      const refreshed = await getQuestion(questionId);
      onQuestionRefresh(refreshed);
      toast.success("Accepted answer updated");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return (
    <AnswerCard
      answer={answer}
      canEdit={canEdit}
      canAccept={canAccept}
      isAccepting={acceptMutation.isPending}
      isSaving={updateMutation.isPending}
      isDeleting={deleteMutation.isPending}
      isUpvoting={upvoteMutation.isPending}
      onUpvote={() => {
        if (!user) {
          openAuthModal("login", `/help/${questionId}`);
          return;
        }
        upvoteMutation.mutate();
      }}
      onDelete={() => {
        if (window.confirm("Delete this answer?")) {
          deleteMutation.mutate();
        }
      }}
      onAccept={() => acceptMutation.mutate()}
      onSaveEdit={(body) => updateMutation.mutateAsync(body).then(() => undefined)}
    />
  );
};
