"use client";

import { Smartphone } from "lucide-react";
import { AdmissionPills } from "./AdmissionPills";
import { BoardExamLinks } from "./BoardExamLinks";
import { CollegeRankingTable } from "./CollegeRankingTable";
import { ExploreCourses } from "./ExploreCourses";
import { ExploreProgramsGrid } from "./ExploreProgramsGrid";
import { HeroBanner } from "./HeroBanner";
import { MegaFooter } from "./MegaFooter";
import { NewsletterBar } from "./NewsletterBar";
import { StudyGoalCards } from "./StudyGoalCards";
import { TopCategoryShowcase } from "./TopCategoryShowcase";
import { TopCollegeCards } from "./TopCollegeCards";
import { TopCollegesTable } from "./TopCollegesTable";
import { TopExamCards } from "./TopExamCards";
import { TopStudyPlaces } from "./TopStudyPlaces";

export const CollegeDuniaHome = () => {
  return (
    <div className="bg-white">
      <HeroBanner />
      <StudyGoalCards />
      <ExploreProgramsGrid />
      <TopCollegesTable />
      <TopCollegeCards />
      <CollegeRankingTable />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 rounded-[2rem] bg-[#fef3e8] px-6 py-8 md:flex-row">
            <div>
              <h2 className="text-2xl font-bold text-blue-700">Subscribe For Regular Alerts</h2>
              <button type="button" className="mt-4 rounded-full bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                Subscribe Now
              </button>
            </div>
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Smartphone className="h-12 w-12" />
            </div>
          </div>
        </div>
      </section>

      <TopStudyPlaces />
      <ExploreCourses />
      <TopCategoryShowcase />
      <TopExamCards />
      <AdmissionPills />
      <BoardExamLinks />
      <NewsletterBar />
      <MegaFooter />
    </div>
  );
};

export default CollegeDuniaHome;
