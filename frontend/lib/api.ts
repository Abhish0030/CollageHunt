"use client";

import axios, { AxiosError } from "axios";
import type {
  ApiErrorResponse,
  ApiResponse,
  College,
  CoursePreview,
  Exam,
  HelpAnswer,
  HelpQuestion,
  HelpQuestionDetail,
  RankedCollege,
  SavedCollege,
  TopContributor,
  User,
} from "@/types/api";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const fallbackApiUrl = "http://localhost:4000";

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export type CollegeFilters = {
  search?: string;
  location?: string;
  maxFees?: number;
  course?: string;
  page?: number;
  limit?: number;
};

export type HelpQuestionFilters = {
  category?: string;
  tag?: string;
  search?: string;
  sort?: "latest" | "popular" | "unanswered" | "solved";
  page?: number;
  limit?: number;
  authorId?: string;
  isSolved?: boolean;
};

export const getApiErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError.code === "ERR_NETWORK") {
    return `Unable to reach the server. Please make sure the backend is running at ${baseURL ?? fallbackApiUrl}.`;
  }
  return axiosError.response?.data?.error?.message ?? "Something went wrong";
};

export const isUnauthorizedError = (error: unknown) => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.status === 401 || axiosError.response?.data?.error?.code === "UNAUTHORIZED";
};

export const fetchColleges = async (filters: CollegeFilters) => {
  const response = await api.get<ApiResponse<College[]>>("/api/colleges", { params: filters });
  return response.data;
};

export const fetchCollege = async (identifier: string) => {
  const response = await api.get<ApiResponse<College>>(`/api/colleges/${identifier}`);
  return response.data.data;
};

export const fetchComparedColleges = async (ids: number[]) => {
  const response = await api.get<ApiResponse<College[]>>("/api/colleges/compare", {
    params: { ids: ids.join(",") },
  });
  return response.data.data;
};

export const fetchFeaturedColleges = async (limit = 6) => {
  const response = await api.get<ApiResponse<College[]>>("/api/colleges/featured", {
    params: { limit },
  });
  return response.data.data;
};

export const fetchTopColleges = async (category: string, limit = 10) => {
  const response = await api.get<ApiResponse<College[]>>("/api/colleges", {
    params: {
      limit,
      page: 1,
      sortBy: "rating",
      category,
    },
  });
  return response.data.data;
};

export const fetchCollegeRankings = async (year: number, agency: string, limit = 10) => {
  const response = await api.get<ApiResponse<RankedCollege[]>>("/api/colleges/rankings", {
    params: { year, agency, limit },
  });
  return response.data.data;
};

export const fetchCourses = async (level: string, limit = 8) => {
  const response = await api.get<ApiResponse<CoursePreview[]>>("/api/courses", {
    params: { level, limit },
  });
  return response.data.data;
};

export const fetchFeaturedExams = async (limit = 6) => {
  const response = await api.get<ApiResponse<Exam[]>>("/api/exams/featured", {
    params: { limit },
  });
  return response.data.data;
};

export const subscribeToNewsletter = async (payload: { email: string; mobile?: string; course?: string }) => {
  const response = await api.post<ApiResponse<{ success: true }>>("/api/newsletter", payload);
  return response.data.data;
};

export const registerUser = async (payload: {
  name: string;
  email: string;
  phone: string;
  city: string;
  studyingIn: string;
  password: string;
}) => {
  const response = await api.post<ApiResponse<User>>("/api/auth/register", payload);
  return response.data.data;
};

export const loginUser = async (payload: { identifier: string; password: string }) => {
  const response = await api.post<ApiResponse<User>>("/api/auth/login", payload);
  return response.data.data;
};

export const fetchMe = async () => {
  const response = await api.get<ApiResponse<User>>("/api/auth/me");
  return response.data.data;
};

export const fetchAuth0Config = async () => {
  const response = await api.get<
    ApiResponse<{
      enabled: boolean;
      callbackUrl: string;
      logoutUrl: string;
      webOrigin: string;
    }>
  >("/api/auth/auth0/config");
  return response.data.data;
};

export const logoutUser = async () => {
  await api.post("/api/auth/logout");
};

export const getAuth0LoginUrl = (
  returnTo?: string,
  provider?: "google",
  mode?: "login" | "signup",
) => {
  const target = returnTo ?? (typeof window !== "undefined" ? window.location.href : "/");
  const providerQuery = provider ? `&provider=${encodeURIComponent(provider)}` : "";
  const modeQuery = mode ? `&mode=${encodeURIComponent(mode)}` : "";
  return `${baseURL}/api/auth/auth0/login?returnTo=${encodeURIComponent(target)}${providerQuery}${modeQuery}`;
};

export const getAuth0LogoutUrl = (returnTo?: string) => {
  const target = returnTo ?? (typeof window !== "undefined" ? window.location.origin : "/");
  return `${baseURL}/api/auth/auth0/logout?returnTo=${encodeURIComponent(target)}`;
};

export const fetchSavedColleges = async () => {
  const response = await api.get<ApiResponse<SavedCollege[]>>("/api/saved");
  return response.data.data;
};

export const saveCollege = async (collegeId: number) => {
  const response = await api.post<ApiResponse<unknown>>(`/api/saved/${collegeId}`);
  return response.data.data;
};

export const unsaveCollege = async (collegeId: number) => {
  const response = await api.delete<ApiResponse<{ removed: boolean; collegeId: number }>>(
    `/api/saved/${collegeId}`,
  );
  return response.data.data;
};

export const getQuestions = async (params?: HelpQuestionFilters) => {
  const response = await api.get<ApiResponse<HelpQuestion[]>>("/api/help/questions", { params });
  return response.data;
};

export const getQuestion = async (id: number) => {
  const response = await api.get<ApiResponse<HelpQuestionDetail>>(`/api/help/questions/${id}`);
  return response.data.data;
};

export const createQuestion = async (data: {
  title: string;
  body?: string;
  category: string;
  tags: string[];
}) => {
  const response = await api.post<ApiResponse<HelpQuestionDetail>>("/api/help/questions", data);
  return response.data.data;
};

export const updateQuestion = async (
  id: number,
  data: {
    title?: string;
    body?: string;
    category?: string;
    tags?: string[];
  },
) => {
  const response = await api.patch<ApiResponse<HelpQuestionDetail>>(`/api/help/questions/${id}`, data);
  return response.data.data;
};

export const deleteQuestion = async (id: number) => {
  const response = await api.delete<ApiResponse<{ deleted: boolean; id: number }>>(`/api/help/questions/${id}`);
  return response.data.data;
};

export const upvoteQuestion = async (id: number) => {
  const response = await api.post<ApiResponse<{ upvotes: number; upvoted: boolean }>>(
    `/api/help/questions/${id}/upvote`,
  );
  return response.data.data;
};

export const getQuestionAnswers = async (id: number) => {
  const response = await api.get<ApiResponse<HelpAnswer[]>>(`/api/help/questions/${id}/answers`);
  return response.data.data;
};

export const createAnswer = async (questionId: number, body: string) => {
  const response = await api.post<ApiResponse<HelpAnswer>>(`/api/help/questions/${questionId}/answers`, { body });
  return response.data.data;
};

export const updateAnswer = async (id: number, body: string) => {
  const response = await api.patch<ApiResponse<HelpAnswer>>(`/api/help/answers/${id}`, { body });
  return response.data.data;
};

export const deleteAnswer = async (id: number) => {
  const response = await api.delete<ApiResponse<{ deleted: boolean; id: number }>>(`/api/help/answers/${id}`);
  return response.data.data;
};

export const upvoteAnswer = async (id: number) => {
  const response = await api.post<ApiResponse<{ upvotes: number; upvoted: boolean }>>(`/api/help/answers/${id}/upvote`);
  return response.data.data;
};

export const acceptAnswer = async (id: number) => {
  const response = await api.post<ApiResponse<{ accepted: boolean }>>(`/api/help/answers/${id}/accept`);
  return response.data.data;
};

export const getTopContributors = async () => {
  const response = await api.get<ApiResponse<TopContributor[]>>("/api/help/top-contributors");
  return response.data.data;
};
