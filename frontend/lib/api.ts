"use client";

import axios, { AxiosError } from "axios";
import {
  filterColleges,
  getCollegeByIdentifier,
  getComparedColleges,
  getFeaturedColleges,
} from "@/lib/collegeData";
import { getApiBaseUrl, getApiFallbackUrl } from "@/lib/env";
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

const baseURL = getApiBaseUrl();
const fallbackApiUrl = getApiFallbackUrl();

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
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return error instanceof Error ? error.message : "Something went wrong";
  }

  const axiosError: AxiosError<ApiErrorResponse> = error;
  if (axiosError.code === "ERR_NETWORK") {
    return `Unable to reach the server. Please make sure the backend is running at ${baseURL ?? fallbackApiUrl}.`;
  }
  return axiosError.response?.data?.error?.message ?? "Something went wrong";
};

export const isUnauthorizedError = (error: unknown) => {
  if (!axios.isAxiosError<ApiErrorResponse>(error)) {
    return false;
  }

  const axiosError: AxiosError<ApiErrorResponse> = error;
  return axiosError.response?.status === 401 || axiosError.response?.data?.error?.code === "UNAUTHORIZED";
};

export const fetchColleges = async (filters: CollegeFilters) => {
  const result = filterColleges(filters);
  return {
    success: true,
    data: result.colleges,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
    },
  } satisfies ApiResponse<College[]>;
};

export const fetchCollege = async (identifier: string) => {
  const college = getCollegeByIdentifier(identifier);
  if (!college) {
    throw new Error("College not found");
  }
  return college;
};

export const fetchComparedColleges = async (ids: number[]) => {
  return getComparedColleges(ids);
};

export const fetchFeaturedColleges = async (limit = 6) => {
  return getFeaturedColleges(limit);
};

export const fetchTopColleges = async (category: string, limit = 10) => {
  return filterColleges({
    stream: category,
    sortBy: "rating",
    limit,
    page: 1,
  }).colleges;
};

export const fetchCollegeRankings = async (year: number, agency: string, limit = 10) => {
  return filterColleges({
    sortBy: "nirfRank",
    limit,
    page: 1,
  }).colleges.map((college) => ({
    ...college,
    ranking: {
      agency,
      rank: college.nirfRank,
      total: 200,
      score: Math.max(65, Math.round(college.rating * 18 + college.placementPct * 0.15 - college.feesPerYear / 200000)),
    },
    stream: college.stream,
    abbreviation: college.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 5)
      .toUpperCase(),
    year,
  }));
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
  const authBaseUrl = baseURL || "";
  return `${authBaseUrl}/api/auth/auth0/login?returnTo=${encodeURIComponent(target)}${providerQuery}${modeQuery}`;
};

export const getAuth0LogoutUrl = (returnTo?: string) => {
  const target = returnTo ?? (typeof window !== "undefined" ? window.location.origin : "/");
  const authBaseUrl = baseURL || "";
  return `${authBaseUrl}/api/auth/auth0/logout?returnTo=${encodeURIComponent(target)}`;
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
