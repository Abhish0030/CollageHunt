"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CollegeCard } from "@/components/CollegeCard";
import { SkeletonCard } from "@/components/SkeletonCard";
import { fetchSavedColleges, isUnauthorizedError } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export const SavedPageClient = () => {
  const router = useRouter();
  const { user } = useAuthStore();

  const query = useQuery({
    queryKey: ["saved-colleges"],
    queryFn: fetchSavedColleges,
    retry: false,
  });

  useEffect(() => {
    if (query.error && (!user || isUnauthorizedError(query.error))) {
      router.replace("/colleges?auth=login&redirect=/saved");
    }
  }, [query.error, router, user]);

  if (query.isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  const colleges = query.data?.map((entry) => entry.college) ?? [];

  return colleges.length > 0 ? (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {colleges.map((college) => (
        <CollegeCard key={college.id} college={college} />
      ))}
    </div>
  ) : (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
      <h2 className="text-2xl font-semibold text-slate-900">No saved colleges yet</h2>
      <p className="mt-3 text-sm text-slate-500">Bookmark colleges from the listing page to build your shortlist.</p>
      <Link href="/colleges" className="button-primary mt-6 inline-flex">
        Explore colleges
      </Link>
    </div>
  );
};
