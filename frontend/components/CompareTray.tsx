"use client";

import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { fetchCollege } from "@/lib/api";
import { useCompareStore } from "@/store/compareStore";

export const CompareTray = () => {
  const { clear, ids, removeCollege } = useCompareStore();
  const { data } = useQuery({
    queryKey: ["compare-tray", ids],
    queryFn: () => Promise.all(ids.map((id) => fetchCollege(String(id)))),
    enabled: ids.length > 0,
  });

  const labels = data?.map((college) => ({ id: college.id, name: college.name })) ?? [];

  return (
    <AnimatePresence>
      {ids.length > 0 ? (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-2xl backdrop-blur"
        >
          <div className="container-shell flex flex-col gap-4 py-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-700">Compare Tray</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {(labels.length > 0 ? labels : ids.map((id) => ({ id, name: "Loading..." }))).map((item) => (
                  <span
                    key={item.id}
                    className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700"
                  >
                    {item.name}
                    <button type="button" onClick={() => removeCollege(item.id)} className="text-slate-400 hover:text-slate-900">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={clear} className="button-secondary">
                Clear
              </button>
              <Link href={`/compare?ids=${ids.join(",")}`} className="button-primary">
                Compare Now
              </Link>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
