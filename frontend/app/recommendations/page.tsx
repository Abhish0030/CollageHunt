import { RecommendationsPageClient } from "@/components/RecommendationsPageClient";
import { fetchServerColleges } from "@/lib/serverApi";

export const dynamic = "force-dynamic";

export default async function RecommendationsPage() {
  const directory = await fetchServerColleges("/api/colleges?limit=40&page=1");

  return <RecommendationsPageClient colleges={directory.data} />;
}
