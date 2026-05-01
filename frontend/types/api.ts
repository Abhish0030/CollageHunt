export interface Course {
  id: number;
  collegeId: number;
  name: string;
  duration: number;
  seats: number;
  fees: number;
}

export interface CoursePreview {
  name: string;
  duration: string;
  totalFees: number;
  mode: string;
}

export interface Review {
  id: number;
  collegeId: number;
  userId: number;
  rating: number;
  body: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export interface College {
  id: number;
  slug: string;
  name: string;
  city: string;
  state: string;
  feesPerYear: number;
  rating: number;
  naacGrade: string;
  establishedYear: number;
  website?: string | null;
  placementPct: number;
  avgPackage: number;
  highestPackage: number;
  topRecruiters: string[];
  createdAt: string;
  courses: Course[];
  reviews?: Review[];
  _count?: {
    reviews: number;
  };
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  city?: string | null;
  studyingIn?: string | null;
  createdAt: string;
  authProvider?: "credentials" | "auth0";
  _count?: {
    saved: number;
  };
}

export type HelpCategory =
  | "engineering"
  | "medicine"
  | "law"
  | "management"
  | "university"
  | "design";

export interface HelpAuthor {
  id: number;
  name: string;
}

export interface HelpAnswer {
  id: number;
  body: string;
  questionId: number;
  authorId: number;
  author: HelpAuthor;
  upvotes: number;
  upvoted?: boolean;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HelpQuestion {
  id: number;
  title: string;
  body?: string | null;
  category: HelpCategory;
  tags: string[];
  upvotes: number;
  views: number;
  answersCount: number;
  isSolved: boolean;
  isPinned: boolean;
  authorId: number;
  author: HelpAuthor;
  createdAt: string;
  updatedAt: string;
  upvoted?: boolean;
}

export interface HelpQuestionDetail extends HelpQuestion {
  answers: HelpAnswer[];
}

export interface TopContributor {
  id: number;
  name: string;
  answersCount: number;
}

export interface SavedCollege {
  id: number;
  college: College;
}

export interface RankedCollege extends College {
  ranking: {
    agency: string;
    rank: number;
    total: number;
    score: number;
  };
  stream: string;
  abbreviation: string;
  year: number;
}

export interface Exam {
  id: number;
  slug: string;
  name: string;
  mode: string;
  participatingColleges: number;
  examDate: string;
  level: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}
