"use client";

import { useMutation } from "@tanstack/react-query";
import { Mail, Phone, ChevronDown } from "lucide-react";
import { FormEvent, useState } from "react";
import toast from "react-hot-toast";
import { getApiErrorMessage, subscribeToNewsletter } from "@/lib/api";

const courseOptions = ["Engineering", "Management", "Medical", "Law", "Commerce", "Science"] as const;

export const NewsletterBar = () => {
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [course, setCourse] = useState<(typeof courseOptions)[number]>(courseOptions[0]);

  const newsletterMutation = useMutation({
    mutationFn: subscribeToNewsletter,
    onSuccess: () => {
      toast.success("Subscribed successfully!");
      setEmail("");
      setMobile("");
      setCourse(courseOptions[0]);
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    newsletterMutation.mutate({
      email,
      mobile,
      course,
    });
  };

  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] bg-slate-950 px-6 py-8 text-white">
          <h2 className="text-2xl font-bold">Subscribe To Our Newsletter</h2>
          <p className="mt-2 text-sm text-slate-300">Get College Notifications, Exam Notifications and News Updates</p>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-slate-900">
              <Mail className="h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Enter your email id"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-slate-900">
              <Phone className="h-4 w-4 text-slate-400" />
              <input
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                placeholder="Enter your mobile no"
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>
            <label className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 text-slate-900">
              <span className="text-sm">🎓</span>
              <select
                value={course}
                onChange={(event) => setCourse(event.target.value as (typeof courseOptions)[number])}
                className="w-full bg-transparent text-sm outline-none"
              >
                {courseOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </label>
            <button
              type="submit"
              disabled={newsletterMutation.isPending}
              className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {newsletterMutation.isPending ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBar;
