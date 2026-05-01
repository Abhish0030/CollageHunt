import Link from "next/link";
import { ChevronRight } from "lucide-react";

export const Breadcrumb = ({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="transition hover:text-blue-700">
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-slate-700">{item.label}</span>
          )}
          {index < items.length - 1 ? <ChevronRight size={14} /> : null}
        </div>
      ))}
    </nav>
  );
};
