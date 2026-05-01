import { StarRating } from "@/components/StarRating";
import { formatDate, getInitials } from "@/lib/utils";
import type { Review } from "@/types/api";

export const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
            {getInitials(review.user.name)}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{review.user.name}</p>
            <p className="text-sm text-slate-500">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-sm leading-6 text-slate-600">{review.body}</p>
    </article>
  );
};
