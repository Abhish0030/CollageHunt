"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import CollegeDuniaHome from "@/components/home/CollegeDuniaHome";
import CollageHuntDashboard from "@/components/home/CollageHuntDashboard";
import { fetchMe, isUnauthorizedError } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export default function HomePageClient() {
  const [hasMounted, setHasMounted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const setSavedCollegeIds = useAuthStore((state) => state.setSavedCollegeIds);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 120000,
    enabled: hasMounted && !user,
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
    }
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (meQuery.error && isUnauthorizedError(meQuery.error)) {
      setUser(null);
      setSavedCollegeIds([]);
    }
  }, [meQuery.error, setSavedCollegeIds, setUser]);

  if (user) {
    return <CollageHuntDashboard />;
  }

  return <CollegeDuniaHome />;
}
