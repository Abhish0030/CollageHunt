"use client";

import { Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const slides = [
  {
    title: "Find Over 25,000+ Colleges in India",
    accent: "Engineering, management, medical, law and more",
    image:
      "https://i.ytimg.com/vi/-w_PT6ZRJGM/maxresdefault.jpg",
    imagePosition: "object-center",
  },
  {
    title: "Find Over 25,000+ Colleges in India",
    accent: "Shortlist with rankings, fees, and exam fit in one place",
    image:
      "https://ik.imagekit.io/syustaging/SYU_PREPROD/Cover_lfvZuNQNK.webp?tr=w-3840",
    imagePosition: "object-center",
  },
  {
    title: "Find Over 25,000+ Colleges in India",
    accent: "Compare outcomes before you decide your next application",
    image:
      "https://img.jagranjosh.com/images/2023/January/1012023/Indian-Institute-of-Management-Visakhapatnam-Campus-View-1.jpeg",
    imagePosition: "object-center",
  },
] as const;

export const HeroBanner = () => {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const activeSlide = slides[slide];

  return (
    <section className="bg-white px-4 pt-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#1e3a8a]">
          <div className="absolute inset-0">
            {slides.map((item, index) => (
              <div
                key={item.image}
                className={`absolute inset-0 transition-all duration-1000 ${
                  index === slide ? "scale-100 opacity-100" : "scale-105 opacity-0"
                }`}
              >
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 1280px"
                  className={`${item.imagePosition} object-cover`}
                />
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,15,42,0.18)_0%,rgba(8,15,42,0.6)_55%,rgba(8,15,42,0.78)_100%)]" />
          <div className="absolute inset-y-0 left-0 w-full bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_45%)]" />
          <div className="relative flex min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-blue-100">{activeSlide.accent}</p>
            <h1 className="max-w-4xl text-4xl font-bold text-white sm:text-5xl">
              {activeSlide.title}
            </h1>

            <form action="/colleges" className="mt-8 w-full max-w-4xl">
              <div className="flex flex-col gap-3 rounded-[2rem] bg-white p-3 shadow-2xl sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-3 px-3">
                  <Search size={20} className="text-slate-400" />
                  <input
                    name="search"
                    placeholder="Search for colleges, exams, courses and more.."
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-full bg-orange-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Search
                </button>
              </div>
            </form>

            <div className="absolute bottom-6 right-6 flex items-center gap-3">
              <Link
                href="/recommendations"
                className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-900/30 transition hover:bg-orange-600"
              >
                Need Counselling
              </Link>
              <div className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
                {slide + 1} / {slides.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
