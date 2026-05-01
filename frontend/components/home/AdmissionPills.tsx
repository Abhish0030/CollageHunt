"use client";

import { ArrowRight } from "lucide-react";

const pills = [
  "B Ed Admission 2025",
  "MBA Admission 2025",
  "MBBS Admission 2025",
  "BA Admission 2025",
  "M Tech Admission 2025",
  "PhD Admission 2025",
  "LLB Admission 2025",
  "BSc Admission 2025",
  "B Pharmacy Admission 2025",
] as const;

export const AdmissionPills = () => {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Admission 2026</h2>
        <div className="flex flex-wrap gap-3">
          {pills.map((pill) => (
            <a
              key={pill}
              href="/colleges"
              className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              {pill}
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200">
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdmissionPills;
