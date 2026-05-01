import type { Metadata } from "next";
import { CollegeDetailClient } from "@/components/CollegeDetailClient";
import { fetchServerCollege } from "@/lib/serverApi";

export const dynamic = "force-dynamic";

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const college = await fetchServerCollege(params.slug);
  return {
    title: college.name,
    description: `${college.name} in ${college.city} offers ${college.courses
      .map((course) => course.name)
      .slice(0, 3)
      .join(", ")} with fees from ₹${college.feesPerYear.toLocaleString("en-IN")} per year.`,
  };
}

export default async function CollegeDetailPage({ params }: Props) {
  const college = await fetchServerCollege(params.slug);
  return <CollegeDetailClient college={college} />;
}
