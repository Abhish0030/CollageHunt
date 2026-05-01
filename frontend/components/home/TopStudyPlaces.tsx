"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";

const cities = ["Delhi NCR", "Bangalore", "Hyderabad", "Pune", "Mumbai", "Chennai", "Kolkata", "Jaipur", "Ahmedabad", "Chandigarh"] as const;

export const TopStudyPlaces = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Top Study Places</h2>
        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 scroll-smooth">
          {cities.map((city) => (
            <Link
              key={city}
              href={`/colleges?location=${encodeURIComponent(city)}`}
              className="flex w-[140px] min-w-[140px] flex-col items-center rounded-xl border border-slate-200 p-4 text-center transition-shadow duration-200 hover:shadow-md"
            >
              <Building2 className="h-12 w-12 text-blue-700" />
              <span className="mt-3 text-sm font-medium text-slate-700">{city}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopStudyPlaces;
