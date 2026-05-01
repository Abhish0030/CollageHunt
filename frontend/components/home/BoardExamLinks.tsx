"use client";

import { ArrowRight } from "lucide-react";

const classTwelveLinks = [
  "CBSE Class 12",
  "CBSE Class 12th Results",
  "CBSE Class 12th Previous Year Papers",
  "CBSE Class 12th Syllabus",
  "CBSE Class 12th Exam Dates",
  "CBSE Class 12th Admit Card",
  "NCERT Solutions Class 12th Physics",
  "NCERT Solutions Class 12th Chemistry",
  "NCERT Solutions Class 12th Biology",
  "NCERT Solutions Class 12th Maths",
  "CBSE Class 12th Notes",
  "CBSE Class 12th Physics Notes",
  "CBSE Class 12th Chemistry Notes",
  "CBSE Class 12th Biology Notes",
] as const;

const classTenLinks = [
  "CBSE Class 10",
  "CBSE Class 10th Results",
  "CBSE Class 10th Previous Year Papers",
  "CBSE Class 10th Syllabus",
  "CBSE Class 10th Exam Dates",
  "CBSE Class 10th Admit Card",
  "NCERT Solutions Class 10th Maths",
  "NCERT Solutions Class 10th Science",
  "NCERT Solutions Class 10th Social Science",
  "CBSE Class 10th Notes",
] as const;

const PillGrid = ({ items }: { items: readonly string[] }) => (
  <div className="flex flex-wrap gap-3">
    {items.map((item) => (
      <a
        key={item}
        href="/"
        className="inline-flex items-center gap-3 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
      >
        {item}
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-200">
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </a>
    ))}
  </div>
);

export const BoardExamLinks = () => {
  return (
    <section className="bg-slate-100">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
        <div>
          <h3 className="mb-4 text-xl font-bold text-slate-900">CBSE Class XII Board Exam</h3>
          <PillGrid items={classTwelveLinks} />
        </div>
        <div>
          <h3 className="mb-4 text-xl font-bold text-slate-900">CBSE Class X Board Exam</h3>
          <PillGrid items={classTenLinks} />
        </div>
      </div>
    </section>
  );
};

export default BoardExamLinks;
