"use client";

import { Briefcase, FlaskConical, GraduationCap, Layers, Palette, Scale, Stethoscope, TrendingUp } from "lucide-react";
import Link from "next/link";

const goals = [
  { label: "Engineering", count: "6374 Colleges", courses: ["BE/B.Tech", "Diploma in Engineering", "ME/M.Tech"], icon: GraduationCap },
  { label: "Management", count: "8071 Colleges", courses: ["MBA/PGDM", "BBA/BMS", "Executive MBA"], icon: Briefcase },
  { label: "Commerce", count: "5111 Colleges", courses: ["B.Com", "M.Com", "CA Foundation"], icon: TrendingUp },
  { label: "Arts", count: "5736 Colleges", courses: ["BA", "MA", "BFA"], icon: Palette },
  { label: "Science", count: "4892 Colleges", courses: ["B.Sc", "M.Sc", "B.Sc Nursing"], icon: FlaskConical },
  { label: "Law", count: "1205 Colleges", courses: ["LLB", "BA LLB", "LLM"], icon: Scale },
  { label: "Medical", count: "2847 Colleges", courses: ["MBBS", "BDS", "BAMS"], icon: Stethoscope },
  { label: "Design", count: "987 Colleges", courses: ["B.Des", "M.Des", "BFA"], icon: Layers },
] as const;

export const StudyGoalCards = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-2xl font-bold text-gray-900">Select Your Study Goal</h2>
        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 scroll-smooth">
          {goals.map((goal) => {
            const Icon = goal.icon;
            return (
              <Link
                key={goal.label}
                href={`/colleges?category=${goal.label.toLowerCase()}`}
                className="min-w-[200px] rounded-xl border border-slate-200 bg-white p-4 transition-shadow duration-200 hover:shadow-md"
              >
                <Icon className="h-12 w-12 text-blue-700" />
                <h3 className="mt-4 font-bold text-slate-900">{goal.label}</h3>
                <p className="mt-1 text-sm text-gray-500">{goal.count}</p>
                <div className="my-4 h-px bg-slate-200" />
                <div className="space-y-2">
                  {goal.courses.map((course) => (
                    <p key={course} className="text-sm text-gray-600">
                      {course}
                    </p>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StudyGoalCards;
