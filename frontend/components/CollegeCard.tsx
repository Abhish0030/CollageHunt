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

export const CollegeCard = ({ college }: { college: College }) => {
  const queryClient = useQueryClient();
  const { addCollege, ids } = useCompareStore();
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
      if ((error as Error).message === "AUTH_REQUIRED") {
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
    <article className="group rounded-xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-1 hover:shadow-xl">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <Link href={`/college/${college.slug}`} className="text-lg font-semibold text-slate-900 transition hover:text-blue-700">
            {college.name}
          </Link>
          <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <MapPin size={16} />
            <span>
              {college.city}, {college.state}
            </span>
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

      <div className="mb-5 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Annual fees</span>
          <span className="font-semibold text-slate-900">{formatCurrency(college.feesPerYear)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Top course</span>
          <span className="font-medium text-slate-800">{getTopCourse(college.courses)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Rating</span>
          <div className="flex items-center gap-2">
            <StarRating rating={college.rating} />
            <span className="font-semibold text-slate-900">{college.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={`/college/${college.slug}`} className="button-primary flex-1">
          View details
        </Link>
        <button
          type="button"
          onClick={() => {
            if (!isCompared && ids.length >= 3) {
              toast.error("You can compare up to 3 colleges at a time");
              return;
            }
            addCollege(college.id);
            toast.success(isCompared ? "Already in compare tray" : "Added to compare");
          }}
          className="button-secondary flex-1"
        >
          <GitCompareArrows className="mr-2" size={16} />
          Add to Compare
        </button>
      </div>
    </article>
  );
};
