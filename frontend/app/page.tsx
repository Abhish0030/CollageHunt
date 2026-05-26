import { cookies } from "next/headers";
import HomePageClient from "@/components/home/HomePageClient";
import { getAuthCookieNames } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const cookieStore = cookies();
  const hasAuthCookie = getAuthCookieNames().some((name) => cookieStore.has(name));

  return <HomePageClient hasAuthCookie={hasAuthCookie} />;
}
