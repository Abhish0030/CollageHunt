"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { z } from "zod";
import {
  fetchAuth0Config,
  fetchMe,
  getApiErrorMessage,
  getAuth0LoginUrl,
  loginUser,
  registerUser,
} from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your email address or mobile number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  mobile: z
    .string()
    .min(10, "Enter a valid mobile number")
    .max(10, "Enter a valid mobile number")
    .regex(/^\d+$/, "Only digits are allowed"),
  studyingIn: z.string().min(1, "Select your study level"),
  city: z.string().min(2, "Enter your city"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Include at least one uppercase letter")
    .regex(/\d/, "Include at least one number")
    .regex(/[^A-Za-z0-9]/, "Include at least one special character"),
  consent: z.boolean(),
}).refine((values) => values.consent, {
  message: "Please accept the privacy policy and terms",
  path: ["consent"],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const studyOptions = [
  "Class 12",
  "Drop Year",
  "Undergraduate",
  "Postgraduate",
  "Working Professional",
] as const;

const fieldClassName =
  "w-full rounded-md border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-[#ff7a45] focus:ring-2 focus:ring-[#ffd6c7]";

const tabClassName = (isActive: boolean) =>
  `relative px-6 py-3 text-[1.05rem] font-semibold transition ${
    isActive ? "text-[#ff6f3d]" : "text-slate-800 hover:text-slate-950"
  }`;

const passwordSuggestions = [
  "Use at least 8 characters",
  "Mix uppercase, lowercase, numbers, and symbols",
  "Avoid your name, phone number, or email",
] as const;

const buildSuggestedPassword = () => {
  const randomChunk = Math.random().toString(36).slice(-4);
  return `CollageHunt@${new Date().getFullYear()}${randomChunk.toUpperCase()}`;
};

export const AuthModal = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isGoogleAuthAvailable, setIsGoogleAuthAvailable] = useState(false);
  const {
    authMode,
    closeAuthModal,
    isAuthModalOpen,
    openRecommendationFlow,
    redirectPath,
    setAuthMode,
    setUser,
  } = useAuthStore();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      consent: true,
      studyingIn: "",
    },
  });

  useEffect(() => {
    if (!isAuthModalOpen) {
      loginForm.reset();
      registerForm.reset();
      setIsGoogleAuthAvailable(false);
      return;
    }

    let isMounted = true;

    const loadAuth0Config = async () => {
      try {
        const config = await fetchAuth0Config();

        if (isMounted) {
          setIsGoogleAuthAvailable(config.enabled);
        }
      } catch {
        if (isMounted) {
          setIsGoogleAuthAvailable(false);
        }
      }
    };

    void loadAuth0Config();

    return () => {
      isMounted = false;
    }
  }, [isAuthModalOpen, loginForm, registerForm]);

  const onAuthSuccess = async (message: string, source: "login" | "register") => {
    const me = await fetchMe();
    setUser(me);
    await queryClient.invalidateQueries({ queryKey: ["me"] });
    await queryClient.invalidateQueries({ queryKey: ["saved-colleges"] });
    toast.success(message);
    closeAuthModal();
    if (source === "register") {
      openRecommendationFlow();
    }
    if (redirectPath && source !== "register") {
      router.push(redirectPath);
    }
  };

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: async () => onAuthSuccess("Logged in successfully", "login"),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async () => onAuthSuccess("Account created successfully", "register"),
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  if (!isAuthModalOpen) {
    return null;
  }

  const isLogin = authMode === "login";
  const activeForm = isLogin ? loginForm : registerForm;
  const isSubmitting = loginMutation.isPending || registerMutation.isPending;
  const registerPassword = registerForm.watch("password") ?? "";
  const passwordChecks = [
    { label: "8+ characters", valid: registerPassword.length >= 8 },
    { label: "Uppercase letter", valid: /[A-Z]/.test(registerPassword) },
    { label: "Number", valid: /\d/.test(registerPassword) },
    { label: "Special character", valid: /[^A-Za-z0-9]/.test(registerPassword) },
  ];

  const handleLogin = (values: LoginForm) => {
    loginMutation.mutate({
      identifier: values.identifier,
      password: values.password,
    });
  };

  const handleRegister = (values: RegisterForm) => {
    registerMutation.mutate({
      name: values.name,
      email: values.email,
      phone: values.mobile,
      city: values.city,
      studyingIn: values.studyingIn,
      password: values.password,
    });
  };

  const handleGoogleAuth = async () => {
    try {
      const config = await fetchAuth0Config();

      if (!config.enabled) {
        setIsGoogleAuthAvailable(false);
        return;
      }

      window.location.href = getAuth0LoginUrl(
        redirectPath ?? window.location.pathname,
        "google",
        isLogin ? "login" : "signup",
      );
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 px-4 py-8 backdrop-blur-sm"
      onClick={closeAuthModal}
    >
      <div
        className="mx-auto w-full max-w-5xl rounded-[32px] border border-white/80 bg-white px-5 py-6 shadow-2xl sm:px-8 sm:py-8 lg:px-10"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-300 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setAuthMode("register")} className={tabClassName(!isLogin)}>
              Sign Up
              {!isLogin ? <span className="absolute inset-x-2 -bottom-3 h-1 rounded-full bg-[#ff6f3d]" /> : null}
            </button>
            <button type="button" onClick={() => setAuthMode("login")} className={tabClassName(isLogin)}>
              Login
              {isLogin ? <span className="absolute inset-x-2 -bottom-3 h-1 rounded-full bg-[#ff6f3d]" /> : null}
            </button>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {isGoogleAuthAvailable ? (
              <button
                type="button"
                onClick={handleGoogleAuth}
                className="inline-flex items-center justify-center gap-3 rounded-full border border-slate-300 px-5 py-3 text-base font-medium text-slate-800 transition hover:bg-slate-50"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.3h6.44a5.5 5.5 0 0 1-2.39 3.61v3h3.87c2.27-2.09 3.57-5.17 3.57-8.64Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.87-3c-1.07.72-2.44 1.15-4.08 1.15-3.14 0-5.8-2.12-6.75-4.96H1.25v3.09A11.99 11.99 0 0 0 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.25 14.28A7.22 7.22 0 0 1 4.88 12c0-.79.13-1.56.37-2.28V6.63H1.25A11.99 11.99 0 0 0 0 12c0 1.93.46 3.75 1.25 5.37l4-3.09Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.77c1.76 0 3.34.61 4.59 1.81l3.44-3.44C17.95 1.15 15.23 0 12 0A11.99 11.99 0 0 0 1.25 6.63l4 3.09C6.2 6.89 8.86 4.77 12 4.77Z"
                  />
                </svg>
                {isLogin ? "Login with Google" : "Sign up with Google"}
              </button>
            ) : null}
            <button
              type="button"
              onClick={closeAuthModal}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <form
          className="space-y-6"
          onSubmit={activeForm.handleSubmit((values) => {
            if (isLogin) {
              handleLogin(values as LoginForm);
              return;
            }

            handleRegister(values as RegisterForm);
          })}
        >
          {isLogin ? (
            <div className="grid gap-5">
              <div>
                <input
                  className={fieldClassName}
                  placeholder="Email or Mobile Number"
                  {...loginForm.register("identifier")}
                />
                <p className="mt-1.5 text-xs text-rose-600">{loginForm.formState.errors.identifier?.message}</p>
              </div>

              <div>
                <input
                  type="password"
                  className={fieldClassName}
                  placeholder="Password"
                  {...loginForm.register("password")}
                />
                <p className="mt-1.5 text-xs text-rose-600">{loginForm.formState.errors.password?.message}</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <input className={fieldClassName} placeholder="Full Name" {...registerForm.register("name")} />
                  <p className="mt-1.5 text-xs text-rose-600">{registerForm.formState.errors.name?.message}</p>
                </div>

                <div>
                  <input className={fieldClassName} placeholder="Email" {...registerForm.register("email")} />
                  <p className="mt-1.5 text-xs text-rose-600">{registerForm.formState.errors.email?.message}</p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <input
                    className={fieldClassName}
                    placeholder="Mobile Number"
                    inputMode="numeric"
                    {...registerForm.register("mobile")}
                  />
                  <p className="mt-1.5 text-xs text-rose-600">{registerForm.formState.errors.mobile?.message}</p>
                </div>

                <div className="relative">
                  <select
                    className={`${fieldClassName} appearance-none pr-12 text-slate-700`}
                    {...registerForm.register("studyingIn")}
                  >
                    <option value="">Studying In</option>
                    {studyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <p className="mt-1.5 text-xs text-rose-600">
                    {registerForm.formState.errors.studyingIn?.message}
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <input className={fieldClassName} placeholder="City You Live In" {...registerForm.register("city")} />
                  <p className="mt-1.5 text-xs text-rose-600">{registerForm.formState.errors.city?.message}</p>
                </div>

                <div>
                  <input
                    type="password"
                    className={fieldClassName}
                    placeholder="Password"
                    {...registerForm.register("password")}
                  />
                  <p className="mt-1.5 text-xs text-rose-600">{registerForm.formState.errors.password?.message}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const suggestion = buildSuggestedPassword();
                        registerForm.setValue("password", suggestion, {
                          shouldDirty: true,
                          shouldTouch: true,
                          shouldValidate: true,
                        });
                        toast.success("Suggested password added");
                      }}
                      className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Suggest password
                    </button>
                    <span className="text-xs text-slate-500">Use email or phone later to log in with this password.</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-sm font-semibold text-slate-800">Password tips</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {passwordChecks.map((check) => (
                    <span
                      key={check.label}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        check.valid ? "bg-emerald-100 text-emerald-700" : "bg-white text-slate-500"
                      }`}
                    >
                      {check.label}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex flex-col gap-1 text-xs text-slate-500">
                  {passwordSuggestions.map((suggestion) => (
                    <span key={suggestion}>{suggestion}</span>
                  ))}
                </div>
              </div>

              <label className="flex items-start gap-3 text-sm leading-7 text-slate-500">
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-[#5a58a3] focus:ring-[#c8c5ff]"
                  {...registerForm.register("consent")}
                />
                <span>
                  I agree to CollageHunt&apos;s <span className="text-[#4d63b5] underline">Privacy Policy</span> and{" "}
                  <span className="text-[#4d63b5] underline">Terms &amp; Conditions</span> and provide consent to be
                  contacted for updates.
                </span>
              </label>
              <p className="-mt-4 text-xs text-rose-600">{registerForm.formState.errors.consent?.message}</p>
            </>
          )}

          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={isSubmitting || !activeForm.formState.isValid}
              className="min-w-[280px] rounded-xl bg-slate-200 px-10 py-4 text-[1.05rem] font-semibold text-slate-700 transition enabled:bg-slate-800 enabled:text-white enabled:hover:bg-slate-900 disabled:cursor-not-allowed disabled:text-slate-500"
            >
              {isSubmitting ? "Please wait..." : isLogin ? "Login" : "Create account"}
            </button>
          </div>

          <p className="text-center text-[1.05rem] text-slate-800">
            {isLogin ? "Don't have a CollageHunt account?" : "Already have a CollageHunt account?"}{" "}
            <button
              type="button"
              onClick={() => setAuthMode(isLogin ? "register" : "login")}
              className="font-semibold text-[#4d63b5] underline underline-offset-4"
            >
              {isLogin ? "Sign Up" : "Login"}
            </button>{" "}
            to continue
          </p>

          <p className="text-center text-sm text-slate-500">
            {isLogin
              ? "Use your email or 10-digit mobile number with the same password."
              : "Google sign-up creates your CollageHunt account automatically on first login."}
          </p>

        </form>
      </div>
    </div>
  );
};
