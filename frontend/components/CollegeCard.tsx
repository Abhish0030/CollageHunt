"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, GitCompareArrows, MapPin } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { getApiErrorMessage, isUnauthorizedError, saveCollege, unsaveCollege } from "@/lib/api";
import { formatCurrency, getTopCourse } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useCompareStore } from "@/store/compareStore";
import type { College } from "@/types/api";
import { StarRating } from "./StarRating";

const isAuthRequiredError = (error: unknown) => error instanceof Error && error.message === "AUTH_REQUIRED";

export const CollegeCard = ({ college }: { college: College }) => {
  const queryClient = useQueryClient();
  const { addCollege, ids, removeCollege } = useCompareStore();
  const { addSavedCollegeId, openAuthModal, removeSavedCollegeId, savedCollegeIds, setSavedCollegeIds, setUser, user } =
    useAuthStore();
  const isSaved = savedCollegeIds.includes(college.id);
  const isCompared = ids.includes(college.id);

  const toggleSave = useMutation({
    mutationFn: async ({ shouldUnsave }: { shouldUnsave: boolean }) => {
      if (shouldUnsave) {
        return unsaveCollege(college.id);
      }
      return saveCollege(college.id);
    },
    onMutate: async ({ shouldUnsave }: { shouldUnsave: boolean }) => {
      const currentState = useAuthStore.getState();
      if (!currentState.user) {
        openAuthModal("login");
        throw new Error("AUTH_REQUIRED");
      }

      const previous = currentState.savedCollegeIds;
      if (shouldUnsave) {
        removeSavedCollegeId(college.id);
      } else {
        addSavedCollegeId(college.id);
      }
      return { previous };
    },
    onSuccess: async (_data, variables) => {
      toast.success(variables.shouldUnsave ? "College removed from saved list" : "College saved");
      await queryClient.invalidateQueries({ queryKey: ["saved-colleges"] });
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saved-colleges"] });
    },
    onError: (error, _variables, context) => {
      if (isAuthRequiredError(error)) {
        return;
      }
      if (context && "previous" in context) {
        setSavedCollegeIds(context.previous);
      }
      if (isUnauthorizedError(error)) {
        setUser(null);
        setSavedCollegeIds([]);
        openAuthModal("login");
        toast.error("Your session expired. Please log in again to save colleges.");
        return;
      }
      toast.error(getApiErrorMessage(error));
    },
  });

  return (
    <article className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6">
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link
              href={`/colleges/${college.slug}`}
              className="block text-xl font-semibold leading-snug text-slate-900 transition hover:text-blue-700"
            >
              {college.name}
            </Link>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <MapPin size={16} />
                {college.city}, {college.state}
              </span>
              {college.stream ? <span>{college.stream}</span> : null}
              {college.ownership ? <span>{college.ownership}</span> : null}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const currentSaved = useAuthStore.getState().savedCollegeIds.includes(college.id);
              toggleSave.mutate({ shouldUnsave: currentSaved });
            }}
            className={`rounded-full border p-2 transition ${
              isSaved
                ? "border-blue-100 bg-blue-50 text-blue-700"
                : "border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-700"
            }`}
            aria-label={isSaved ? "Unsave college" : "Save college"}
          >
            <Bookmark fill={isSaved ? "currentColor" : "none"} size={18} />
          </button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="text-slate-500">Annual fees</p>
            <p className="mt-1 font-semibold text-slate-900">{formatCurrency(college.feesPerYear)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="text-slate-500">Top course</p>
            <p className="mt-1 font-medium text-slate-900">{getTopCourse(college.courses)}</p>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="text-slate-500">Rating</p>
            <div className="mt-1 flex items-center gap-2">
              <StarRating rating={college.rating} />
              <span className="font-semibold text-slate-900">{college.rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-4 text-sm">
            <p className="text-slate-500">NIRF</p>
            <p className="mt-1 font-semibold text-slate-900">
              {college.nirfRank ? `#${college.nirfRank}` : "Unranked"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex w-full flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
        <Link href={`/colleges/${college.slug}`} className="button-primary w-full">
          View details
        </Link>
        <button
          type="button"
          onClick={() => {
            if (!isCompared && ids.length >= 3) {
              toast.error("You can shortlist up to 3 colleges at a time");
              return;
            }
            if (isCompared) {
              removeCollege(college.id);
              toast.success("Removed from shortlist");
              return;
            }
            addCollege(college.id);
            toast.success("Added to shortlist");
          }}
          className="button-secondary w-full"
        >
          <GitCompareArrows className="mr-2" size={16} />
          {isCompared ? "Remove shortlist" : "Shortlist"}
        </button>
      </div>
    </article>
  );
};
