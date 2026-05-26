"use client";

import { useQuery } from "@tanstack/react-query";
import { Heart, Menu, MessageCircle, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchMe, fetchSavedColleges, getAuth0LogoutUrl, getQuestions, isUnauthorizedError, logoutUser } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { openAuthModal, savedCollegeIds, setSavedCollegeIds, setUser, user } = useAuthStore();

  const meQuery = useQuery({
    queryKey: ["me"],
    queryFn: fetchMe,
    retry: false,
    staleTime: 120000,
  });

  const savedQuery = useQuery({
    queryKey: ["saved-colleges"],
    queryFn: fetchSavedColleges,
    retry: false,
    enabled: !!user,
  });

  const unansweredQuery = useQuery({
    queryKey: ["help-unanswered-count", user?.id],
    queryFn: () => getQuestions({ authorId: "me", isSolved: false, limit: 1, page: 1 }),
    retry: false,
    enabled: !!user,
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

  useEffect(() => {
    if (savedQuery.data) {
      setSavedCollegeIds(savedQuery.data.map((item) => item.college.id));
    }
  }, [savedQuery.data, setSavedCollegeIds]);

  useEffect(() => {
    if (savedQuery.error && isUnauthorizedError(savedQuery.error)) {
      setUser(null);
      setSavedCollegeIds([]);
    }
  }, [savedQuery.error, setSavedCollegeIds, setUser]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/colleges", label: "Colleges" },
    { href: "/compare", label: "Compare" },
    { href: "/saved", label: "Saved" },
  ];

  const handleLogout = async () => {
    if (!user || isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      if (user.authProvider === "auth0") {
        window.location.href = getAuth0LogoutUrl(window.location.origin);
        return;
      }

      await logoutUser();
      setUser(null);
      setSavedCollegeIds([]);
      setIsLogoutDialogOpen(false);
      setIsMenuOpen(false);
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="container-shell flex h-20 items-center justify-between gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="CollageHunt home">
            <svg
              viewBox="0 0 56 56"
              aria-hidden="true"
              className="h-10 w-10 sm:h-11 sm:w-11"
            >
              <path d="M28 6L6 14L12 17V24L14 22V18L28 12L42 18V22L44 24V17L50 14L28 6Z" fill="#153A84" />
              <path d="M42 18L40 31H46L44 18H42Z" fill="#153A84" />
              <circle cx="28" cy="29" r="12" stroke="#F97316" strokeWidth="5" fill="white" />
              <circle cx="28" cy="29" r="6.5" stroke="#153A84" strokeWidth="3" fill="white" />
              <path d="M19 38L9 47" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <span className="flex flex-col leading-none">
              <span className="text-[1.55rem] font-extrabold tracking-tight text-[#153A84]">
                College<span className="text-[#F97316]">Hunt</span>
              </span>
              <span className="mt-1 text-[11px] font-medium tracking-[0.01em] text-slate-500 sm:text-xs">
                Discover · Compare · Decide
              </span>
            </span>
          </Link>

          <form
            className="hidden max-w-xl flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 md:flex"
            onSubmit={(event) => {
              event.preventDefault();
              router.push(`/colleges?search=${encodeURIComponent(search)}`);
            }}
          >
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search colleges, cities, or states"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </form>

          <nav className="hidden items-center gap-5 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition ${
                  pathname === link.href ? "text-blue-700" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/help"
              className={`relative inline-flex items-center gap-2 text-sm font-medium transition ${
                pathname.startsWith("/help") ? "text-blue-700" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <MessageCircle size={16} />
              Help
              {pathname.startsWith("/help") ? <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-blue-700" /> : null}
              {(unansweredQuery.data?.meta?.total ?? 0) > 0 ? (
                <span className="absolute -right-2 -top-1 h-2.5 w-2.5 rounded-full bg-rose-500" />
              ) : null}
            </Link>
            <Link href="/saved" className="relative rounded-full border border-slate-200 p-2 text-slate-700">
              <Heart size={18} />
              <span className="absolute -right-1 -top-1 rounded-full bg-blue-700 px-1.5 text-[10px] font-semibold text-white">
                {savedCollegeIds.length}
              </span>
            </Link>
            {user ? (
              <button
                type="button"
                onClick={() => setIsLogoutDialogOpen(true)}
                className="button-secondary"
              >
                Logout
              </button>
            ) : (
              <button type="button" onClick={() => openAuthModal("login")} className="button-primary">
                Login
              </button>
            )}
          </nav>

          <button type="button" onClick={() => setIsMenuOpen((value) => !value)} className="md:hidden">
            <Menu size={22} />
          </button>
        </div>

        {isMenuOpen ? (
          <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
            <form
              className="mb-4 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
              onSubmit={(event) => {
                event.preventDefault();
                router.push(`/colleges?search=${encodeURIComponent(search)}`);
                setIsMenuOpen(false);
              }}
            >
              <Search size={18} className="text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search colleges"
                className="w-full bg-transparent text-sm outline-none"
              />
            </form>
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-slate-700">
                  {link.label}
                </Link>
              ))}
              <Link href="/help" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
                <MessageCircle size={16} />
                Help
                {(unansweredQuery.data?.meta?.total ?? 0) > 0 ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                ) : null}
              </Link>
              {user ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsLogoutDialogOpen(true);
                  }}
                  className="button-secondary mt-2"
                >
                  Logout
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="button-primary mt-2"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        ) : null}
      </header>

      {isLogoutDialogOpen && user ? (
        <div className="fixed inset-0 z-50 bg-slate-950/45 px-4 backdrop-blur-sm">
          <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-slate-900">Confirm logout</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {user.authProvider === "auth0"
                  ? "You will be signed out of CollageHunt and your Google/Auth0 session will be cleared."
                  : "You will be signed out of your CollageHunt account on this device."}
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutDialogOpen(false)}
                  disabled={isLoggingOut}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoggingOut ? "Logging out..." : "Yes, logout"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
