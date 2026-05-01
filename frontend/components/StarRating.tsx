"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const StarRating = ({
  rating,
  size = 16,
  className,
}: {
  rating: number;
  size?: number;
  className?: string;
}) => {
  const stars = Array.from({ length: 5 }, (_, index) => {
    const value = index + 1;
    const isFilled = rating >= value;
    const isHalf = rating >= value - 0.5 && rating < value;

    return (
      <div key={value} className="relative">
        <Star className="text-slate-200" fill="currentColor" size={size} />
        {(isFilled || isHalf) && (
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: isHalf ? "50%" : "100%" }}
          >
            <Star className="text-amber-400" fill="currentColor" size={size} />
          </div>
        )}
      </div>
    );
  });

  return <div className={cn("flex items-center gap-1", className)}>{stars}</div>;
};
