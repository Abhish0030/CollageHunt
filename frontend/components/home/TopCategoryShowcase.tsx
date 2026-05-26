"use client";

import { ArrowRight, BriefcaseBusiness, GraduationCap, Landmark, Scale, Stethoscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    title: "Top Engineering",
    subtitle: "Colleges in India",
    href: "/colleges?course=B.Tech",
    image:
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80",
    icon: GraduationCap,
    iconAccent: "text-violet-600",
  },
  {
    title: "Top MBA",
    subtitle: "Colleges in India",
    href: "/colleges?course=MBA",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80",
    icon: BriefcaseBusiness,
    iconAccent: "text-rose-500",
  },
  {
    title: "Top Medical",
    subtitle: "Colleges in India",
    href: "/colleges?course=MBBS",
    image:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=900&q=80",
    icon: Stethoscope,
    iconAccent: "text-indigo-600",
  },
  {
    title: "Top Law",
    subtitle: "Colleges in India",
    href: "/colleges?search=law",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=80",
    icon: Scale,
    iconAccent: "text-amber-600",
  },
  {
    title: "Top Universities",
    subtitle: "in India",
    href: "/colleges",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    icon: Landmark,
    iconAccent: "text-orange-500",
  },
] as const;

export const TopCategoryShowcase = () => {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Featured Streams</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">Explore top college categories with a quicker visual scan</h2>
          </div>
          <Link href="/colleges" className="hidden text-sm font-semibold text-blue-700 sm:inline-flex">
            Browse all
          </Link>
        </div>

        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-3 scroll-smooth">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.title}
                href={category.href}
                className="group min-w-[230px] max-w-[230px]"
              >
                <article className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
                  <div className="relative h-32 overflow-hidden">
                    <Image
                      src={category.image}
                      alt={category.title}
                      fill
                      sizes="230px"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_0%,rgba(15,23,42,0.14)_100%)]" />
                    <div className="absolute bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-md">
                      <Icon className={`h-4 w-4 ${category.iconAccent}`} />
                    </div>
                  </div>

                  <div className="px-3.5 pb-3.5 pt-3">
                    <h3 className="text-[1rem] font-bold text-slate-950">{category.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{category.subtitle}</p>
                    <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
                      Explore
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TopCategoryShowcase;
