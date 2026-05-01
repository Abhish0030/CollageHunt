"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Landmark, MapPin, Search, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BackToTopButton } from "@/components/BackToTopButton";
import { CollegeCard } from "@/components/CollegeCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { fetchColleges } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_MAX_FEES = 2500000;
const quickLinks = [
  { label: "Engineering", href: "/colleges?course=B.Tech" },
  { label: "Medicine", href: "/colleges?course=MBBS" },
  { label: "Law", href: "/colleges?course=BA%20LLB" },
  { label: "Management", href: "/colleges?course=MBA" },
  { label: "Computer Applications", href: "/colleges?course=BCA" },
] as const;

export const ListingPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthStore();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") ?? "");
  const [location, setLocation] = useState(searchParams.get("location") ?? "");
  const [course, setCourse] = useState(searchParams.get("course") ?? "");
  const [maxFees, setMaxFees] = useState(Number(searchParams.get("maxFees") ?? DEFAULT_MAX_FEES));
  const [page, setPage] = useState(Number(searchParams.get("page") ?? 1));
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (location) params.set("location", location);
    if (course) params.set("course", course);
    if (maxFees !== DEFAULT_MAX_FEES) params.set("maxFees", String(maxFees));
    if (page > 1) params.set("page", String(page));
    router.replace(`/colleges${params.toString() ? `?${params.toString()}` : ""}`);
  }, [course, debouncedSearch, location, maxFees, page, router]);

  useEffect(() => {
    const authMode = searchParams.get("auth");
    const redirect = searchParams.get("redirect");
    const authError = searchParams.get("authError");
    if (authMode === "login" || authMode === "register") {
      openAuthModal(authMode, redirect);

      if (authError === "auth0-cancelled") {
        toast.error("You are unable to login. Please login again.");
      } else if (authError === "auth0-restart") {
        toast.error("Your login session expired. Please login again.");
      }

      const params = new URLSearchParams(searchParams.toString());
      params.delete("auth");
      params.delete("redirect");
      params.delete("authError");
      router.replace(`/colleges${params.toString() ? `?${params.toString()}` : ""}`);
    }
  }, [openAuthModal, router, searchParams]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, location, course, maxFees]);

  const listingQuery = useQuery({
    queryKey: ["colleges", debouncedSearch, location, course, maxFees, page],
    queryFn: () =>
      fetchColleges({
        search: debouncedSearch || undefined,
        location: location || undefined,
        course: course || undefined,
        maxFees,
        page,
        limit: 12,
      }),
  });

  const directoryQuery = useQuery({
    queryKey: ["college-directory"],
    queryFn: () => fetchColleges({ limit: 40, page: 1 }),
  });

  const colleges = listingQuery.data?.data ?? [];
  const meta = listingQuery.data?.meta;
  const directory = directoryQuery.data?.data ?? [];
  const locations = [...new Set(directory.map((college) => college.city))].sort();
  const courseOptions = [...new Set(directory.flatMap((college) => college.courses.map((item) => item.name)))].sort();
  const activeFilterCount = [debouncedSearch, location, course, maxFees !== DEFAULT_MAX_FEES].filter(Boolean).length;
  const affordableCount = directory.filter((college) => college.feesPerYear <= 300000).length;
  const highRatedCount = directory.filter((college) => college.rating >= 4.5).length;
  const lawCount = directory.filter((college) =>
    college.courses.some((courseItem) => ["BA LLB", "BBA LLB", "LLB", "LLM"].includes(courseItem.name)),
  ).length;

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setLocation("");
    setCourse("");
    setMaxFees(DEFAULT_MAX_FEES);
    setPage(1);
  };

  return (
    <div className="container-shell py-10">
      <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-card sm:px-8 lg:px-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.22),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%)]" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-300">College Discovery</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Search colleges by outcomes, affordability, and fit.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Discover realistic options across India with live filters for city, course, annual fees, and career direction.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-full border border-white/12 bg-white/6 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-white/20 hover:bg-white/10"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur">
              <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 text-slate-900 shadow-lg">
                <Search size={18} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by college, city, state, or course"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Landmark size={16} className="text-blue-300" />
                    <span className="text-xs uppercase tracking-[0.18em]">Directory</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold">{directory.length}</p>
                  <p className="mt-1 text-xs text-slate-400">colleges indexed</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Wallet size={16} className="text-emerald-300" />
                    <span className="text-xs uppercase tracking-[0.18em]">Affordable</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold">{affordableCount}</p>
                  <p className="mt-1 text-xs text-slate-400">under Rs 3L/year</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Sparkles size={16} className="text-amber-300" />
                    <span className="text-xs uppercase tracking-[0.18em]">Strong Picks</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold">{highRatedCount}</p>
                  <p className="mt-1 text-xs text-slate-400">rated 4.5 and above</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-white/10 bg-white/6 px-5 py-4 text-sm text-slate-200">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={15} className="text-blue-300" />
                  {locations.length} cities tracked
                </span>
                <span className="inline-flex items-center gap-2">
                  <Landmark size={15} className="text-violet-300" />
                  {lawCount} law-focused options available
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-300" />
                  {courseOptions.length} course types you can filter instantly
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-400/20 bg-blue-400/10 px-5 py-4 text-sm text-blue-100">
              <p className="font-semibold text-white">Best move for law discovery</p>
              <p className="mt-1 text-blue-100/90">
                Try `BA LLB`, `LLB`, or a city like `Delhi` to narrow the shortlist faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterSidebar
          locations={locations}
          courseOptions={courseOptions}
          location={location}
          setLocation={setLocation}
          course={course}
          setCourse={setCourse}
          maxFees={maxFees}
          setMaxFees={setMaxFees}
          onReset={handleResetFilters}
          isOpen={isFilterOpen}
          setIsOpen={setIsFilterOpen}
        />

        <section>
          <div className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">College results</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {meta ? `${meta.total} colleges found` : "Loading results"}
                </p>
              </div>
              <div className="text-sm text-slate-500">Page {meta?.page ?? page}</div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {debouncedSearch ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  Search: {debouncedSearch}
                </span>
              ) : null}
              {location ? (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  City: {location}
                </span>
              ) : null}
              {course ? (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  Course: {course}
                </span>
              ) : null}
              {maxFees !== DEFAULT_MAX_FEES ? (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Max fees: ₹{maxFees.toLocaleString("en-IN")}
                </span>
              ) : null}
              {activeFilterCount === 0 ? (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  No active filters
                </span>
              ) : null}
            </div>
          </div>

          {course === "BA LLB" || course === "LLB" || debouncedSearch.toLowerCase().includes("law") ? (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Law shortlist mode</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Focus on `BA LLB`, `BBA LLB`, `LLB`, and `LLM` options. Top legal hubs in this directory include Delhi,
                    Bengaluru, Hyderabad, Pune, and Kolkata.
                  </p>
                </div>
                <Link href="/recommendations" className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
                  Explore matches
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ) : null}

          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Showing curated cards with fees, top course, rating, and quick compare actions.
              </p>
            </div>
            {activeFilterCount > 0 ? (
              <button type="button" onClick={handleResetFilters} className="button-secondary">
                Clear all filters
              </button>
            ) : null}
          </div>

          {listingQuery.isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : colleges.length > 0 ? (
            <>
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {colleges.map((college) => (
                  <CollegeCard key={college.id} college={college} />
                ))}
              </div>

              <div className="mt-8 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="button-secondary"
                >
                  Previous
                </button>
                <p className="text-sm text-slate-600">
                  Showing {colleges.length} of {meta?.total ?? colleges.length}
                </p>
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={Boolean(meta && page * meta.limit >= meta.total)}
                  className="button-secondary"
                >
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <h3 className="text-xl font-semibold text-slate-900">No colleges matched your filters</h3>
              <p className="mt-3 text-sm text-slate-500">
                Try widening the fee range, changing the city, or clearing the course filter.
              </p>
            </div>
          )}
        </section>
      </div>
      <BackToTopButton />
    </div>
  );
};
