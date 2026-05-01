import { SavedPageClient } from "@/components/SavedPageClient";

export default function SavedPage() {
  return (
    <div className="container-shell py-10">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Saved Colleges</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-900">Your shortlist, ready to revisit</h1>
      </div>
      <SavedPageClient />
    </div>
  );
}
