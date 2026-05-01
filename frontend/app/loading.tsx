import { SkeletonCard } from "@/components/SkeletonCard";

export default function Loading() {
  return (
    <div className="container-shell py-10">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    </div>
  );
}
