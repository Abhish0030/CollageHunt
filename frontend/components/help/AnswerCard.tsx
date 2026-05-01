"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { getInitials } from "@/lib/utils";
import type { HelpAnswer } from "@/types/api";
import { formatRelativeTime } from "./helpUtils";

const editAnswerSchema = z.object({
  body: z.string().trim().min(20).max(2000),
});

type EditAnswerForm = z.infer<typeof editAnswerSchema>;

type AnswerCardProps = {
  answer: HelpAnswer;
  canEdit: boolean;
  canAccept: boolean;
  isAccepting: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  isUpvoting: boolean;
  onUpvote: () => void;
  onDelete: () => void;
  onAccept: () => void;
  onSaveEdit: (body: string) => Promise<void>;
};

export const AnswerCard = ({
  answer,
  canEdit,
  canAccept,
  isAccepting,
  isSaving,
  isDeleting,
  isUpvoting,
  onUpvote,
  onDelete,
  onAccept,
  onSaveEdit,
}: AnswerCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<EditAnswerForm>({
    resolver: zodResolver(editAnswerSchema),
    mode: "onChange",
    defaultValues: {
      body: answer.body,
    },
  });

  useEffect(() => {
    form.reset({ body: answer.body });
  }, [answer.body, form]);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {answer.isAccepted ? (
        <div className="rounded-t-2xl border-l-4 border-green-500 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
          ACCEPTED ANSWER
        </div>
      ) : null}
      <div className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {getInitials(answer.author.name)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{answer.author.name}</p>
            <p className="text-sm text-slate-500">Answered {formatRelativeTime(answer.createdAt)}</p>
          </div>
        </div>

        {isEditing ? (
          <form
            className="mt-4"
            onSubmit={form.handleSubmit(async (values) => {
              await onSaveEdit(values.body);
              setIsEditing(false);
            })}
          >
            <textarea
              {...form.register("body")}
              className="min-h-[160px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none transition focus:border-blue-400"
            />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-xs text-rose-600">{form.formState.errors.body?.message}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    form.reset({ body: answer.body });
                    setIsEditing(false);
                  }}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700">{answer.body}</p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
          <button
            type="button"
            onClick={onUpvote}
            disabled={isUpvoting}
            className={`rounded-full border px-4 py-2 font-semibold transition ${
              answer.upvoted
                ? "border-blue-200 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Upvote ({answer.upvotes})
          </button>
          {canEdit ? (
            <>
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="rounded-full border border-slate-200 px-4 py-2 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting}
                className="rounded-full border border-rose-200 px-4 py-2 font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </>
          ) : null}
          {canAccept && !answer.isAccepted ? (
            <button
              type="button"
              onClick={onAccept}
              disabled={isAccepting}
              className="rounded-full bg-green-600 px-4 py-2 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isAccepting ? "Accepting..." : "Mark as Accepted"}
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
};
