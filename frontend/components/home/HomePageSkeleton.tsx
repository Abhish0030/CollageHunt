"use client";

export const HomePageSkeleton = () => {
  return (
    <div className="animate-pulse pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-[380px] rounded-[2rem] bg-slate-200" />
      </div>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-4 sm:px-6 lg:px-8">
        <div className="h-10 w-72 rounded-full bg-slate-200" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-48 min-w-[220px] rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="h-60 rounded-2xl bg-slate-200" />
          ))}
        </div>
        <div className="h-[420px] rounded-2xl bg-slate-200" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-80 min-w-[280px] rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePageSkeleton;
