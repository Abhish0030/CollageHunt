"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import { createQuestion, getApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { TagInput } from "./TagInput";
import { HELP_CATEGORIES } from "./helpUtils";

const askQuestionSchema = z.object({
  title: z.string().trim().min(10).max(200),
  category: z.string().min(1),
  body: z.string().trim().max(5000).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(5),
});

type AskQuestionForm = z.infer<typeof askQuestionSchema>;

type AskQuestionModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AskQuestionModal = ({ isOpen, onClose }: AskQuestionModalProps) => {
  const router = useRouter();
  const { openAuthModal, user } = useAuthStore();

  const form = useForm<AskQuestionForm>({
    resolver: zodResolver(askQuestionSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      category: "engineering",
      body: "",
      tags: [],
    },
  });

  const mutation = useMutation({
    mutationFn: createQuestion,
    onSuccess: (question) => {
      toast.success("Question posted! You'll be notified when answered.");
      form.reset();
      onClose();
      router.push(`/help/${question.id}`);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-950">Ask a Question</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={18} />
          </button>
        </div>

        {!user ? (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-lg font-semibold text-slate-900">Please login to ask a question</p>
            <button
              type="button"
              onClick={() => {
                onClose();
                openAuthModal("login", "/help");
              }}
              className="mt-4 rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        ) : (
          <form
            className="mt-6 space-y-5"
            onSubmit={form.handleSubmit((values) =>
              mutation.mutate({
                title: values.title,
                category: values.category,
                body: values.body?.trim() || undefined,
                tags: values.tags,
              }),
            )}
          >
            <div>
              <label className="text-sm font-semibold text-slate-900">Question Title *</label>
              <input
                {...form.register("title")}
                placeholder="e.g. What is the JEE Main 2025 cutoff for NIT Trichy CSE?"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-rose-600">{form.formState.errors.title?.message}</span>
                <span className="text-slate-400">{(form.watch("title") ?? "").length} / 200</span>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">Category *</label>
              <select
                {...form.register("category")}
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
              >
                {HELP_CATEGORIES.filter((item) => item.value !== "all").map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">Description (optional)</label>
              <textarea
                {...form.register("body")}
                placeholder="Add more context to your question"
                className="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-400"
              />
              <p className="mt-1 text-xs text-rose-600">{form.formState.errors.body?.message}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-900">Tags (up to 5)</label>
              <div className="mt-2">
                <Controller
                  control={form.control}
                  name="tags"
                  render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
                />
              </div>
              <p className="mt-1 text-xs text-rose-600">{form.formState.errors.tags?.message}</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {mutation.isPending ? "Posting..." : "Post Question ->"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
