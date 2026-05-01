import { notFound } from "next/navigation";
import type { ApiResponse, College } from "@/types/api";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const fetchServerColleges = async (path: string) => {
  const response = await fetch(`${baseURL}${path}`, {
    next: { revalidate: 300 },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as ApiResponse<College[]>;
};

export const fetchServerCollege = async (identifier: string) => {
  const response = await fetch(`${baseURL}/api/colleges/${identifier}`, {
    next: { revalidate: 300 },
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return ((await response.json()) as ApiResponse<College>).data;
};
