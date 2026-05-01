export const SkeletonCard = () => {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-4 h-5 w-2/3 rounded bg-slate-200" />
      <div className="mb-3 h-4 w-1/3 rounded bg-slate-200" />
      <div className="mb-5 h-4 w-1/2 rounded bg-slate-200" />
      <div className="grid gap-3">
        <div className="h-12 rounded-lg bg-slate-100" />
        <div className="h-12 rounded-lg bg-slate-100" />
      </div>
    </div>
  );
};
