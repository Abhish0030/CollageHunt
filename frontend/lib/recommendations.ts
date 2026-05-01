import type { College } from "@/types/api";
import type { RecommendationPreferences } from "@/store/authStore";

export const interestOptions = [
  "Engineering",
  "Management",
  "Medical",
  "Commerce",
  "Computer Applications",
  "Science",
  "Law",
] as const;

export const examOptionsByInterest: Record<string, string[]> = {
  Engineering: ["JEE Main", "JEE Advanced", "BITSAT", "VITEEE", "SRMJEEE"],
  Management: ["CAT", "XAT", "SNAP", "NMAT", "MAT"],
  Medical: ["NEET UG", "AIIMS Nursing", "JIPMER", "NEET PG"],
  Commerce: ["CUET", "NPAT", "SET", "Christ Entrance Test"],
  "Computer Applications": ["NIMCET", "CUET", "IPU CET", "KIITEE"],
  Science: ["CUET", "IAT", "NEST", "ICAR AIEEA"],
  Law: ["CLAT", "AILET", "LSAT India", "SLAT", "MH CET Law"],
};

export const budgetBands: Record<RecommendationPreferences["budget"], number> = {
  low: 150000,
  medium: 450000,
  high: 1250000,
};

const courseKeywordMap: Record<string, string[]> = {
  Engineering: ["B.Tech", "M.Tech"],
  Management: ["MBA", "BBA"],
  Medical: ["MBBS"],
  Commerce: ["B.Com", "BBA"],
  "Computer Applications": ["BCA", "B.Tech"],
  Science: ["B.Sc"],
  Law: ["BA LLB", "BBA LLB", "LLB", "LLM"],
};

export type OnlineDegree = {
  id: string;
  title: string;
  provider: string;
  stream: string;
  duration: string;
  feeLabel: string;
  mode: "online" | "hybrid";
  highlight: string;
};

export const onlineDegrees: OnlineDegree[] = [
  {
    id: "online-btech-ai",
    title: "Online B.Tech in AI & Data Science",
    provider: "upGrad School of Technology",
    stream: "Engineering",
    duration: "48 months",
    feeLabel: "Starts at Rs 2.9L",
    mode: "hybrid",
    highlight: "Project-led engineering pathway with mentor support.",
  },
  {
    id: "online-mba-business",
    title: "Online MBA in Business Analytics",
    provider: "NMIMS Global",
    stream: "Management",
    duration: "24 months",
    feeLabel: "Starts at Rs 1.95L",
    mode: "online",
    highlight: "Great fit if you want leadership roles with flexibility.",
  },
  {
    id: "online-bba-finance",
    title: "Online BBA in Finance",
    provider: "Jain Online",
    stream: "Commerce",
    duration: "36 months",
    feeLabel: "Starts at Rs 1.35L",
    mode: "online",
    highlight: "Best for commerce students wanting job-ready specializations.",
  },
  {
    id: "online-bca-cloud",
    title: "Online BCA in Cloud & Full Stack",
    provider: "Amity Online",
    stream: "Computer Applications",
    duration: "36 months",
    feeLabel: "Starts at Rs 1.5L",
    mode: "online",
    highlight: "Developer-focused track with modern stack exposure.",
  },
  {
    id: "online-bsc-biotech",
    title: "Online B.Sc in Biotechnology Foundations",
    provider: "Manav Rachna Online",
    stream: "Science",
    duration: "36 months",
    feeLabel: "Starts at Rs 1.2L",
    mode: "online",
    highlight: "Useful for science learners who prefer flexible study schedules.",
  },
  {
    id: "online-health-admin",
    title: "Online Healthcare Management Program",
    provider: "Apollo MedSkills",
    stream: "Medical",
    duration: "18 months",
    feeLabel: "Starts at Rs 95K",
    mode: "hybrid",
    highlight: "Ideal for medical-adjacent admin and hospital operations roles.",
  },
  {
    id: "online-llm-corporate",
    title: "Online LLM in Corporate and Commercial Law",
    provider: "Jindal Global Law School Online",
    stream: "Law",
    duration: "12 months",
    feeLabel: "Starts at Rs 1.85L",
    mode: "online",
    highlight: "Strong fit for learners targeting legal consulting and corporate law roles.",
  },
];

export const getRecommendedColleges = (colleges: College[], preferences: RecommendationPreferences) => {
  const maxBudget = budgetBands[preferences.budget];
  const selectedCourseKeywords = preferences.interests.flatMap((interest) => courseKeywordMap[interest] ?? []);

  return colleges
    .filter((college) => {
      const matchesSelectedCollege =
        preferences.preferredCollegeIds.length === 0 || preferences.preferredCollegeIds.includes(college.id);
      const matchesInterest =
        selectedCourseKeywords.length === 0 ||
        college.courses.some((course) => selectedCourseKeywords.includes(course.name));
      const matchesBudget = college.feesPerYear <= maxBudget;
      const matchesState =
        preferences.preferredStates.length === 0 || preferences.preferredStates.includes(college.state);
      const matchesLocation =
        !preferences.preferredLocation ||
        college.city.toLowerCase().includes(preferences.preferredLocation.toLowerCase()) ||
        college.state.toLowerCase().includes(preferences.preferredLocation.toLowerCase());
      return matchesSelectedCollege && matchesInterest && matchesBudget && matchesState && matchesLocation;
    })
    .sort((a, b) => {
      const selectedCollegeBoostA = preferences.preferredCollegeIds.includes(a.id) ? 1 : 0;
      const selectedCollegeBoostB = preferences.preferredCollegeIds.includes(b.id) ? 1 : 0;
      if (selectedCollegeBoostB !== selectedCollegeBoostA) return selectedCollegeBoostB - selectedCollegeBoostA;
      const preferredStateBoostA = preferences.preferredStates.includes(a.state) ? 1 : 0;
      const preferredStateBoostB = preferences.preferredStates.includes(b.state) ? 1 : 0;
      if (preferredStateBoostB !== preferredStateBoostA) return preferredStateBoostB - preferredStateBoostA;
      const interestScoreA = a.courses.filter((course) => selectedCourseKeywords.includes(course.name)).length;
      const interestScoreB = b.courses.filter((course) => selectedCourseKeywords.includes(course.name)).length;
      if (interestScoreB !== interestScoreA) return interestScoreB - interestScoreA;
      if (b.rating !== a.rating) return b.rating - a.rating;
      return a.feesPerYear - b.feesPerYear;
    })
    .slice(0, 6);
};

export const getRecommendedOnlineDegrees = (preferences: RecommendationPreferences) => {
  return onlineDegrees
    .filter((degree) => {
      const matchesInterest =
        preferences.interests.length === 0 || preferences.interests.includes(degree.stream);
      const matchesMode =
        preferences.studyMode === "campus" ? degree.mode === "hybrid" : true;
      return matchesInterest && matchesMode;
    })
    .sort((a, b) => {
      const interestMatchA = preferences.interests.includes(a.stream) ? 1 : 0;
      const interestMatchB = preferences.interests.includes(b.stream) ? 1 : 0;
      return interestMatchB - interestMatchA;
    })
    .slice(0, 4);
};
