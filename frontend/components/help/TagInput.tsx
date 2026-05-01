"use client";

import { X } from "lucide-react";
import { useState } from "react";

type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
};

export const TagInput = ({ value, onChange, maxTags = 5 }: TagInputProps) => {
  const [input, setInput] = useState("");

  const addTag = (rawValue: string) => {
    const tag = rawValue.trim();
    if (!tag || value.includes(tag) || value.length >= maxTags) {
      return;
    }

    onChange([...value, tag]);
    setInput("");
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
      <div className="flex flex-wrap gap-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((currentTag) => currentTag !== tag))}
              className="text-blue-500 transition hover:text-blue-700"
              aria-label={`Remove ${tag}`}
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addTag(input);
            }
          }}
          onBlur={() => addTag(input)}
          placeholder={value.length >= maxTags ? "Maximum tags reached" : "Type a tag and press Enter"}
          className="min-w-[220px] flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          disabled={value.length >= maxTags}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">{value.length} / {maxTags} tags</p>
    </div>
  );
};
