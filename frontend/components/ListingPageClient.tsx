"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Landmark, MapPin, Search, Sparkles, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { BackToTopButton } from "@/components/BackToTopButton";
import { CollegeCard } from "@/components/CollegeCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SkeletonCard } from "@/components/SkeletonCard";
import { filterColleges } from "@/lib/collegeData";
import { fetchColleges } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_MAX_FEES = 2500000;
const quickLinks = [
  { label: "Engineering", href: "/colleges?stream=Engineering" },
  { label: "Medicine", href: "/colleges?stream=Medical" },
  { label: "Law", href: "/colleges?stream=Law" },
  { label: "Management", href: "/colleges?stream=Management" },
  { label: "Computer Applications", href: "/colleges?stream=Computer%20Applications" },
] as const;

export const ListingPageClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { openAuthModal } = useAuthStore();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") ?? "");
  const [location, setLocation] = useState(searchParams.get("city") ?? searchParams.get("location") ?? "");
  const [stream, setStream] = useState(searchParams.get("stream") ?? "");
  const [ownership, setOwnership] = useState(searchParams.get("ownership") ?? "");
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
    if (location) params.set("city", location);
    if (stream) params.set("stream", stream);
    if (ownership) params.set("ownership", ownership);
    if (maxFees !== DEFAULT_MAX_FEES) params.set("maxFees", String(maxFees));
    if (page > 1) params.set("page", String(page));
    router.replace(`/colleges${params.toString() ? `?${params.toString()}` : ""}`);
  }, [debouncedSearch, location, maxFees, ownership, page, router, stream]);

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
  }, [debouncedSearch, location, maxFees, ownership, stream]);

  const directoryQuery = useQuery({
    queryKey: ["college-directory-local"],
    queryFn: () => fetchColleges({ limit: 200, page: 1 }),
  });

  const directory = directoryQuery.data?.data ?? [];
  const filteredResult = useMemo(
    () =>
      filterColleges({
        search: debouncedSearch || undefined,
        city: location || undefined,
        stream: stream || undefined,
        ownership: ownership || undefined,
        maxFees,
        page,
        limit: 12,
      }),
    [debouncedSearch, location, maxFees, ownership, page, stream],
  );
  const colleges = filteredResult.colleges;
  const meta = {
    total: filteredResult.total,
    page: filteredResult.page,
    limit: filteredResult.limit,
  };
  const locations = [...new Set(directory.map((college) => college.city))].sort();
  const streams = [...new Set(directory.map((college) => college.stream).filter(Boolean))].sort() as string[];
  const ownershipOptions = [...new Set(directory.map((college) => college.ownership).filter(Boolean))].sort() as string[];
  const activeFilterCount = [debouncedSearch, location, stream, ownership, maxFees !== DEFAULT_MAX_FEES].filter(Boolean).length;
  const affordableCount = directory.filter((college) => college.feesPerYear <= 300000).length;
  const highRatedCount = directory.filter((college) => college.rating >= 4.5).length;
  const lawCount = directory.filter((college) => college.stream === "Law").length;

  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setLocation("");
    setStream("");
    setOwnership("");
    setMaxFees(DEFAULT_MAX_FEES);
    setPage(1);
  };

  return (
    <div className="container-shell py-10">
      <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white px-6 py-10 sm:px-8 lg:px-10">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-700">College Discovery</p>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <h1 className="max-w-3xl text-[34px] font-bold tracking-tight text-slate-950 sm:text-[36px]">
                Find colleges by stream, city, fees, and ownership.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                Explore a seeded directory of Indian colleges with instant client-side filtering and shortlist-friendly cards.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-slate-900">
                <Search size={18} className="text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by college, city, state, or stream"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Landmark size={16} className="text-blue-700" />
                    <span className="text-xs uppercase tracking-[0.18em]">Directory</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{directory.length}</p>
                  <p className="mt-1 text-xs text-slate-500">colleges indexed</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Wallet size={16} className="text-blue-700" />
                    <span className="text-xs uppercase tracking-[0.18em]">Affordable</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{affordableCount}</p>
                  <p className="mt-1 text-xs text-slate-500">under Rs 3L/year</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Sparkles size={16} className="text-blue-700" />
                    <span className="text-xs uppercase tracking-[0.18em]">Strong Picks</span>
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-950">{highRatedCount}</p>
                  <p className="mt-1 text-xs text-slate-500">rated 4.5 and above</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_300px]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-700">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                <span className="inline-flex items-center gap-2">
                  <MapPin size={15} className="text-blue-700" />
                  {locations.length} cities tracked
                </span>
                <span className="inline-flex items-center gap-2">
                  <Landmark size={15} className="text-blue-700" />
                  {lawCount} law-focused options available
                </span>
                <span className="inline-flex items-center gap-2">
                  <Sparkles size={15} className="text-blue-700" />
                  {streams.length} streams you can filter instantly
                </span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700">
              <p className="font-semibold text-slate-950">Best move for faster filtering</p>
              <p className="mt-1 text-slate-600">
                Combine a stream, city, and max fee to surface a smaller shortlist immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <FilterSidebar
          streams={streams}
          locations={locations}
          ownershipOptions={ownershipOptions}
          stream={stream}
          setStream={setStream}
          location={location}
          setLocation={setLocation}
          ownership={ownership}
          setOwnership={setOwnership}
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
              {stream ? (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  Stream: {stream}
                </span>
              ) : null}
              {ownership ? (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Ownership: {ownership}
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

          {stream === "Law" || debouncedSearch.toLowerCase().includes("law") ? (
            <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-amber-900">Law shortlist mode</p>
                  <p className="mt-1 text-sm text-amber-800">
                    Legal programs are strongest in Delhi, Bengaluru, Hyderabad, Pune, Kolkata, and Sonipat within this seeded directory.
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

          {directoryQuery.isLoading ? (
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
