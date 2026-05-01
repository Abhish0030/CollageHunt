"use client";

import { Filter, RotateCcw, SlidersHorizontal } from "lucide-react";

type Props = {
  locations: string[];
  courseOptions: string[];
  location: string;
  setLocation: (value: string) => void;
  course: string;
  setCourse: (value: string) => void;
  maxFees: number;
  setMaxFees: (value: number) => void;
  onReset: () => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
};

export const FilterSidebar = ({
  locations,
  courseOptions,
  location,
  setLocation,
  course,
  setCourse,
  maxFees,
  setMaxFees,
  onReset,
  isOpen,
  setIsOpen,
}: Props) => {
  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="button-secondary mb-4 w-full md:hidden"
      >
        <Filter className="mr-2" size={16} />
        Filters
      </button>
      <aside className={`${isOpen ? "block" : "hidden"} md:block`}>
        <div className="glass-panel sticky top-24 rounded-xl p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={18} className="text-blue-700" />
              <h2 className="text-lg font-semibold text-slate-900">Refine Results</h2>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Location</label>
              <select
                className="field-base"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
              >
                <option value="">All locations</option>
                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Course type</label>
              <select className="field-base" value={course} onChange={(event) => setCourse(event.target.value)}>
                <option value="">All courses</option>
                {courseOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>Max annual fees</span>
                <span>₹{maxFees.toLocaleString("en-IN")}</span>
              </div>
              <input
                type="range"
                min={50000}
                max={2500000}
                step={25000}
                value={maxFees}
                onChange={(event) => setMaxFees(Number(event.target.value))}
                className="w-full accent-blue-700"
              />
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {[
                  { label: "Budget", value: 150000 },
                  { label: "Balanced", value: 450000 },
                  { label: "Premium", value: 900000 },
                ].map((band) => (
                  <button
                    key={band.label}
                    type="button"
                    onClick={() => setMaxFees(band.value)}
                    className={`rounded-full border px-2 py-1 transition ${
                      maxFees === band.value
                        ? "border-blue-200 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                    }`}
                  >
                    {band.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
